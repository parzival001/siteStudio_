const db = require('../config/db'); // Ajuste o caminho conforme o seu projeto
const bcrypt = require('bcryptjs');
const moment = require('moment');
const axios = require('axios');

// Exibição do formulário de login
exports.formLogin = (req, res) => {
  res.render('aluno/login');
};

// Realiza o login
exports.login = (req, res) => {
  const { email, senha } = req.body;

  console.log('Tentando login:', email, senha);

  const sql = 'SELECT * FROM alunos WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.render('aluno/login', { error: 'Erro no servidor.' });
    }

    // Se não encontrar o aluno
    if (results.length === 0) {
      console.log('Aluno não encontrado');
      return res.render('aluno/login', { error: 'Email ou senha incorretos.' });
    }

    const aluno = results[0];
    console.log('Aluno encontrado:', aluno);

    // Verifica se a senha é válida
    if (!bcrypt.compareSync(senha, aluno.senha)) {
      console.log('Senha incorreta');
      return res.render('aluno/login', { error: 'Email ou senha incorretos.' });
    }

    // Senha correta, cria a sessão
    req.session.user = aluno; // Salva os dados do aluno na sessão (ajustado para 'user')
    console.log('Login bem-sucedido, redirecionando para /aluno/home');

    return res.redirect('/aluno/home');
  });
};

// Função para carregar a home do aluno
exports.homeAluno = async (req, res) => {
  const alunoId = req.session.user.id;

  try {
    // Buscar apenas aulas pendentes e com data igual ou posterior a hoje
    const [aulas] = await db.query(`
      SELECT 
  a.id, 
  DATE_FORMAT(a.data, '%d/%m/%Y') AS data_formatada,
  a.horario, 
  a.vagas, 
  IFNULL(t.nome, 'Sem tipo definido') AS tipo_nome,  -- Caso tipo_id seja NULL
  p.nome AS professor_nome, 
  a.status
FROM aulas a
JOIN tipos_aula t ON a.tipo_id = t.id
JOIN professores p ON a.professor_id = p.id
WHERE a.status = 'pendente'
    `);

    console.log('Aulas encontradas:', aulas);

    // Buscar aulas que o aluno já está inscrito
    const [inscricoes] = await db.query(`
      SELECT aula_id FROM aulas_alunos WHERE aluno_id = ?
    `, [alunoId]);

    const aulasAgendadas = inscricoes.map(i => i.aula_id);

    // Buscar a primeira aula agendada do aluno
    const [primeiraAula] = await db.query(`
      SELECT a.id, a.data, a.horario 
      FROM aulas a
      JOIN aulas_alunos aa ON aa.aula_id = a.id
      WHERE aa.aluno_id = ?
      ORDER BY a.data, a.horario
      LIMIT 1
    `, [alunoId]);

    // Montar e formatar os dados das aulas
    const aulasFormatadas = await Promise.all(aulas.map(async (aula) => {
      const [alunos] = await db.query(`
        SELECT alunos.id, alunos.nome 
        FROM aulas_alunos 
        JOIN alunos ON alunos.id = aulas_alunos.aluno_id 
        WHERE aula_id = ?
      `, [aula.id]);

      const jaInscrito = aulasAgendadas.includes(aula.id);

      const agora = moment();
      const dataHoraAula = moment(`${aula.data_raw} ${aula.horario}`, 'YYYY-MM-DD HH:mm:ss');
      let pode_desmarcar = false;
      let tempo_cancelamento = 12;

      if (primeiraAula.length && primeiraAula[0].id === aula.id) {
        tempo_cancelamento = 2;
      }

      if (dataHoraAula.diff(agora, 'hours', true) >= tempo_cancelamento) {
        pode_desmarcar = true;
      }

      return {
        ...aula,
        horario_formatado: moment(aula.horario, 'HH:mm:ss').format('HH:mm'),
        alunos,
        ja_inscrito: jaInscrito,
        pode_desmarcar,
        tempo_cancelamento,
      };
    }));

    console.log('Aulas formatadas:', aulasFormatadas);

    res.render('aluno/aulas', {
      aulas: aulasFormatadas
    });

  } catch (err) {
    console.error('Erro ao carregar aulas:', err);
    res.render('aluno/aulas', { error: 'Erro ao carregar as aulas. Tente novamente.' });
  }
};




