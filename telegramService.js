const TelegramBot = require('node-telegram-bot-api');
const token = '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8';
const bot = new TelegramBot(token, { polling: true });

console.log("Bot do Telegram está rodando...");

// Chat ID do admin (fixo ou salvo de um banco de dados)
const CHAT_ID_ADMIN = '5535291163'; // substitua pelo seu

bot.on('message', (msg) => {
  console.log("Mensagem recebida:", msg.text);
  console.log("Chat ID:", msg.chat.id);
});

// Função para enviar mensagem ao admin
function enviarMensagem(texto) {
  if (!texto || texto.trim() === '') return;
  return bot.sendMessage(CHAT_ID_ADMIN, texto, { parse_mode: 'Markdown' });
}

module.exports = { enviarMensagem };



