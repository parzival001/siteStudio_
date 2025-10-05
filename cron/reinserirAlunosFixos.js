 const db = require('../config/db');

 async function reinserirAlunosFixos() {
   console.log('🔁 Atualizando presença dos alunos fixos nas aulas do dia...');

   try {
     const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

      
     const hoje = new Date();
     const diaSemanaIndex = new Intl.DateTimeFormat("pt-BR", {
       timeZone: "America/Sao_Paulo",
       weekday: "short"
     }).formatToParts(hoje).find(p => p.type === "weekday").value.toLowerCase();

      
     let diaHoje;
     switch (diaSemanaIndex) {
       case "dom": diaHoje = "domingo"; break;
       case "seg": diaHoje = "segunda"; break;
       case "ter": diaHoje = "terca"; break;
       case "qua": diaHoje = "quarta"; break;
       case "qui": diaHoje = "quinta"; break;
       case "sex": diaHoje = "sexta"; break;
       case "sáb": case "sab": diaHoje = "sabado"; break;
       default: diaHoje = diasSemana[hoje.getDay()];
     }

     console.log("Hora atual do servidor:", hoje.toString());
     console.log("Hora forçada Brasília:", new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }));
     console.log("Dia da semana detectado:", diaHoje);

     
     const [aulasFixas] = await db.query(`
       SELECT id FROM aulas_fixas
       WHERE dia_semana = ?
     `, [diaHoje]);

     for (const aula of aulasFixas) {
       const aulaId = aula.id;

        
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

        
       const [alunosFixos] = await db.query(`
         SELECT aluno_id
         FROM alunos_fixos_aulas_fixas
         WHERE aula_fixa_id = ?
       `, [aulaId]);

       for (const aluno of alunosFixos) {
         const alunoId = aluno.aluno_id;

          
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