// =============================================================================
// cron/usoCreditosAulasFixas.js  (versão corrigida)
// =============================================================================
// Mudanças:
//  1) Respeita aulas_fixas_desistencias — quem desistiu daquela data NÃO é cobrado
//  2) Não cobra duplicado (UNIQUE em uso_creditos garante, mas checamos antes)
//  3) Mantém regra atual: "treino livre" não consome passe livre
// =============================================================================

const db = require('../config/db');
const { enviarMensagem } = require('../utils/telegram');

async function descontarCreditosAulasFixas() {
  console.log('📆 Processando aulas fixas do dia para desconto de crédito...');

  const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const hoje = new Date();
  const diaSemanaStr = diasSemana[hoje.getDay()];

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  const dataHoje = `${ano}-${mes}-${dia}`;

  try {
    // Busca aulas fixas do dia (sem acento, padronizado)
    const [aulas] = await db.query(`
      SELECT
        af.id AS aula_id,
        af.categoria_id,
        c.nome AS categoria_nome,
        af.horario,
        af.professor_id,
        p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN professores p ON af.professor_id = p.id
      JOIN categorias c ON af.categoria_id = c.categoria_id
      WHERE LOWER(REPLACE(REPLACE(af.dia_semana, 'ç', 'c'), 'á', 'a')) = ?
    `, [diaSemanaStr]);

    for (const aula of aulas) {
      const categoria = aula.categoria_nome?.trim().toLowerCase();

      // Quem está efetivamente na aula HOJE (e não desistiu)
      const [alunos] = await db.query(`
        SELECT a.id AS aluno_id, a.nome, a.telegram_chat_id
        FROM alunos_aulas_fixas aaf
        JOIN alunos a ON aaf.aluno_id = a.id
        WHERE aaf.aula_fixa_id = ?
          AND NOT EXISTS (
            SELECT 1 FROM aulas_fixas_desistencias d
            WHERE d.aluno_id = aaf.aluno_id
              AND d.aula_fixa_id = aaf.aula_fixa_id
              AND d.data = ?
          )
      `, [aula.aula_id, dataHoje]);

      for (const aluno of alunos) {
        // Idempotência: já descontamos hoje?
        const [[ja]] = await db.query(`
          SELECT id FROM uso_creditos
          WHERE aluno_id = ? AND aula_fixa_id = ? AND data_utilizacao = ?
        `, [aluno.aluno_id, aula.aula_id, dataHoje]);

        if (ja) {
          console.log(`⏭️ Já descontado: ${aluno.nome} na aula ${aula.aula_id}`);
          continue;
        }

        // Escolhe pacote
        let queryPacote, params;
        if (categoria === 'treino livre') {
          queryPacote = `
            SELECT * FROM pacotes_aluno
            WHERE aluno_id = ?
              AND categoria_id = ?
              AND (data_validade IS NULL OR data_validade >= ?)
              AND (quantidade_aulas - aulas_utilizadas) > 0
            ORDER BY data_validade ASC, id ASC
            LIMIT 1
          `;
          params = [aluno.aluno_id, aula.categoria_id, dataHoje];
        } else {
          queryPacote = `
            SELECT * FROM pacotes_aluno
            WHERE aluno_id = ?
              AND (passe_livre = 1 OR categoria_id = ?)
              AND (data_validade IS NULL OR data_validade >= ?)
              AND (quantidade_aulas - aulas_utilizadas) > 0
            ORDER BY data_validade ASC, id ASC
            LIMIT 1
          `;
          params = [aluno.aluno_id, aula.categoria_id, dataHoje];
        }

        const [pacote] = await db.query(queryPacote, params);

        if (pacote.length === 0) {
          console.log(`⚠ Sem pacote válido: ${aluno.nome} (ID ${aluno.aluno_id}) para aula ${aula.aula_id}`);
          continue;
        }

        const pacoteSelecionado = pacote[0];

        // Treino livre + passe livre = não consome (regra existente)
        if (categoria === 'treino livre' && pacoteSelecionado.passe_livre === 1) {
          console.log(`⚠ Passe livre ignorado para treino livre: ${aluno.nome}`);
          continue;
        }

        const conn = await db.getConnection();
        try {
          await conn.beginTransaction();

          await conn.query(`
            UPDATE pacotes_aluno
            SET aulas_utilizadas = aulas_utilizadas + 1
            WHERE id = ?
          `, [pacoteSelecionado.id]);

          await conn.query(`
            INSERT INTO uso_creditos (pacote_id, aluno_id, aula_fixa_id, data_utilizacao)
            VALUES (?, ?, ?, ?)
          `, [pacoteSelecionado.id, aluno.aluno_id, aula.aula_id, dataHoje]);

          await conn.commit();
          console.log(`✔ Crédito descontado: ${aluno.nome} na aula ${aula.aula_id}`);

          // Notificação opcional
          if (aluno.telegram_chat_id) {
            enviarMensagem(
              `💳 Um crédito foi usado hoje (${dataHoje}) para sua aula fixa com o professor *${aula.professor_nome}*.`
            ).catch(() => {});
          }
        } catch (txErr) {
          await conn.rollback();
          console.error(`❌ Erro na transação para ${aluno.nome}:`, txErr.message);
        } finally {
          conn.release();
        }
      }
    }
  } catch (err) {
    console.error('Erro ao processar créditos em aulas fixas:', err);
  }
}

module.exports = descontarCreditosAulasFixas;
