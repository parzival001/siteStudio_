const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Supondo que você tenha um arquivo de conexão com o banco de dados
const moment = require('moment');
const alunoController = require('../controllers/alunoController');

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

  try {
    // Carregar os dados do aluno
    const [[aluno]] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);

    // Carregar as aulas pendentes
    const [aulas] = await db.query(`
      SELECT a.id, a.data, a.horario, a.vagas, t.nome AS tipo_nome, p.nome AS professor_nome, a.status
      FROM aulas a
      JOIN tipos_aula t ON a.tipo_id = t.id
      JOIN professores p ON a.professor_id = p.id
      WHERE a.status = 'pendente'
    `);

    // Carregar as aulas já agendadas pelo aluno
    const [agendadas] = await db.query('SELECT aula_id FROM aulas_alunos WHERE aluno_id = ?', [alunoId]);
    const aulasAgendadas = agendadas.map(a => a.aula_id);

    // Verificar se o aluno já está inscrito nas aulas pendentes
    const aulasFormatadas = aulas.map(aula => {
      const jaInscrito = aulasAgendadas.includes(aula.id); // Verifica se o aluno já está inscrito
      const podeDesmarcar = podeDesmarcarAula(aula.data); // Lógica para verificar cancelamento
      return {
        ...aula,
        ja_inscrito: jaInscrito,
        pode_desmarcar: podeDesmarcar,
      };
    });

    // Carregar o histórico de aulas concluídas
    const [historico] = await db.query(`
      SELECT a.data, a.horario, t.nome AS tipo_nome, p.nome AS professor_nome
      FROM aulas_alunos aa
      JOIN aulas a ON aa.aula_id = a.id
      JOIN tipos_aula t ON a.tipo_id = t.id
      JOIN professores p ON a.professor_id = p.id
      WHERE aa.aluno_id = ? AND a.status = 'concluida'
      ORDER BY a.data DESC
    `, [alunoId]);

    // Carregar os pacotes ativos do aluno
    const [pacotes] = await db.query(`
      SELECT * FROM pacotes_aluno WHERE aluno_id = ? AND data_validade >= CURRENT_DATE
    `, [alunoId]);

    // Carregar a anamnese do aluno
    const [[anamnese]] = await db.query(`
      SELECT observacoes FROM anamneses WHERE aluno_id = ?
    `, [alunoId]);

    // Passar os dados para a página do aluno
    res.render('aluno/home', {
      aluno,
      aulas: aulasFormatadas,
      aulasAgendadas,
      historico,
      pacotes,
      anamnese: anamnese ? anamnese.observacoes : "Nenhuma anamnese cadastrada"
    });
  } catch (err) {
    console.error('Erro ao carregar home do aluno:', err);
    res.render('aluno/home', { error: 'Erro ao carregar os dados. Tente novamente.' });
  }
});

// Função que calcula se o aluno pode desmarcar a aula
function podeDesmarcarAula(dataAula) {
  const dataAulaObj = new Date(dataAula);
  const horaAtual = new Date();

  // Para a primeira aula, cancelamento é possível até 2 horas antes
  if (dataAulaObj - horaAtual <= 2 * 60 * 60 * 1000) {
    return true; // Pode cancelar
  }

  // Para as demais, é possível desmarcar até 12 horas antes
  if (dataAulaObj - horaAtual <= 12 * 60 * 60 * 1000) {
    return true;
  }
  return false;
}

router.get('/aulas', authAluno, async (req, res) => {
  const alunoId = req.session.user.id;

  try {
    // Busca todas as aulas disponíveis e futuras
    const [aulas] = await db.query(`
      SELECT 
        a.id, 
        a.data AS data_raw,
        DATE_FORMAT(a.data, '%d/%m/%Y') AS data_formatada,
        a.horario, 
        a.vagas, 
        t.nome AS tipo_nome, 
        p.nome AS professor_nome, 
        a.status
      FROM aulas a
      JOIN tipos_aula t ON a.tipo_id = t.id
      JOIN professores p ON a.professor_id = p.id
      WHERE a.status = 'pendente' AND a.data >= CURDATE()
    `);

    console.log('Aulas encontradas:', aulas); // Para depuração

    // Aulas que o aluno está inscrito
    const [inscricoes] = await db.query(`
      SELECT aula_id FROM aulas_alunos WHERE aluno_id = ?
    `, [alunoId]);

    const aulasAgendadas = inscricoes.map(i => i.aula_id);

    // A primeira aula do aluno (por data mais próxima)
    const [primeiraAula] = await db.query(`
      SELECT a.id, a.data, a.horario 
      FROM aulas a
      JOIN aulas_alunos aa ON aa.aula_id = a.id
      WHERE aa.aluno_id = ?
      ORDER BY a.data, a.horario
      LIMIT 1
    `, [alunoId]);

    // Montar dados para a view
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
    res.render('aluno/aulas', { error: 'Erro ao carregar aulas.' });
  }
});

