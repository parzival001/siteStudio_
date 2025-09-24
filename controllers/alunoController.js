const db = require('../config/db'); // Ajuste o caminho conforme o seu projeto
const bcrypt = require('bcryptjs');
const moment = require('moment');
const axios = require('axios');
const { enviarMensagem } = require('../utils/telegram');
const { enviarMensagemAluno } = require('../utils/telegramAluno');
const path = require('path');
const fs = require('fs');



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

exports.homeAluno = async (req, res) => {
  const alunoId = req.session.user.id;

  try {
       // Dados pessoais do aluno
    const [[aluno]] = await db.query(
      `SELECT nome, data_nascimento, endereco, cidade, uf, telefone, rg, cpf
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
// Desinscrever aluno de uma aula
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

    // Enviar mensagem ao admin e ao grupo de alunos
    if (aulaInfo && alunoInfo) {
      const mensagem =
        `⚠️ *Cancelamento de Aula*\n\n` +
        `👤 Aluno: ${alunoInfo.nome || ''}\n` +
        `📅 Data: ${new Date(aulaInfo.data).toLocaleDateString('pt-BR')}\n` +
        `⏰ Horário: ${aulaInfo.horario?.slice(0, 5) || ''}\n` +
        `🏷️ Categoria: ${aulaInfo.categoria_nome || ''}\n` +
        `👨‍🏫 Professor: ${aulaInfo.professor_nome || ''}`;

      // Envia para o admin
      await enviarMensagem(mensagem);

      // Envia para o grupo de alunos
      await enviarMensagemAluno(mensagem);
    }

    res.redirect('/aluno/aulas');

  } catch (error) {
    console.error('❌ Erro ao desinscrever aluno:', error);
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

    for (const pacote of pacotes) {
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

      // ✅ Corrigir valor do campo "pago"
      pacote.pago = pacote.pago === 1 || pacote.pago === '1' ? 'Sim' : 'Não';

      // ✅ Buscar créditos usados do pacote com data, horário e categoria
      const [usos] = await db.query(`
        SELECT 
          DATE_FORMAT(u.data_utilizacao, '%d/%m/%Y') AS data,
          af.horario,
          c.nome AS categoria
        FROM uso_creditos u
        LEFT JOIN aulas_fixas af ON af.id = u.aula_fixa_id
        LEFT JOIN categorias c ON c.categoria_id = af.categoria_id
        WHERE u.pacote_id = ?
        ORDER BY u.data_utilizacao DESC
      `, [pacote.id]);

      pacote.usos = usos;
    }

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
      JOIN categorias c ON categoria_id = h.categoria_id
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




////////////////////////////////////////////////AULAS FIXAS/////////////////////////////////////////////////

// Função para calcular a próxima data da aula
function proximaDataDoDiaSemana(diaSemana, horario) {
  const diasSemana = {
    'domingo': 0,
    'segunda-feira': 1,
    'segunda': 1,
    'terça-feira': 2,
    'terça': 2,
    'terca': 2,
    'quarta-feira': 3,
    'quarta': 3,
    'quinta-feira': 4,
    'quinta': 4,
    'sexta-feira': 5,
    'sexta': 5,
    'sábado': 6,
    'sabado': 6
  };

  const diaLower = diaSemana
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '');

  const diaAlvo = diasSemana[diaLower];

  if (diaAlvo === undefined) {
    throw new Error('Dia da semana inválido: ' + diaSemana);
  }

  const agora = new Date();
  const hojeDia = agora.getDay();

  // Define a data da aula (sem hora ainda)
  const proximaData = new Date(agora);
  let diasParaAdicionar = diaAlvo - hojeDia;

  // Se a aula for hoje, verifica se o horário da aula já passou
  const [horaAula, minutoAula] = horario.split(':').map(Number);
  const dataTentativa = new Date(agora);
  dataTentativa.setHours(horaAula, minutoAula, 0, 0);

  if (diasParaAdicionar < 0 || (diasParaAdicionar === 0 && dataTentativa <= agora)) {
    diasParaAdicionar += 7;
  }

  proximaData.setDate(agora.getDate() + diasParaAdicionar);
  proximaData.setHours(horaAula, minutoAula, 0, 0);

  return proximaData;
}

// Controller listar aulas fixas disponíveis
exports.listarAulasFixasDisponiveis = async (req, res) => {
  const alunoId = req.session.user?.id;

  // 🔹 Helper para sempre pegar hora de São Paulo
  function getNowSP() {
    const agora = new Date();
    const formatado = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).format(agora);

    // formatado vem como "MM/DD/YYYY, HH:MM:SS"
    return new Date(formatado);
  }

  const hojeSP = getNowSP();
  const hoje = hojeSP.toISOString().slice(0, 10);

  try {
    const [aulas] = await db.query(`
      SELECT
        af.id,
        c.nome AS categoria_nome,
        p.nome AS professor_nome,
        af.dia_semana,
        af.horario,
        af.vagas,
        af.categoria_id,
        CASE
          WHEN aaf.aluno_id IS NOT NULL THEN 1
          ELSE 0
        END AS inscrito,
        IFNULL(aaf.eh_fixo, 0) AS eh_fixo
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
      JOIN professores p ON af.professor_id = p.id
      LEFT JOIN alunos_aulas_fixas aaf
        ON af.id = aaf.aula_fixa_id AND aaf.aluno_id = ?
      ORDER BY
        CASE
          WHEN af.dia_semana = 'domingo' THEN 0
          WHEN af.dia_semana = 'segunda' THEN 1
          WHEN af.dia_semana = 'terca' THEN 2
          WHEN af.dia_semana = 'terça' THEN 2
          WHEN af.dia_semana = 'quarta' THEN 3
          WHEN af.dia_semana = 'quinta' THEN 4
          WHEN af.dia_semana = 'sexta' THEN 5
          WHEN af.dia_semana = 'sabado' THEN 6
          WHEN af.dia_semana = 'sábado' THEN 6
        END,
        af.horario
    `, [alunoId]);

    const [pacotes] = await db.query(`
      SELECT categoria_id, passe_livre, quantidade_aulas, aulas_utilizadas, data_validade
      FROM pacotes_aluno
      WHERE aluno_id = ?
        AND (data_validade IS NULL OR data_validade >= ?)
        AND (quantidade_aulas - aulas_utilizadas) > 0
    `, [alunoId, hoje]);

    const [desistenciasHistorico] = await db.query(`
      SELECT data FROM aulas_fixas_desistencias
      WHERE aluno_id = ?
    `, [alunoId]);

    function temPacoteParaCategoria(categoriaId) {
      return pacotes.some(pacote =>
        pacote.passe_livre === 1 || pacote.categoria_id === categoriaId
      );
    }

    function proximaDataDoDiaSemana(diaSemana, horario) {
      const diasSemanaMap = {
        domingo: 0, segunda: 1, terca: 2, terça: 2,
        quarta: 3, quinta: 4, sexta: 5,
        sabado: 6, sábado: 6
      };

      const hojeSP = getNowSP();
      const diaAtual = hojeSP.getDay();
      const diaAula = diasSemanaMap[diaSemana.toLowerCase()];
      let diasAteAula = diaAula - diaAtual;
      if (diasAteAula < 0) diasAteAula += 7;

      const dataAula = new Date(hojeSP);
      dataAula.setDate(hojeSP.getDate() + diasAteAula);
      const [hora, minuto] = horario.split(':').map(Number);
      dataAula.setHours(hora, minuto, 0, 0);
      return dataAula;
    }

    const aulasComExtras = aulas.map(aula => {
      const dataHoraAula = proximaDataDoDiaSemana(aula.dia_semana, aula.horario);
      const agora = getNowSP();

      // Semana de referência
      const dataBase = new Date(dataHoraAula);
      const inicioSemana = new Date(dataBase);
      inicioSemana.setDate(dataBase.getDate() - dataBase.getDay());
      inicioSemana.setHours(0, 0, 0, 0);

      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6);
      fimSemana.setHours(23, 59, 59, 999);

      // Filtra desistências do aluno nessa semana
      const desistenciasSemana = desistenciasHistorico.filter(d => {
        const dataDes = new Date(d.data);
        dataDes.setHours(0, 0, 0, 0);
        return dataDes >= inicioSemana && dataDes <= fimSemana;
      });

      const jaDesistiuNaSemana = desistenciasSemana.length > 0;

      // ✅ Regra corrigida
      const limiteHoras = jaDesistiuNaSemana ? 12 : 2;

      const diffHoras = (dataHoraAula - agora) / (1000 * 60 * 60);
      const podeDesistir = diffHoras >= limiteHoras;

      const mensagemDesistencia = podeDesistir
        ? null
        : jaDesistiuNaSemana
          ? 'Desistências adicionais na semana precisam de pelo menos 12 horas de antecedência.'
          : 'Desistência da primeira aula da semana precisa de pelo menos 2 horas de antecedência.';

      return {
        ...aula,
        horario: aula.horario?.slice(0, 5),
        temPacote: temPacoteParaCategoria(aula.categoria_id),
        pode_desistir: podeDesistir,
        ehFixo: aula.eh_fixo === 1,
        limite_desistencia_horas: limiteHoras,
        mensagem_desistencia: mensagemDesistencia
      };
    });

    res.render('aluno/aulasFixasDisponiveis', { aulas: aulasComExtras });

  } catch (err) {
    console.error('Erro ao listar aulas fixas:', err);
    res.status(500).send('Erro interno ao buscar aulas fixas');
  }
};

exports.inscreverNaAulaFixa = async (req, res) => {
  const alunoId = req.session.user?.id;
  const aulaFixaId = req.params.id;

  try {
    const [[aula]] = await db.query(
      `SELECT categoria_id, vagas FROM aulas_fixas WHERE id = ?`,
      [aulaFixaId]
    );

    if (!aula) {
      return res.status(404).send('Aula fixa não encontrada.');
    }

    if (aula.vagas <= 0) {
      return res.status(400).send('Não há vagas disponíveis nessa aula.');
    }

    const [[inscrito]] = await db.query(
      `SELECT * FROM alunos_aulas_fixas WHERE aluno_id = ? AND aula_fixa_id = ?`,
      [alunoId, aulaFixaId]
    );

    if (inscrito) {
      return res.status(400).send('Você já está inscrito nessa aula.');
    }

    const hoje = new Date().toISOString().slice(0, 10);
    const [pacotes] = await db.query(
      `SELECT * FROM pacotes_aluno
       WHERE aluno_id = ?
         AND (categoria_id = ? OR passe_livre = 1)
         AND (data_validade IS NULL OR data_validade >= ?)
         AND (quantidade_aulas - aulas_utilizadas) > 0
       ORDER BY data_validade ASC
       LIMIT 1`,
      [alunoId, aula.categoria_id, hoje]
    );

    if (pacotes.length === 0) {
      const [aulas] = await db.query(`
        SELECT af.id, af.dia_semana, af.horario, af.vagas, af.categoria_id,
               c.nome AS categoria_nome,
               p.nome AS professor_nome,
               CASE WHEN aaf.aluno_id IS NOT NULL THEN 1 ELSE 0 END AS inscrito
        FROM aulas_fixas af
        JOIN categorias c ON af.categoria_id = c.categoria_id
        JOIN professores p ON af.professor_id = p.id
        LEFT JOIN alunos_aulas_fixas aaf ON af.id = aaf.aula_fixa_id AND aaf.aluno_id = ?
        WHERE af.vagas > 0
      `, [alunoId]);

      aulas.forEach(aulaItem => {
        aulaItem.temPacote = aulaItem.id !== parseInt(aulaFixaId);
      });

      return res.render('aluno/aulasFixas', {
        aulas,
        mensagemErroId: parseInt(aulaFixaId),
        mensagemErroTexto: 'Você não possui pacote válido com aulas disponíveis para essa categoria.'
      });
    }

    // ✅ Insere com eh_fixo = 0
    await db.query(
      `INSERT INTO alunos_aulas_fixas (aluno_id, aula_fixa_id, eh_fixo) VALUES (?, ?, 0)`,
      [alunoId, aulaFixaId]
    );

    await db.query(
      `UPDATE aulas_fixas SET vagas = vagas - 1 WHERE id = ?`,
      [aulaFixaId]
    );

    res.redirect('/aluno/aulas-fixas');

  } catch (err) {
    console.error('Erro ao inscrever em aula fixa:', err);
    res.status(500).send('Erro ao inscrever na aula');
  }
};

exports.desistirAulaFixa = async (req, res) => {
  const alunoId = req.session.user.id;
  const aulaId = req.params.aulaId;

  try {
    // 1) Verifica se o aluno está inscrito na aula
    const [[inscricao]] = await db.query(`
      SELECT * FROM alunos_aulas_fixas
      WHERE aluno_id = ? AND aula_fixa_id = ?
    `, [alunoId, aulaId]);

    if (!inscricao) {
      return res.status(400).send('Você não está inscrito nesta aula fixa.');
    }

    // 2) Busca dados da aula (categoria e professor)
    const [[aula]] = await db.query(`
      SELECT af.*, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
      JOIN professores p ON af.professor_id = p.id
      WHERE af.id = ?
    `, [aulaId]);

    if (!aula) {
      return res.status(404).send('Aula fixa não encontrada.');
    }

    // --- Mantemos o cálculo da próxima data da aula apenas para registro/notificação ---
    const diasSemanaMap = {
      domingo: 0, segunda: 1, terca: 2, terça: 2, quarta: 3,
      quinta: 4, sexta: 5, sabado: 6, sábado: 6
    };

    function getProximaDataAula(diaSemana, horario) {
      const hoje = new Date();
      const diaAtual = hoje.getDay();
      const diaSemanaNum = diasSemanaMap[diaSemana.toLowerCase()];
      if (diaSemanaNum === undefined) throw new Error(`Dia inválido: ${diaSemana}`);

      let diasAteAula = diaSemanaNum - diaAtual;
      if (diasAteAula < 0) diasAteAula += 7;

      const proximaAula = new Date(hoje);
      proximaAula.setDate(hoje.getDate() + diasAteAula);
      const [hora, minuto] = aula.horario.split(':').map(Number);
      proximaAula.setHours(hora, minuto, 0, 0);

      if (proximaAula <= hoje) proximaAula.setDate(proximaAula.getDate() + 7);
      return proximaAula;
    }

    const dataAula = getProximaDataAula(aula.dia_semana, aula.horario);
    const dataAulaStr = dataAula.toISOString().slice(0, 10);

    // -----------------------------------------------------------------------------------
    // REMOVIDO: Regras de bloqueio por 2h/12h no back-end.
    // Agora a prevenção é 100% feita pela UI (sumir botão / mostrar mensagem).
    // -----------------------------------------------------------------------------------

    // Evita duplicidade de registro para a mesma aula/data
    await db.query(`
      DELETE FROM aulas_fixas_desistencias
      WHERE aluno_id = ? AND aula_fixa_id = ? AND data = ?
    `, [alunoId, aulaId, dataAulaStr]);

    // Registra desistência
    await db.query(`
      INSERT INTO aulas_fixas_desistencias (aluno_id, aula_fixa_id, data)
      VALUES (?, ?, ?)
    `, [alunoId, aulaId, dataAulaStr]);

    // Remove da lista de participantes
    await db.query(`
      DELETE FROM alunos_aulas_fixas
      WHERE aluno_id = ? AND aula_fixa_id = ?
    `, [alunoId, aulaId]);

    // Libera a vaga
    await db.query(`
      UPDATE aulas_fixas SET vagas = vagas + 1 WHERE id = ?
    `, [aulaId]);

    // Notificações
    const [[alunoInfo]] = await db.query(`SELECT nome FROM alunos WHERE id = ?`, [alunoId]);

    const mensagem =
      `⚠️ *Cancelamento de Aula*\n\n` +
      `👤 Aluno: ${alunoInfo.nome}\n` +
      `📅 Data: ${dataAula.toLocaleDateString('pt-BR')}\n` +
      `⏰ Horário: ${aula.horario.slice(0, 5)}\n` +
      `🏷️ Categoria: ${aula.categoria_nome}\n` +
      `👨‍🏫 Professor: ${aula.professor_nome}`;

    // Se você usa essas funções, mantenha os imports no topo do arquivo:
    // const { enviarMensagem } = require('../utils/telegram');
    // const { enviarMensagemAluno } = require('../utils/telegramAlunos');
    await enviarMensagem(mensagem);
    await enviarMensagemAluno(mensagem);

    return res.redirect('/aluno/aulas-fixas');
  } catch (error) {
    console.error('Erro ao desistir da aula fixa:', error);
    return res.status(500).send('Erro interno no servidor');
  }
};


////////////////////////////////////////////////ANAMNESE////////////////////////////////////////////

exports.exibirAnamnese = async (req, res) => {
  const alunoId = req.session.user.id;

  const [[anamnese]] = await db.query(`SELECT * FROM anamneses WHERE aluno_id = ?`, [alunoId]);

  res.render('aluno/anamnese', {
    anamnese,
    aluno: req.session.user
  });
};

exports.salvarAnamnese = async (req, res) => {
  const alunoId = req.session.user.id;
  const dados = req.body;

  const [[existe]] = await db.query(`SELECT id FROM anamneses WHERE aluno_id = ?`, [alunoId]);

  const aceite = dados.aceite_termo ? 1 : 0;

  if (existe) {
    await db.query(`
      UPDATE anamneses SET
        peso = ?, estatura = ?, contato_emergencia_nome = ?, contato_emergencia_telefone = ?,
        tempo_sentado = ?, atividade_fisica = ?, fumante = ?, alcool = ?, alimentacao = ?, gestante = ?,
        tratamento_medico = ?, lesoes = ?, marcapasso = ?, metais = ?, problema_cervical = ?, procedimento_cirurgico = ?,
        alergia_medicamentosa = ?, hipertensao = ?, hipotensao = ?, diabetes = ?, epilepsia = ?, labirintite = ?,
        observacoes = ?, aceite_termo = ?
      WHERE aluno_id = ?
    `, [
      dados.peso, dados.estatura, dados.contato_emergencia_nome, dados.contato_emergencia_telefone,
      dados.tempo_sentado, dados.atividade_fisica, dados.fumante, dados.alcool, dados.alimentacao, dados.gestante,
      dados.tratamento_medico, dados.lesoes, dados.marcapasso, dados.metais, dados.problema_cervical, dados.procedimento_cirurgico,
      dados.alergia_medicamentosa, dados.hipertensao, dados.hipotensao, dados.diabetes, dados.epilepsia, dados.labirintite,
      dados.observacoes, aceite, alunoId
    ]);
  } else {
    await db.query(`
      INSERT INTO anamneses (
        aluno_id, peso, estatura, contato_emergencia_nome, contato_emergencia_telefone,
        tempo_sentado, atividade_fisica, fumante, alcool, alimentacao, gestante,
        tratamento_medico, lesoes, marcapasso, metais, problema_cervical, procedimento_cirurgico,
        alergia_medicamentosa, hipertensao, hipotensao, diabetes, epilepsia, labirintite,
        observacoes, aceite_termo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      alunoId, dados.peso, dados.estatura, dados.contato_emergencia_nome, dados.contato_emergencia_telefone,
      dados.tempo_sentado, dados.atividade_fisica, dados.fumante, dados.alcool, dados.alimentacao, dados.gestante,
      dados.tratamento_medico, dados.lesoes, dados.marcapasso, dados.metais, dados.problema_cervical, dados.procedimento_cirurgico,
      dados.alergia_medicamentosa, dados.hipertensao, dados.hipotensao, dados.diabetes, dados.epilepsia, dados.labirintite,
      dados.observacoes, aceite
    ]);
  }

  res.redirect('/aluno/home'); // ou para a página de confirmação

};

  //////////////////////////////////////////////////////////DADOS////////////////////////////////////////
  // Controller para mostrar os dados do aluno
