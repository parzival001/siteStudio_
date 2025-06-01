const axios = require('axios');


const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || 5535291163;

async function enviarMensagem(mensagem, parseMode = 'HTML') {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: CHAT_ID,
      text: mensagem,
      parse_mode: parseMode, // 'HTML' ou 'Markdown'
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem para o Telegram:', error.message);
  }
}

module.exports = { enviarMensagem };


