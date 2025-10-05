const express = require('express');
const router = express.Router();
const db = require('../config/db'); 
const moment = require('moment');
const alunoController = require('../controllers/alunoController');
const {autenticarAluno} = require('../middleware/authMiddleware')
const multer = require('multer');
const path = require('path');
const fs = require('fs');

router.get('/pacotes', autenticarAluno, alunoController.listarPacotes);

console.log('listarPacotes:', alunoController.listarPacotes);

// Middleware de autenticação
function authAluno(req, res, next) {
  if (req.session.user && req.session.user.tipo === 'aluno') {
    console.log('Usuário autenticado:', req.session.user);  // Verifique a sessão aqui
    return next();
  }
  return res.redirect('/login');
}





router.get('/home', authAluno, alunoController.homeAluno);


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





// Rota de home do aluno


router.get('/aulas', authAluno, async (req, res) => {
  const alunoId = req.session.user.id;

  try {
    // Buscar todas as aulas pendentes e futuras
    const [aulas] = await db.query(`
      SELECT 
        a.id, 
        a.data AS data_raw,
        DATE_FORMAT(a.data, '%d/%m/%Y') AS data_formatada,
        a.horario, 
        a.vagas, 
        c.nome AS categoria_nome, 
        p.nome AS professor_nome, 
        a.status
      FROM aulas a
      JOIN categorias c ON a.categoria_id = c.categoria_id
      JOIN professores p ON a.professor_id = p.id
      WHERE a.status = 'pendente' AND a.data >= CURDATE()
    `);

    // Buscar IDs das aulas em que o aluno está inscrito
    const [inscricoes] = await db.query(`
      SELECT aula_id FROM aulas_alunos WHERE aluno_id = ?
    `, [alunoId]);
    const aulasAgendadas = inscricoes.map(i => i.aula_id);

    // Buscar a primeira aula do aluno (por data e horário mais próximos)
    const [primeira] = await db.query(`
      SELECT a.id, a.data, a.horario 
      FROM aulas a
      JOIN aulas_alunos aa ON aa.aula_id = a.id
      WHERE aa.aluno_id = ?
      ORDER BY a.data ASC, a.horario ASC
      LIMIT 1
    `, [alunoId]);

    const primeiraAulaId = primeira.length ? primeira[0].id : null;

    // Formatar os dados das aulas
    const aulasFormatadas = await Promise.all(aulas.map(async (aula) => {
      const [alunos] = await db.query(`
        SELECT alunos.id, alunos.nome 
        FROM aulas_alunos 
        JOIN alunos ON alunos.id = aulas_alunos.aluno_id 
        WHERE aula_id = ?
      `, [aula.id]);

      const jaInscrito = aulasAgendadas.includes(aula.id);

      const agora = moment().utcOffset('-03:00'); // Fuso do Brasil
      const [hora, minuto] = aula.horario.split(':');
      const dataHoraAula = moment(aula.data_raw).set({
        hour: parseInt(hora),
        minute: parseInt(minuto),
        second: 0
      });

      const horasParaAula = dataHoraAula.diff(agora, 'hours', true); // diferença em horas com fração

      let tempo_cancelamento = 12;
      if (primeiraAulaId && aula.id === primeiraAulaId) {
        tempo_cancelamento = 2;
      }

      const pode_desmarcar = horasParaAula >= tempo_cancelamento;

      // Debug (opcional)
      // console.log({
      //   aulaId: aula.id,
      //   agora: agora.format(),
      //   dataHoraAula: dataHoraAula.format(),
      //   horasParaAula,
      //   tempo_cancelamento,
      //   pode_desmarcar
      // });

      return {
        ...aula,
        horario_formatado: moment(aula.horario, 'HH:mm:ss').format('HH:mm'),
        alunos,
        ja_inscrito: jaInscrito,
        pode_desmarcar,
        tempo_cancelamento
      };
    }));

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
  const alunoId = req.session.user.id;

  try {
    const [historico] = await db.query(`
      SELECT a.data, a.horario, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas_alunos aa
      JOIN aulas a ON aa.aula_id = a.id
      JOIN categorias c ON a.categoria_id = c.categoria_id
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


//////////////////////////////////////////////AULAS FIXAS /////////////////////////////////////////////

router.get('/aulas-fixas', authAluno, alunoController.listarAulasFixasDisponiveis);
router.post('/aulas-fixas/inscrever/:id', authAluno, alunoController.inscreverNaAulaFixa);
router.post('/aulas-fixas/desistir/:aulaId', authAluno, alunoController.desistirAulaFixa);


///////////////////////////////////////////ANAMNESE////////////////////////////////////////////////////
// GET - Exibir formulário
router.get('/anamnese', alunoController.exibirAnamnese);
// POST - Salvar ou atualizar anamnese
router.post('/anamnese', alunoController.salvarAnamnese);

///////////////////////////////////////////DADOS ALUNO//////////////////////////////////

// Configuração do Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'uploads', 'contratos'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `contrato_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });
// Rota para atualizar dados
router.post('/atualizar-dados', authAluno, upload.single('contrato'), alunoController.atualizarDadosAluno);

router.get('/dados', authAluno, alunoController.mostrarDadosAluno);
// Rota para exibir dados
router.get('/aluno/dados', authAluno, async (req, res) => {
  const alunoId = req.session.user.id;

  try {
    const [[aluno]] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);
    res.render('aluno/dados', { aluno });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar dados do aluno');
  }
});


module.exports = router;