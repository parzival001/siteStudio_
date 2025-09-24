require('dotenv').config();
const axios = require('axios');
const https = require('https');
const dns = require('dns');

// Cria agente HTTPS que força IPv4 via lookup
const agent = new https.Agent({
  lookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback); // força IPv4
  }
});

// Tokens e IDs do Telegram
const BOT_TOKEN_ADMIN = process.env.TELEGRAM_BOT_TOKEN_ADMIN;
const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO;
const CHAT_ID_ADMIN = process.env.TELEGRAM_CHAT_ID_ADMIN;
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID;

/**
 * Envia mensagem ao Telegram com retry automático
 */
async function enviarTelegram(botToken, chatId, mensagem, parseMode = 'Markdown', tentativas = 3) {
  if (!mensagem?.trim()) {
    console.warn('⚠️ Mensagem vazia, ignorada.');
    return;
  }

  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      const res = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        { chat_id: chatId, text: mensagem, parse_mode: parseMode },
        { httpsAgent: agent, timeout: 10000, family: 4 } // timeout de 10s e força IPv4
      );

      console.log(`✅ Mensagem enviada (tentativa ${tentativa}):`, res.data);
      return res.data;

    } catch (err) {
      if (err.response) {
        console.error(`❌ Erro Telegram (resposta do servidor) [tentativa ${tentativa}]:`, err.response.status, err.response.data);
        break; 
      } else if (err.request) {
        console.error(`⚠️ Erro Telegram (sem resposta) [tentativa ${tentativa}]:`, err.code || err.message);
      } else {
        console.error(`⚠️ Erro Telegram (execução) [tentativa ${tentativa}]:`, err.message);
      }

      if (tentativa < tentativas) {
        console.log('🔄 Tentando novamente em 2s...');
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }

  console.error('❌ Todas as tentativas de envio falharam.');
  return null;
}

// Funções específicas
async function enviarMensagem(mensagem, parseMode = 'Markdown') {
  return enviarTelegram(BOT_TOKEN_ADMIN, CHAT_ID_ADMIN, mensagem, parseMode);
}

async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
  return enviarTelegram(BOT_TOKEN_ALUNO, GRUPO_ALUNOS_ID, mensagem, parseMode);
}

// Exporta funções
module.exports = {
  enviarMensagem,
  enviarMensagemAluno
};