const db = require('../config/db');
const bcrypt = require('bcryptjs');
const express = require('express');
const dayjs = require('dayjs');
const router = express.Router();
const { enviarMensagem } = require('../utils/telegram');



// Controller para rotas de 'professor'

exports.home = (req, res) => {
  res.render('professor/home', { nome: req.session.user.nome });
};


//////////////////////////////////////////////////////professor///////////////////////////////////////////
exports.cadastrarProfessor = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    // Verifica se já existe
    const [existente] = await db.query('SELECT id FROM professores WHERE email = ?', [email]);
    if (existente.length > 0) {
      return res.status(409).send('Já existe um professor com esse e-mail.');
    }

    await db.query(
      'INSERT INTO professores (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senha]
    );

    res.redirect('/login-professor'); // ou para onde quiser redirecionar
  } catch (err) {
    console.error('Erro ao cadastrar professor:', err); // <- aqui
    res.status(500).send('Erro interno ao cadastrar professor');
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


//////////////////////////////////////////////////CADASTRAR ALUNOS /////////////////////////////////////

exports.formCadastroAluno = (req, res) => {
  res.render('professor/cadastrarAluno');
};

exports.cadastrarAluno = async (req, res) => {
  const { nome, email, senha, telefone, data_nascimento } = req.body;
  const senhaHash = bcrypt.hashSync(senha, 10);

  try {
    // Verifica se já existe aluno com esse e-mail
    const [alunoExistente] = await db.query(
      'SELECT id FROM alunos WHERE email = ?',
      [email]
    );

    if (alunoExistente.length > 0) {
      // Aluno já existe
      return res.status(400).send('Erro: esse e-mail já está cadastrado!');
    }

    // Insere novo aluno
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

exports.deletarAluno = async (req, res) => {
  const { id } = req.params;
  try {
    // Deleta pacotes vinculados ao aluno
    await db.query('DELETE FROM pacotes_aluno WHERE aluno_id = ?', [id]);

    // Deleta anamnese do aluno
    await db.query('DELETE FROM anamneses WHERE aluno_id = ?', [id]);

    // Agora deleta o aluno
    await db.query('DELETE FROM alunos WHERE id = ?', [id]);

    res.redirect('/professor/alunos');
  } catch (err) {
    console.error('Erro ao deletar aluno:', err);
    res.status(500).send('Erro ao deletar aluno.');
  }
};


/////////////////////////////////////////////////AULAS FIXAS///////////////////////////////////////////
// Exibe form para criar nova aula fixa
exports.listarAulasFixas = async (req, res) => {
  console.log('🔥 ENTROU NO listarAulasFixas');
  try {
    const [aulasFixas] = await db.query(`
      SELECT af.*, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      LEFT JOIN categorias c ON af.categoria_id = c.categoria_id
      LEFT JOIN professores p ON af.professor_id = p.id
    `);

    console.log('TOTAL AULAS FIXAS:', aulasFixas.length, JSON.stringify(aulasFixas));

    const ordemDias = {
      segunda: 1, seg: 1,
      terca: 2, terça: 2, ter: 2,
      quarta: 3, qua: 3,
      quinta: 4, qui: 4,
      sexta: 5, sex: 5,
      sabado: 6, sábado: 6, sab: 6,
      domingo: 7, dom: 7
    };

    function normalizar(dia) {
      if (!dia) return '';
      return dia
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '');
    }

    function aulaConcluida(diaSemana, horario) {
      const diasMap = { domingo: 0, seg: 1, segunda: 1, ter: 2, terca: 2, terça: 2, qua: 3, quarta: 3, qui: 4, quinta: 4, sex: 5, sexta: 5, sab: 6, sabado: 6, sábado: 6 };
      const hoje = new Date();
      const hojeDia = hoje.getDay(); // 0(dom) a 6(sab)
      const diaAula = diasMap[normalizar(diaSemana)] ?? -1;
      if (diaAula === -1) return false;

      // Diferença em dias entre hoje e dia da aula
      let diffDias = hojeDia - diaAula;
      if (diffDias < 0) diffDias += 7;

      if (diffDias > 0) return true; // aula já passou nessa semana

      if (diffDias === 0) {
        // comparar horário atual com horário da aula
        if (!horario) return false;
        const [horaAula, minAula] = horario.split(':').map(Number);
        const agora = hoje.getHours() * 60 + hoje.getMinutes();
        const aulaMinutos = horaAula * 60 + minAula;
        return agora >= aulaMinutos;
      }

      return false;
    }

    // Ordena primeiro pelo dia da semana, depois pelo horário
    aulasFixas.sort((a, b) => {
      const diaA = ordemDias[normalizar(a.dia_semana)] || 99;
      const diaB = ordemDias[normalizar(b.dia_semana)] || 99;
      const horaA = (a.horario || '00:00').slice(0, 5);
      const horaB = (b.horario || '00:00').slice(0, 5);

      if (diaA !== diaB) return diaA - diaB;
      return horaA.localeCompare(horaB);
    });

    for (const aula of aulasFixas) {
      console.log('AULA ID:', aula.id, '| FIXOS:', JSON.stringify(aula.alunos_fixos));
  // Busca alunos SEMPRE (fixos)
  const [alunosFixo] = await db.query(`
    SELECT 
      aaf.aluno_id AS aluno_id,
      a.nome AS nome
    FROM alunos_fixos_aulas_fixas aaf
    JOIN alunos a ON a.id = aaf.aluno_id
    WHERE aaf.aula_fixa_id = ? 
      AND aaf.ativo = 1
      AND aaf.eh_fixo = 1
  `, [aula.id]);

  // Busca alunos SEMPRE (temporários)
  const [alunosTemporarios] = await db.query(`
    SELECT 
      aaf.aluno_id AS aluno_id,
      a.nome AS nome
    FROM alunos_fixos_aulas_fixas aaf
    JOIN alunos a ON a.id = aaf.aluno_id
    WHERE aaf.aula_fixa_id = ? 
      AND aaf.ativo = 1
      AND aaf.eh_fixo = 0
  `, [aula.id]);

  console.log('AULA ID:', aula.id, '| FIXOS:', JSON.stringify(alunosFixo), '| TEMP:', JSON.stringify(alunosTemporarios));

  aula.alunos_fixos = alunosFixo || [];
  aula.alunos_fixos_temporarios = alunosTemporarios || [];

  // Envio de mensagem só se a aula já ocorreu
  if (aulaConcluida(aula.dia_semana, aula.horario)) {
    const todosAlunos = [...alunosFixo, ...alunosTemporarios];

    const nomes = todosAlunos.length > 0
      ? todosAlunos.map(a => `- ${a.nome}`).join('\n')
      : '_Nenhum participante._';

    const mensagem =
      `📚 *Aula fixa finalizada!*\n` +
      `👨‍🏫 *Professor:* ${aula.professor_nome}\n` +
      `📘 *Categoria:* ${aula.categoria_nome}\n` +
      `👥 *Participantes de hoje:*\n${nomes}`;

    console.log('[DEBUG] Enviando mensagem ao grupo:\n', mensagem);
    await enviarMensagem(mensagem);
  }
}

    

        const aulasSemana = require('./aulasFixasSemanaController');

    console.log('🔍 ENRIQUECIMENTO: tipo do horario:', typeof aulasFixas[0]?.horario, 'valor:', JSON.stringify(aulasFixas[0]?.horario));
    

    for (const aula of aulasFixas) {
      const dataAula = aulasSemana.proximaOcorrencia(aula.dia_semana, aula.horario);
      aula.proxima_data = dataAula;

      if (dataAula) {
        const [y, m, d] = dataAula.split('-');
        aula.proxima_data_fmt = `${d}/${m}/${y}`;
      } else {
        aula.proxima_data_fmt = '—';
      }
      

      aula.horario_fmt = (aula.horario || '').slice(0, 5);

      // Busca status da liberação dessa data
      const [[lib]] = await db.query(`
        SELECT id, arquivada
        FROM aulas_fixas_liberacoes
        WHERE aula_fixa_id = ? AND data_aula = ?
      `, [aula.id, dataAula]);

      aula.semana_liberada = !!lib;
      aula.semana_arquivada = !!(lib && lib.arquivada);

      
    }

    res.render('professor/novaAulaFixa', {
      aulasFixas,
      msg: req.query.msg,
      arquivadas: req.query.arquivadas,
    });
  } catch (err) {
    console.error('Erro ao listar aulas fixas:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

// Salva nova aula fixa
exports.salvarAulaFixa = async (req, res) => {
  const { categoria_id, professor_id, dia_semana, horario, vagas } = req.body;

  if (!categoria_id || !professor_id || !dia_semana || !horario || !vagas) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  try {
    await db.query(
      `INSERT INTO aulas_fixas (categoria_id, professor_id, dia_semana, horario, vagas)
       VALUES (?, ?, ?, ?, ?)`,
      [categoria_id, professor_id, dia_semana, horario, vagas]
    );
    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error('Erro ao salvar aula fixa:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.removerAlunoAulaFixa = async (req, res) => {
  const { aulaId, alunoId } = req.params;

  try {
    // Remove o aluno da aula fixa do dia (presença)
    await db.query(
      'DELETE FROM alunos_aulas_fixas WHERE aula_fixa_id = ? AND aluno_id = ?',
      [aulaId, alunoId]
    );

    // Remove o vínculo fixo permanente
    await db.query(
      'DELETE FROM alunos_fixos_aulas_fixas WHERE aula_fixa_id = ? AND aluno_id = ?',
      [aulaId, alunoId]
    );

    // Aumenta o número de vagas disponíveis
    await db.query(
      'UPDATE aulas_fixas SET vagas = vagas + 1 WHERE id = ?',
      [aulaId]
    );

    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao remover aluno da aula fixa');
  }
};

// Remove uma aula fixa
exports.deletarAulaFixa = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    // Excluir registros relacionados na tabela uso_creditos
    await db.query('DELETE FROM uso_creditos WHERE aula_fixa_id = ?', [id]);

    // Excluir desistências relacionadas à aula fixa
    await db.query('DELETE FROM aulas_fixas_desistencias WHERE aula_fixa_id = ?', [id]);

    // Excluir alunos temporariamente inscritos
    await db.query('DELETE FROM alunos_aulas_fixas WHERE aula_fixa_id = ?', [id]);

    // Excluir alunos fixos relacionados à aula fixa (evita erro de foreign key)
    await db.query('DELETE FROM alunos_fixos_aulas_fixas WHERE aula_fixa_id = ?', [id]);

    // Por fim, excluir a aula fixa
    await db.query('DELETE FROM aulas_fixas WHERE id = ?', [id]);

    res.redirect(req.get('Referer') || '/professor/semana');
  } catch (err) {
    console.error('Erro ao deletar aula fixa:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

exports.adicionarAlunoAulaFixa = async (req, res) => {
  const { aulaId } = req.params;
  const { aluno_id, eh_fixo } = req.body;

  try {
    // Verifica se o aluno já está inscrito na aula
    const [[existe]] = await db.query(`
      SELECT * FROM alunos_aulas_fixas
      WHERE aula_fixa_id = ? AND aluno_id = ?
    `, [aulaId, aluno_id]);

    if (existe) {
      return res.status(400).send('Aluno já está inscrito nesta aula.');
    }

    // Adiciona o aluno na aula fixa
    await db.query(`
      INSERT INTO alunos_aulas_fixas (aula_fixa_id, aluno_id, eh_fixo)
      VALUES (?, ?, ?)
    `, [aulaId, aluno_id, eh_fixo === 'true']);

    // Atualiza o número de vagas
    await db.query(`
      UPDATE aulas_fixas SET vagas = vagas - 1 WHERE id = ?
    `, [aulaId]);

    res.redirect('/professor/aulas-fixas/nova');
  } catch (err) {
    console.error('Erro ao adicionar aluno na aula fixa:', err);
    res.status(500).send('Erro ao adicionar aluno na aula fixa');
  }
};

function proximaDataSemana(diaSemanaTexto) {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const diaSemana = dias.indexOf(diaSemanaTexto);
  const hoje = new Date();
  const diaAtual = hoje.getDay();
  const diasAteProxima = (diaSemana - diaAtual + 7) % 7 || 7;

  const proximaData = new Date(hoje);
  proximaData.setDate(hoje.getDate() + diasAteProxima);
  return proximaData.toISOString().split('T')[0];
}

exports.gerarAulasFixas = async () => {
  try {
    console.log('⏳ Gerando aulas fixas da semana...');

    const [aulasFixas] = await db.query(`
      SELECT af.id, af.categoria_id, af.professor_id, af.dia_semana, af.horario
      FROM aulas_fixas af
    `);

    for (const aula of aulasFixas) {
      const dataAula = proximaDataSemana(aula.dia_semana);

      // Verifica se aula já foi criada para essa data
      const [aulaExistente] = await db.query(`
        SELECT id FROM aulas
        WHERE aula_fixa_id = ? AND data = ?
      `, [aula.id, dataAula]);

      if (aulaExistente.length > 0) {
        console.log(`🔁 Aula fixa ${aula.id} já criada para ${dataAula}`);
        continue;
      }

      // Cria nova aula
      const [resultado] = await db.query(`
        INSERT INTO aulas (data, horario, professor_id, categoria_id, aula_fixa_id)
        VALUES (?, ?, ?, ?, ?)
      `, [dataAula, aula.horario, aula.professor_id, aula.categoria_id, aula.id]);

      const novaAulaId = resultado.insertId;
      console.log(`✅ Aula criada para ${dataAula} (ID: ${novaAulaId})`);

      // Pega alunos fixos que NÃO desistiram dessa data
      const [alunosFixos] = await db.query(`
        SELECT aaf.aluno_id
        FROM alunos_aulas_fixas aaf
        WHERE aaf.aula_fixa_id = ?
          AND aaf.eh_fixo = 1
          AND NOT EXISTS (
            SELECT 1 FROM desistencias_aula_fixa d
            WHERE d.aluno_id = aaf.aluno_id
              AND d.aula_fixa_id = aaf.aula_fixa_id
              AND d.data = ?
          )
      `, [aula.id, dataAula]);

      // Insere os alunos fixos que não desistiram na nova aula
      for (const { aluno_id } of alunosFixos) {
        await db.query(`
          INSERT INTO aulas_alunos (aula_id, aluno_id, tipo_participacao)
          VALUES (?, ?, 'fixo')
        `, [novaAulaId, aluno_id]);
      }

      console.log(`👥 ${alunosFixos.length} alunos fixos adicionados à aula ${novaAulaId}`);
    }

    console.log('🏁 Geração de aulas fixas concluída.');
  } catch (error) {
    console.error('❌ Erro ao gerar aulas fixas:', error);
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

////////////////////////////////////////////////////ANAMNESE///////////////////////////////////////////////

// Listar alunos com o id da última anamnese (se existir)
exports.listarAlunosComAnamnese = async (req, res) => {
  try {
    const busca = req.query.busca ? `%${req.query.busca}%` : '%';

    const [alunos] = await db.query(
      `SELECT 
        alunos.id, 
        alunos.nome,
        (SELECT id FROM anamneses WHERE aluno_id = alunos.id ORDER BY id DESC LIMIT 1) AS anamneseId
      FROM alunos
      WHERE alunos.nome LIKE ?
      ORDER BY alunos.nome`,
      [busca]
    );

    res.render('professor/alunos', { alunos, busca: req.query.busca || '' });
  } catch (err) {
    console.error('Erro ao listar alunos:', err);
    res.status(500).send('Erro interno ao listar alunos');
  }
};

// Visualizar anamnese de um aluno pelo id
exports.verAnamnese = async (req, res) => {
  const alunoId = parseInt(req.params.id, 10);
  try {
    // Busca aluno
    const [[aluno]] = await db.query('SELECT id, nome FROM alunos WHERE id = ?', [alunoId]);
    if (!aluno) {
      return res.status(404).send('Aluno não encontrado.');
    }

    // Busca anamnese mais recente do aluno
    const [[anamnese]] = await db.query(
      'SELECT * FROM anamneses WHERE aluno_id = ? ORDER BY id DESC LIMIT 1',
      [alunoId]
    );

    if (!anamnese) {
      return res.status(404).send('Anamnese não encontrada.');
    }

    res.render('professor/anamnese', { aluno, anamnese });
  } catch (err) {
    console.error('Erro ao buscar anamnese:', err);
    res.status(500).send('Erro interno ao buscar anamnese');
  }
};

/////////////////////////////////////////////////DADOS ALUNOS//////////////////////////////////////////////////
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

exports.verDadosAluno = async (req, res) => {
  const busca = req.query.busca || ''; // pega o texto da pesquisa

  try {
    let sql = `SELECT id, nome, email, telefone FROM alunos WHERE nome LIKE ? ORDER BY nome`;
    const [alunos] = await db.query(sql, [`%${busca}%`]);

    if (alunos.length === 0) {
      return res.render('verDadosAluno', { alunos: [], mensagem: 'Aluno não encontrado', busca });
    }

    res.render('verDadosAluno', { alunos, busca });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar alunos');
  }
}

exports.verDetalhesAluno = async (req, res) => {
  const alunoId = req.params.id;

  try {
    const [[aluno]] = await db.query('SELECT * FROM alunos WHERE id = ?', [alunoId]);

    if (!aluno) {
      return res.status(404).send('Aluno não encontrado');
    }

    res.render('detalhesAluno', { aluno });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar dados do aluno');
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

// Função utilitária para adicionar dias a uma data
function adicionarDias(data, dias) {
  const novaData = new Date(data);
  novaData.setDate(novaData.getDate() + dias);
  return novaData;
}

// Exports
exports.formPacotes = async (req, res) => {
  try {
    const [alunos] = await db.query('SELECT * FROM alunos');
    res.render('professor/pacotes', { alunos });
  } catch (err) {
    console.error('Erro ao buscar alunos para pacotes:', err);
    res.status(500).send('Erro interno no servidor');
  }
};



exports.atualizarPacote = async (req, res) => {
  const pacoteId = parseInt(req.params.id, 10);
  const {
    categoria_id,
    quantidade_aulas,
    data_inicio,
    data_validade,
    pago,
    passe_livre
  } = req.body;

  try {
    await db.query(`
      UPDATE pacotes_aluno
      SET categoria_id = ?, quantidade_aulas = ?, data_inicio = ?, data_validade = ?, pago = ?, passe_livre = ?
      WHERE id = ?
    `, [
      categoria_id || null,
      quantidade_aulas,
      data_inicio,
      data_validade,
      pago ? 1 : 0,
      passe_livre ? 1 : 0,
      pacoteId
    ]);

    res.redirect(`/professor/pacotes/${pacoteId}`);
  } catch (err) {
    console.error('Erro ao atualizar pacote:', err);
    res.status(500).send('Erro ao atualizar pacote.');
  }
};


exports.atualizarAulasUtilizadas = async (req, res) => {
  try {
    const pacoteId = parseInt(req.params.id, 10);
    const aulasUtilizadas = parseInt(req.body.aulas_utilizadas, 10);
    const alunoId = parseInt(req.body.aluno_id, 10);
    console.log('req.body:', req.body);

    if (isNaN(pacoteId) || isNaN(alunoId)) {
      console.error("ID inválido:", pacoteId, alunoId);
      return res.status(400).send("Dados inválidos.");
    }
    console.log('req.body:', req.body);
    await db.query(
      "UPDATE pacotes_aluno SET aulas_utilizadas = ? WHERE id = ?",
      [aulasUtilizadas, pacoteId]
    );

    res.redirect(`/professor/pacotes/aluno/${alunoId}`);
  } catch (error) {
    console.error("Erro ao atualizar aulas utilizadas:", error);
    res.status(500).send("Erro interno.");
  }


};


////////////////////////////////////////////////PACOTES//////////////////////////////////////////////////

exports.deletarPacote = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar aluno_id para redirecionar depois
    const [pacote] = await db.query(
      'SELECT aluno_id FROM pacotes_aluno WHERE id = ?',
      [id]
    );

    if (pacote.length === 0) {
      return res.status(404).send('Pacote não encontrado.');
    }

    const alunoId = pacote[0].aluno_id;

    // 🔴 Apagar primeiro dependências
    await db.query('DELETE FROM uso_creditos WHERE pacote_id = ?', [id]);
    await db.query('DELETE FROM pacotes_modalidades WHERE pacote_id = ?', [id]);

    // Agora pode apagar o pacote
    await db.query('DELETE FROM pacotes_aluno WHERE id = ?', [id]);

    console.log(`✅ Pacote ${id} deletado com sucesso.`);

    res.redirect(`/professor/pacotes/${alunoId}`);
  } catch (error) {
    console.error('Erro ao deletar pacote:', error);
    res.status(500).send('Erro ao deletar pacote.');
  }
};


exports.verPacotesPorAluno = async (req, res) => {
  const alunoId = parseInt(req.params.id, 10);

  try {
    const [[aluno]] = await db.query('SELECT id, nome FROM alunos WHERE id = ?', [alunoId]);

    const [pacotes] = await db.query(`
      SELECT
        p.id,
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

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // zera horas para evitar problemas de comparação

    pacotes.forEach(p => {
      // Calcula créditos restantes
      const total = parseInt(p.quantidade_aulas, 10) || 0;
      const usados = parseInt(p.aulas_utilizadas, 10) || 0;
      p.creditos_restantes = total - usados;

      // Calcula status da validade
      if (!p.data_validade || p.data_validade === '0000-00-00') {
        p.status_validade = 'Sem validade';
      } else {
        const validade = new Date(p.data_validade);
        validade.setHours(0, 0, 0, 0);

        const diasRestantes = Math.ceil((validade - hoje) / (1000 * 60 * 60 * 24));
        p.status_validade = diasRestantes <= 0
          ? 'Vencido'
          : diasRestantes <= 7
            ? 'Vence em breve'
            : `Válido (${diasRestantes} dias)`;
      }
    });

    res.render('professor/pacotesPorAluno', { aluno, pacotes });
  } catch (err) {
    console.error('Erro ao buscar pacotes do aluno:', err);
    res.status(500).send('Erro ao buscar pacotes.');
  }
};
exports.adicionarPacote = async (req, res) => {
  const {
    aluno_id,
    categoria_id,
    tipo,
    quantidade_aulas,
    data_inicio,
    data_validade
  } = req.body;

  try {
    // Garante que data_validade seja nula se estiver vazia
    const validadeFinal = data_validade && data_validade.trim() !== '' ? data_validade : null;

    // Insere o novo pacote na tabela com os campos corretos
    await db.query(`
      INSERT INTO pacotes_aluno 
        (aluno_id, categoria_id, tipo, quantidade_aulas, data_inicio, data_validade)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      aluno_id,
      categoria_id || null, // caso esteja em branco
      tipo,
      quantidade_aulas,
      data_inicio,
      validadeFinal
    ]);

    res.redirect(`/professor/pacotes/aluno/${aluno_id}`);
  } catch (err) {
    console.error('Erro ao adicionar pacote:', err);
    res.status(500).send('Erro interno no servidor');
  }
};

// controllers/professorController.js
exports.formNovoPacote = async (req, res) => {
  try {
    const [alunos] = await db.query('SELECT * FROM alunos');
    const [categorias] = await db.query('SELECT * FROM categorias');
    res.render('professor/novoPacote', { alunos, categorias });
  } catch (err) {
    console.error('Erro ao carregar dados para o formulário:', err);
    res.status(500).send('Erro ao carregar dados.');
  }
};

exports.verPacotesAluno = async (req, res) => {
  try {
    const alunoId = req.params.id;

    // Buscar dados do aluno
    const [[aluno]] = await db.query('SELECT id, nome FROM alunos WHERE id = ?', [alunoId]);

    // Buscar pacotes do aluno com nome da categoria, ordenado por data de início (mais novo primeiro)
    const [pacotes] = await db.query(`
      SELECT p.*, c.nome AS categoria_nome
      FROM pacotes_aluno p
      LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
      WHERE p.aluno_id = ?
      ORDER BY p.data_inicio DESC
    `, [alunoId]);

    function isValidDate(d) {
      return d instanceof Date && !isNaN(d);
    }

    for (const pacote of pacotes) {
      // Aulas restantes
      const total = parseInt(pacote.quantidade_aulas, 10) || 0;
      const usadas = parseInt(pacote.aulas_utilizadas, 10) || 0;
      pacote.aulas_restantes = total - usadas;

      // Passe Livre não tem categoria — exibe rótulo dedicado
      if (pacote.passe_livre == 1) {
        pacote.categoria_nome = 'Passe Livre';
      } else if (!pacote.categoria_nome) {
        pacote.categoria_nome = '—';
      }






      // Formata data de início
      if (pacote.data_inicio) {
        const data = new Date(pacote.data_inicio);
        pacote.data_inicio_formatada = `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
      }

      // Formata validade e status
      if (!pacote.data_validade || pacote.data_validade === '0000-00-00' || pacote.tipo === 'avulsa') {
        pacote.data_validade_formatada = '—';
        pacote.status_validade = 'Sem validade';
      } else {
        const validade = new Date(pacote.data_validade);
        validade.setHours(0, 0, 0, 0);

        if (!isValidDate(validade)) {
          pacote.data_validade_formatada = '—';
          pacote.status_validade = 'Sem validade';
        } else {
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);

          const diasRestantes = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

          pacote.status_validade = diasRestantes < 0
            ? 'Vencido'
            : diasRestantes <= 7
              ? 'Vence em breve'
              : 'Válido';

          pacote.data_validade_formatada = `${String(validade.getDate()).padStart(2, '0')}/${String(validade.getMonth() + 1).padStart(2, '0')}/${validade.getFullYear()}`;
        }
      }

      pacote.pago = !!pacote.pago;

      // Buscar uso de créditos do pacote
      const [usos] = await db.query(`
        SELECT uc.data_utilizacao, af.dia_semana, af.horario, c.nome AS categoria
        FROM uso_creditos uc
        JOIN aulas_fixas af ON uc.aula_fixa_id = af.id
        LEFT JOIN categorias c ON af.categoria_id = c.categoria_id
        WHERE uc.pacote_id = ?
        ORDER BY uc.data_utilizacao DESC
      `, [pacote.id]);

      pacote.usos = usos.map(uso => {
        const data = new Date(uso.data_utilizacao);
        const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return {
          data: `${String(data.getDate()).padStart(2, '0')}/${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`,
          diaSemana: diasSemana[uso.dia_semana] || '',
          horario: uso.horario ? uso.horario.slice(0, 5) : '',
          categoria: uso.categoria || ''
        };
      });
    }

    res.render('professor/pacotesAluno', { aluno, pacotes });
  } catch (err) {
    console.error('Erro ao buscar pacotes do aluno:', err);
    res.status(500).send('Erro ao buscar pacotes do aluno.');
  }
};


// Cria novo pacote para um aluno
exports.criarPacote = async (req, res) => {

  console.log('Aluno selecionado:', req.body.aluno_id);
  console.log('Dados recebidos:', req.body);

  try {
    const dataBruta = req.body.data_inicio;

    if (!dataBruta || isNaN(Date.parse(dataBruta))) {
      throw new Error('Data de início inválida');
    }

    const data_inicio_formatada = dayjs(dataBruta).format('YYYY-MM-DD');
    console.log("Data formatada:", data_inicio_formatada);

    // Calcular data de validade com base no tipo do pacote
    let data_validade = null;
    const tipo = req.body.tipo;

    if (tipo === 'mensal') {
      data_validade = dayjs(data_inicio_formatada).add(30, 'day').format('YYYY-MM-DD');
    } else if (tipo === 'trimestral') {
      data_validade = dayjs(data_inicio_formatada).add(90, 'day').format('YYYY-MM-DD');
    } else if (tipo === 'semestral') {
      data_validade = dayjs(data_inicio_formatada).add(180, 'day').format('YYYY-MM-DD');
    } else if (tipo === 'anual') {
      data_validade = dayjs(data_inicio_formatada).add(365, 'day').format('YYYY-MM-DD');
    } else if (tipo === 'avulsa') {
      data_validade = null; // Sem validade real
    } else {
      throw new Error('Tipo de pacote inválido');
    }

    const novoPacote = {
      aluno_id: req.body.aluno_id,
      categoria_id: req.body.categoria_id,
      tipo,
      quantidade_aulas: req.body.quantidade_aulas,
      data_inicio: data_inicio_formatada,
      data_validade: data_validade ?? null, // garante null real
      pago: req.body.pago ? 1 : 0,
      passe_livre: req.body.passe_livre ? 1 : 0
    };

    // Se for passe livre, ignora a categoria
if (novoPacote.passe_livre) {
  novoPacote.categoria_id = null;
}

if (!novoPacote.data_validade || novoPacote.data_validade.trim() === '') {
  novoPacote.data_validade = null;
}

const [result] = await db.query(
  `INSERT INTO pacotes_aluno (
    aluno_id, categoria_id, tipo, quantidade_aulas, data_inicio, data_validade, pago, passe_livre
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    novoPacote.aluno_id,
    novoPacote.categoria_id,
    novoPacote.tipo,
    novoPacote.quantidade_aulas,
    novoPacote.data_inicio,
    novoPacote.data_validade,
    novoPacote.pago,
    novoPacote.passe_livre
  ]
);

    if (result.affectedRows > 0) {
      const pacote_id = result.insertId;

      // Passe Livre: vincula TODAS as categorias automaticamente
      if (novoPacote.passe_livre) {
        const [todasCategorias] = await db.query(`SELECT categoria_id FROM categorias`);
        for (const cat of todasCategorias) {
          await db.query(
            `INSERT INTO pacotes_modalidades (pacote_id, categoria_id) VALUES (?, ?)`,
            [pacote_id, cat.categoria_id]
          );
        }
      }

      return res.redirect(`/professor/pacotes/aluno/${novoPacote.aluno_id}`);
    } else {
      throw new Error('Falha ao criar pacote');
    }
  } catch (err) {
    console.error('Erro ao criar pacote:', err);
    res.render('professor/pacotes', { error: 'Erro ao criar o pacote. Tente novamente.' });
  }
};

exports.deletarPacote = async (req, res) => {
  const { id } = req.params;

  try {
    // Buscar o aluno_id antes de deletar
    const [[pacote]] = await db.query('SELECT aluno_id FROM pacotes_aluno WHERE id = ?', [id]);

    if (!pacote) {
      return res.status(404).send('Pacote não encontrado.');
    }

    const alunoId = pacote.aluno_id;

    // Deletar o pacote
    await db.query('DELETE FROM pacotes_aluno WHERE id = ?', [id]);

    // Redirecionar para a página de pacotes do aluno
    res.redirect(`/professor/pacotes/aluno/${alunoId}`);
  } catch (error) {
    console.error('Erro ao deletar pacote:', error);
    res.status(500).send('Erro ao deletar pacote.');
  }
};


exports.listarPacotesPorAluno = async (req, res) => {
  const aluno_id = req.params.aluno_id;

  try {
    const [pacotes] = await db.query(`
      SELECT
        p.id,
        a.nome AS aluno_nome,
        a.id AS aluno_id,
        p.quantidade_aulas,
        p.aulas_utilizadas,
        p.data_inicio,
        p.data_validade,
        p.pago,
        p.passe_livre,
        p.tipo,
        c.nome AS categoria_nome
      FROM pacotes_aluno p
      JOIN alunos a ON a.id = p.aluno_id
      LEFT JOIN categorias c ON c.categoria_id = p.categoria_id
      WHERE p.aluno_id = ?
      ORDER BY p.data_inicio DESC
    `, [aluno_id]);

    const [dadosAluno] = await db.query('SELECT * FROM alunos WHERE id = ?', [aluno_id]);
    const aluno = dadosAluno[0];

    for (const pacote of pacotes) {
      // Cálculo de aulas restantes
      const aulasTotal = parseInt(pacote.quantidade_aulas, 10) || 0;
      const aulasUtilizadas = parseInt(pacote.aulas_utilizadas, 10) || 0;
      pacote.aulas_restantes = aulasTotal - aulasUtilizadas;

      // Formatação data de início
      if (pacote.data_inicio) {
        const dataInicio = new Date(pacote.data_inicio);
        pacote.data_inicio = `${String(dataInicio.getDate()).padStart(2, '0')}/${String(dataInicio.getMonth() + 1).padStart(2, '0')}/${dataInicio.getFullYear()}`;
      }

      // Validade e status
      if (!pacote.data_validade || pacote.data_validade === '0000-00-00' || pacote.tipo === 'avulsa') {
        pacote.data_validade = '—';
        pacote.status_validade = 'Sem validade';
      } else {
        const validade = new Date(pacote.data_validade);
        validade.setHours(0, 0, 0, 0);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const diasRestantes = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));
        pacote.status_validade = diasRestantes < 0
          ? 'Vencido'
          : diasRestantes <= 7
          ? 'Vence em breve'
          : 'Válido';
        pacote.data_validade = `${String(validade.getDate()).padStart(2, '0')}/${String(validade.getMonth() + 1).padStart(2, '0')}/${validade.getFullYear()}`;
      }

      pacote.pago = !!pacote.pago;

      // Buscar usos do pacote
      const [usos] = await db.query(`
        SELECT uc.data_utilizacao, af.dia_semana, af.horario, c.nome AS categoria_nome
        FROM uso_creditos uc
        JOIN aulas_fixas af ON uc.aula_fixa_id = af.id
        LEFT JOIN categorias c ON af.categoria_id = c.categoria_id
        WHERE uc.pacote_id = ?
        ORDER BY uc.data_utilizacao DESC
      `, [pacote.id]);

      pacote.usos = usos.map(u => ({
        data: new Date(u.data_utilizacao).toLocaleDateString('pt-BR'),
        diaSemana: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][u.dia_semana] || '',
        horario: u.horario ? u.horario.slice(0, 5) : '',
        categoria: u.categoria_nome || ''
      }));
    }

    res.render('professor/listaPacotes', { pacotes, aluno });

  } catch (err) {
    console.error('Erro ao listar pacotes:', err);
    res.status(500).send('Erro ao listar pacotes');
  }
};



///////////////////////////////////////////////////EDITAR PACOTE///////////////////////////////////////

exports.editarPacoteForm = async (req, res) => {
  const pacoteId = req.params.id;
  const [[pacote]] = await db.query(`
  SELECT p.*, c.nome AS categoria_nome
  FROM pacotes_aluno p
  LEFT JOIN categorias c ON p.categoria_id = c.categoria_id
  WHERE p.id = ?
`, [pacoteId]);

  const [categorias] = await db.query(`SELECT * FROM categorias`);
  if (!pacote) return res.status(404).send('Pacote não encontrado');

  res.render('professor/editarPacote', { pacote, categorias });
};

exports.editarPacote = async (req, res) => {
  console.log('Entrou no editarPacote');
  const {
    categoria_nome,
    quantidade_aulas,
    data_inicio,
    tipo,
    pago,
    passe_livre,
    aluno_id,
    modalidades_passe_livre // array de nomes das categorias
  } = req.body;

  if (!aluno_id || !quantidade_aulas || !tipo || !data_inicio) {
    return res.status(400).send('Dados inválidos ou incompletos.');
  }

  try {
    const data_inicio_formatada = dayjs(data_inicio).format('YYYY-MM-DD');

    // Calcular data de validade
    let data_validade = null;
    if (tipo === 'mensal') {
      data_validade = dayjs(data_inicio_formatada).add(30, 'day').format('YYYY-MM-DD');
    } else if (tipo === 'trimestral') {
      data_validade = dayjs(data_inicio_formatada).add(90, 'day').format('YYYY-MM-DD');
    } else if (tipo === 'semestral') {
      data_validade = dayjs(data_inicio_formatada).add(180, 'day').format('YYYY-MM-DD');
    } else if (tipo === 'anual') {
      data_validade = dayjs(data_inicio_formatada).add(365, 'day').format('YYYY-MM-DD');
    } else if (tipo === 'avulsa') {
      data_validade = null;
    } else {
      throw new Error('Tipo de pacote inválido');
    }

    // Obter categoria_id a partir do nome, se não for passe livre
    let categoriaFinal = null;
    let passeLivreFinal = passe_livre ? 1 : 0;

    if (!passe_livre && categoria_nome) {
      const [[categoria]] = await db.query(`SELECT categoria_id FROM categorias WHERE nome = ?`, [categoria_nome]);
      if (!categoria) return res.status(400).send('Categoria não encontrada.');
      categoriaFinal = categoria.categoria_id;
    }

    // Se categoriaFinal for null, considerar como passe livre
    if (!categoriaFinal) {
      passeLivreFinal = 1;
    }

    console.log('Data validade calculada:', data_validade);

    // Atualizar pacote
    await db.query(`
      UPDATE pacotes_aluno
      SET categoria_id = ?, tipo = ?, quantidade_aulas = ?, data_inicio = ?, data_validade = ?, pago = ?, passe_livre = ?
      WHERE id = ?
    `, [
      categoriaFinal,
      tipo,
      quantidade_aulas,
      data_inicio_formatada,
      data_validade,
      pago ? 1 : 0,
      passeLivreFinal,
      req.params.id
    ]);

    // Passe Livre: re-sincroniza com TODAS as categorias atuais do sistema
    if (passeLivreFinal) {
      await db.query(`DELETE FROM pacotes_modalidades WHERE pacote_id = ?`, [req.params.id]);
      const [todasCategorias] = await db.query(`SELECT categoria_id FROM categorias`);
      for (const cat of todasCategorias) {
        await db.query(
          `INSERT INTO pacotes_modalidades (pacote_id, categoria_id) VALUES (?, ?)`,
          [req.params.id, cat.categoria_id]
        );
      }
    } else {
      // Se mudou de Passe Livre para categoria específica, limpa as vinculações
      await db.query(`DELETE FROM pacotes_modalidades WHERE pacote_id = ?`, [req.params.id]);
    }

    return res.redirect(`/professor/pacotes/${aluno_id}`);
  } catch (err) {
    console.error('Erro ao atualizar pacote:', err);
    res.status(500).send('Erro ao atualizar o pacote.');
  }
};



////////////////////////////////////////////////////////////////////////


exports.limparAlunosTemporarios = async () => {
  try {
    const [aulas] = await db.query(`SELECT id, dia_semana, horario FROM aulas_fixas`);

    const diasSemanaMap = {
      domingo: 0,
      segunda: 1,
      terca: 2,
      terça: 2,
      quarta: 3,
      quinta: 4,
      sexta: 5,
      sabado: 6,
      sábado: 6
    };

    function getProximaDataAula(diaSemana, horario) {
      const hoje = new Date();
      const diaAtual = hoje.getDay();

      const diaSemanaNum = diasSemanaMap[diaSemana.toLowerCase()];
      if (diaSemanaNum === undefined) return null;

      let diasAteAula = diaSemanaNum - diaAtual;
      if (diasAteAula < 0) diasAteAula += 7;

      const proximaAula = new Date(hoje);
      proximaAula.setDate(hoje.getDate() + diasAteAula);

      const [hora, minuto] = horario.split(':').map(Number);
      proximaAula.setHours(hora, minuto, 0, 0);

      return proximaAula;
    }

    for (const aula of aulas) {
      const proximaData = getProximaDataAula(aula.dia_semana, aula.horario);
      if (!proximaData) continue;

      const hoje = new Date();

      // Se a próxima data for depois de hoje, significa que a última aula já passou
      if (proximaData > hoje) {
        // Remover temporários dessa aula (que são da semana anterior)
        await db.query(`
          DELETE FROM alunos_aulas_fixas 
          WHERE aula_fixa_id = ? AND eh_fixo = false
        `, [aula.id]);
      }
    }

    console.log('✅ Alunos temporários removidos com sucesso.');
  } catch (err) {
    console.error('Erro ao limpar alunos temporários:', err);
  }
};


////////////////////////////////////////////////////////ZERAR ////////////////////////////////



function limparTabela() {
    if (!confirm("⚠️ Tem certeza que deseja limpar a tabela? Essa ação NÃO pode ser desfeita.")) {
      return;
    }

    fetch('/limpar-tabela', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
    })
    .catch(error => {
      console.error(error);
      alert("Erro ao limpar a tabela.");
    });
  }




module.exports = exports;