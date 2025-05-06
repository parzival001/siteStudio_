const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db'); // Ajuste conforme sua estrutura

// Configuração do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/contratos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'contrato-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Rota POST para upload do contrato
router.post('/upload-contrato/:id', upload.single('contrato'), async (req, res) => {
  const alunoId = req.params.id;
  const contratoPdf = req.file.filename;

  try {
    await db.query('UPDATE alunos SET contrato_pdf = ? WHERE id = ?', [contratoPdf, alunoId]);
    res.redirect('/professor/dados-alunos'); // Ajuste essa rota se necessário
  } catch (err) {
    console.error('Erro ao salvar contrato:', err);
    res.status(500).send('Erro ao salvar contrato.');
  }
});






// Middleware de autenticação
function authProfessor(req, res, next) {
  if (req.session.user && req.session.user.tipo === 'professor') {
    return next();
  }
  return res.redirect('/login');
}

// Página inicial do professor
router.get('/home', authProfessor, professorController.home);

// Aulas avulsas
router.get('/aulas', authProfessor, professorController.listarAulas);
router.post('/aulas/criar', authProfessor, professorController.criarAula);
router.post('/aulas/deletar/:id', authProfessor, professorController.deletarAula);
router.post('/aulas/concluir/:id', authProfessor, professorController.concluirAula);
router.get('/adicionar-aluno/:id', authProfessor, professorController.formAdicionarAluno);
router.post('/adicionar-aluno/:id', authProfessor, professorController.adicionarAlunoNaAula);
router.post('/remover-aluno/:aulaId/:alunoId', authProfessor, professorController.removerAlunoDaAula);

// Formulário de edição de aula fixa
router.get('/aulas-fixas/editar/:id', authProfessor, professorController.formEditarAulaFixa);
// Atualizar aula fixa
router.post('/aulas-fixas/editar/:id', authProfessor, professorController.editarAulaFixa);
// Deletar aula fixa
router.post('/aulas-fixas/deletar/:id', authProfessor, professorController.deletarAulaFixa);
//router.post('/aulas-fixas/remover-aluno', authProfessor, professorController.removerAlunoAulaFixa);
router.post('/aulas-fixas/:aulaId/remover-aluno/:alunoId', authProfessor, professorController.removerAlunoAulaFixa);



// Alunos
router.get('/alunos', authProfessor, professorController.listaAlunos);
router.get('/alunos/cadastrar', authProfessor, professorController.formCadastroAluno);
router.post('/alunos/cadastrar', authProfessor, professorController.cadastrarAluno);
router.get('/aluno/:id/deletar', authProfessor, professorController.deletarAluno);

//Professor
router.get('/professores', professorController.listarProfessores);

//Daods Pessoais
router.get('/dados-pessoais-alunos', professorController.verDadosPessoaisAlunos);

// Pacotes
router.get('/pacotes', authProfessor, professorController.formPacotes);
router.post('/pacotes', authProfessor, professorController.adicionarPacote);

router.get('/alunos', authProfessor, async (req, res) => {
  const busca = req.query.busca || '';

  try {
    const [alunos] = await db.query(
      `SELECT * FROM alunos WHERE nome LIKE ?`,
      [`%${busca}%`]
    );

    res.render('professor/verAlunos', { alunos, busca });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar alunos');
  }
});

router.get('/alunos/:id/editar', authProfessor, async (req, res) => {
  const alunoId = req.params.id;
  try {
    const [result] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);
    if (result.length === 0) return res.status(404).send('Aluno não encontrado');
    const aluno = result[0];
    res.render('professor/editarAluno', { aluno });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar aluno');
  }
});

router.post('/alunos/:id/editar', authProfessor, async (req, res) => {
  const alunoId = req.params.id;
  const { nome, email } = req.body;
  try {
    await db.query('UPDATE alunos SET nome = ?, email = ? WHERE id = ?', [nome, email, alunoId]);
    res.redirect('/professor/alunos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao atualizar aluno');
  }
});

//anamnase
router.get('/alunos/:id/anamnese', authProfessor, professorController.formAnamnese);
router.post('/alunos/:id/anamnese', authProfessor, professorController.salvarAnamnese);
router.get('/anamnese/:id', authProfessor, professorController.exibirFormularioAnamnese);
router.get('/aluno/:id/anamnese', professorController.verAnamnese);
router.get('/aluno/:id/anamnese/:anamneseId', professorController.verAnamnese);
router.get('/aluno/:id/anamnese', professorController.exibirFormularioAnamnese);

