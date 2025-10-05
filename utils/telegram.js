// Substituindo o seu código atual
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// Tokens e IDs do Telegram
const BOT_TOKEN_ADMIN = process.env.TELEGRAM_BOT_TOKEN_ADMIN;
const CHAT_ID_ADMIN = process.env.TELEGRAM_CHAT_ID_ADMIN;
const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO;
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID;

// Inicializa os bots
// O 'polling: false' é importante para não receber mensagens, apenas enviar
const botAdmin = new TelegramBot(BOT_TOKEN_ADMIN, { polling: false });
const botAluno = new TelegramBot(BOT_TOKEN_ALUNO, { polling: false });

/**
 * Envia mensagem para o Bot de Admin
 */
async function enviarMensagem(mensagem, parseMode = 'Markdown') {
    try {
        // A biblioteca cuida de retries e HTTP
        const res = await botAdmin.sendMessage(CHAT_ID_ADMIN, mensagem, { parse_mode: parseMode });
        console.log('✅ Mensagem enviada pelo Bot Admin:', res);
        return res;
    } catch (error) {
        console.error('❌ Erro ao enviar mensagem do Bot Admin:', error.message);
        return null;
    }
}

/**
 * Envia mensagem para o Bot de Aluno
 */
async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
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