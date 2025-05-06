const db     = require('../config/db');           // ajuste o caminho conforme seu projeto
const bcrypt = require('bcryptjs');
const moment = require('moment');
const axios  = require('axios');

exports.formLogin = (req, res) => {
  res.render('aluno/login');
};

exports.login = (req, res) => {
  const { email, senha } = req.body;

  console.log('login:', email, senha);

  const sql = 'SELECT * FROM alunos WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.render('aluno/login', { error: 'Erro no servidor.' });
    }
    if (results.length === 0) {
      console.log('Aluno não encontrado');
      return res.render('aluno/login', { error: 'Email ou senha incorretos.' });
    }

    const aluno = results[0];
    console.log('Aluno encontrado:', aluno);

    // bcrypt.compareSync espera hash no segundo parâmetro
    if (!bcrypt.compareSync(senha, aluno.senha)) {
      console.log('Senha incorreta');
      return res.render('aluno/login', { error: 'Email ou senha incorretos.' });
    }

    // tudo certo, salva a sessão e redireciona
    req.session.aluno = aluno;
    console.log('Redirecionando para /aluno/home');
    return res.redirect('/aluno/home');
  });
};