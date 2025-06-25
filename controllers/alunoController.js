const db = require('../config/db'); // Ajuste o caminho conforme o seu projeto
const bcrypt = require('bcryptjs');
const moment = require('moment');
const axios = require('axios');
const { enviarMensagem } = require('../utils/telegram');
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
    'quarta-feira': 3,
    'quarta': 3,
    'quinta-feira': 4,
    'quinta': 4,
    'sexta-feira': 5,
    'sexta': 5,
    'sábado': 6,
    'sabado': 6
  };

  const diaLower = diaSemana.toLowerCase();
  const diaAlvo = diasSemana[diaLower];
  if (diaAlvo === undefined) {
    throw new Error('Dia da semana inválido: ' + diaSemana);
  }

  const hoje = new Date();
  const hojeDia = hoje.getDay();

  // Calcula diferença em dias para o próximo dia da semana alvo
  let diffDias = diaAlvo - hojeDia;
  if (diffDias < 0 || (diffDias === 0 && hoje.getHours() > parseInt(horario.split(':')[0]))) {
    diffDias += 7; // Próxima semana
  }

  const proximaData = new Date(hoje);
  proximaData.setDate(hoje.getDate() + diffDias);

  const [h, m] = horario.split(':');
  proximaData.setHours(parseInt(h), parseInt(m), 0, 0);

  return proximaData;
}

