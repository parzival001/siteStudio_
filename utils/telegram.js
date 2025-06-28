const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8';
const CHAT_ID_ADMIN = -1002656604822;

async function enviarMensagem(mensagem, parseMode = 'Markdown') {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  if (!mensagem || mensagem.trim() === '') {
    console.warn('⚠️ Mensagem vazia. Nada foi enviado ao Telegram.');
    return;
  }

  try {
    const response = await axios.post(url, {
      chat_id: CHAT_ID_ADMIN,
      text: mensagem,
      parse_mode: parseMode
    });
    console.log('✅ Mensagem enviada ao grupo via utils/telegram.js');
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem para o Telegram:', error.response?.data || error.message);
  }
}

module.exports = { enviarMensagem };
