const db = require('../config/db');
const { enviarMensagem } = require('../utils/telegram');
const cron = require('node-cron');


//const CHAT_ID_DO_ADMIN = -1002656604822;

async function verificarAniversarios() {
  try {
    const hoje = new Date();
    const dia = hoje.getDate();
    const mes = hoje.getMonth() + 1;

    // Busca alunos que fazem aniversário hoje
    const [alunos] = await db.query(`
      SELECT nome, data_nascimento 
      FROM alunos
      WHERE DAY(data_nascimento) = ? 
        AND MONTH(data_nascimento) = ?
    `, [dia, mes]);

    // Se ninguém faz aniversário hoje, não envia nada
    if (alunos.length === 0) {
      return;
    }

    // Monta a lista com os aniversariantes
    let msg = " 🎉 Aniversariantes de hoje 🎉 \n\n";

    alunos.forEach(a => {
      msg += `• ${a.nome}\n`;
    });

    // Envia somente para o admin
    await enviarMensagem(msg);

  } catch (err) {
    console.error("Erro ao verificar aniversários:", err);
  }
}

module.exports = { verificarAniversarios };