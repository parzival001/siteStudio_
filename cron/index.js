const cron = require('node-cron');
const descontarCreditosAulasFixas = require('../cron/usoCreditosAulasFixas'); 
const reinserirAlunosFixos = require('../cron/reinserirAlunosFixos');
const notificarAulasEncerradasHoje = require('../cron/notificarAulasEncerradasHoje');


// cron.schedule('10 23 * * *', () => {
//   console.log('🔔 Enviando lista de participantes das aulas fixas...');
//   notificarAulasEncerradasHoje();

// });

// // Agenda para rodar todo dia às 23:30
// cron.schedule('30 23 * * *', () => {
//   console.log('🕣 Iniciando desconto automático de créditos das aulas fixas às 10h59...');
//   descontarCreditosAulasFixas()
//     .then(() => console.log('✅ Desconto de créditos concluído.'))
//     .catch(err => console.error('❌ Erro no desconto automático:', err));

// });

// console.log('Cron job iniciado e agendado para rodar todo dia às 21h46.');


// // Rodar todo dia às 23h40, por exemplo
// cron.schedule('40 23 * * *', () => {
//   console.log('🔁 Executando rotina de reinserção de alunos fixos às 13:23...');
//   reinserirAlunosFixos();
// });


