const axios = require('axios');

const TELEGRAM_BOT_TOKEN = '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8'; // Substitua pelo token do seu bot

async function enviarMensagem(chatId, mensagem) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: chatId,
      text: mensagem,
      parse_mode: 'HTML'
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem Telegram:', error.message);
  }
}

module.exports = { enviarMensagem };