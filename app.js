const express = require('express');
const handlebars = require('express-handlebars');
const session = require('express-session');
const path = require('path');
const cron = require('node-cron');
const bcrypt = require('bcrypt'); 
const app = express();
const db = require('./config/db');
require('./cron/index');
require('dotenv').config();



// const { enviarMensagem } = require('./telegramService');

// async function verificarAniversarios() {
//   const hoje = new Date();
//   const dia = hoje.getDate();
//   const mes = hoje.getMonth() + 1;

//   const [alunos] = await db.query(`
//     SELECT nome, telegram_chat_id FROM alunos
//     WHERE DAY(data_nascimento) = ? AND MONTH(data_nascimento) = ?
//   `, [dia, mes]);

//   for (const aluno of alunos) {
//     if (aluno.telegram_chat_id) {
//       await enviarMensagem(aluno.telegram_chat_id, `Feliz aniversário, ${aluno.nome}! Que seu dia seja incrível!`);
//     }
//   }
// }




// Configurar handlebars com helpers
const hbs = handlebars.create({
  defaultLayout: 'main',
  extname: '.handlebars',
  helpers: {
    eq: function (a, b, options) {
      if (typeof options === 'object' && typeof options.fn === 'function') {
        return a === b ? options.fn(this) : options.inverse(this);
      } else {
        return a === b;
      }
    },
    sortBy: function (array, field) {
      if (!Array.isArray(array)) return [];
      return array.slice().sort((a, b) => {
        const valA = (a[field] || '').toString().toLowerCase();
        const valB = (b[field] || '').toString().toLowerCase();
        return valA.localeCompare(valB);
      });
    },
    ifCond: function (v1, operator, v2, options) {
      switch (operator) {
        case '==': return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===': return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=': return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==': return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<': return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=': return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>': return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=': return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&': return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||': return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default: return options.inverse(this);
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
    },

    // ✅ Adicionados:
    subtract: function (a, b) {
      return a - b;
    },
    lte: function (a, b) {
      return a <= b;
    }
  }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '30d',   // define cache de 30 dias
    etag: true,      // mantém ETag para evitar re-download se não mudou
    lastModified: true
}));
app.use('/uploads/contratos', express.static('uploads/contratos'));
const compression = require('compression');
app.use(compression());




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




