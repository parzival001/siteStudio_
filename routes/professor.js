const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db'); // Ajuste conforme sua estrutura




const professorController = require('../controllers/professorController');
console.log('Editar função:', professorController.editarPacoteForm);

// Configuração do armazenamento dos arquivos PDF
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/contratos/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Rota POST para upload do contrato
router.post('/upload-contrato/:id', upload.single('contrato'), async (req, res) => {
  const alunoId = req.params.id;

  if (!req.file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  const contratoPdf = req.file.filename;

  try {
    // Verificar se o aluno existe antes de tentar atualizar
    const [aluno] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);
    if (!aluno) {
      return res.status(404).send('Aluno não encontrado.');
    }

    // Atualizar o contrato no banco de dados
    await db.query('UPDATE alunos SET contrato_pdf = ? WHERE id = ?', [contratoPdf, alunoId]);
    res.redirect('/professor/dadosPessoaisAlunos'); // Redireciona para a página de dados do aluno
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
router.post('/pacotes/editar/:id', professorController.atualizarPacote);



router.get('/pacotes/:id/editar', professorController.editarPacoteForm);
router.get('/pacotes/aluno/:id', professorController.verPacotesAluno);

router.get('/pacotes/mover-aula/:id', professorController.selecionarAulaParaMover);
router.post('/pacotes/mover-aula/:id', professorController.moverAulaParaPacote);
router.get('/pacotes/editar/:id', professorController.editarPacote);


///////////////////////////////////////////////////// PACOTES/////////////////////////////////////////////////////////

router.post('/pacotes/deletar/:id', professorController.deletarPacote);
router.get('/pacotes/novo/:id', professorController.formNovoPacote);
router.post('/pacotes/novo', professorController.criarPacote);
//router.get('/pacotes/aluno/:id', professorController.verPacotesPorAluno);
router.post('/pacotes/criar', professorController.criarPacote);
//router.get('/pacotes/:id', professorController.verPacotesPorAluno);
router.get('pacotes/alunos/:aluno_id', professorController.listarPacotesPorAluno);

router.post('/pacotes', authProfessor, professorController.adicionarPacote);
router.get('/pacotes', async (req, res) => {
  try {
    const [pacotes] = await db.query(`
      SELECT p.*, a.nome AS aluno_nome, c.nome AS categoria_nome
      FROM pacotes p
      JOIN alunos a ON p.aluno_id = a.id
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
    `);
    res.render('professor/pacotes', { pacotes });
  } catch (err) {
    console.error('Erro ao buscar pacotes:', err);
    res.status(500).send('Erro ao buscar pacotes');
  }
});

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
    res.redirect('/professor/pacotes/aluno/${alunoId}');
  } catch (err) {
    res.status(500).send('Erro ao adicionar pacote');
  }
});

//deletar pacote
router.post('/deletar-pacote/:id', (req, res) => {
  const pacoteId = req.params.id;
  console.log('Tentando deletar pacote:', pacoteId);

  db.query('DELETE FROM pacotes WHERE id = ?', [pacoteId], (err, results) => {
    if (err) {
      console.error('Erro ao deletar pacote:', err);
      return res.status(500).send('Erro ao deletar pacote');
    }
    console.log('Pacote deletado:', results);
    res.redirect('/professor/pacotes');
  });
});


/////////////////////////////////////////////////// Créditos manuais//////////////////////////////////////////////
router.get('/creditos/novo', professorController.formAdicionarCredito);
router.post('/creditos/novo', professorController.adicionarCredito);
router.get('/creditos', professorController.listarCreditos);



// Aulas avulsas
router.get('/aulas', authProfessor, professorController.listarAulas);
router.post('/aulas/criar', authProfessor, professorController.criarAula);
router.post('/aulas/deletar/:id', authProfessor, professorController.deletarAula);
router.post('/aulas/concluir/:id', authProfessor, professorController.concluirAula);
router.get('/adicionar-aluno/:id', authProfessor, professorController.formAdicionarAluno);
router.post('/adicionar-aluno/:id', authProfessor, professorController.adicionarAlunoNaAula);


