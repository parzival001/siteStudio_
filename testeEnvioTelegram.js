const TelegramBot = require('node-telegram-bot-api');
const token = '7923011749:AAHSw03IwnhwY19AFdMAZDAhlNhFsvAFSPo'; // troque pelo token do BotFather
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  console.log("Mensagem recebida no grupo:");
  console.log(JSON.stringify(msg, null, 2));
});