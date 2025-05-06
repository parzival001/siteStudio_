const db = require('../config/db');
const bcrypt = require('bcrypt'); // Certifique-se de ter `npm install bcrypt`

exports.showLogin = (req, res) => {
  res.render('login');
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.render('login', { error: 'Por favor, preencha todos os campos.' });
    }

    const sql = `
      SELECT id, nome, email, senha, 'professor' AS tipo FROM professores WHERE email = ?
      UNION
      SELECT id, nome, email, senha, 'aluno' AS tipo FROM alunos WHERE email = ?
    `;

    const [results] = await db.query(sql, [email, email]);

    if (results.length === 0) {
      return res.render('login', { error: 'Email ou senha incorretos.' });
    }

    const user = results[0];

    const senhaValida = await bcrypt.compare(senha, user.senha).catch(() => false);

    // Se a senha do banco não for hash (texto plano antigo), compare direto:
    const senhaCorreta = senhaValida || user.senha === senha;

    if (!senhaCorreta) {
      return res.render('login', { error: 'Email ou senha incorretos.' });
    }

    req.session.user = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo
    };

    console.log('Sessão do usuário:', req.session.user);

    if (user.tipo === 'professor') {
      return res.redirect('/professor/home');
    } else if (user.tipo === 'aluno') {
      return res.redirect('/aluno/home');
    } else {
      return res.render('login', { error: 'Tipo de usuário inválido.' });
    }

  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).render('login', { error: 'Erro interno no servidor.' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Erro ao encerrar sessão:', err);
      return res.send('Erro ao sair da sessão.');
    }
    res.redirect('/login');
  });
};
