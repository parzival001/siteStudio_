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
        IFNULL(c.nome, 'Sem categoria definida') AS categoria_nome,
        p.nome AS professor_nome, 
        a.status
      FROM aulas a
      JOIN categorias c ON a.categoria_id = c.categoria_id
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


exports.inscreverAluno = async (req, res) => {
  const aulaId = req.params.id;
  const alunoId = req.session.user.id;

  try {
    // Verifica se já está inscrito
    const [inscrito] = await db.query(
      `SELECT * FROM aulas_alunos WHERE aula_id = ? AND aluno_id = ?`,
      [aulaId, alunoId]
    );

    if (inscrito.length > 0) {
      return res.redirect('/aluno/aulas'); // já está inscrito
    }

    // Buscar categoria da aula
    const [[aula]] = await db.query(
      `SELECT categoria_id, vagas FROM aulas WHERE id = ?`,
      [aulaId]
    );

    if (!aula || aula.vagas <= 0) {
      return res.redirect('/aluno/aulas');
    }

    const categoriaId = aula.categoria_id;

    // Buscar pacote válido
    const [pacotes] = await db.query(`
      SELECT * FROM pacotes_aluno
      WHERE aluno_id = ?
        AND data_validade >= CURDATE()
        AND (passe_livre = 1 OR categoria_id = ?)
        AND quantidade_aulas > aulas_utilizadas
      ORDER BY data_validade ASC
      LIMIT 1
    `, [alunoId, categoriaId]);

    if (pacotes.length === 0) {
      req.session.erroAula = {
        aula_id: parseInt(aulaId, 10),
        mensagem: "Você não possui pacote válido para essa aula."
      };
      return res.redirect('/aluno/aulas');
    }

    const pacote = pacotes[0];

    // Inserir vínculo
    await db.query(`
      INSERT INTO aulas_alunos (aula_id, aluno_id, pacote_id)
      VALUES (?, ?, ?)
    `, [aulaId, alunoId, pacote.id]);

    // Atualizar vagas
    await db.query(
      `UPDATE aulas SET vagas = vagas - 1 WHERE id = ?`,
      [aulaId]
    );

    // Atualizar pacote
    await db.query(
      `UPDATE pacotes_aluno SET aulas_utilizadas = aulas_utilizadas + 1 WHERE id = ?`,
      [pacote.id]
    );

    res.redirect('/aluno/aulas');

  } catch (err) {
    console.error("Erro ao inscrever aluno:", err);
    res.status(500).send("Erro ao processar inscrição.");
  }
};
exports.desinscreverAluno = async (req, res) => {
  const aulaId = req.params.aulaId;
  const alunoId = req.session.user.id;

  try {
    // Buscar data/hora da aula
    const [[aula]] = await db.query(`
      SELECT data, horario FROM aulas WHERE id = ?
    `, [aulaId]);

    if (!aula) return res.status(404).send('Aula não encontrada');

    const agora = moment().utcOffset('-03:00');
    const [hora, minuto] = aula.horario.split(':');
    const dataHoraAula = moment(aula.data).set({
      hour: parseInt(hora),
      minute: parseInt(minuto),
      second: 0
    });

    let tempo_cancelamento = 12;

    // Verifica se é a primeira aula do aluno
    const [primeira] = await db.query(`
      SELECT a.id FROM aulas a
      JOIN aulas_alunos aa ON aa.aula_id = a.id
      WHERE aa.aluno_id = ?
      ORDER BY a.data ASC, a.horario ASC
      LIMIT 1
    `, [alunoId]);

    const primeiraAulaId = primeira.length ? primeira[0].id : null;
    if (aulaId == primeiraAulaId) tempo_cancelamento = 2;

    const horasParaAula = dataHoraAula.diff(agora, 'hours', true);

    if (horasParaAula < tempo_cancelamento) {
      return res.status(400).send('Você só pode se desinscrever com antecedência mínima.');
    }

    // Verifica se o aluno estava inscrito e se usou pacote
    const [[registro]] = await db.query(`
      SELECT pacote_id FROM aulas_alunos 
      WHERE aula_id = ? AND aluno_id = ?
    `, [aulaId, alunoId]);

    // Remove inscrição
    await db.query(`
      DELETE FROM aulas_alunos WHERE aula_id = ? AND aluno_id = ?
    `, [aulaId, alunoId]);

    // Libera vaga
    await db.query(`
      UPDATE aulas SET vagas = vagas + 1 WHERE id = ?
    `, [aulaId]);

    // Repor crédito se pacote foi usado
    if (registro && registro.pacote_id) {
      await db.query(`
        UPDATE pacotes_aluno SET aulas_utilizadas = aulas_utilizadas - 1
        WHERE id = ? AND aulas_utilizadas > 0
      `, [registro.pacote_id]);
      console.log("Crédito devolvido ao pacote:", registro.pacote_id);
    }

    res.redirect('/aluno/aulas');

  } catch (err) {
    console.error('Erro ao desinscrever aluno:', err);
    res.status(500).send('Erro ao desinscrever da aula.');
  }
};

exports.listarPacotes = async (req, res) => {
  try {
    const alunoId = req.session.user?.id;

    if (!alunoId) {
      return res.status(401).send('Usuário não logado.');
    }
    console.log('Aluno ID da sessão:', alunoId);
    const [pacotes] = await db.query(`
      SELECT 
        p.id, 
        a.nome AS aluno_nome, 
        p.quantidade_aulas AS aulas_total, 
        p.aulas_utilizadas, 
        p.data_validade AS validade, 
        p.pago, 
        p.passe_livre, 
        c.nome AS modalidade
      FROM pacotes_aluno p
      JOIN alunos a ON a.id = p.aluno_id
      LEFT JOIN categorias c ON c.categoria_id = p.categoria_id
      WHERE p.aluno_id = ?
    `, [alunoId]);

    pacotes.forEach(pacote => {
      const validade = new Date(pacote.validade);
      validade.setHours(0, 0, 0, 0);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const diasRestantes = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

      const aulasTotal = parseInt(pacote.aulas_total, 10) || 0;
      const aulasUtilizadas = parseInt(pacote.aulas_utilizadas, 10) || 0;
      pacote.aulas_restantes = aulasTotal - aulasUtilizadas;

      pacote.status_validade = diasRestantes < 0
        ? 'Vencido'
        : diasRestantes <= 7
          ? 'Próximo do vencimento'
          : 'Válido';

      const dia = String(validade.getDate()).padStart(2, '0');
      const mes = String(validade.getMonth() + 1).padStart(2, '0');
      const ano = validade.getFullYear();
      pacote.validade = `${dia}/${mes}/${ano}`;
    });
    console.log('Pacotes retornados:', pacotes);
    res.render('aluno/pacotes', { pacotes });
  } catch (err) {
    console.error('Erro ao listar pacotes:', err);
    res.status(500).send('Erro ao listar pacotes');
  }
};


