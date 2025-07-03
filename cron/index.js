const cron = require('node-cron');
const descontarCreditosAulasFixas = require('../cron/usoCreditosAulasFixas'); // ajuste o caminho correto
const reinserirAlunosFixos = require('../cron/reinserirAlunosFixos');
const db = require('../config/db'); // importe seu db se necessário
const notificarAulasEncerradasHoje = require('../cron/notificarAulasEncerradasHoje');

cron.schedule('00 21 * * *', () => {
  console.log('🔔 Enviando lista de participantes das aulas fixas...');
  notificarAulasEncerradasHoje();
});

// Agenda para rodar todo dia às 59:10
cron.schedule('00 22 * * *', () => {
  console.log('🕣 Iniciando desconto automático de créditos das aulas fixas às 10h59...');
  descontarCreditosAulasFixas()
    .then(() => console.log('✅ Desconto de créditos concluído.'))
    .catch(err => console.error('❌ Erro no desconto automático:', err));
});

console.log('Cron job iniciado e agendado para rodar todo dia às 21h46.');


// Rodar todo dia às 3h da manhã, por exemplo
cron.schedule('00 23 * * *', () => {
  console.log('🔁 Executando rotina de reinserção de alunos fixos às 03:00...');
  reinserirAlunosFixos();
});


