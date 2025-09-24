require('dotenv').config();
const axios = require('axios');
const https = require('https');

// --- Configurações do Bot ---
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO || BOT_TOKEN;
const CHAT_ID_ADMIN = process.env.TELEGRAM_CHAT_ID_ADMIN;
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID;

if (!BOT_TOKEN || !CHAT_ID_ADMIN) {
  console.error('❌ ERRO: BOT_TOKEN ou CHAT_ID_ADMIN não definido nas variáveis de ambiente.');
  process.exit(1);
}

/**
 * Cria agente HTTPS com IPv4 e timeout
 */
const httpsAgent = new https.Agent({ family: 4 });

/**
 * Envia mensagem para o admin
 */
async function enviarMensagem(mensagem, parseMode = 'Markdown') {
  if (!mensagem || mensagem.trim() === '') return;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: CHAT_ID_ADMIN,
      text: mensagem,
      parse_mode: parseMode
    }, {
      httpsAgent,
      timeout: 10000 // 10 segundos
    });

    console.log('✅ Mensagem enviada ao admin:', response.data.ok);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem para o Telegram:');
    console.error(error.response?.data || error.message);
  }
}

/**
 * Envia mensagem para o grupo de alunos
 */
async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
  if (!mensagem || mensagem.trim() === '' || !GRUPO_ALUNOS_ID) return;

  const url = `https://api.telegram.org/bot${BOT_TOKEN_ALUNO}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: GRUPO_ALUNOS_ID,
      text: mensagem,
      parse_mode: parseMode
    }, {
      httpsAgent,
      timeout: 10000
    });

    console.log('✅ Mensagem enviada ao grupo de alunos:', response.data.ok);
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem para o grupo de alunos:');
    console.error(error.response?.data || error.message);
  }
}

/**
 * Função de teste para enviar mensagem
 */
async function enviarMensagemTeste() {
  console.log('🔹 Enviando mensagem de teste...');
  await enviarMensagem('Teste de envio ao admin');
  await enviarMensagemAluno('Teste de envio ao grupo de alunos');
}

module.exports = {
  enviarMensagem,
  enviarMensagemAluno,
  enviarMensagemTeste
};