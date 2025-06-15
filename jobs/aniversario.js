const pool = require('../config/db'); // ajuste para sua conexão com o banco
const { enviarMensagem } = require('../utils/telegram');
const cron = require('node-cron');

// Substitua pelo seu chat_id fixo (veja no getUpdates do Telegram Bot API)
const CHAT_ID_ADMIN = -1002656604822;

// Executar todo dia às 08:01
cron.schedule('18 12 * * *', async () => {
  try {
    const [aniversariantes] = await pool.query(`
      SELECT a.nome AS aluno_nome
      FROM alunos a
      WHERE DAY(a.data_nascimento) = DAY(CURDATE()) 
        AND MONTH(a.data_nascimento) = MONTH(CURDATE())
    `);

    if (aniversariantes.length > 0) {
      for (const { aluno_nome } of aniversariantes) {
        const mensagem = `🎉 Hoje é aniversário do aluno${aluno_nome}!`;
        await enviarMensagem(mensagem);
      }
      console.log(`[Aniversários] Mensagens enviadas: ${aniversariantes.length}`);
    } else {
      console.log(`[Aniversários] Nenhum aniversariante hoje.`);
    }

  } catch (err) {
    console.error('Erro ao verificar aniversariantes:', err.message);
  }
});