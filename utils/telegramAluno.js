const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7923011749:AAHSw03IwnhwY19AFdMAZDAhlNhFsvAFSPo';
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID || -1002543104429;

async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: GRUPO_ALUNOS_ID,
      text: mensagem,
      parse_mode: parseMode
    });
    console.log('✅ Mensagem enviada ao grupo dos alunos:', response.data);
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem para grupo de alunos:', error.response?.data || error.message);
  }
}

module.exports = { enviarMensagemAluno };