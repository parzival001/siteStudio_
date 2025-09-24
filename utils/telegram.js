require('dotenv').config();
const axios = require('axios');
const https = require('https'); // Forçar IPv4

// Cria um agente HTTPS que força IPv4
const agent = new https.Agent({ family: 4 });

// Tokens e IDs (recomendado usar .env)
const BOT_TOKEN_ADMIN = process.env.TELEGRAM_BOT_TOKEN_ADMIN || '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8';
const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO || '7923011749:AAHSw03IwnhwY19AFdMAZDAhlNhFsvAFSPo';
const CHAT_ID_ADMIN = process.env.TELEGRAM_CHAT_ID_ADMIN || -1002656604822;
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID || -1002543104429;

/**
 * Envia mensagem para o admin
 * @param {string} mensagem
 * @param {string} parseMode
 */
async function enviarMensagem(mensagem, parseMode = 'Markdown') {
  if (!mensagem || mensagem.trim() === '') {
    console.warn('⚠️ Mensagem vazia para admin. Nada enviado.');
    return;
  }

  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN_ADMIN}/sendMessage`,
      {
        chat_id: CHAT_ID_ADMIN,
        text: mensagem,
        parse_mode: parseMode
      },
      { httpsAgent: agent, timeout: 10000 } // timeout de 10s
    );

    console.log('✅ Mensagem enviada ao admin:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem para admin:', err.response?.data || err.message);
  }
}

/**
 * Envia mensagem para o grupo de alunos
 * @param {string} mensagem
 * @param {string} parseMode
 */
async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
  if (!mensagem || mensagem.trim() === '') {
    console.warn('⚠️ Mensagem vazia para alunos. Nada enviado.');
    return;
  }

  try {
    const res = await axios.post(
      `https://api.telegram.org/bot${BOT_TOKEN_ALUNO}/sendMessage`,
      {
        chat_id: GRUPO_ALUNOS_ID,
        text: mensagem,
        parse_mode: parseMode
      },
      { httpsAgent: agent, timeout: 10000 } // timeout de 10s
    );

    console.log('✅ Mensagem enviada ao grupo de alunos:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem para grupo de alunos:', err.response?.data || err.message);
  }
}

/**
 * Função de teste rápida
 */
async function testeTelegram() {
  console.log('🚀 Iniciando teste de envio para Telegram...');
  await enviarMensagem('Teste admin IPv4');
  await enviarMensagemAluno('Teste grupo de alunos IPv4');
  console.log('🚀 Teste concluído.');
}

module.exports = { enviarMensagem, enviarMensagemAluno, testeTelegram };