 const db = require('../config/db');

 async function gerarAulasFixasParaSemana() {
   const [aulasFixas] = await db.query('SELECT * FROM aulas_fixas');

   const hoje = new Date();
   const diasDaSemana = {
     domingo: 0,
     segunda: 1,
     terça: 2,
     quarta: 3,
     quinta: 4,
     sexta: 5,
     sábado: 6
   };

   for (const aula of aulasFixas) {
     const diaSemanaNum = diasDaSemana[aula.dia_semana.toLowerCase()];
     const dataAlvo = new Date(hoje);
     dataAlvo.setDate(dataAlvo.getDate() + ((7 + diaSemanaNum - hoje.getDay()) % 7));
    
     const dataFormatada = dataAlvo.toISOString().slice(0, 10);  AAAA-MM-DD

      
     const [aulaExistente] = await db.query(`
       SELECT * FROM aulas
       WHERE tipo_id = ? AND professor_id = ? AND data = ? AND horario = ?
     `, [aula.tipo_id, aula.professor_id, dataFormatada, aula.horario]);

     if (aulaExistente.length === 0) {
       await db.query(`
         INSERT INTO aulas (tipo_id, professor_id, data, horario, vagas, status)
         VALUES (?, ?, ?, ?, ?, 'pendente')
       `, [aula.tipo_id, aula.professor_id, dataFormatada, aula.horario, aula.vagas]);

       console.log(`Aula gerada para ${aula.dia_semana} - ${dataFormatada}`);
     }
   }
 }