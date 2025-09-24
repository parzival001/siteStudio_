require('dotenv').config();
const { enviarMensagem, enviarMensagemAluno } = require('./utils/telegram');

async function testeTelegram() {
  try {
    console.log("📤 Testando envio de mensagem para o admin...");
    await enviarMensagem("✅ Mensagem de teste para o admin - IPv4");

    console.log("📤 Testando envio de mensagem para o grupo de alunos...");
    await enviarMensagemAluno("✅ Mensagem de teste para o grupo de alunos - IPv4");

    console.log("🎉 Teste concluído!");
  } catch (err) {
    console.error("❌ Erro no teste:", err);
  }
}

testeTelegram();