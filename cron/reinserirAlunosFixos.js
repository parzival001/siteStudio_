const db = require('../config/db');

async function reinserirAlunosFixos() {
  console.log('🔁 Atualizando presença dos alunos fixos nas aulas...');

  try {
    // Pega todas as aulas fixas
    const [aulasFixas] = await db.query(`SELECT id FROM aulas_fixas`);

    for (const aula of aulasFixas) {
      const aulaId = aula.id;

      // Conta quantos alunos temporários serão removidos
      const [temporarios] = await db.query(`
        SELECT aluno_id FROM alunos_aulas_fixas
        WHERE aula_fixa_id = ? AND eh_fixo = false
      `, [aulaId]);

      // Remove os alunos temporários
      await db.query(`
        DELETE FROM alunos_aulas_fixas
        WHERE aula_fixa_id = ? AND eh_fixo = false
      `, [aulaId]);

      // Aumenta vagas conforme o número de temporários removidos
      if (temporarios.length > 0) {
        await db.query(`
          UPDATE aulas_fixas
          SET vagas = vagas + ?
          WHERE id = ?
        `, [temporarios.length, aulaId]);
      }

      // Seleciona os alunos fixos
      const [alunosFixos] = await db.query(`
        SELECT aluno_id
        FROM alunos_aulas_fixas
        WHERE aula_fixa_id = ? AND eh_fixo = true
      `, [aulaId]);

      for (const aluno of alunosFixos) {
        // Tenta inserir o aluno fixo (ignora se já está)
        const [result] = await db.query(`
          INSERT IGNORE INTO alunos_aulas_fixas (aluno_id, aula_fixa_id, eh_fixo)
          VALUES (?, ?, true)
        `, [aluno.aluno_id, aulaId]);

        // Se foi realmente inserido (não estava antes), diminui a vaga
        if (result.affectedRows > 0) {
          await db.query(`
            UPDATE aulas_fixas
            SET vagas = vagas - 1
            WHERE id = ?
          `, [aulaId]);
        }
      }
    }

    console.log('✅ Alunos fixos atualizados com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao atualizar alunos fixos:', err);
  }
}

module.exports = reinserirAlunosFixos;