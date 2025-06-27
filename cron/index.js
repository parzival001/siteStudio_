const cron = require('node-cron');
const descontarCreditosAulasFixas = require('../cron/usoCreditosAulasFixas'); // ajuste o caminho correto
const db = require('../config/db'); // importe seu db se necessário


// Agenda para rodar todo dia às 20:30
cron.schedule('40 13 * * *', () => {
  console.log('🕣 Iniciando desconto automático de créditos das aulas fixas às 21;09...');
  descontarCreditosAulasFixas()
    .then(() => console.log('✅ Desconto de créditos concluído.'))
    .catch(err => console.error('❌ Erro no desconto automático:', err));
});

console.log('Cron job iniciado e agendado para rodar todo dia às 21Ç09.');