// cron/usoCreditosAulasFixas.js
async function descontarCreditosAulasFixas() {
  console.log('📆 Processando aulas fixas do dia para desconto de crédito...');

  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda...
  const dataHoje = hoje.toISOString().split('T')[0];

  try {
    const [aulas] = await db.query(`
      SELECT af.id AS aula_id, af.categoria_id, af.horario, af.professor_id, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN professores p ON af.professor_id = p.id
      WHERE af.dia_semana = ?
    `, [diaSemana]);

    for (const aula of aulas) {
      const [alunos] = await db.query(`
        SELECT a.id AS aluno_id, a.nome, a.telegram_chat_id
        FROM alunos_aulas_fixas aaf
        JOIN alunos a ON aaf.aluno_id = a.id
        WHERE aaf.aula_fixa_id = ?
      `, [aula.aula_id]);

      for (const aluno of alunos) {
        const [pacote] = await db.query(`
          SELECT * FROM pacotes_aluno
          WHERE aluno_id = ?
            AND (passe_livre = 1 OR FIND_IN_SET(?, modalidades_passe_livre) OR categoria_id = ?)
            AND validade >= ?
            AND aulas_disponiveis > 0
          ORDER BY validade ASC, id ASC
          LIMIT 1
        `, [aluno.aluno_id, aula.categoria_id, aula.categoria_id, dataHoje]);

        if (pacote.length > 0) {
          const pacoteSelecionado = pacote[0];

          await db.query(`
            UPDATE pacotes_aluno SET aulas_disponiveis = aulas_disponiveis - 1, aulas_usadas = aulas_usadas + 1
            WHERE id = ?
          `, [pacoteSelecionado.id]);

          await db.query(`
            INSERT INTO uso_creditos (pacote_id, aluno_id, aula_fixa_id, data_utilizacao)
            VALUES (?, ?, ?, ?)
          `, [pacoteSelecionado.id, aluno.aluno_id, aula.aula_id, dataHoje]);

          if (aluno.telegram_chat_id) {
            await enviarMensagem(aluno.telegram_chat_id,
              `💳 Um crédito foi usado hoje (${dataHoje}) para sua aula fixa com o professor *${aula.professor_nome}*.`);
          }

          console.log(`✔ Crédito descontado: Aluno ${aluno.nome} (ID ${aluno.aluno_id}) na aula ${aula.aula_id}`);
        } else {
          console.log(`⚠ Sem pacote válido: Aluno ${aluno.nome} (ID ${aluno.aluno_id}) para aula ${aula.aula_id}`);
        }
      }
    }
  } catch (err) {
    console.error('Erro ao processar créditos em aulas fixas:', err);
  }
}

module.exports = descontarCreditosAulasFixas;
