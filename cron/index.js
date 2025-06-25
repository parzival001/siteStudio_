const cron = require('node-cron');
const descontarCreditosAulasFixas = require('./usoCreditosAulasFixas');

// Executar todos os dias às 23:59
cron.schedule('04 16 * * *', async () => {
  console.log('⏰ Executando tarefa CRON para desconto de créditos...');
  await descontarCreditosAulasFixas();
});