// Formulário de edição de aula fixa
router.get('/aulas-fixas/editar/:id', authProfessor, professorController.formEditarAulaFixa);
// Atualizar aula fixa
router.post('/aulas-fixas/editar/:id', authProfessor, professorController.editarAulaFixa);
// Deletar aula fixa
router.post('/aulas-fixas/deletar/:id', authProfessor, professorController.deletarAulaFixa);
//router.post('/aulas-fixas/remover-aluno', authProfessor, professorController.removerAlunoAulaFixa);
router.post('/aulas-fixas/:aulaId/remover-aluno/:alunoId', authProfessor, professorController.removerAlunoAulaFixa);
router.post('/remover-aluno/:aulaId/:alunoId', authProfessor, professorController.removerAlunoDaAula);
router.post('/pacotes/atualizar-utilizadas/:id', professorController.atualizarAulasUtilizadas);



//categorias
router.get('/categorias', professorController.listarCategorias);
router.post('/categorias', professorController.criarCategoria);
router.post('/categorias/:id/delete', professorController.deletarCategoria);

// Alunos
router.get('/alunos/cadastrar', authProfessor, professorController.formCadastroAluno);
router.post('/alunos/cadastrar', authProfessor, professorController.cadastrarAluno);
router.get('/aluno/:id/deletar', authProfessor, professorController.deletarAluno);

//Professor
router.get('/professores', professorController.listarProfessores);

//Daods Pessoais
router.get('/dados-pessoais-alunos', professorController.verDadosPessoaisAlunos);
router.get('/dadosPessoaisAlunos', professorController.verDadosPessoaisAlunos);
router.post('/atualizar-dados-aluno/:id', professorController.atualizarDadosAluno);
router.get('/ver-dados-aluno/:id', professorController.verDadosAluno);


router.get('/dados-alunos', async (req, res) => {
  try {
    const [alunos] = await db.query('SELECT * FROM alunos');
    res.render('professor/dadosAlunos', { alunos });
  } catch (err) {
    res.status(500).send('Erro ao carregar alunos');
  }
});





