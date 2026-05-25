const db = require('../config/db'); // Ajuste o caminho conforme o seu projeto
const bcrypt = require('bcryptjs');
const moment = require('moment');
const { enviarMensagem, enviarMensagemAluno } = require('../utils/telegram');
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



exports.listarPacotes = async (req, res) => {
  try {
    const { formatarDataBR } = require('../utils/formatarData');
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
        p.observacao,
        c.nome AS modalidade
      FROM pacotes_aluno p
      JOIN alunos a ON a.id = p.aluno_id
      LEFT JOIN categorias c ON c.categoria_id = p.categoria_id
      WHERE p.aluno_id = ?
      ORDER BY p.data_inicio DESC, p.id DESC
    `, [alunoId]);

    for (const pacote of pacotes) {
      const aulasTotal = parseInt(pacote.aulas_total, 10) || 0;
      const aulasUtilizadas = parseInt(pacote.aulas_utilizadas, 10) || 0;
      pacote.aulas_restantes = aulasTotal - aulasUtilizadas;

      // Passe Livre não tem categoria — exibe rótulo dedicado
      if (pacote.passe_livre == 1) {
        pacote.modalidade = 'Passe Livre';
      } else if (!pacote.modalidade) {
        pacote.modalidade = '—';
      }

      // ===== Histórico de uso =====
      const [usosAtivos] = await db.query(`
        SELECT
          uc.data_utilizacao AS data,
          c.nome AS categoria,
          af.horario,
          p.nome AS professor
        FROM uso_creditos uc
        LEFT JOIN aulas_fixas af ON af.id = uc.aula_fixa_id
        LEFT JOIN categorias c ON c.categoria_id = af.categoria_id
        LEFT JOIN professores p ON p.id = af.professor_id
        WHERE uc.pacote_id = ?
        ORDER BY uc.data_utilizacao DESC
      `, [pacote.id]);

      const [usosArquivados] = await db.query(`
        SELECT
          arq.data_aula AS data,
          arq.categoria_nome AS categoria,
          arq.horario,
          arq.professor_nome AS professor
        FROM aulas_fixas_arquivadas_alunos arqa
        JOIN aulas_fixas_arquivadas arq ON arq.id = arqa.arquivamento_id
        WHERE arqa.pacote_id = ?
          AND arqa.credito_usado = 1
        ORDER BY arq.data_aula DESC
      `, [pacote.id]);

      const chaveDuplicada = new Set();
      const usos = [];
      for (const u of [...usosAtivos, ...usosArquivados]) {
        const dataFmt = formatarDataBR(u.data);
        const chave = `${dataFmt}_${u.horario || ''}`;
        if (chaveDuplicada.has(chave)) continue;
        chaveDuplicada.add(chave);

        usos.push({
          data_fmt: dataFmt,
          data_raw: u.data,
          categoria: u.categoria || '-',
          horario: String(u.horario || '').slice(0, 5),
          professor: u.professor || '-',
        });
      }
      usos.sort((a, b) => {
        const sa = String(a.data_raw instanceof Date ? a.data_raw.toISOString() : a.data_raw);
        const sb = String(b.data_raw instanceof Date ? b.data_raw.toISOString() : b.data_raw);
        return sb.localeCompare(sa);
      });
      pacote.historico_uso = usos;

      pacote.data_inicio_formatada = formatarDataBR(pacote.data_inicio);
      const validadeFmt = formatarDataBR(pacote.validade);

      if (pacote.validade) {
        const validadeDate = pacote.validade instanceof Date
          ? pacote.validade
          : new Date(String(pacote.validade).slice(0, 10) + 'T00:00:00Z');

        const hoje = new Date();
        const hojeUTC = new Date(Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()));
        const diasRestantes = Math.floor((validadeDate - hojeUTC) / (1000 * 60 * 60 * 24));

        pacote.status_validade = diasRestantes < 0
          ? 'Vencido'
          : diasRestantes <= 7
            ? 'Próximo do vencimento'
            : 'Válido';
      } else {
        pacote.status_validade = 'Sem validade';
      }

      pacote.validade = validadeFmt;
    }

    res.render('aluno/pacotes', { pacotes });
  } catch (err) {
    console.error('Erro ao listar pacotes:', err);
    res.status(500).send('Erro ao carregar pacotes.');
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


// 🔹 Hora oficial São Paulo
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

  return new Date(formatado);
}

// 🔹 Calcula próxima data corretamente
function proximaDataDoDiaSemana(diaSemana, horario) {
  const diasSemana = {
    'domingo': 0,
    'segunda': 1,
    'terca': 2,
    'terça': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
    'sabado': 6,
    'sábado': 6
  };

  const diaLower = diaSemana
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, '');

  const diaAlvo = diasSemana[diaLower];

  if (diaAlvo === undefined) {
    throw new Error('Dia da semana inválido: ' + diaSemana);
  }

  const agora = getNowSP(); 
  const hojeDia = agora.getDay();

  let diasParaAdicionar = (diaAlvo - hojeDia + 7) % 7;

  const [horaAula, minutoAula] = horario.split(':').map(Number);

  const dataAula = new Date(agora);
  dataAula.setDate(agora.getDate() + diasParaAdicionar);
  dataAula.setHours(horaAula, minutoAula, 0, 0);

  // 🔥 Se for hoje e já passou do horário, joga para próxima semana
  if (diasParaAdicionar < 0 || (diasParaAdicionar === 0 && dataAula <= agora)) {
    dataAula.setDate(dataAula.getDate() + 7);
  }

  return dataAula;
}

// Controller listar aulas fixas disponíveis
exports.listarAulasFixasDisponiveis = async (req, res) => {
  const alunoId = req.session.user?.id;

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
    const [[inscricao]] = await db.query(`
      SELECT * FROM alunos_aulas_fixas
      WHERE aluno_id = ? AND aula_fixa_id = ?
    `, [alunoId, aulaId]);

    if (!inscricao) {
      return res.status(400).send('Você não está inscrito nesta aula fixa.');
    }

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

    const dataAula = proximaDataDoDiaSemana(aula.dia_semana, aula.horario);
    const dataAulaStr = dataAula.toISOString().slice(0, 10);
    const dataFormatada = dataAula.toLocaleDateString('pt-BR');

    // ---- Regra de antecedência (mantém 2h primeira da semana / 12h demais) ----
    const agora = getNowSP();
    const inicioSemana = new Date(dataAula);
    inicioSemana.setDate(dataAula.getDate() - dataAula.getDay());
    inicioSemana.setHours(0, 0, 0, 0);
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);

    const [desistenciasSemana] = await db.query(`
      SELECT id FROM aulas_fixas_desistencias
      WHERE aluno_id = ? AND data >= ? AND data <= ?
    `, [
      alunoId,
      inicioSemana.toISOString().slice(0, 10),
      fimSemana.toISOString().slice(0, 10)
    ]);

    const jaDesistiuNaSemana = desistenciasSemana.length > 0;
    const limiteHoras = jaDesistiuNaSemana ? 12 : 2;
    const diffHoras = (dataAula - agora) / (1000 * 60 * 60);
    const dentroDoPrazo = diffHoras >= limiteHoras;

    if (!dentroDoPrazo) {
      return res.status(400).send(
        jaDesistiuNaSemana
          ? `Desistências adicionais na semana exigem ${limiteHoras}h de antecedência.`
          : `A primeira desistência da semana exige ${limiteHoras}h de antecedência.`
      );
    }

    // ---- Tudo ok: registra desistência ----
    await db.query(`
      INSERT IGNORE INTO aulas_fixas_desistencias (aluno_id, aula_fixa_id, data)
      VALUES (?, ?, ?)
    `, [alunoId, aulaId, dataAulaStr]);

    // Remove da semana corrente
    await db.query(`
      DELETE FROM alunos_aulas_fixas
      WHERE aluno_id = ? AND aula_fixa_id = ?
    `, [alunoId, aulaId]);

    await db.query(`
      UPDATE aulas_fixas SET vagas = vagas + 1 WHERE id = ?
    `, [aulaId]);

    // ---- Devolução de crédito se já tinha sido descontado ----
    const [[uso]] = await db.query(`
      SELECT id, pacote_id FROM uso_creditos
      WHERE aluno_id = ? AND aula_fixa_id = ? AND data_utilizacao = ?
    `, [alunoId, aulaId, dataAulaStr]);

    if (uso) {
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();
        await conn.query(`
          UPDATE pacotes_aluno
          SET aulas_utilizadas = GREATEST(0, aulas_utilizadas - 1)
          WHERE id = ?
        `, [uso.pacote_id]);
        await conn.query(`DELETE FROM uso_creditos WHERE id = ?`, [uso.id]);
        await conn.commit();
        console.log(`💰 Crédito devolvido (aluno ${alunoId}, aula ${aulaId}, ${dataAulaStr})`);
      } catch (e) {
        await conn.rollback();
        console.error('Erro ao devolver crédito:', e);
      } finally {
        conn.release();
      }
    }

    // Notificação
    const [[alunoInfo]] = await db.query(`SELECT nome FROM alunos WHERE id = ?`, [alunoId]);
    const mensagem =
      `⚠️ *Cancelamento de Aula*\n\n` +
      `👤 Aluno: ${alunoInfo.nome}\n` +
      `📅 Data: ${dataFormatada}\n` +
      `⏰ Horário: ${aula.horario.slice(0, 5)}\n` +
      `🏷️ Categoria: ${aula.categoria_nome}\n` +
      `👨‍🏫 Professor: ${aula.professor_nome}` +
      (uso ? `\n💰 Crédito devolvido` : '');

    enviarMensagem(mensagem).catch(() => {});
    if (typeof enviarMensagemAluno === 'function') {
      enviarMensagemAluno(mensagem).catch(() => {});
    }

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

///////////////////////////////////////cLAUDE///////////////////////