router.get('/aulas-fixas/nova', authProfessor, async (req, res) => {
  try {
    // Busca tipos de aula
    const [tipos] = await db.query('SELECT id, nome FROM tipos_aula');

    // Busca professores
    const [professores] = await db.query('SELECT id, nome FROM professores');

    // Busca todas as aulas fixas com nome do tipo e professor
    const [aulasFixas] = await db.query(`
      SELECT af.*, t.nome AS tipo_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN tipos_aula t ON af.tipo_id = t.id
      JOIN professores p ON af.professor_id = p.id
    `);

    // Formata e anexa os alunos de cada aula
    for (const aula of aulasFixas) {
      aula.dia_semana = aula.dia_semana.charAt(0).toUpperCase() + aula.dia_semana.slice(1);
      aula.horario = aula.horario.slice(0, 5);

      const [alunosAula] = await db.query(
        `SELECT a.id, a.nome FROM alunos a
         JOIN alunos_aulas_fixas aaf ON a.id = aaf.aluno_id
         WHERE aaf.aula_fixa_id = ?`,
        [aula.id]
      );
      aula.alunos = alunosAula;
    }

    // Busca todos os alunos para o formulário
    const [alunos] = await db.query('SELECT id, nome FROM alunos');

    // Renderiza tudo
    res.render('professor/novaAulaFixa', {
      tipos,
      professores,
      aulasFixas,
      alunos
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar aulas fixas');
  }
});

router.get('/aulas-fixas/:id', authProfessor, async (req, res) => {
  const aulaId = req.params.id;

  try {
    const [aula] = await db.query(`
      SELECT af.*, t.nome AS tipo_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN tipos_aula t ON af.tipo_id = t.id
      JOIN professores p ON af.professor_id = p.id
      WHERE af.id = ?`, [aulaId]);

    if (!aula.length) {
      return res.status(404).send('Aula fixa não encontrada');
    }

    // Pega os alunos cadastrados nessa aula
    const [alunos] = await db.query(`
      SELECT a.id, a.nome FROM alunos a
      JOIN alunos_aulas_fixas aaf ON a.id = aaf.aluno_id
      WHERE aaf.aula_fixa_id = ?`, [aulaId]);

    // Ao invés de renderizar, apenas redireciona de volta à página principal
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar detalhes da aula fixa');
  }
});

router.post('/aulas-fixas/nova', authProfessor, async (req, res) => {
  const { tipo_id, professor_id, dia_semana, horario, vagas } = req.body;
  try {
    await db.query(`
      INSERT INTO aulas_fixas (tipo_id, professor_id, dia_semana, horario, vagas)
      VALUES (?, ?, ?, ?, ?)`,
      [tipo_id, professor_id, dia_semana, horario, vagas]
    );
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    res.status(500).send('Erro ao salvar aula fixa');
  }
});

router.get('/aulas-fixas/editar/:id', authProfessor, async (req, res) => {
  const id = req.params.id;
  try {
    const [aula] = await db.query('SELECT * FROM aulas_fixas WHERE id = ?', [id]);
    const [tipos] = await db.query('SELECT * FROM tipos_aula');
    const [professores] = await db.query('SELECT * FROM professores');
    res.render('professor/editarAulaFixa', { aula: aula[0], tipos, professores });
  } catch (err) {
    res.status(500).send('Erro ao carregar aula fixa');
  }
});

router.post('/aulas-fixas/editar/:id', authProfessor, async (req, res) => {
  const { tipo_id, professor_id, dia_semana, horario, vagas } = req.body;
  const id = req.params.id;

  try {
    await db.query(`
      UPDATE aulas_fixas
      SET tipo_id = ?, professor_id = ?, dia_semana = ?, horario = ?, vagas = ?
      WHERE id = ?`,
      [tipo_id, professor_id, dia_semana, horario, vagas, id]
    );
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    res.status(500).send('Erro ao atualizar aula fixa');
  }
});

router.post('/aulas-fixas/:aulaId/remover-aluno/:alunoId', authProfessor, async (req, res) => {
  const { aulaId, alunoId } = req.params;

  try {
    // Remover o relacionamento entre o aluno e a aula fixa
    await db.query('DELETE FROM alunos_aulas_fixas WHERE aula_fixa_id = ? AND aluno_id = ?', [aulaId, alunoId]);

    // Opcional: aumentar as vagas novamente
    await db.query('UPDATE aulas_fixas SET vagas = vagas + 1 WHERE id = ?', [aulaId]);

    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover aluno da aula fixa');
  }
});

// Adicionar aluno à aula fixa
router.post('/aulas-fixas/:id/adicionar-aluno', authProfessor, async (req, res) => {
  const aulaId = req.params.id; // Pega o ID da aula fixa
  const alunoId = req.body.aluno_id; // Pega o ID do aluno a ser adicionado

  try {
    // Verifica se o aluno já está cadastrado nessa aula
    const [existe] = await db.query(`
      SELECT * FROM alunos_aulas_fixas WHERE aula_fixa_id = ? AND aluno_id = ?`,
      [aulaId, alunoId]
    );

    if (existe.length > 0) {
      return res.status(400).send('Aluno já está cadastrado nesta aula');
    }

    // Adiciona o aluno à aula fixa
    await db.query(`
      INSERT INTO alunos_aulas_fixas (aula_fixa_id, aluno_id) 
      VALUES (?, ?)`,
      [aulaId, alunoId]
    );

    // Atualiza a quantidade de vagas da aula fixa
    const [aula] = await db.query('SELECT vagas FROM aulas_fixas WHERE id = ?', [aulaId]);
    const vagasRestantes = aula[0].vagas - 1;

    await db.query('UPDATE aulas_fixas SET vagas = ? WHERE id = ?', [vagasRestantes, aulaId]);

    res.redirect(`/professor/aulas-fixas/${aulaId}`); // Redireciona para a página da aula fixa

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao adicionar aluno à aula');
  }
});

router.post('/aulas-fixas/deletar/:id', authProfessor, async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM aulas_fixas WHERE id = ?', [id]);
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    res.status(500).send('Erro ao deletar aula fixa');
  }
});