router.get('/alunos', authProfessor, async (req, res) => {
  const busca = req.query.busca || '';

  try {
    const [alunos] = await db.query(
      `SELECT * FROM alunos WHERE nome LIKE ?`,
      [`%${busca}%`]
    );

    res.render('professor/listaAlunos', { alunos, busca });
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
  const { nome, email, senha } = req.body;

  try {
    // Se a senha foi enviada, atualiza também a senha
    if (senha && senha.trim() !== '') {
      const senhaHash = bcrypt.hashSync(senha, 10);
      await db.query(
        'UPDATE alunos SET nome = ?, email = ?, senha = ? WHERE id = ?',
        [nome, email, senhaHash, alunoId]
      );
    } else {
      // Atualiza apenas nome e email
      await db.query(
        'UPDATE alunos SET nome = ?, email = ? WHERE id = ?',
        [nome, email, alunoId]
      );
    }

    res.redirect('/professor/alunos');
  } catch (err) {
    console.error('Erro ao atualizar aluno:', err);
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
    // Busca categorias de aula
    const [categorias] = await db.query('SELECT categoria_id, nome FROM categorias');

    // Busca professores
    const [professores] = await db.query('SELECT id, nome FROM professores');

    // Busca todas as aulas fixas com nome da categoria e do professor
    const [aulasFixas] = await db.query(`
      SELECT af.*, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
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
      categorias,
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
      SELECT af.*, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
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

    // Redireciona de volta à página principal de aulas fixas
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao carregar detalhes da aula fixa');
  }
});

router.post('/aulas-fixas/nova', authProfessor, async (req, res) => {
  const { categoria_id, professor_id, dia_semana, horario, vagas } = req.body;
  try {
    await db.query(`
      INSERT INTO aulas_fixas (categoria_id, professor_id, dia_semana, horario, vagas)
      VALUES (?, ?, ?, ?, ?)`,
      [categoria_id, professor_id, dia_semana, horario, vagas]
    );
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar aula fixa');
  }
});

router.get('/aulas-fixas/editar/:id', authProfessor, async (req, res) => {
  const id = req.params.id;
  try {
    const [aula] = await db.query('SELECT * FROM aulas_fixas WHERE id = ?', [id]);
    const [categorias] = await db.query('SELECT * FROM categorias');
    const [professores] = await db.query('SELECT * FROM professores');
    res.render('professor/editarAulaFixa', { aula: aula[0], categorias, professores });
  } catch (err) {
    res.status(500).send('Erro ao carregar aula fixa');
  }
});

router.post('/aulas-fixas/editar/:id', authProfessor, async (req, res) => {
  const { categoria_id, professor_id, dia_semana, horario, vagas } = req.body;
  const id = req.params.id;

  try {
    await db.query(`
      UPDATE aulas_fixas
      SET categoria_id = ?, professor_id = ?, dia_semana = ?, horario = ?, vagas = ?
      WHERE id = ?`,
      [categoria_id, professor_id, dia_semana, horario, vagas, id]
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
  const aulaId = req.params.id;
  const alunoId = req.body.aluno_id;

  try {
    // Verifica se o aluno já está cadastrado
    const [existe] = await db.query(`
      SELECT * FROM alunos_aulas_fixas WHERE aula_fixa_id = ? AND aluno_id = ?`,
      [aulaId, alunoId]
    );

    if (existe.length > 0) {
      return res.status(400).send('Aluno já está cadastrado nesta aula');
    }

    // Verifica vagas disponíveis
    const [[aula]] = await db.query('SELECT vagas, categoria_id FROM aulas_fixas WHERE id = ?', [aulaId]);

    if (aula.vagas <= 0) {
      return res.status(400).send('Não há mais vagas disponíveis para esta aula');
    }

    // Busca pacote válido do aluno
    const [[pacote]] = await db.query(`
      SELECT * FROM pacotes_aluno
      WHERE aluno_id = ?
        AND (FIND_IN_SET(?, categoria_id) OR passe_livre = 1)
        AND quantidade_aulas > 0
        AND data_validade >= CURDATE()
      ORDER BY data_validade ASC
      LIMIT 1
    `, [alunoId, aula.categoria_id]);

    if (!pacote) {
      return res.status(400).send('O aluno não possui créditos disponíveis para esta modalidade');
    }

    // Adiciona o aluno na aula
    await db.query(`
      INSERT INTO alunos_aulas_fixas (aula_fixa_id, aluno_id)
      VALUES (?, ?)`, [aulaId, alunoId]
    );

    // Atualiza as vagas
    await db.query('UPDATE aulas_fixas SET vagas = vagas - 1 WHERE id = ?', [aulaId]);

    // Atualiza o pacote
    await db.query(`
      UPDATE pacotes_aluno
      SET quantidade_aulas = quantidade_aulas - 1,
          aulas_utilizadas = aulas_utilizadas + 1
      WHERE id = ?`, [pacote.id]
    );

    res.redirect(`/professor/aulas-fixas/${aulaId}`);
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

    await db.query(`
      INSERT INTO professores 
      (nome, email, senha, dados_pessoais, telefone, especialidade, bio)
      VALUES (?, ?, ?, '', '', '', '')
    `, [nome, email, hash]);

    res.redirect('/professor/cadastrar');
  } catch (err) {
    console.error('Erro ao cadastrar professor:', err.message);  // aparece no terminal
    res.status(500).send(`Erro ao cadastrar professor: ${err.message}`);  // aparece no navegador
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

// Rota GET para exibir o formulário de atualização
router.get('/atualizar-dados-aluno/:id', async (req, res) => {
  const alunoId = req.params.id;
  
  try {
    const [aluno] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);
    
    if (aluno.length > 0) {
      res.render('professor/atualizarDadosAluno', { aluno: aluno[0] });
    } else {
      res.status(404).send('Aluno não encontrado');
    }
  } catch (err) {
    console.error('Erro ao buscar dados do aluno:', err);
    res.status(500).send('Erro ao carregar dados do aluno');
  }
});








module.exports = router;
