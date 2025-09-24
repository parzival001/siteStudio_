require('dotenv').config();
const axios = require('axios');
const https = require('https');

// Cria agente HTTPS que força IPv4
const agent = new https.Agent({ family: 4 });

// Tokens e IDs do Telegram
const BOT_TOKEN_ADMIN = process.env.TELEGRAM_BOT_TOKEN_ADMIN || '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8';
const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO || '7923011749:AAHSw03IwnhwY19AFdMAZDAhlNhFsvAFSPo';
const CHAT_ID_ADMIN = process.env.TELEGRAM_CHAT_ID_ADMIN || -1002656604822;
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID || -1002543104429;

async function enviarMensagem(mensagem, parseMode = 'Markdown') {
  if (!mensagem?.trim()) return console.warn('⚠️ Mensagem vazia para admin.');

  try {
    const res = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN_ADMIN}/sendMessage`, {
      chat_id: CHAT_ID_ADMIN,
      text: mensagem,
      parse_mode: parseMode
    }, { httpsAgent: agent });

    console.log('✅ Mensagem enviada ao admin:', res.data);
    return res.data;
  } catch (err) {
  if (err.response) {
    // O servidor respondeu com status != 2xx
    console.error('❌ Erro Telegram (resposta do servidor):', err.response.status, err.response.data);
  } else if (err.request) {
    // Requisição enviada, mas sem resposta
    console.error('❌ Erro Telegram (nenhuma resposta recebida):', err.request);
  } else {
    // Outro erro
    console.error('❌ Erro Telegram (configuração/execução):', err.message);
  }
}
}

async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
  if (!mensagem?.trim()) return console.warn('⚠️ Mensagem vazia para alunos.');

  try {
    const res = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN_ALUNO}/sendMessage`, {
      chat_id: GRUPO_ALUNOS_ID,
      text: mensagem,
      parse_mode: parseMode
    }, { httpsAgent: agent });

    console.log('✅ Mensagem enviada ao grupo de alunos:', res.data);
    return res.data;
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem para grupo de alunos:', err.response?.data || err.message);
  }
}

// Função de teste definitiva
async function testeTelegram() {
  console.log('🚀 Testando envio de mensagens...');
  await enviarMensagem('Teste admin IPv4');
  await enviarMensagemAluno('Teste grupo de alunos IPv4');
}

// Exporta as funções corretamente
module.exports = {
  enviarMensagem,
  enviarMensagemAluno,
  testeTelegram
};