// Controller listar aulas fixas disponíveis
exports.listarAulasFixasDisponiveis = async (req, res) => {
  const alunoId = req.session.user?.id;
  const hoje = new Date().toISOString().slice(0, 10);

  try {
    // Buscar todas as aulas fixas, independentemente das vagas
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
        END AS inscrito
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
      JOIN professores p ON af.professor_id = p.id
      LEFT JOIN alunos_aulas_fixas aaf
        ON af.id = aaf.aula_fixa_id AND aaf.aluno_id = ?
      -- Removido filtro de vagas para mostrar todas as aulas
    `, [alunoId]);

    // Buscar pacotes válidos do aluno
    const [pacotes] = await db.query(`
      SELECT categoria_id, passe_livre, quantidade_aulas, aulas_utilizadas, data_validade
      FROM pacotes_aluno
      WHERE aluno_id = ?
        AND (data_validade IS NULL OR data_validade >= ?)
        AND (quantidade_aulas - aulas_utilizadas) > 0
    `, [alunoId, hoje]);

    // Verifica se aluno tem pacote para categoria ou passe livre
    function temPacoteParaCategoria(categoriaId) {
      return pacotes.some(pacote => 
        pacote.passe_livre === 1 || pacote.categoria_id === categoriaId
      );
    }

    // Mapeia aulas adicionando flags temPacote e pode_desistir
    const aulasComExtras = aulas.map(aula => {
      const dataHoraAula = proximaDataDoDiaSemana(aula.dia_semana, aula.horario);
      const agora = new Date();

      let podeDesistir = false;
      if (dataHoraAula) {
        const diffHoras = (dataHoraAula - agora) / (1000 * 60 * 60);
        podeDesistir = diffHoras >= 2;
      }

      return {
        ...aula,
        temPacote: temPacoteParaCategoria(aula.categoria_id),
        pode_desistir: podeDesistir,
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
    // 1. Buscar a aula fixa e categoria dela
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

    // 2. Verificar se aluno já está inscrito na aula fixa
    const [[inscrito]] = await db.query(
      `SELECT * FROM alunos_aulas_fixas WHERE aluno_id = ? AND aula_fixa_id = ?`,
      [alunoId, aulaFixaId]
    );

    if (inscrito) {
      return res.status(400).send('Você já está inscrito nessa aula.');
    }

    // 3. Verificar se aluno tem pacote válido e com créditos para essa categoria
    const hoje = new Date().toISOString().slice(0, 10); // formato 'YYYY-MM-DD'
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
      // Se não tem pacote válido, recarrega a lista de aulas com flag para mensagem
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

      // Configura temPacote para cada aula:
      aulas.forEach(aulaItem => {
        // Para a aula que tentou inscrever e falhou: false
        // Para as outras: true (assumindo que tem pacote para as outras)
        aulaItem.temPacote = aulaItem.id !== parseInt(aulaFixaId);
      });

      return res.render('aluno/aulasFixas', {
        aulas,
        mensagemErroId: parseInt(aulaFixaId),
        mensagemErroTexto: 'Você não possui pacote válido com aulas disponíveis para essa categoria.'
      });
    }

    const pacote = pacotes[0];

    // 4. Inserir inscrição na aula fixa
    await db.query(
      `INSERT INTO alunos_aulas_fixas (aluno_id, aula_fixa_id) VALUES (?, ?)`,
      [alunoId, aulaFixaId]
    );

    // 5. Diminuir uma aula disponível no pacote
    await db.query(
      `UPDATE pacotes_aluno SET aulas_utilizadas = aulas_utilizadas + 1 WHERE id = ?`,
      [pacote.id]
    );

    // 6. Diminuir a vaga da aula fixa
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
    const [[aula]] = await db.query(`
      SELECT categoria_id, dia_semana, horario FROM aulas_fixas WHERE id = ?
    `, [aulaId]);

    if (!aula) {
      return res.status(404).send('Aula fixa não encontrada.');
    }

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
      if (diaSemanaNum === undefined) throw new Error(`Dia da semana inválido: ${diaSemana}`);

      let diasAteAula = diaSemanaNum - diaAtual;
      if (diasAteAula < 0) diasAteAula += 7;

      const proximaAula = new Date(hoje);
      proximaAula.setDate(hoje.getDate() + diasAteAula);

      const [hora, minuto] = horario.split(':').map(Number);
      proximaAula.setHours(hora, minuto, 0, 0);

      if (proximaAula <= hoje) proximaAula.setDate(proximaAula.getDate() + 7);

      return proximaAula;
    }

    const dataAula = getProximaDataAula(aula.dia_semana, aula.horario);
    const agora = new Date();

    const diffHoras = (dataAula - agora) / (1000 * 60 * 60);

    if (diffHoras < 2) {
      return res.status(400).send('Desistência só permitida com no mínimo 2 horas de antecedência.');
    }

    // Remove inscrição do aluno
    await db.query(`
      DELETE FROM alunos_aulas_fixas WHERE aluno_id = ? AND aula_fixa_id = ?
    `, [alunoId, aulaId]);

    // Aumenta 1 vaga na aula
    await db.query(`
      UPDATE aulas_fixas SET vagas = vagas + 1 WHERE id = ?
    `, [aulaId]);

    // *** Devolver crédito no pacote ***

    const hojeISO = new Date().toISOString().slice(0, 10);

    // Buscar pacote válido usado para essa categoria (mesmo critério da inscrição)
    const [pacotes] = await db.query(`
      SELECT id, aulas_utilizadas FROM pacotes_aluno
      WHERE aluno_id = ?
        AND (categoria_id = ? OR passe_livre = 1)
        AND (data_validade IS NULL OR data_validade >= ?)
        AND aulas_utilizadas > 0
      ORDER BY data_validade ASC
      LIMIT 1
    `, [alunoId, aula.categoria_id, hojeISO]);

    if (pacotes.length > 0) {
      const pacote = pacotes[0];

      // Decrementar aulas_utilizadas (devolver crédito)
      await db.query(`
        UPDATE pacotes_aluno SET aulas_utilizadas = aulas_utilizadas - 1 WHERE id = ?
      `, [pacote.id]);
    }

    res.redirect('/aluno/aulas-fixas');

  } catch (error) {
    console.error('Erro ao desistir da aula fixa:', error);
    res.status(500).send('Erro interno no servidor');
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