// Pacotes por aluno
router.get('/aluno/:id/pacote', authProfessor, async (req, res) => {
  const alunoId = req.params.id;
  try {
    const [aluno] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);
    res.render('professor/adicionarPacote', { aluno: aluno[0] });
  } catch (err) {
    res.status(500).send('Erro ao carregar dados do aluno');
  }
});

router.post('/aluno/:id/pacote', authProfessor, async (req, res) => {
  const alunoId = req.params.id;
  const { quantidade, validade } = req.body;

  try {
    await db.query(`
      INSERT INTO pacotes (aluno_id, quantidade_creditos, validade)
      VALUES (?, ?, ?)`,
      [alunoId, quantidade, validade]
    );
    res.redirect('/professor/alunos');
  } catch (err) {
    res.status(500).send('Erro ao adicionar pacote');
  }
});

// Tipos de aula
router.get('/tipos-aula', authProfessor, async (req, res) => {
  try {
    const [tipos] = await db.query('SELECT * FROM tipos_aula');
    res.render('professor/tiposAula', { tipos });
  } catch (err) {
    res.status(500).send('Erro ao listar tipos de aula');
  }
});

router.post('/tipos-aula/adicionar', authProfessor, async (req, res) => {
  const { nome } = req.body;
  try {
    await db.query('INSERT INTO tipos_aula (nome) VALUES (?)', [nome]);
    res.redirect('/professor/tipos-aula');
  } catch (err) {
    res.status(500).send('Erro ao adicionar tipo de aula');
  }
});

router.post('/tipos-aula/deletar/:id', authProfessor, async (req, res) => {
  const id = req.params.id;
  try {
    await db.query('DELETE FROM tipos_aula WHERE id = ?', [id]);
    res.redirect('/professor/tipos-aula');
  } catch (err) {
    res.status(500).send('Erro ao deletar tipo de aula');
  }
});



// Anamnese
router.get('/aluno/:id/anamnese', authProfessor, async (req, res) => {
  const alunoId = req.params.id;
  try {
    const [aluno] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);
    const [anamnese] = await db.query('SELECT * FROM anamneses WHERE aluno_id = ?', [alunoId]);

    res.render('professor/anamnese', {
      aluno: aluno[0],
      anamnese: anamnese[0]
    });
  } catch (err) {
    res.status(500).send('Erro ao carregar anamnese');
  }
});

router.post('/aluno/:id/anamnese', authProfessor, async (req, res) => {
  const alunoId = req.params.id;
  const { observacoes } = req.body;
  const dataAtual = new Date().toISOString().split('T')[0];

  try {
    const [existe] = await db.query('SELECT * FROM anamneses WHERE aluno_id = ?', [alunoId]);

    if (existe.length > 0) {
      await db.query(`
        UPDATE anamneses SET observacoes = ?, data = ? WHERE aluno_id = ?`,
        [observacoes, dataAtual, alunoId]
      );
    } else {
      await db.query(`
        INSERT INTO anamneses (aluno_id, observacoes, data)
        VALUES (?, ?, ?)`,
        [alunoId, observacoes, dataAtual]
      );
    }

    res.redirect('/professor/aluno/' + alunoId + '/anamnese');
  } catch (err) {
    res.status(500).send('Erro ao salvar anamnese');
  }
});


//PROFESSOR
router.get('/cadastrar', async (req, res) => {
  try {
    const [professores] = await db.query('SELECT * FROM professores');
    res.render('professor/cadastrarProfessor', { professores });
  } catch (err) {
    res.status(500).send('Erro ao carregar professores');
  }
});

router.post('/cadastrar', async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const hash = await bcrypt.hash(senha, 10);
    await db.query('INSERT INTO professores (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hash]);
    res.redirect('/professor/cadastrar');
  } catch (err) {
    res.status(500).send('Erro ao cadastrar professor');
  }
});

router.post('/deletar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM professores WHERE id = ?', [id]);
    res.redirect('/professor/cadastrar');
  } catch (err) {
    res.status(500).send('Erro ao deletar professor');
  }
});

router.post('/upload-contrato/:id', upload.single('contrato'), async (req, res) => {
  const alunoId = req.params.id;
  const contratoPdf = req.file.filename;

  await db.query('UPDATE alunos SET contrato_pdf = ? WHERE id = ?', [contratoPdf, alunoId]);
  res.redirect('/professor/dados-pessoais-alunos');
});

router.post('/upload-contrato/:id', upload.single('contrato'), async (req, res) => {
  // ...
});

module.exports = router;
