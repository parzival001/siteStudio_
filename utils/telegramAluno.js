// require('dotenv').config();
// const axios = require('axios');
// const https = require('https');

// const BOT_TOKEN_ALUNO = process.env.TELEGRAM_BOT_TOKEN_ALUNO;
// const GRUPO_ALUNOS_ID = process.env.TELEGRAM_GRUPO_ALUNOS_ID;

// if (!BOT_TOKEN_ALUNO) {
//   console.error("❌ ERRO: TELEGRAM_BOT_TOKEN_ALUNO não definido nas variáveis de ambiente.");
//   process.exit(1);
// }

// if (!GRUPO_ALUNOS_ID) {
//   console.error("❌ ERRO: TELEGRAM_GRUPO_ALUNOS_ID não definido nas variáveis de ambiente.");
//   process.exit(1);
// }

// // Força IPv4 e define timeout de 10s
// const agent = new https.Agent({ family: 4 });
// const TIMEOUT = 5000;

// /**
//  * Envia mensagem para grupo de alunos no Telegram
//  * @param {string} mensagem
//  * @param {'Markdown'|'HTML'} parseMode
//  */
// async function enviarMensagemAluno(mensagem, parseMode = 'Markdown') {
//   if (!mensagem || mensagem.trim() === '') {
//     console.warn('⚠️ Mensagem vazia. Nada foi enviado ao grupo de alunos.');
//     return;
//   }

//   const url = `https://api.telegram.org/bot${BOT_TOKEN_ALUNO}/sendMessage`;

//   try {
//     const response = await axios.post(
//       url,
//       {
//         chat_id: GRUPO_ALUNOS_ID,
//         text: mensagem,
//         parse_mode: parseMode,
//       },
//       {
//         httpsAgent: agent,
//         timeout: TIMEOUT, // evita travar se o Telegram não responder
//       }
//     );
//     console.log('✅ Mensagem enviada ao grupo dos alunos:', response.data);
//     return response.data;

//   } catch (error) {
//     // Mostra detalhes sem travar o app
//     if (error.response) {
//       console.error('❌ Erro no Telegram:', error.response.data);
//     } else if (error.code === 'ETIMEDOUT') {
//       console.error('❌ Timeout: não foi possível conectar ao Telegram em 10s');
//     } else {
//       console.error('❌ Erro desconhecido ao enviar mensagem:', error.message);
//     }
//   }
// }

// // Teste rápido
// async function enviarMensagemAlunoTeste() {
//   try {
//     const response = await enviarMensagemAluno('Teste de mensagem para grupo de alunos');
//     console.log('Mensagem de teste enviada:', response);
//   } catch (error) {
//     console.error('Erro no teste:', error.message);
//   }
// }

// module.exports = { enviarMensagemAluno, enviarMensagemAlunoTeste };