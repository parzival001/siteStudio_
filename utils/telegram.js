const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Tokens e IDs do Telegram
const BOT_TOKEN_ADMIN = process.env.TELEGRAM_BOT_TOKEN_ADMIN;
const CHAT_ID_ADMIN = process.env.TELEGRAM_CHAT_ID_ADMIN;
const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO;
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID;

// Inicializa os bots de forma condicional com timeout
const botAdmin = BOT_TOKEN_ADMIN
  ? new TelegramBot(BOT_TOKEN_ADMIN, { polling: false, request: { timeout: 5000 } })
  : null;

const botAluno = BOT_TOKEN_ALUNO
  ? new TelegramBot(BOT_TOKEN_ALUNO, { polling: false, request: { timeout: 5000 } })
  : null;

/**
 * Envia mensagem para o Bot de Admin (com timeout)
 */
async function enviarMensagem(mensagem, parseMode = 'Markdown') {
  if (!botAdmin) {
    console.warn('⚠️ Alerta: Telegram Bot Admin não configurado. Token ausente.');
    return null;  // Sai silenciosamente se o bot não estiver configurado
  }

  try {
    const res = await botAdmin.sendMessage(CHAT_ID_ADMIN, mensagem, { parse_mode: parseMode });
    console.log('✅ Mensagem enviada pelo Bot Admin:', res);
    return res;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem do Bot Admin:', error.message);
    return null;
  }
}

/**
 * Envia mensagem para o Bot de Aluno (com timeout)
 */
async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
  if (!botAluno) {
    console.warn('⚠️ Alerta: Telegram Bot Aluno não configurado. Token ausente.');
    return null; // Sai silenciosamente se o bot não estiver configurado
  }

  try {
    const res = await botAluno.sendMessage(GRUPO_ALUNOS_ID, mensagem, { parse_mode: parseMode });
    console.log('✅ Mensagem enviada pelo Bot Aluno:', res);
    return res;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem do Bot Aluno:', error.message);
    return null;
  }
}

// Exporta funções
module.exports = {
  enviarMensagem,
  enviarMensagemAluno
};