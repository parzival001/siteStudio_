const db = require('../config/db'); // ajuste o caminho conforme seu projeto
const { enviarMensagem } = require('../utils/telegram'); // se tiver, ou comente

async function descontarCreditoTeste(alunoId, aulaFixaId) {
  const dataHoje = new Date().toISOString().slice(0, 10);

  try {
    // Buscar aula fixa para pegar categoria e professor
    const [[aula]] = await db.query(`
      SELECT af.categoria_id, af.professor_id, af.horario, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN professores p ON af.professor_id = p.id
      WHERE af.id = ?
    `, [aulaFixaId]);

    if (!aula) {
      console.log('Aula fixa não encontrada');
      return;
    }

    // Verifica se já descontou crédito hoje para esse aluno e aula
    const [[jaDescontou]] = await db.query(`
      SELECT COUNT(*) AS count FROM uso_creditos
      WHERE aluno_id = ? AND aula_fixa_id = ? AND data_utilizacao = ?
    `, [alunoId, aulaFixaId, dataHoje]);

    if (jaDescontou.count > 0) {
      console.log('Crédito já descontado para este aluno e aula hoje.');
      return;
    }

    // Buscar pacote válido
    const [[pacote]] = await db.query(`
      SELECT * FROM pacotes_aluno
      WHERE aluno_id = ?
        AND (categoria_id = ? OR passe_livre = 1)
        AND quantidade_aulas > 0
        AND data_validade >= CURDATE()
      ORDER BY data_validade ASC, id ASC
      LIMIT 1
    `, [alunoId, aula.categoria_id]);

    if (!pacote) {
      console.log('Nenhum pacote válido encontrado para o aluno nessa categoria.');
      return;
    }

    // Atualizar créditos no pacote
    await db.query(`
      UPDATE pacotes_aluno
      SET quantidade_aulas = quantidade_aulas - 1,
          aulas_utilizadas = aulas_utilizadas + 1
      WHERE id = ?
    `, [pacote.id]);

    // Registrar uso de crédito
    await db.query(`
      INSERT INTO uso_creditos (pacote_id, aluno_id, aula_fixa_id, data_utilizacao)
      VALUES (?, ?, ?, ?)
    `, [pacote.id, alunoId, aulaFixaId, dataHoje]);

    console.log(`✔ Crédito descontado para aluno ID ${alunoId} na aula fixa ID ${aulaFixaId}.`);

    // Opcional: enviar mensagem Telegram
    /*
    const [[aluno]] = await db.query('SELECT telegram_chat_id FROM alunos WHERE id = ?', [alunoId]);
    if (aluno && aluno.telegram_chat_id) {
      await enviarMensagem(aluno.telegram_chat_id,
        `💳 Crédito usado hoje (${dataHoje}) na aula fixa com o professor ${aula.professor_nome}.`);
    }
    */

  } catch (err) {
    console.error('Erro no teste de desconto:', err);
  }
}

// Recebe IDs via linha de comando para testar rápido
const args = process.argv.slice(2);
const alunoId = args[0];
const aulaFixaId = args[1];

if (!alunoId || !aulaFixaId) {
  console.log('Uso: node descontarCreditoTeste.js <aluno_id> <aula_fixa_id>');
  process.exit(1);
}

descontarCreditoTeste(alunoId, aulaFixaId).then(() => process.exit(0));