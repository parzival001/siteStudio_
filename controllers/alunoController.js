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
    const [aulas] = await db.query(`
      SELECT 
        a.id, 
        a.data AS data_raw, 
        DATE_FORMAT(a.data, '%d/%m/%Y') AS data_formatada,
        a.horario, 
        a.vagas, 
        IFNULL(t.nome, 'Sem tipo definido') AS tipo_nome,
        p.nome AS professor_nome, 
        a.status
      FROM aulas a
      JOIN tipos_aula t ON a.tipo_id = t.id
      JOIN professores p ON a.professor_id = p.id
      WHERE a.status = 'pendente'
    `);

    const [inscricoes] = await db.query(`
      SELECT aula_id FROM aulas_alunos WHERE aluno_id = ?
    `, [alunoId]);

    const aulasAgendadas = inscricoes.map(i => i.aula_id);

    const [primeiraAula] = await db.query(`
      SELECT a.id, a.data, a.horario 
      FROM aulas a
      JOIN aulas_alunos aa ON aa.aula_id = a.id
      WHERE aa.aluno_id = ?
      ORDER BY a.data, a.horario
      LIMIT 1
    `, [alunoId]);

    const aulasFormatadas = await Promise.all(aulas.map(async (aula) => {
      const [alunos] = await db.query(`
        SELECT alunos.id, alunos.nome 
        FROM aulas_alunos 
        JOIN alunos ON alunos.id = aulas_alunos.aluno_id 
        WHERE aula_id = ?
      `, [aula.id]);

      const jaInscrito = aulasAgendadas.includes(aula.id);
      const agora = moment();

      const horarioSplit = aula.horario.split(':');
      const dataHoraAula = moment(aula.data_raw).set({
        hour: parseInt(horarioSplit[0], 10),
        minute: parseInt(horarioSplit[1], 10),
        second: 0
      });

      let tempo_cancelamento = 12;
      if (primeiraAula.length && primeiraAula[0].id === aula.id) {
        tempo_cancelamento = 2;
      }

      const diffHoras = dataHoraAula.diff(agora, 'hours', true);
      const pode_desmarcar = diffHoras >= tempo_cancelamento;

      return {
        ...aula,
        horario_formatado: moment(aula.horario, 'HH:mm:ss').format('HH:mm'),
        alunos,
        ja_inscrito: jaInscrito,
        pode_desmarcar,
        tempo_cancelamento,
      };
    }));

    res.render('aluno/aulas', {
      aulas: aulasFormatadas
    });

  } catch (err) {
    console.error('Erro ao carregar aulas:', err);
    res.render('aluno/aulas', { error: 'Erro ao carregar as aulas. Tente novamente.' });
  }
};


exports.desinscreverAula = async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).send('Não autorizado');
  }

  const alunoId = req.session.user.id;
  const aulaId = req.params.aulaId;

  try {
    // Buscar data e horário da aula
    const [[aula]] = await db.query('SELECT data, horario FROM aulas WHERE id = ?', [aulaId]);
    if (!aula) return res.status(404).send('Aula não encontrada');

    const aulaDateStr = aula.data.toISOString().split('T')[0];
    const aulaDateTime = new Date(`${aulaDateStr}T${aula.horario}`);
    const agora = new Date();

    const diffHoras = (aulaDateTime - agora) / (1000 * 60 * 60);

    // Verificar se já participou de outras aulas
    const [registros] = await db.query(
      `SELECT COUNT(*) AS total FROM aulas_alunos WHERE aluno_id = ? AND aula_id != ?`,
      [alunoId, aulaId]
    );

    const jaParticipouAntes = registros[0].total > 0;
    const horasMinimas = jaParticipouAntes ? 12 : 2;

    if (diffHoras < horasMinimas) {
      return res.status(403).send(`Você só pode se desinscrever com pelo menos ${horasMinimas} horas de antecedência.`);
    }

    // Remover inscrição do aluno na aula
    await db.query('DELETE FROM aulas_alunos WHERE aluno_id = ? AND aula_id = ?', [alunoId, aulaId]);

    // Atualizar número de vagas
    await db.query('UPDATE aulas SET vagas = vagas + 1 WHERE id = ?', [aulaId]);

    res.redirect('/aluno/aulas');
  } catch (err) {
    console.error('Erro ao desinscrever aluno da aula:', err);
    res.status(500).send('Erro ao desinscrever da aula');
  }
};

exports.getAlunosDaAula = async (aulaId) => {
  const [alunos] = await db.query(
    `SELECT al.id, al.nome
     FROM aulas_alunos aa
     JOIN alunos al ON al.id = aa.aluno_id
     WHERE aa.aula_id = ?`,
    [aulaId]
  );
  return alunos;
};