// Exibir pacotes
router.get('/pacotes', authAluno, async (req, res) => {
  const alunoId = req.session.user.id; // Mudança aqui: agora usamos req.session.user

  try {
    const [pacotes] = await db.query(`
      SELECT * FROM pacotes_aluno WHERE aluno_id = ? AND data_validade >= CURRENT_DATE
    `, [alunoId]);

    res.render('aluno/pacotes', { pacotes });
  } catch (err) {
    console.error('Erro ao carregar pacotes:', err);
    res.render('aluno/pacotes', { error: 'Erro ao carregar os pacotes. Tente novamente.' });
  }
});

// Exibir histórico
router.get('/historico', authAluno, async (req, res) => {
  const alunoId = req.session.user.id; // Mudança aqui: agora usamos req.session.user

  try {
    const [historico] = await db.query(`
      SELECT a.data, a.horario, t.nome AS tipo_nome, p.nome AS professor_nome
      FROM aulas_alunos aa
      JOIN aulas a ON aa.aula_id = a.id
      JOIN tipos_aula t ON a.tipo_id = t.id
      JOIN professores p ON a.professor_id = p.id
      WHERE aa.aluno_id = ? AND a.status = 'concluida'
      ORDER BY a.data DESC
    `, [alunoId]);

    res.render('aluno/historico', { historico });
  } catch (err) {
    console.error('Erro ao carregar histórico:', err);
    res.render('aluno/historico', { error: 'Erro ao carregar o histórico. Tente novamente.' });
  }
});

// Exibir dados pessoais
router.get('/dados', authAluno, async (req, res) => {
  const alunoId = req.session.user.id; // Mudança aqui: agora usamos req.session.user

  try {
    const [[aluno]] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);

    res.render('aluno/dados', { aluno });
  } catch (err) {
    console.error('Erro ao carregar dados pessoais:', err);
    res.render('aluno/dados', { error: 'Erro ao carregar os dados pessoais. Tente novamente.' });
  }
});


// Exibir anamnese
router.get('/anamnese', authAluno, async (req, res) => {
  const alunoId = req.session.user.id;

  const [[anamnese]] = await db.query(`
    SELECT
      peso, estatura, contato_emergencia_nome, contato_emergencia_telefone,
      tempo_sentado, atividade_fisica, fumante, alcool, alimentacao,
      gestante, tratamento_medico, lesoes, marcapasso, metais,
      problema_cervical, procedimento_cirurgico, alergia_medicamentosa,
      hipertensao, hipotensao, diabetes, epilepsia, labirintite,
      observacoes, aceite_termo, criado_em
    FROM anamneses
    WHERE aluno_id = ?
  `, [alunoId]);

  if (!anamnese) {
    return res.render('aluno/anamnese', {
      anamnese: {
        observacoes: 'Nenhuma anamnese cadastrada.'
      }
    });
  }

  res.render('aluno/anamnese', { anamnese });
});

// Exibir dados pessoais
router.get('/dados', authAluno, async (req, res) => {
  const alunoId = req.session.user.id;

  const [[aluno]] = await db.query(`
    SELECT nome, data_nascimento, endereco, cidade, uf, telefone, rg, cpf
    FROM alunos
    WHERE id = ?
  `, [alunoId]);

  res.render('aluno/dados', { aluno });
});

router.post('/aluno/inscrever/:id', authAluno, async (req, res) => {
  const aulaId = req.params.id;
  const alunoId = req.session.user.id;

  try {
    await db.query('INSERT INTO aulas_alunos (aula_id, aluno_id) VALUES (?, ?)', [aulaId, alunoId]);
    res.redirect('/aluno/aulas');  // Redireciona para a página de aulas
  } catch (err) {
    console.error('Erro ao inscrever aluno:', err);
    res.redirect('/aluno/aulas');
  }
});


router.post('/inscrever/:aulaId', authAluno, async (req, res) => {
  const aulaId = req.params.aulaId;
  const alunoId = req.session.user.id;

  try {
    // Verifica se o aluno já está inscrito
    const [jaInscrito] = await db.query(`
      SELECT * FROM aulas_alunos WHERE aula_id = ? AND aluno_id = ?
    `, [aulaId, alunoId]);

    if (jaInscrito.length > 0) {
      return res.redirect('/aluno/aulas'); // já está inscrito
    }

    // Insere a inscrição
    await db.query(`
      INSERT INTO aulas_alunos (aula_id, aluno_id) VALUES (?, ?)
    `, [aulaId, alunoId]);

    // Atualiza o número de vagas
    await db.query(`
      UPDATE aulas SET vagas = vagas - 1 WHERE id = ?
    `, [aulaId]);

    res.redirect('/aluno/aulas');
  } catch (err) {
    console.error('Erro ao inscrever aluno:', err);
    res.status(500).send('Erro ao inscrever o aluno na aula.');
  }
});

router.post('/desinscrever/:aulaId', alunoController.desinscreverAula);




module.exports = router;