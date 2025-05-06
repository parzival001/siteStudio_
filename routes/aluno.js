const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Supondo que você tenha um arquivo de conexão com o banco de dados

// Middleware de autenticação
function authAluno(req, res, next) {
  if (req.session.user && req.session.user.tipo === 'aluno') {
    console.log('Usuário autenticado:', req.session.user);  // Verifique a sessão aqui
    return next();
  }
  return res.redirect('/login');
}

// Rota de home do aluno
router.get('/home', authAluno, async (req, res) => {
  const alunoId = req.session.user.id; // Mudança aqui: agora usamos req.session.user

  const [[aluno]] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);

  const [aulas] = await db.query(`
    SELECT a.id, a.data, a.horario, a.vagas, t.nome AS tipo_nome, p.nome AS professor_nome
    FROM aulas a
    JOIN tipos_aula t ON a.tipo_id = t.id
    JOIN professores p ON a.professor_id = p.id
    WHERE a.status = 'pendente'
  `);

  const [agendadas] = await db.query('SELECT aula_id FROM aulas_alunos WHERE aluno_id = ?', [alunoId]);
  const aulasAgendadas = agendadas.map(a => a.aula_id);

  const [historico] = await db.query(`
    SELECT a.data, a.horario, t.nome AS tipo_nome, p.nome AS professor_nome
    FROM aulas_alunos aa
    JOIN aulas a ON aa.aula_id = a.id
    JOIN tipos_aula t ON a.tipo_id = t.id
    JOIN professores p ON a.professor_id = p.id
    WHERE aa.aluno_id = ? AND a.status = 'concluida'
    ORDER BY a.data DESC
  `, [alunoId]);

  const [pacotes] = await db.query(`
    SELECT * FROM pacotes WHERE aluno_id = ? AND validade >= CURRENT_DATE
  `, [alunoId]);

  const [[anamnese]] = await db.query(`
    SELECT observacoes FROM anamneses WHERE aluno_id = ?
  `, [alunoId]);

  res.render('aluno/home', {
    aluno,
    aulas,
    aulasAgendadas,
    historico,
    pacotes,
    anamnese: anamnese ? anamnese.observacoes : "Nenhuma anamnese cadastrada"
  });
});

module.exports = router;