require('dotenv').config(); // Garante que as variáveis do .env sejam carregadas
const axios = require('axios');
const https = require('https'); // Para forçar IPv4

// Bot e grupo configurados via variáveis de ambiente
const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO;
const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID;

if (!BOT_TOKEN_ALUNO) {
  console.error("❌ ERRO: TELEGRAM_BOT_TOKEN_ALUNO não definido nas variáveis de ambiente.");
  process.exit(1);
}

if (!GRUPO_ALUNOS_ID) {
  console.error("❌ ERRO: TELEGRAM_GRUPO_ALUNOS_ID não definido nas variáveis de ambiente.");
  process.exit(1);
}

// Cria um agente HTTPS reutilizável forçando IPv4
const agent = new https.Agent({ family: 4 });

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

// Função de teste opcional
async function enviarMensagemAlunoTeste() {
  try {
    const response = await enviarMensagemAluno('Teste de mensagem para grupo de alunos');
    console.log('Mensagem de teste enviada:', response);
  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

module.exports = { enviarMensagemAluno, enviarMensagemAlunoTeste };