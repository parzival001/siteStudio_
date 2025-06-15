const TelegramBot = require('node-telegram-bot-api');
const token = '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8';
const bot = new TelegramBot(token); // ❌ sem polling aqui!

const CHAT_ID_ADMIN = -1002656604822;


function enviarMensagem(texto) {
  if (!texto || texto.trim() === '') return;
  return bot.sendMessage(CHAT_ID_ADMIN, texto, { parse_mode: 'Markdown' });
}

module.exports = { enviarMensagem };

