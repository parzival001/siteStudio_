const TelegramBot = require('node-telegram-bot-api');
const token = '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8'; // Substitua pelo seu token real do BotFather
const bot = new TelegramBot(token, { polling: true }); // polling true para testes

// Para descobrir seu chat_id ao digitar /start ou outra mensagem
bot.on('message', (msg) => {
  console.log("Mensagem recebida:", msg);
  // Mostra o chat ID no console:
  console.log("Chat ID:", msg.chat.id);
});

// Chat ID do professor (fixo)
const CHAT_ID = 123456789; // Substitua pelo seu ID real

// Exporta a função para enviar notificação
function enviarNotificacao(texto) {
  return bot.sendMessage(CHAT_ID, texto);
}

module.exports = { enviarNotificacao };