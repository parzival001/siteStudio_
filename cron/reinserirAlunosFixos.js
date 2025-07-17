const db = require('../config/db');

async function reinserirAlunosFixos() {
  console.log('🔁 Atualizando presença dos alunos fixos nas aulas do dia...');

  try {
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const hoje = new Date();
    const diaHoje = diasSemana[hoje.getDay()];

    // Seleciona somente as aulas do dia
    const [aulasFixas] = await db.query(`
      SELECT id FROM aulas_fixas
      WHERE dia_semana = ?
    `, [diaHoje]);

    for (const aula of aulasFixas) {
      const aulaId = aula.id;

      // Remove os alunos temporários
      const [temporarios] = await db.query(`
        SELECT aluno_id FROM alunos_aulas_fixas
        WHERE aula_fixa_id = ? AND eh_fixo = 0
      `, [aulaId]);

      if (temporarios.length > 0) {
        await db.query(`
          DELETE FROM alunos_aulas_fixas
          WHERE aula_fixa_id = ? AND eh_fixo = 0
        `, [aulaId]);

        await db.query(`
          UPDATE aulas_fixas
          SET vagas = vagas + ?
          WHERE id = ?
        `, [temporarios.length, aulaId]);
      }

      // Busca os alunos fixos pela nova tabela
      const [alunosFixos] = await db.query(`
        SELECT aluno_id
        FROM alunos_fixos_aulas_fixas
        WHERE aula_fixa_id = ?
      `, [aulaId]);

      for (const aluno of alunosFixos) {
        const alunoId = aluno.aluno_id;

        // Verifica se já está na aula (evita duplicidade)
        const [[jaInscrito]] = await db.query(`
          SELECT 1 FROM alunos_aulas_fixas
          WHERE aluno_id = ? AND aula_fixa_id = ?
        `, [alunoId, aulaId]);

        if (!jaInscrito) {
          const [result] = await db.query(`
            INSERT INTO alunos_aulas_fixas (aluno_id, aula_fixa_id, eh_fixo)
            VALUES (?, ?, 1)
          `, [alunoId, aulaId]);

          if (result.affectedRows > 0) {
            await db.query(`
              UPDATE aulas_fixas
              SET vagas = vagas - 1
              WHERE id = ?
            `, [aulaId]);
          }
        }
      }
    }

    console.log('✅ Alunos fixos atualizados com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao atualizar alunos fixos:', err);
  }
}

module.exports = reinserirAlunosFixos;