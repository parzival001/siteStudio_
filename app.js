const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const bcrypt = require('bcrypt'); // Incluído para usar no login
const upload = require('./utils/upload');
const app = express();
require('./jobs/aniversario');




cron.schedule('*/1 * * * *', async () => {
  console.log('🧹 Executando limpeza de aulas expiradas...');

  try {
    // 1. Buscar aulas vencidas
    const [aulas] = await db.query(`
      SELECT a.id, a.data, a.horario, p.nome AS professor_nome
      FROM aulas a
      JOIN professores p ON a.professor_id = p.id
      WHERE STR_TO_DATE(CONCAT(a.data, ' ', a.horario), '%Y-%m-%d %H:%i:%s') < NOW()
    `);

    for (const aula of aulas) {
      // 2. Buscar participantes
      const [alunos] = await db.query(`
        SELECT al.nome FROM alunos al
        JOIN aulas_alunos aa ON aa.aluno_id = al.id
        WHERE aa.aula_id = ?
      `, [aula.id]);

      const nomes = alunos.map(a => a.nome).join(', ') || 'Nenhum participante';

      const dataFormatada = new Date(aula.data).toLocaleDateString('pt-BR');
      const horaFormatada = aula.horario.slice(0, 5);

      // 3. Montar mensagem
      const mensagem = `✅ *Aula Concluída (Auto)*\n👨‍🏫 Professor: ${aula.professor_nome}\n📅 Data: ${dataFormatada}\n🕒 Hora: ${horaFormatada}\n👥 Participantes: ${nomes}`;

      // 4. Enviar para o Telegram
      console.log('[TELEGRAM] Enviando mensagem para aula ID', aula.id);
      await enviarMensagem(mensagem, 'Markdown');
    }

    // 5. Depois de enviar todas as mensagens, deletar
    const [result] = await db.query(`
      DELETE FROM aulas 
      WHERE STR_TO_DATE(CONCAT(data, ' ', horario), '%Y-%m-%d %H:%i:%s') < NOW()
    `);

    console.log(`🗑️ Aulas deletadas: ${result.affectedRows}`);
  } catch (err) {
    console.error('❌ Erro ao processar aulas expiradas:', err);
  }
});

const { enviarMensagem } = require('./telegramService');

async function verificarAniversarios() {
  const hoje = new Date();
  const dia = hoje.getDate();
  const mes = hoje.getMonth() + 1;

  const [alunos] = await db.query(`
    SELECT nome, telegram_chat_id FROM alunos
    WHERE DAY(data_nascimento) = ? AND MONTH(data_nascimento) = ?
  `, [dia, mes]);

  for (const aluno of alunos) {
    if (aluno.telegram_chat_id) {
      await enviarMensagem(aluno.telegram_chat_id, `Feliz aniversário, ${aluno.nome}! Que seu dia seja incrível!`);
    }
  }
}



// Configurar handlebars com helpers
const hbs = handlebars.create({
  defaultLayout: 'main',
  extname: '.handlebars',
  helpers: {
    eq: function (a, b, options) {
      if (typeof options === 'object' && typeof options.fn === 'function') {
        // Uso como block helper
        return a === b ? options.fn(this) : options.inverse(this);
      } else {
        // Uso inline: retorna booleano
        return a === b;
      }
    },
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    },
    array: (...args) => args.slice(0, -1),
    replace: (str, find, replace) => str.replaceAll(find, replace),
    capitalize: str => str.charAt(0).toUpperCase() + str.slice(1),
    formatDate: function (date) {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    },
    isVencido: function (data) {
      const validade = new Date(data);
      const hoje = new Date();
      return validade < hoje;
    },
    venceEm7Dias: function (data) {
      const validade = new Date(data);
      const hoje = new Date();
      const diff = (validade - hoje) / (1000 * 60 * 60 * 24);
      return diff <= 7 && diff > 0;
    }
  }
});


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads/contratos', express.static('uploads/contratos'));

// Configuração da sessão
app.use(session({
  secret: 'segredo',  // Troque 'segredo' por algo mais seguro em produção
  resave: false,
  saveUninitialized: true
}));

// Rotas
const authRoutes = require('./routes/auth');
const professorRoutes = require('./routes/professor');
const alunoRoutes = require('./routes/aluno');
const authController = require('./controllers/authController');


app.use('/', authRoutes);
app.use('/professor', professorRoutes);
app.use('/aluno', alunoRoutes);
app.use('/uploads', express.static('public/uploads'));

// Cron job para gerar aulas fixas
const gerarAulasFixas = require('./utils/gerarAulasFixas');
cron.schedule('0 0 * * 0', () => {
  console.log('Gerando aulas fixas...');
  gerarAulasFixas();
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Autenticação de login
const db = require('./config/db');

exports.login = (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.render('login', { error: 'Por favor, preencha todos os campos.' });
  }

  const sql = `
    SELECT id, nome, email, senha, 'professor' AS tipo FROM professores WHERE email = ?
    UNION
    SELECT id, nome, email, senha, 'aluno' AS tipo FROM alunos WHERE email = ?
  `;

  db.query(sql, [email, email], (err, results) => {
    if (err) {
      console.error('Erro no banco:', err);
      return res.render('login', { error: 'Erro interno no servidor.' });
    }

    if (results.length === 0) {
      return res.render('login', { error: 'Email ou senha incorretos.' });
    }

    const user = results[0];

    // Usando bcrypt para comparar a senha criptografada
    if (!bcrypt.compareSync(senha, user.senha)) {
      return res.render('login', { error: 'Email ou senha incorretos.' });
    }

    req.session.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo
    };

    console.log('Sessão do usuário:', req.session.user);  // Verifique os dados da sessão

    // Verifique o tipo do usuário
    console.log('Tipo de usuário:', user.tipo);

    if (user.tipo === 'professor') {
      res.redirect('/professor/home');
    } else if (user.tipo === 'aluno') {
      res.redirect('/aluno/home');
    } else {
      res.render('login', { error: 'Tipo de usuário inválido.' });
    }
  });
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.send('Erro ao sair da sessão.');
    }
    res.redirect('/login');
  });
};

app.get('/', (req, res) => {
  res.render('login'); // Isso renderiza a view "home.handlebars"
});

