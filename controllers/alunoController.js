const db = require('../config/db'); // Ajuste o caminho conforme o seu projeto
const bcrypt = require('bcryptjs');
const moment = require('moment');
const axios = require('axios');
const { enviarMensagem } = require('../utils/telegram');


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

function podeDesmarcarAula(dataAula, horarioAula, isPrimeiraAula) {
  const dataHora = moment(`${dataAula} ${horarioAula}`, 'YYYY-MM-DD HH:mm:ss');
  const agora = moment();
  const horasDeAntecedencia = isPrimeiraAula ? 2 : 12;
  return dataHora.diff(agora, 'hours', true) >= horasDeAntecedencia;
}

exports.homeAluno = async (req, res) => {
  const alunoId = req.session.user.id;

  try {
    // Dados pessoais do aluno
    const [[aluno]] = await db.query(`
      SELECT nome, data_nascimento, endereco, cidade, uf, telefone, rg, cpf
      FROM alunos
      WHERE id = ?
    `, [alunoId]);

   if (aluno && aluno.data_nascimento) {
  aluno.data_nascimento_formatada = moment(aluno.data_nascimento).utcOffset(-3).format('DD/MM/YYYY');
}
    console.log("Data de nascimento formatada:", aluno.data_nascimento_formatada);
    // Aulas pendentes
    const [aulas] = await db.query(`
      SELECT 
        a.id, a.data, a.horario, a.vagas, 
        c.nome AS categoria_nome, 
        p.nome AS professor_nome, 
        a.status
      FROM aulas a
      JOIN categorias c ON a.categoria_id = c.categoria_id
      JOIN professores p ON a.professor_id = p.id
      WHERE a.status = 'pendente'
    `);

    // IDs das aulas já agendadas
    const [inscricoes] = await db.query(`
      SELECT aula_id FROM aulas_alunos WHERE aluno_id = ?
    `, [alunoId]);

    const aulasAgendadas = inscricoes.map(a => a.aula_id);

    // Verificar qual é a primeira aula agendada
    const [primeira] = await db.query(`
      SELECT a.id, a.data, a.horario
      FROM aulas a
      JOIN aulas_alunos aa ON aa.aula_id = a.id
      WHERE aa.aluno_id = ?
      ORDER BY a.data ASC, a.horario ASC
      LIMIT 1
    `, [alunoId]);

    const primeiraAulaId = primeira.length > 0 ? primeira[0].id : null;

    // Montar dados das aulas com status de inscrição e cancelamento
    const aulasFormatadas = aulas.map(aula => {
      const jaInscrito = aulasAgendadas.includes(aula.id);
      const isPrimeiraAula = aula.id === primeiraAulaId;
      const pode_desmarcar = podeDesmarcarAula(aula.data, aula.horario, isPrimeiraAula);

      return {
        ...aula,
        data_formatada: moment(aula.data).format('DD/MM/YYYY'),
        horario_formatado: moment(aula.horario, 'HH:mm:ss').format('HH:mm'),
        ja_inscrito: jaInscrito,
        pode_desmarcar,
      };
    });

    // Histórico de aulas concluídas
    const [historico] = await db.query(`
      SELECT a.data, a.horario, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas_alunos aa
      JOIN aulas a ON aa.aula_id = a.id
      JOIN categorias c ON a.categoria_id = c.categoria_id
      JOIN professores p ON a.professor_id = p.id
      WHERE aa.aluno_id = ? AND a.status = 'concluida'
      ORDER BY a.data DESC
    `, [alunoId]);

    // Pacotes ativos
    const [pacotes] = await db.query(`
      SELECT * FROM pacotes_aluno 
      WHERE aluno_id = ? AND data_validade >= CURRENT_DATE
    `, [alunoId]);

    // Anamnese (se existir)
    const [[anamnese]] = await db.query(`
      SELECT observacoes 
      FROM anamneses 
      WHERE aluno_id = ?
    `, [alunoId]);
          console.log('Aluno enviado para view:', aluno);
    // Renderizar página home do aluno
    res.render('aluno/home', {
      aluno,
      aulas: aulasFormatadas,
      aulasAgendadas,
      historico,
      pacotes,
      anamnese: anamnese ? anamnese.observacoes : 'Nenhuma anamnese cadastrada'
    });

  } catch (err) {
    console.error('Erro ao carregar home do aluno:', err);
    res.render('aluno/home', { error: 'Erro ao carregar os dados. Tente novamente.' });
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
  // Verifica se há usuário na sessão
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).send('Sessão expirada ou usuário não autenticado.');
  }

  const aulaId = req.params.id;
  const alunoId = req.session.user.id;

  try {
    // Buscar info do pacote (se existir)
    const [[registro]] = await db.query(
      `SELECT pacote_id FROM aulas_alunos WHERE aula_id = ? AND aluno_id = ?`,
      [aulaId, alunoId]
    );

    // Buscar dados da aula e do aluno para compor a mensagem
    const [[aulaInfo]] = await db.query(`
      SELECT a.data, a.horario, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas a
      JOIN categorias c ON a.categoria_id = c.categoria_id
      JOIN professores p ON a.professor_id = p.id
      WHERE a.id = ?
    `, [aulaId]);

    const [[alunoInfo]] = await db.query(`
      SELECT nome FROM alunos WHERE id = ?
    `, [alunoId]);

    // Remover aluno da aula
    await db.query(
      `DELETE FROM aulas_alunos WHERE aula_id = ? AND aluno_id = ?`,
      [aulaId, alunoId]
    );

    // Incrementar vaga da aula
    await db.query(
      `UPDATE aulas SET vagas = vagas + 1 WHERE id = ?`,
      [aulaId]
    );

    // Repor crédito ao pacote, se houver
    if (registro && registro.pacote_id) {
      await db.query(
        `UPDATE pacotes_aluno 
         SET aulas_utilizadas = GREATEST(aulas_utilizadas - 1, 0)
         WHERE id = ?`,
        [registro.pacote_id]
      );
    }

    // Enviar mensagem ao admin via Telegram
    if (aulaInfo && alunoInfo) {
      const mensagem =
        `⚠️ *Cancelamento de Aula*\n\n` +
        `👤 Aluno: ${alunoInfo.nome || ''}\n` +
        `📅 Data: ${new Date(aulaInfo.data).toLocaleDateString('pt-BR')}\n` +
        `⏰ Horário: ${aulaInfo.horario?.slice(0, 5) || ''}\n` +
        `🏷️ Categoria: ${aulaInfo.categoria_nome || ''}\n` +
        `👨‍🏫 Professor: ${aulaInfo.professor_nome || ''}`;

      await enviarMensagem(mensagem);
    }

    res.redirect('/aluno/aulas');
  } catch (error) {
    console.error('Erro ao desinscrever aluno:', error);
    res.status(500).send('Erro ao desinscrever aluno.');
  }
};
exports.listarPacotes = async (req, res) => {
  try {
    const alunoId = req.session.user?.id;

    if (!alunoId) {
      return res.status(401).send('Usuário não logado.');
    }

    const [pacotes] = await db.query(`
      SELECT 
        p.id, 
        a.nome AS aluno_nome, 
        p.quantidade_aulas AS aulas_total, 
        p.aulas_utilizadas, 
        p.data_inicio,
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
      const aulasTotal = parseInt(pacote.aulas_total, 10) || 0;
      const aulasUtilizadas = parseInt(pacote.aulas_utilizadas, 10) || 0;
      pacote.aulas_restantes = aulasTotal - aulasUtilizadas;

      // ✅ Formatar data de início
      if (pacote.data_inicio) {
        const inicio = new Date(pacote.data_inicio);
        const dia = String(inicio.getDate()).padStart(2, '0');
        const mes = String(inicio.getMonth() + 1).padStart(2, '0');
        const ano = inicio.getFullYear();
        pacote.data_inicio_formatada = `${dia}/${mes}/${ano}`;
      } else {
        pacote.data_inicio_formatada = '-';
      }

      // ✅ Formatar validade e status
      if (pacote.validade) {
        const validade = new Date(pacote.validade);
        validade.setHours(0, 0, 0, 0);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const diasRestantes = Math.floor((validade - hoje) / (1000 * 60 * 60 * 24));

        pacote.status_validade = diasRestantes < 0
          ? 'Vencido'
          : diasRestantes <= 7
            ? 'Próximo do vencimento'
            : 'Válido';

        const dia = String(validade.getDate()).padStart(2, '0');
        const mes = String(validade.getMonth() + 1).padStart(2, '0');
        const ano = validade.getFullYear();
        pacote.validade = `${dia}/${mes}/${ano}`;
      } else {
        pacote.status_validade = 'Sem validade';
        pacote.validade = '-';
      }
    });

    res.render('aluno/pacotes', { pacotes });
  } catch (err) {
    console.error('Erro ao listar pacotes:', err);
    res.status(500).send('Erro ao listar pacotes');
  }
};


exports.historicoAluno = async (req, res) => {
  const alunoId = req.session.user.id;

  try {
    const [historico] = await pool.query(`
      SELECT h.*, c.nome AS tipo_nome, p.nome AS professor_nome
      FROM historico_aulas h
      JOIN categorias c ON c.id = h.categoria_id
      JOIN professores p ON p.id = h.professor_id
      WHERE h.aluno_id = ?
      ORDER BY h.data DESC, h.horario DESC
    `, [alunoId]);

    res.render('aluno/historico', { historico });

  } catch (err) {
    console.error('Erro ao buscar histórico:', err.message);
    res.status(500).send('Erro ao buscar histórico');
  }
};