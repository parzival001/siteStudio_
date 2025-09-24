const TelegramBot = require('node-telegram-bot-api');
const https = require('https');

// Token do seu bot (idealmente usar variável de ambiente)
const token = process.env.TELEGRAM_BOT_TOKEN_ALUNO || '7923011749:AAHSw03IwnhwY19AFdMAZDAhlNhFsvAFSPo';

// Cria um agente HTTPS que força IPv4
const agent = new https.Agent({ family: 4 });

// Inicializa o bot com polling e agente IPv4
const bot = new TelegramBot(token, {
  polling: true,
  request: { agent }
});

bot.on('message', (msg) => {
  console.log("📩 Mensagem recebida no bot:");
  console.log(JSON.stringify(msg, null, 2));
});

bot.on('polling_error', (error) => {
  console.error('❌ Erro de polling:', error.message);
});

console.log('✅ Bot iniciado e ouvindo mensagens (IPv4 forçado)');