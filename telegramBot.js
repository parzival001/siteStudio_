// const TelegramBot = require('node-telegram-bot-api');
// const express = require('express');
// const app = express();
// const port = process.env.PORT || 3000;

// // Seu token
// const token = '7858384013:AAGsYcXDgMjKS_JyUC_WKqFLydSuDLR7eS8';

// // Define o chat ID do professor
// const CHAT_ID = 5535291163;

// // Detecta se está em produção (exemplo: usando variável de ambiente)
// const isProduction = process.env.NODE_ENV === 'production';

// // Inicializa o bot
// let bot;

// if (isProduction) {
//   // Em produção, usar webhook
//   bot = new TelegramBot(token);
//   const url = 'https://seusite.com'; // coloque seu domínio real com HTTPS
//   const webhookPath = `/bot${token}`;

//   bot.setWebHook(`${url}${webhookPath}`);

//   app.use(express.json());

//   app.post(webhookPath, (req, res) => {
//     bot.processUpdate(req.body);
//     res.sendStatus(200);
//   });

//   console.log('✅ Webhook do Telegram configurado com sucesso!');
// } else {
//   // Em ambiente local, usar polling
//   bot = new TelegramBot(token, { polling: true });

//   bot.on('message', (msg) => {
//     console.log("📩 Mensagem recebida:", msg);
//     console.log("💬 Chat ID:", msg.chat.id);
//   });

//   console.log('🤖 Bot rodando em modo polling (local)');
// }

// // Função para enviar notificação
// function enviarNotificacao(texto) {
//   return bot.sendMessage(CHAT_ID, texto);
// }

// module.exports = { enviarNotificacao };

// // Inicia o servidor Express
// app.listen(port, () => {
//   console.log(`🚀 Servidor rodando na porta ${port}`);
// });