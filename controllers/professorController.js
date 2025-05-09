const db = require('../config/db');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();



// Controller para rotas de 'professor'

exports.home = (req, res) => {
  res.render('professor/home', { nome: req.session.user.nome });
};







exports.criarAula = async (req, res) => {
  const { professor_id, categoria_id, data, horario, vagas } = req.body;
  try {
    await db.query(
      'INSERT INTO aulas (categoria_id, professor_id, data, horario, vagas) VALUES (?, ?, ?, ?, ?)',
      [categoria_id, professor_id, data, horario, vagas]
    );
    res.redirect('/professor/aulas');
  } catch (err) {
    console.error('Erro ao criar aula:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.listarAulas = async (req, res) => {
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  try {
    // Buscar aulas com professor e categoria
    const [aulas] = await db.query(`
      SELECT a.*, ta.nome AS categoria, p.nome AS professor_nome
      FROM aulas a
      JOIN tipos_aula ta ON a.categoria_id = ta.id
      JOIN professores p ON a.professor_id = p.id
      ORDER BY a.data DESC
    `);

    // Buscar alunos associados às aulas
    const [aulaAlunos] = await db.query(`
      SELECT aa.aula_id, al.id AS aluno_id, al.nome AS aluno_nome
      FROM aula_alunos aa
      JOIN alunos al ON aa.aluno_id = al.id
    `);

    // Organizar os alunos por aula
    const alunosPorAula = {};
    aulaAlunos.forEach(({ aula_id, aluno_id, aluno_nome }) => {
      if (!alunosPorAula[aula_id]) {
        alunosPorAula[aula_id] = [];
      }
      alunosPorAula[aula_id].push({ id: aluno_id, nome: aluno_nome });
    });

    // Formatar datas e horários
    const aulasFormatadas = aulas.map(aula => {
      const horarioLimpo = aula.horario.slice(0, 5);
      const dataIso = `${aula.data.toISOString().slice(0, 10)}T${horarioLimpo}`;
      const dataObj = new Date(dataIso);
      if (isNaN(dataObj)) {
        console.warn('Data inválida:', aula.data, aula.horario);
        return { ...aula, data_formatada: 'Data inválida' };
      }
      const diaSemana = diasSemana[dataObj.getDay()];
      const dia = String(dataObj.getDate()).padStart(2, '0');
      const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
      const horarioFormatado = dataObj.toTimeString().slice(0, 5);
      return {
        ...aula,
        data_formatada: `${diaSemana} - ${dia}/${mes} às ${horarioFormatado}`,
        alunos: alunosPorAula[aula.id] || []
      };
    });

    // Buscar dados auxiliares
    const [categorias] = await db.query('SELECT id, nome FROM tipos_aula');
    const [professores] = await db.query('SELECT id, nome FROM professores');
    const [alunos] = await db.query('SELECT id, nome FROM alunos');

    // Renderizar
    res.render('professor/aulas', {
      aulas: aulasFormatadas,
      categorias,
      professores,
      alunos
    });
  } catch (err) {
    console.error('Erro ao listar aulas:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

// Método para adicionar aluno a uma aula
exports.adicionarAlunoNaAula = async (req, res) => {
  const aulaId = parseInt(req.params.id, 10);
  const { aluno_id } = req.body;

  if (isNaN(aulaId) || !aluno_id) {
    return res.status(400).send('ID inválido ou aluno não especificado');
  }

  try {
    // Verifica se ainda há vagas
    const [[aula]] = await db.query('SELECT vagas FROM aulas WHERE id = ?', [aulaId]);

    if (!aula || aula.vagas <= 0) {
      return res.status(400).send('Sem vagas disponíveis para esta aula.');
    }

    // Verifica se o aluno já está na aula
    const [verificarAluno] = await db.query(
      'SELECT * FROM aula_alunos WHERE aula_id = ? AND aluno_id = ?',
      [aulaId, aluno_id]
    );

    if (verificarAluno.length > 0) {
      return res.status(400).send('Aluno já está inscrito nesta aula');
    }

    // Adiciona o aluno e reduz a vaga
    await db.query('INSERT INTO aula_alunos (aula_id, aluno_id) VALUES (?, ?)', [aulaId, aluno_id]);
    await db.query('UPDATE aulas SET vagas = vagas - 1 WHERE id = ?', [aulaId]);

    res.redirect('/professor/aulas');
  } catch (err) {
    console.error('Erro ao adicionar aluno na aula:', err);
    res.status(500).send('Erro interno ao adicionar aluno');
  }
};

exports.deletarAluno = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM alunos WHERE id = ?', [id]);
    res.redirect('/professor/alunos');
  } catch (err) {
    console.error('Erro ao deletar aluno:', err);
    res.status(500).send('Erro interno no servidor');
  }
};


//professor
exports.cadastrarProfessor = async (req, res) => {
  const { nome, email, senha, telefone } = req.body;
  const senhaHash = bcrypt.hashSync(senha, 10);

  try {
    await db.query(
      'INSERT INTO professores (nome, email, senha, telefone) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, telefone]
    );
    res.redirect('/professor/login');
  } catch (err) {
    console.error('Erro ao cadastrar professor:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.listarProfessores = async (req, res) => {
  try {
    const [professores] = await db.query('SELECT id, nome, email, telefone FROM professores');
    res.render('professor/cadastrarProfessor', { professores });
  } catch (err) {
    console.error('Erro ao listar professores:', err);
    res.status(500).send('Erro interno no servidor');
  }
};


exports.deletarAula = async (req, res) => {
  const aulaId = parseInt(req.params.id, 10);
  if (isNaN(aulaId)) return res.status(400).send('ID inválido');
  try {
    await db.query('DELETE FROM aulas_alunos WHERE aula_id = ?', [aulaId]);
    await db.query('DELETE FROM aulas WHERE id = ?', [aulaId]);
    res.redirect('/professor/aulas');
  } catch (err) {
    console.error('Erro ao deletar aula:', err);
    res.status(500).send('Erro ao deletar aula');
  }
};

exports.concluirAula = async (req, res) => {
  const aulaId = parseInt(req.params.id, 10);
  try {
    const [alunos] = await db.query('SELECT aluno_id FROM aula_alunos WHERE aula_id = ?', [aulaId]);
    for (const { aluno_id } of alunos) {
      await db.query(
        `UPDATE pacotes_aluno
         SET creditos = creditos - 1
         WHERE aluno_id = ? AND validade >= CURDATE() AND creditos > 0
         ORDER BY validade ASC
         LIMIT 1`,
        [aluno_id]
      );
    }
    await db.query("UPDATE aulas SET status = 'concluida' WHERE id = ?", [aulaId]);
    res.redirect('/professor/aulas');
  } catch (err) {
    console.error('Erro ao concluir aula:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.formAdicionarAluno = async (req, res) => {
  const aulaId = parseInt(req.params.id, 10);
  try {
    const [alunos] = await db.query('SELECT id, nome FROM alunos');
    res.render('professor/adicionarAluno', { aulaId, alunos });
  } catch (err) {
    console.error('Erro ao buscar alunos:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.removerAlunoDaAula = async (req, res) => {
  const { aulaId, alunoId } = req.params;

  try {
    await db.query(
      'DELETE FROM aula_alunos WHERE aula_id = ? AND aluno_id = ?',
      [aulaId, alunoId]
    );
    res.redirect('/professor/aulas');
  } catch (err) {
    console.error('Erro ao remover aluno da aula:', err);
    res.status(500).send('Erro ao remover aluno da aula');
  }

    try {
      await db.query('DELETE FROM aula_alunos WHERE aula_id = ? AND aluno_id = ?', [aulaId, alunoId]);
  
      // Aumenta uma vaga
      await db.query('UPDATE aulas SET vagas = vagas + 1 WHERE id = ?', [aulaId]);
  
      res.redirect('/professor/aulas');
    } catch (err) {
      console.error('Erro ao remover aluno da aula:', err);
      res.status(500).send('Erro ao remover aluno');
    }
    

  };

  exports.formCadastroAluno = (req, res) => {
  res.render('professor/cadastrarAluno');
  };

  exports.cadastrarAluno = async (req, res) => {
  const { nome, email, senha, telefone, data_nascimento } = req.body;
  const senhaHash = bcrypt.hashSync(senha, 10);
  try {
    await db.query(
      'INSERT INTO alunos (nome, email, senha, telefone, data_nascimento) VALUES (?, ?, ?, ?, ?)',
      [nome, email, senhaHash, telefone, data_nascimento]
    );
    res.redirect('/professor/alunos');
  } catch (err) {
    console.error('Erro ao cadastrar aluno:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.listaAlunos = async (req, res) => {
  try {
    const [alunos] = await db.query('SELECT * FROM alunos');
    res.render('professor/listaAlunos', { alunos });
  } catch (err) {
    console.error('Erro ao listar alunos:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.formPacotes = async (req, res) => {
  try {
    const [alunos] = await db.query('SELECT * FROM alunos');
    res.render('professor/pacotes', { alunos });
  } catch (err) {
    console.error('Erro ao buscar alunos para pacotes:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.adicionarPacote = async (req, res) => {
  const { aluno_id, creditos, validade } = req.body;
  try {
    await db.query('INSERT INTO pacotes_aluno (aluno_id, creditos, validade) VALUES (?, ?, ?)', [aluno_id, creditos, validade]);
    res.redirect('/professor/pacotes');
  } catch (err) {
    console.error('Erro ao adicionar pacote:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

// Lista todas as aulas fixas
exports.listarAulasFixas = async (req, res) => {
  try {
    const [aulasFixas] = await db.query(`
      SELECT af.*, t.nome AS tipo_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN tipos_aula t    ON af.tipo_id      = t.id
      JOIN professores p   ON af.professor_id = p.id
      ORDER BY af.dia_semana, af.horario
    `);
    res.render('professor/novaAulaFixa', { aulasFixas });
  } catch (err) {
    console.error('Erro ao listar aulas fixas:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

// Exibe form para criar nova aula fixa
exports.formNovaAulaFixa = async (req, res) => {
  try {
    const [tipos] = await db.query('SELECT id, nome FROM tipos_aula');
    const [professores] = await db.query('SELECT id, nome FROM professores');
    
    console.log('Tipos:', tipos); // Verifique os tipos retornados
    console.log('Professores:', professores); // Verifique os professores retornados
    
    res.render('professor/novaAulaFixa', { tipos, professores });
  } catch (err) {
    console.error('Erro ao buscar dados para aula fixa:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.listarAlunos = async (req, res) => {
  try {
    const [alunos] = await db.query('SELECT * FROM alunos');
    res.render('professor/listaAlunos', { alunos });
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao listar alunos');
  }
};

//Anamnase

exports.formAnamnese = async (req, res) => {
  const alunoId = parseInt(req.params.id, 10);
  try {
    // busca dados do aluno e da anamnese (se existir)
    const [[aluno]] = await db.query('SELECT id, nome FROM alunos WHERE id = ?', [alunoId]);
    const [[anamnese]] = await db.query('SELECT * FROM anamneses WHERE aluno_id = ?', [alunoId]);
    res.render('professor/anamnese', { aluno, anamnese });
  } catch (err) {
    console.error('Erro ao carregar anamnese:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.exibirFormularioAnamnese = async (req, res) => {
  const alunoId = parseInt(req.params.id, 10);

  try {
    const [alunoRows] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);
    if (alunoRows.length === 0) {
      return res.status(404).send('Aluno não encontrado.');
    }

    const aluno = alunoRows[0];

    const [anamneseRows] = await db.query('SELECT id FROM anamneses WHERE aluno_id = ?', [alunoId]);
    const jaTemAnamnese = anamneseRows.length > 0;
    const anamneseId = jaTemAnamnese ? anamneseRows[0].id : null;

    res.render('professor/anamnese', { aluno, jaTemAnamnese, anamneseId });
  } catch (err) {
    console.error('Erro ao carregar formulário de anamnese:', err);
    res.status(500).send('Erro ao carregar formulário');
  }
};

exports.salvarAnamnese = async (req, res) => {
  const alunoId = parseInt(req.params.id, 10);
  const {
    peso,
    estatura,
    contato_emergencia_nome,
    contato_emergencia_telefone,
    tempo_sentado,
    atividade_fisica,
    fumante,
    alcool,
    alimentacao,
    gestante,
    tratamento_medico,
    lesoes,
    marcapasso,
    metais,
    problema_cervical,
    procedimento_cirurgico,
    alergia_medicamentosa,
    hipertensao,
    hipotensao,
    diabetes,
    epilepsia,
    labirintite,
    observacoes
  } = req.body;

  // Checkbox só envia valor se marcado
  const aceite_termo = req.body.aceite_termo ? 1 : 0;

  const criado_em = new Date(); // ou uso de NOW() no SQL

  try {
    // Verifica se já existe registro para este aluno
    const [existe] = await db.query(
      'SELECT * FROM anamneses WHERE aluno_id = ?',
      [alunoId]
    );

    if (existe.length > 0) {
      // Atualiza
      await db.query(
        `UPDATE anamneses SET
           peso                      = ?,
           estatura                  = ?,
           contato_emergencia_nome   = ?,
           contato_emergencia_telefone = ?,
           tempo_sentado             = ?,
           atividade_fisica          = ?,
           fumante                   = ?,
           alcool                    = ?,
           alimentacao               = ?,
           gestante                  = ?,
           tratamento_medico         = ?,
           lesoes                    = ?,
           marcapasso                = ?,
           metais                    = ?,
           problema_cervical         = ?,
           procedimento_cirurgico    = ?,
           alergia_medicamentosa     = ?,
           hipertensao               = ?,
           hipotensao                = ?,
           diabetes                  = ?,
           epilepsia                 = ?,
           labirintite               = ?,
           observacoes               = ?,
           aceite_termo              = ?,
           criado_em                 = ?
         WHERE aluno_id = ?`,
        [
          peso,
          estatura,
          contato_emergencia_nome,
          contato_emergencia_telefone,
          tempo_sentado,
          atividade_fisica,
          fumante,
          alcool,
          alimentacao,
          gestante,
          tratamento_medico,
          lesoes,
          marcapasso,
          metais,
          problema_cervical,
          procedimento_cirurgico,
          alergia_medicamentosa,
          hipertensao,
          hipotensao,
          diabetes,
          epilepsia,
          labirintite,
          observacoes,
          aceite_termo,
          criado_em,
          alunoId
        ]
      );
    } else {
      // Insere novo registro
      await db.query(
        `INSERT INTO anamneses (
           aluno_id,
           peso,
           estatura,
           contato_emergencia_nome,
           contato_emergencia_telefone,
           tempo_sentado,
           atividade_fisica,
           fumante,
           alcool,
           alimentacao,
           gestante,
           tratamento_medico,
           lesoes,
           marcapasso,
           metais,
           problema_cervical,
           procedimento_cirurgico,
           alergia_medicamentosa,
           hipertensao,
           hipotensao,
           diabetes,
           epilepsia,
           labirintite,
           observacoes,
           aceite_termo,
           criado_em
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alunoId,
          peso,
          estatura,
          contato_emergencia_nome,
          contato_emergencia_telefone,
          tempo_sentado,
          atividade_fisica,
          fumante,
          alcool,
          alimentacao,
          gestante,
          tratamento_medico,
          lesoes,
          marcapasso,
          metais,
          problema_cervical,
          procedimento_cirurgico,
          alergia_medicamentosa,
          hipertensao,
          hipotensao,
          diabetes,
          epilepsia,
          labirintite,
          observacoes,
          aceite_termo,
          criado_em
        ]
      );
    }

    res.redirect('/professor/aluno/' + alunoId + '/anamnese');
  } catch (err) {
    console.error('Erro ao salvar anamnese:', err);
    res.status(500).send('Erro ao salvar anamnese');
  }
};

exports.verAnamnese = async (req, res) => {
  const anamneseId = parseInt(req.params.anamneseId, 10);

  try {
    const [rows] = await db.query('SELECT * FROM anamneses WHERE id = ?', [anamneseId]);

    if (rows.length === 0) {
      return res.status(404).send('Anamnese não encontrada.');
    }

    const anamnese = rows[0];
    res.render('professor/verAnamnese', { anamnese });
  } catch (err) {
    console.error('Erro ao buscar anamnese:', err);
    res.status(500).send('Erro ao buscar anamnese.');
  }
};

// Salva nova aula fixa
exports.salvarAulaFixa = async (req, res) => {
  const { tipo_id, professor_id, dia_semana, horario, vagas } = req.body;
  try {
    await db.query(
      `INSERT INTO aulas_fixas 
        (tipo_id, professor_id, dia_semana, horario, vagas)
       VALUES (?, ?, ?, ?, ?)`,
      [tipo_id, professor_id, dia_semana, horario, vagas]
    );
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error('Erro ao salvar aula fixa:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

// Exibe form para editar uma aula fixa existente
exports.formEditarAulaFixa = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    const [[aula]]       = await db.query('SELECT * FROM aulas_fixas WHERE id = ?', [id]);
    const [tipos]        = await db.query('SELECT id, nome FROM tipos_aula');
    const [professores]  = await db.query('SELECT id, nome FROM professores');
    res.render('professor/editarAulaFixa', { aula, tipos, professores });
  } catch (err) {
    console.error('Erro ao buscar aula fixa para editar:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.removerAlunoAulaFixa = async (req, res) => {
  const { aulaId, alunoId } = req.params;

  try {
    await db.query(
      'DELETE FROM alunos_aulas_fixas WHERE aula_fixa_id = ? AND aluno_id = ?',
      [aulaId, alunoId]
    );

    // ✅ Redireciona de volta para a página de listagem
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover aluno da aula fixa');
  }
};

// Atualiza a aula fixa editada
exports.editarAulaFixa = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { tipo_id, professor_id, dia_semana, horario, vagas } = req.body;
  try {
    await db.query(
      `UPDATE aulas_fixas
         SET tipo_id = ?, professor_id = ?, dia_semana = ?, horario = ?, vagas = ?
       WHERE id = ?`,
      [tipo_id, professor_id, dia_semana, horario, vagas, id]
    );
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error('Erro ao atualizar aula fixa:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

// Remove uma aula fixa
exports.deletarAulaFixa = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await db.query('DELETE FROM aulas_fixas WHERE id = ?', [id]);
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error('Erro ao deletar aula fixa:', err);
    res.status(500).send('Erro interno no servidor');
  }
};







// Função para formatar a data no formato yyyy-mm-dd

function formatDateForInput(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`; // formato aceito por <input type="date">
}

exports.verDadosPessoaisAlunos = async (req, res) => {
  try {
    // Certifique-se de que o SELECT inclui o campo "id"
    const [alunos] = await db.query(`
      SELECT id, nome, data_nascimento, endereco, complemento, cep, cidade, uf, telefone, rg, cpf
      FROM alunos
    `);

    if (!alunos || alunos.length === 0) {
      console.error('Nenhum aluno encontrado');
      return res.status(404).send('Nenhum aluno encontrado');
    }

    // Formatar a data de nascimento para o formato dd/mm/yyyy
    alunos.forEach(aluno => {
      aluno.data_nascimento = formatDateForInput(aluno.data_nascimento);
    });

    res.render('professor/dadosPessoaisAlunos', { alunos });
  } catch (err) {
    console.error('Erro ao buscar dados pessoais dos alunos:', err);
    return res.status(500).send('Erro ao buscar dados pessoais: ' + err.message);
  }
};

//contrato 

exports.uploadContrato = async (req, res) => {
  const alunoId = req.body.alunoId;
  const file = req.file;

  if (!file) {
    return res.status(400).send('Nenhum arquivo enviado.');
  }

  try {
    await db.query('UPDATE alunos SET contrato_pdf = ? WHERE id = ?', [file.filename, alunoId]);
    res.redirect('/professor/alunos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar o contrato.');
  }
};

//Ver dados alunos
function formatDateForDisplay(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

exports.verDadosAluno = async (req, res) => {
  const alunoId = req.params.id;

  try {
    const [resultado] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);
    const aluno = resultado[0];

    if (!aluno) {
      return res.status(404).send('Aluno não encontrado');
    }

    // 🟢 Formatando a data para exibição
    aluno.data_nascimento = formatDateForDisplay(aluno.data_nascimento);

    res.render('professor/verDadosAluno', { aluno });
  } catch (err) {
    console.error('Erro ao buscar dados do aluno:', err);
    res.status(500).send('Erro ao buscar dados do aluno');
  }
};

// Atualizar Dados do Aluno
exports.atualizarDadosAluno = async (req, res) => {
  const alunoId = req.params.id;
  const { nome, data_nascimento, endereco, cidade_uf, telefone, rg, cpf } = req.body;


  // Dividir cidade e UF
  const [cidade, uf] = cidade_uf.split(' - ');

  // Dividir endereço, complemento e CEP
  const partesEndereco = endereco.split(',');
  const enderecoFinal = partesEndereco[0]?.trim() || '';
  const complemento = partesEndereco[1]?.trim() || '';
  const cep = partesEndereco[2]?.trim() || '';

  try {
    await db.query(
      `UPDATE alunos SET nome = ?, data_nascimento = ?, endereco = ?, complemento = ?, cep = ?, cidade = ?, uf = ?, telefone = ?, rg = ?, cpf = ? WHERE id = ?`,
      [nome, data_nascimento, enderecoFinal, complemento, cep, cidade, uf, telefone, rg, cpf, alunoId]
    );
    res.redirect('/professor/dadosPessoaisAlunos');
  } catch (err) {
    console.error('Erro ao atualizar dados do aluno:', err);
    res.status(500).send('Erro ao atualizar dados do aluno.');
  }
};


//CATEGORIAS
exports.listarCategorias = async (req, res) => {
  const [categorias] = await db.query('SELECT * FROM categorias');
  res.render('professor/categorias', { categorias });
};

exports.criarCategoria = async (req, res) => {
  const { nome } = req.body;
  await db.query('INSERT INTO categorias (nome) VALUES (?)', [nome]);
  res.redirect('/professor/categorias');
};

exports.deletarCategoria = async (req, res) => {
  const id = req.params.id;
  await db.query('DELETE FROM categorias WHERE categoria_id = ?', [id]);
  res.redirect('/professor/categorias');
};



// controllers/professorController.js
exports.formNovoPacote = async (req, res) => {
  const [alunos] = await db.query('SELECT id, nome FROM alunos');
  const [categorias] = await db.query('SELECT id, nome FROM categorias');

  res.render('professor/novoPacote', {
    alunos,
    categorias
  });
};

exports.criarNovoPacote = async (req, res) => {
  const {
    aluno_id,
    categoria_id,
    tipo,
    quantidade_aulas,
    data_inicio,
    passe_livre,
    pago
  } = req.body;

  // Define validade automaticamente com base no tipo
  const validade = new Date(data_inicio);
  if (tipo === 'mensal') validade.setMonth(validade.getMonth() + 1);
  if (tipo === 'trimestral') validade.setMonth(validade.getMonth() + 3);
  if (tipo === 'semestral') validade.setMonth(validade.getMonth() + 6);

  await db.query(`
    INSERT INTO pacotes_aluno 
      (aluno_id, categoria_id, tipo, quantidade_aulas, data_inicio, data_validade, passe_livre, pago) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      aluno_id,
      passe_livre ? null : categoria_id,
      tipo,
      quantidade_aulas,
      data_inicio,
      validade.toISOString().split('T')[0],
      passe_livre ? 1 : 0,
      pago ? 1 : 0
    ]
  );

  res.redirect('/professor/pacotes');
};

exports.verPacotesPorAluno = async (req, res) => {
  const alunoId = req.params.id;

  try {
    const [[aluno]] = await db.query('SELECT nome FROM alunos WHERE id = ?', [alunoId]);

    const [pacotes] = await db.query(`
      SELECT 
        p.id,
        p.tipo,
        p.quantidade_aulas,
        p.aulas_utilizadas,
        p.data_inicio,
        p.data_validade,
        p.pago,
        p.passe_livre,
        c.nome AS categoria_nome
      FROM pacotes_aluno p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.aluno_id = ?
      ORDER BY p.data_inicio DESC
    `, [alunoId]);

    // Calcular status de validade e créditos restantes
    const hoje = new Date();

    pacotes.forEach(p => {
      const validade = new Date(p.data_validade);
      const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
      p.status_validade = diasRestantes <= 0
        ? 'Vencido'
        : diasRestantes <= 7
        ? 'Vence em breve'
        : `Válido (${diasRestantes} dias)`;
      p.creditos_restantes = p.quantidade_aulas - p.aulas_utilizadas;
    });

    res.render('professor/pacotesPorAluno', { aluno, pacotes });
  } catch (err) {
    console.error('Erro ao buscar pacotes do aluno:', err);
    res.status(500).send('Erro ao buscar pacotes.');
  }
};

exports.listarPacotesPorAluno = async (req, res) => {
  try {
    const [pacotes] = await db.query(`
      SELECT p.id, a.nome AS aluno_nome, p.nome_pacote, p.aulas_total, p.aulas_usadas, p.validade, p.pago, p.passe_livre, c.nome AS modalidade
      FROM pacotes_aluno p
      JOIN alunos a ON a.id = p.aluno_id
      LEFT JOIN categorias c ON c.id = p.modalidade_id
    `);

    // Lógica para calcular aulas restantes e status de validade
    const hoje = new Date();
    pacotes.forEach(pacote => {
      const validade = new Date(pacote.validade);
      const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
      pacote.aulas_restantes = pacote.aulas_total - pacote.aulas_usadas;
      pacote.status_validade = diasRestantes < 0 ? 'Vencido'
                            : diasRestantes <= 7 ? 'Próximo do vencimento'
                            : 'Válido';
    });

    res.render('professor/listaPacotes', { pacotes });
  } catch (err) {
    console.error('Erro ao listar pacotes:', err);
    res.status(500).send('Erro ao listar pacotes');
  }
};

exports.verPacotesAluno = async (req, res) => {
  const alunoId = req.params.id;

  // Buscar dados do aluno
  const [[aluno]] = await db.query('SELECT id, nome FROM alunos WHERE id = ?', [alunoId]);

  // Buscar pacotes do aluno com nome da categoria
  const [pacotes] = await db.query(`
    SELECT p.*, c.nome AS categoria_nome 
    FROM pacotes p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.aluno_id = ?
  `, [alunoId]);

  // Buscar todas as categorias disponíveis
  const [categorias] = await db.query('SELECT * FROM categorias');

  // Renderizar view
  res.render('professor/pacotesAluno', {
    aluno,
    pacotes,
    categorias
  });
};
// Cria novo pacote para um aluno
exports.criarPacote = async (req, res) => {
  const { aluno_id, categoria_id, quantidade_aulas, validade_dias, passe_livre, pago } = req.body;

  const hoje = new Date();
  const validade = new Date(hoje);
  validade.setDate(validade.getDate() + parseInt(validade_dias));

  await db.query(`
    INSERT INTO pacotes 
    (aluno_id, categoria_id, quantidade_aulas, aulas_usadas, validade, passe_livre, pago)
    VALUES (?, ?, ?, 0, ?, ?, ?)
  `, [aluno_id, categoria_id, quantidade_aulas, validade, passe_livre, pago]);

  res.redirect(`/professor/pacotes/${aluno_id}`);
};

exports.pacotesDoAluno = async (req, res) => {
  const alunoId = req.params.id;

  try {
    // Buscar dados do aluno
    const [[aluno]] = await db.query('SELECT id, nome FROM alunos WHERE id = ?', [alunoId]);

    // Buscar pacotes do aluno com nome da categoria
    const [pacotes] = await db.query(`
      SELECT p.*, c.nome AS categoria_nome 
      FROM pacotes p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.aluno_id = ?
    `, [alunoId]);

    // Buscar todas as categorias disponíveis
    const [categorias] = await db.query('SELECT * FROM categorias');

    // Renderizar view
    res.render('professor/pacotesAluno', {
      aluno,
      pacotes,
      categorias
    });

  } catch (error) {
    console.error('Erro ao carregar pacotes do aluno:', error);
    res.status(500).send('Erro interno ao carregar pacotes do aluno');
  }
};

// Função para listar pacotes
exports.listarPacotes = async (req, res) => {
  const [pacotes] = await db.query('SELECT * FROM pacotes');
  res.render('professor/pacotes', { pacotes });
};



// Função para deletar pacotes
exports.deletarPacote = async (req, res) => {
  const id = req.params.id;

  // Deletar pacote do banco de dados
  await db.query('DELETE FROM pacotes WHERE id = ?', [id]);

  res.redirect('/professor/pacotes'); // Redireciona para a lista de pacotes
};

// Função para ver os pacotes de um aluno específico
exports.verPacotesAluno = async (req, res) => {
  const alunoId = req.params.alunoId;

  // Consultar pacotes associados ao aluno
  const [pacotes] = await db.query('SELECT * FROM pacotes WHERE aluno_id = ?', [alunoId]);

  res.render('professor/pacotesAluno', { pacotes });
};

exports.verPacotesPorAluno = async (req, res) => {
  const alunoId = req.params.id;

  try {
    const [pacotes] = await db.query(`
      SELECT 
        p.id,
        p.tipo,
        p.quantidade_aulas,
        p.aulas_utilizadas,
        p.data_inicio,
        p.data_validade,
        p.pago,
        p.passe_livre,
        c.nome AS categoria_nome
      FROM pacotes_aluno p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.aluno_id = ?
      ORDER BY p.data_inicio DESC
    `, [alunoId]);

    res.render('professor/pacotesAluno', { pacotes, alunoId });

  } catch (error) {
    console.error("Erro ao buscar pacotes do aluno:", error);
    res.status(500).send("Erro ao buscar pacotes");
  }
};