 const db = require('../config/db');
 const { enviarMensagem } = require('../utils/telegram');

 async function notificarAulasEncerradasHoje() {
   console.log('📨 Verificando aulas fixas encerradas...');

   const agora = new Date();
   const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
   const nomeDiaHoje = diasSemana[agora.getDay()];
   const dataHoje = agora.toISOString().split('T')[0];
   const horaAtual = agora.toTimeString().slice(0, 5);  HH:mm

   function horaParaMinutos(hora) {
     const [h, m] = hora.split(':').map(Number);
     return h * 60 + m;
   }

   try {
     const [aulas] = await db.query(`
       SELECT af.id, af.horario, af.dia_semana, af.categoria_id, af.professor_id,
              c.nome AS categoria_nome, p.nome AS professor_nome
       FROM aulas_fixas af
       JOIN categorias c ON af.categoria_id = c.categoria_id
       JOIN professores p ON af.professor_id = p.id
       WHERE LOWER(af.dia_semana) = ?
     `, [nomeDiaHoje]);

     for (const aula of aulas) {
       const horaAula = aula.horario.slice(0, 5);

        
       if (horaParaMinutos(horaAtual) < horaParaMinutos(horaAula)) continue;

       const [alunos] = await db.query(`
         SELECT a.nome
         FROM alunos_aulas_fixas aaf
         JOIN alunos a ON a.id = aaf.aluno_id
         WHERE aaf.aula_fixa_id = ?
       `, [aula.id]);

       const nomes = alunos.length
         ? alunos.map(a => `- ${a.nome}`).join('\n')
         : '_Nenhum aluno presente._';

       const texto =
         `📚 *Aula fixa encerrada hoje*\n` +
         `📆 *Data:* ${dataHoje}\n` +
         `🕒 *Horário:* ${horaAula}\n` +
         `📘 *Categoria:* ${aula.categoria_nome}\n` +
         `👨‍🏫 *Professor:* ${aula.professor_nome}\n\n` +
         `👥 *Alunos presentes:*\n${nomes}`;

       await enviarMensagem(texto);  
       console.log(`✅ Notificação enviada para aula ${aula.id}`);
     }

     console.log('✅ Todas notificações foram enviadas.');
   } catch (err) {
     console.error('❌ Erro ao enviar notificações de aulas fixas:', err);
   }
 }

 module.exports = notificarAulasEncerradasHoje;
