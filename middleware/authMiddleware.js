function autenticarAluno(req, res, next) {
  console.log('Session do aluno:', req.session.user);
  if (req.session && req.session.user && req.session.user.tipo === 'aluno') {
    next();
  } else {
    console.log('Bloqueado pelo middleware');
    res.redirect('/login');
  }
}

module.exports = {
  autenticarAluno
};