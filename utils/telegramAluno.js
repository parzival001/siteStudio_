require('dotenv').config(); // Garante que as variáveis do .env sejam carregadas
const axios = require('axios');
const https = require('https'); // Para forçar IPv4

// Bot e grupo configurados com fallback (ideal é usar sempre variáveis de ambiente)
const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO || '7923011749:AAHSw03IwnhwY19AFdMAZDAhlNhFsvAFSPo';
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID || -1002543104429;

/**
 * Envia uma mensagem para o grupo de alunos no Telegram
 * @param {string} mensagem - Texto da mensagem
 * @param {string} parseMode - Formatação (ex: 'Markdown', 'HTML')
 */
async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
  if (!mensagem || mensagem.trim() === '') {
    console.warn('⚠️ Mensagem vazia. Nada foi enviado ao grupo de alunos.');
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN_ALUNO}/sendMessage`;

  // Força uso de IPv4
  const agent = new https.Agent({ family: 4 });

  try {
    const response = await axios.post(url, {
      chat_id: GRUPO_ALUNOS_ID,
      text: mensagem,
      parse_mode: parseMode
    }, {
      httpsAgent: agent
    });
    console.log('✅ Mensagem enviada ao grupo dos alunos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem para grupo de alunos:', error.response?.data || error.message);
  }
}

module.exports = { enviarMensagemAluno };