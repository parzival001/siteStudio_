const axios = require('axios');
const https = require('https'); // Necessário para forçar IPv4
require('dotenv').config();

// Valida se a variável de ambiente está definida
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID_ADMIN = -1002656604822;

if (!BOT_TOKEN) {
  console.error("❌ ERRO: TELEGRAM_BOT_TOKEN não definido nas variáveis de ambiente.");
  process.exit(1); // Encerra o processo se o token não estiver definido
}

async function enviarMensagem(mensagem, parseMode = 'Markdown') {
  if (!mensagem || mensagem.trim() === '') {
    console.warn('⚠️ Mensagem vazia. Nada foi enviado ao Telegram.');
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  // Força uso de IPv4
  const agent = new https.Agent({ family: 4 });

  try {
    const response = await axios.post(url, {
      chat_id: CHAT_ID_ADMIN,
      text: mensagem,
      parse_mode: parseMode
    }, {
      httpsAgent: agent
    });

    console.log('✅ Mensagem enviada ao grupo via utils/telegram.js');
    return response.data;

  } catch (error) {
    console.error('❌ Erro ao enviar mensagem para o Telegram:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Mensagem:', error.message);
    }
  }
}

module.exports = { enviarMensagem };