exports.mostrarDadosAluno = async (req, res) => {
  const alunoId = req.session.user.id;

  try {
    const [[aluno]] = await db.query(`
      SELECT nome, data_nascimento, endereco, complemento, cep, cidade, uf, telefone, rg, cpf, contrato_pdf
      FROM alunos
      WHERE id = ?
    `, [alunoId]);

    if (!aluno) {
      return res.status(404).send('Aluno não encontrado');
    }

    // Formata data de nascimento para YYYY-MM-DD
    if (aluno.data_nascimento) {
      aluno.data_nascimento = moment(aluno.data_nascimento).format('YYYY-MM-DD');
    }

    res.render('aluno/dados', { aluno });
  } catch (error) {
    console.error('Erro ao carregar dados do aluno:', error);
    res.status(500).send('Erro interno do servidor');
  }
};

exports.atualizarDadosAluno = async (req, res) => {
  const alunoId = req.session.user.id;
  const {
    nome,
    data_nascimento,
    endereco,
    complemento,
    cep,
    cidade,
    uf,
    telefone,
    rg,
    cpf
  } = req.body;

  const contratoFile = req.file;
  let contratoNomeArquivo;

  try {
    if (contratoFile) {
      contratoNomeArquivo = contratoFile.filename;

      const [[alunoAtual]] = await db.query('SELECT contrato_pdf FROM alunos WHERE id = ?', [alunoId]);
      if (alunoAtual.contrato_pdf) {
        const caminhoAntigo = path.join(__dirname, '..', 'public', 'uploads', 'contratos', alunoAtual.contrato_pdf);
        if (fs.existsSync(caminhoAntigo)) {
          fs.unlinkSync(caminhoAntigo);
        }
      }
    }

    const campos = [
      nome, data_nascimento, endereco, complemento, cep,
      cidade, uf, telefone, rg, cpf
    ];

    let sql = `
      UPDATE alunos SET 
        nome = ?, data_nascimento = ?, endereco = ?, complemento = ?, cep = ?,
        cidade = ?, uf = ?, telefone = ?, rg = ?, cpf = ?
    `;

    if (contratoNomeArquivo) {
      sql += `, contrato_pdf = ?`;
      campos.push(contratoNomeArquivo);
    }

    sql += ` WHERE id = ?`;
    campos.push(alunoId);

    await db.query(sql, campos);

    res.redirect('/aluno/dados');
  } catch (error) {
    console.error('Erro ao atualizar dados do aluno:', error);
    res.status(500).send('Erro ao atualizar dados');
  }
};
