// controllers/aulasFixasSemanaController.js
// Gerencia o fluxo de "aulas fixas semanais com liberação manual"
// - Aluno fixo permanente fica em alunos_fixos_aulas_fixas
// - Toda semana o professor clica "Liberar Semana" e os fixos são copiados
//   para alunos_aulas_fixas (a visão da semana corrente)
// - Quando o aluno desiste de uma data, sai da semana corrente mas mantém
//   o vínculo permanente — volta na próxima liberação

const db = require('../config/db');
const dayjs = require('dayjs');
const { enviarMensagem } = require('../utils/telegram');

// -----------------------------------------------------------------------------
// Helpers de data
// -----------------------------------------------------------------------------
const DIAS_MAP = {
  domingo: 0, dom: 0,
  segunda: 1, seg: 1,
  terca: 2, 'terça': 2, ter: 2,
  quarta: 3, qua: 3,
  quinta: 4, qui: 4,
  sexta: 5, sex: 5,
  sabado: 6, 'sábado': 6, sab: 6
};

function normalizar(dia) {
  return (dia || '').toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Próxima data (incluindo hoje se for o dia) em que a aula fixa ocorre.
 * Se já passou nesta semana, retorna a próxima semana.
 */
function proximaOcorrencia(diaSemanaTexto, horarioStr) {
  const diaAlvo = DIAS_MAP[normalizar(diaSemanaTexto)];
  if (diaAlvo === undefined) return null;

  const agora = dayjs();
  const diaHoje = agora.day();
  let diff = (diaAlvo - diaHoje + 7) % 7;

  let alvo = agora.add(diff, 'day');
  const [h, m] = (horarioStr || '00:00').split(':').map(Number);
  alvo = alvo.hour(h).minute(m).second(0).millisecond(0);

  // Se cair hoje e o horário já passou, joga pra próxima semana
  if (diff === 0 && alvo.isBefore(agora)) {
    alvo = alvo.add(7, 'day');
  }
  return alvo.format('YYYY-MM-DD');
}

// =============================================================================
// VIEW PRINCIPAL: Painel semanal do professor
// Mostra todas as aulas fixas com:
//   - lista de alunos fixos permanentes
//   - se a semana atual já foi liberada
//   - botão "Liberar Semana"
// =============================================================================
exports.painelSemana = async (req, res) => {
  try {
    const [aulas] = await db.query(`
      SELECT
        af.id,
        af.dia_semana,
        af.horario,
        af.vagas,
        c.nome AS categoria_nome,
        p.nome AS professor_nome,
        af.professor_id,
        af.categoria_id
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
      JOIN professores p ON af.professor_id = p.id
    `);

    console.log('TOTAL DE AULAS:', aulas.length);

aulas.forEach(a => {
  console.log(
    `ID: ${a.id} | Categoria: ${a.categoria_nome} | Professor: ${a.professor_nome}`
  );
});

    for (const aula of aulas) {
      const [[ultimaLiberacao]] = await db.query(`
  SELECT data_aula, arquivada
  FROM aulas_fixas_liberacoes
  WHERE aula_fixa_id = ?
  ORDER BY data_aula DESC
  LIMIT 1
`, [aula.id]);

if (
  ultimaLiberacao &&
  ultimaLiberacao.arquivada === 1
) {
  aula.proxima_data = dayjs(ultimaLiberacao.data_aula)
    .add(7, 'day')
    .format('YYYY-MM-DD');
} else {
  aula.proxima_data = proximaOcorrencia(
    aula.dia_semana,
    aula.horario
  );
}
      const { formatarDataBR } = require('../utils/formatarData');
      aula.proxima_data_fmt = formatarDataBR(aula.proxima_data);
      aula.horario_fmt = (aula.horario || '').slice(0, 5);

      // Alunos fixos permanentes desta aula
      const [fixos] = await db.query(`
        SELECT a.id, a.nome
        FROM alunos_fixos_aulas_fixas aff
        JOIN alunos a ON a.id = aff.aluno_id
        WHERE aff.aula_fixa_id = ? AND aff.ativo = 1
        ORDER BY a.nome
      `, [aula.id]);
      aula.alunos_fixos = fixos;

      // Verifica se a próxima ocorrência já foi liberada
      const [[lib]] = await db.query(`
  SELECT id, liberada_em, arquivada
  FROM aulas_fixas_liberacoes
  WHERE aula_fixa_id = ?
    AND data_aula = ?
    AND arquivada = 0
`, [aula.id, aula.proxima_data]);

aula.semana_liberada = !!lib;
aula.semana_arquivada = false;;
      aula.liberada_em = lib ? dayjs(lib.liberada_em).format('DD/MM/YYYY HH:mm') : null;

      // Alunos visíveis na semana corrente (já liberados)
      if (aula.semana_liberada) {
        const [presentes] = await db.query(`
          SELECT a.id, a.nome, aaf.eh_fixo
          FROM alunos_aulas_fixas aaf
          JOIN alunos a ON a.id = aaf.aluno_id
          WHERE aaf.aula_fixa_id = ?
          ORDER BY aaf.eh_fixo DESC, a.nome
        `, [aula.id]);
        aula.alunos_semana = presentes;
      } else {
        aula.alunos_semana = [];
      }
    }

    // Ordena por dia da semana e horário
    aulas.sort((a, b) => {
      const da = DIAS_MAP[normalizar(a.dia_semana)] ?? 99;
      const db_ = DIAS_MAP[normalizar(b.dia_semana)] ?? 99;
      if (da !== db_) return da - db_;
      return (a.horario || '').localeCompare(b.horario || '');
    });

    // Lista de alunos pra dropdown de "marcar como fixo"
    const [alunos] = await db.query('SELECT id, nome FROM alunos ORDER BY nome');

    // Lista de professores e categorias pra dropdown de "criar nova aula fixa"
    const [professores] = await db.query('SELECT id, nome FROM professores ORDER BY nome');
    const [categorias] = await db.query('SELECT categoria_id AS id, nome FROM categorias ORDER BY nome');

    res.render('professor/painelSemana', {
      aulas: aulas,
      alunos,
      professores,
      categorias,
      msg: req.query.msg,
      liberadas: req.query.liberadas,
      puladas: req.query.puladas,
      arquivadas: req.query.arquivadas,
    });
  } catch (err) {
    console.error('Erro no painel semanal:', err);
    res.status(500).send('Erro ao carregar painel semanal');
  }
};

// =============================================================================
// AÇÃO: Liberar uma aula fixa pra semana corrente
// =============================================================================
exports.liberarSemana = async (req, res) => {
  const aulaFixaId = parseInt(req.params.id, 10);
  const professorId = req.session.user?.id;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Pega a aula fixa
    const [[aula]] = await conn.query(`
      SELECT af.*, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
      JOIN professores p ON af.professor_id = p.id
      WHERE af.id = ?
    `, [aulaFixaId]);

    if (!aula) {
      await conn.rollback();
      return res.status(404).send('Aula fixa não encontrada.');
    }

    const [[ultimaLiberacao]] = await conn.query(`
  SELECT data_aula, arquivada
  FROM aulas_fixas_liberacoes
  WHERE aula_fixa_id = ?
  ORDER BY data_aula DESC
  LIMIT 1
`, [aula.id]);

let dataAula;

if (ultimaLiberacao) {
  dataAula = dayjs(ultimaLiberacao.data_aula)
    .add(7, 'day')
    .format('YYYY-MM-DD');
} else {
  dataAula = proximaOcorrencia(
    aula.dia_semana,
    aula.horario
  );
}
    console.log(
  'Aula:',
  aulaFixaId,
  'Dia:',
  aula.dia_semana,
  'Horário:',
  aula.horario,
  'Data calculada:',
  dataAula
);

    // Verifica idempotência: já foi liberada?
    const [[ja]] = await conn.query(`
  SELECT id
  FROM aulas_fixas_liberacoes
  WHERE aula_fixa_id = ?
    AND data_aula = ?
    AND arquivada = 0
`, [aulaFixaId, dataAula]);

    if (ja) {
      await conn.rollback();
      return res.redirect('/professor/semana?msg=ja_liberada');
    }

    // Limpa qualquer inscrição "fantasma" da semana anterior nesta aula
    await conn.query(`
      DELETE FROM alunos_aulas_fixas WHERE aula_fixa_id = ?
    `, [aulaFixaId]);

    // Pega os alunos fixos permanentes
    const [fixos] = await conn.query(`
      SELECT aluno_id FROM alunos_fixos_aulas_fixas
      WHERE aula_fixa_id = ? AND ativo = 1
    `, [aulaFixaId]);

    // Filtra os que desistiram especificamente desta data
    const [desistencias] = await conn.query(`
      SELECT aluno_id FROM aulas_fixas_desistencias
      WHERE aula_fixa_id = ? AND data = ?
    `, [aulaFixaId, dataAula]);
    const desistiuSet = new Set(desistencias.map(d => d.aluno_id));

    let inseridos = 0;
    for (const { aluno_id } of fixos) {
      if (desistiuSet.has(aluno_id)) continue;
      await conn.query(`
        INSERT INTO alunos_aulas_fixas (aluno_id, aula_fixa_id, eh_fixo)
        VALUES (?, ?, 1)
      `, [aluno_id, aulaFixaId]);
      inseridos++;
    }

    // Recalcula vagas: vagas originais - inseridos
    // (Atenção: aqui assumimos que a coluna "vagas" no aulas_fixas é o LIMITE
    //  e não as restantes. Se for o contrário no seu modelo, ajustar.)
    const vagasRestantes = Math.max(0, aula.vagas - inseridos);
    await conn.query(`
      UPDATE aulas_fixas SET vagas = ? WHERE id = ?
    `, [vagasRestantes, aulaFixaId]);

    // Marca como liberada
    await conn.query(`
      INSERT INTO aulas_fixas_liberacoes (aula_fixa_id, data_aula, liberada_por)
      VALUES (?, ?, ?)
    `, [aulaFixaId, dataAula, professorId]);

    await conn.commit();

    // Notifica grupo do Telegram (opcional, falha silenciosa)
    enviarMensagem(
      `🔓 *Aula liberada para a semana*\n` +
      `📘 ${aula.categoria_nome}\n` +
      `👨‍🏫 ${aula.professor_nome}\n` +
      `📅 ${dayjs(dataAula).format('DD/MM/YYYY')} (${aula.dia_semana}) às ${aula.horario.slice(0, 5)}\n` +
      `👥 ${inseridos} aluno(s) fixo(s) automaticamente inscrito(s)`
    ).catch(() => {});

    res.redirect('/professor/semana?msg=liberada');
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao liberar semana:', err);
    res.status(500).send('Erro ao liberar semana.');
  } finally {
    conn.release();
  }
};

// =============================================================================
// AÇÃO: Liberar TODAS as aulas de uma vez (botão de atalho)
// =============================================================================
exports.liberarTodasSemana = async (req, res) => {
  try {
    const [aulas] = await db.query('SELECT id FROM aulas_fixas');
    let liberadas = 0;
    let puladas = 0;

    for (const a of aulas) {
      // Reusa a lógica fingindo um req — mais simples chamar diretamente:
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        const [[aula]] = await conn.query(
          'SELECT * FROM aulas_fixas WHERE id = ?', [a.id]
        );
        const [[ultimaLiberacao]] = await conn.query(`
  SELECT data_aula, arquivada
  FROM aulas_fixas_liberacoes
  WHERE aula_fixa_id = ?
  ORDER BY data_aula DESC
  LIMIT 1
`, [aulaFixaId]);

let dataAula;

if (ultimaLiberacao) {
  dataAula = dayjs(ultimaLiberacao.data_aula)
    .add(7, 'day')
    .format('YYYY-MM-DD');
} else {
  dataAula = proximaOcorrencia(
    aula.dia_semana,
    aula.horario
  );
  console.log('Nova data calculada:', dataAula);
}

        const [[ja]] = await conn.query(`
          SELECT id FROM aulas_fixas_liberacoes
          WHERE aula_fixa_id = ? AND data_aula = ?
        `, [a.id, dataAula]);

        if (ja) { puladas++; await conn.rollback(); conn.release(); continue; }

        await conn.query('DELETE FROM alunos_aulas_fixas WHERE aula_fixa_id = ?', [a.id]);

        const [fixos] = await conn.query(`
          SELECT aluno_id FROM alunos_fixos_aulas_fixas
          WHERE aula_fixa_id = ? AND ativo = 1
        `, [a.id]);

        const [des] = await conn.query(`
          SELECT aluno_id FROM aulas_fixas_desistencias
          WHERE aula_fixa_id = ? AND data = ?
        `, [a.id, dataAula]);
        const desSet = new Set(des.map(d => d.aluno_id));

        let inseridos = 0;
        for (const { aluno_id } of fixos) {
          if (desSet.has(aluno_id)) continue;
          await conn.query(`
            INSERT INTO alunos_aulas_fixas (aluno_id, aula_fixa_id, eh_fixo)
            VALUES (?, ?, 1)
          `, [aluno_id, a.id]);
          inseridos++;
        }

        await conn.query(`
          UPDATE aulas_fixas SET vagas = GREATEST(0, vagas - ?) WHERE id = ?
        `, [inseridos, a.id]);

        await conn.query(`
          INSERT INTO aulas_fixas_liberacoes (aula_fixa_id, data_aula, liberada_por)
          VALUES (?, ?, ?)
        `, [a.id, dataAula, req.session.user?.id]);

        await conn.commit();
        liberadas++;
      } catch (e) {
        await conn.rollback();
        console.error(`Erro ao liberar aula ${a.id}:`, e);
      } finally {
        conn.release();
      }
    }

    res.redirect(`/professor/semana?msg=lote&liberadas=${liberadas}&puladas=${puladas}`);
  } catch (err) {
    console.error('Erro ao liberar todas:', err);
    res.status(500).send('Erro ao liberar todas as aulas.');
  }
};

// =============================================================================
// AÇÃO: Adicionar aluno fixo permanente
// =============================================================================
exports.adicionarAlunoFixo = async (req, res) => {
  const aulaFixaId = parseInt(req.params.id, 10);
  const alunoId = parseInt(req.body.aluno_id, 10);

  if (!alunoId || !aulaFixaId) {
    return res.status(400).send('Dados inválidos.');
  }

  try {
    // Insere ou reativa o vínculo permanente
    // (criado_em é populado automaticamente pelo MySQL com CURRENT_TIMESTAMP)
    await db.query(`
      INSERT INTO alunos_fixos_aulas_fixas (aluno_id, aula_fixa_id, ativo)
      VALUES (?, ?, 1)
      ON DUPLICATE KEY UPDATE ativo = 1
    `, [alunoId, aulaFixaId]);

    // Se a semana atual já estiver liberada, insere também na semana corrente
    const [[aula]] = await db.query('SELECT dia_semana, horario FROM aulas_fixas WHERE id = ?', [aulaFixaId]);
    const dataAula = proximaOcorrencia(aula.dia_semana, aula.horario);
    const [[lib]] = await db.query(`
      SELECT id FROM aulas_fixas_liberacoes WHERE aula_fixa_id = ? AND data_aula = ?
    `, [aulaFixaId, dataAula]);

    if (lib) {
      // Já liberada — adiciona o aluno na semana corrente também
      const [[existe]] = await db.query(`
        SELECT id FROM alunos_aulas_fixas WHERE aula_fixa_id = ? AND aluno_id = ?
      `, [aulaFixaId, alunoId]);

      if (!existe) {
        await db.query(`
          INSERT INTO alunos_aulas_fixas (aluno_id, aula_fixa_id, eh_fixo)
          VALUES (?, ?, 1)
        `, [alunoId, aulaFixaId]);
        await db.query('UPDATE aulas_fixas SET vagas = GREATEST(0, vagas - 1) WHERE id = ?', [aulaFixaId]);
      }
    }

    res.redirect('/professor/semana');
  } catch (err) {
    console.error('Erro ao adicionar aluno fixo:', err);
    res.status(500).send('Erro ao adicionar aluno fixo.');
  }
};

// =============================================================================
// AÇÃO: Remover aluno fixo permanente
// =============================================================================
exports.removerAlunoFixo = async (req, res) => {
  const aulaFixaId = parseInt(req.params.aulaId, 10);
  const alunoId = parseInt(req.params.alunoId, 10);

  try {
    // Remove o vínculo permanente
    await db.query(`
      DELETE FROM alunos_fixos_aulas_fixas
      WHERE aula_fixa_id = ? AND aluno_id = ?
    `, [aulaFixaId, alunoId]);

    // Remove da semana corrente também, se estiver lá
    const [r] = await db.query(`
      DELETE FROM alunos_aulas_fixas
      WHERE aula_fixa_id = ? AND aluno_id = ?
    `, [aulaFixaId, alunoId]);

    if (r.affectedRows > 0) {
      await db.query('UPDATE aulas_fixas SET vagas = vagas + 1 WHERE id = ?', [aulaFixaId]);
    }

    res.redirect('/professor/semana');
  } catch (err) {
    console.error('Erro ao remover aluno fixo:', err);
    res.status(500).send('Erro ao remover aluno fixo.');
  }
};

// =============================================================================
// AÇÃO: Arquivar UMA aula da semana corrente
// - Faz snapshot dos alunos que efetivamente participaram (sem desistências)
// - Limpa alunos_aulas_fixas daquela aula
// - Marca a liberação como arquivada → some do painel
// =============================================================================
exports.arquivarAula = async (req, res) => {
  const aulaFixaId = parseInt(req.params.id, 10);
  const professorId = req.session.user?.id;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Pega snapshot da aula
    const [[aula]] = await conn.query(`
      SELECT af.*, c.nome AS categoria_nome, p.nome AS professor_nome
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
      JOIN professores p ON af.professor_id = p.id
      WHERE af.id = ?
    `, [aulaFixaId]);

    if (!aula) {
      await conn.rollback();
      return res.status(404).send('Aula não encontrada.');
    }

    // Busca a liberação ATIVA (não arquivada) mais recente dessa aula.
    // Não usamos proximaOcorrencia aqui porque depois que o horário da aula
    // passa, ela calcularia a próxima semana — e a liberação atual ficaria órfã.
    const [[lib]] = await conn.query(`
      SELECT id, data_aula, arquivada
      FROM aulas_fixas_liberacoes
      WHERE aula_fixa_id = ?
        AND arquivada = 0
      ORDER BY data_aula DESC
      LIMIT 1
    `, [aulaFixaId]);

    if (!lib) {
      await conn.rollback();
      const back = req.get('Referer') || '/professor/semana';
      return res.redirect(back.split('?')[0] + '?msg=nao_liberada');
    }

    const dataAula = lib.data_aula;
    // Garante formato string YYYY-MM-DD (mysql2 pode retornar como Date object)
    const { isoDate } = require('../utils/formatarData');
    const dataAulaStr = isoDate(dataAula);

    // Pega alunos que estão na semana (não inclui quem desistiu — desistência
    // já foi removida de alunos_aulas_fixas no momento da desistência)
    const [participantes] = await conn.query(`
      SELECT
        aaf.aluno_id,
        aaf.eh_fixo,
        a.nome AS aluno_nome,
        uc.id AS uso_id,
        uc.pacote_id
      FROM alunos_aulas_fixas aaf
      JOIN alunos a ON a.id = aaf.aluno_id
      LEFT JOIN uso_creditos uc
        ON uc.aluno_id = aaf.aluno_id
       AND uc.aula_fixa_id = aaf.aula_fixa_id
       AND uc.data_utilizacao = ?
      WHERE aaf.aula_fixa_id = ?
    `, [dataAulaStr, aulaFixaId]);

    // Cria o registro de arquivamento
    const [arquivado] = await conn.query(`
      INSERT INTO aulas_fixas_arquivadas
        (aula_fixa_id, data_aula, dia_semana, horario,
         categoria_nome, professor_nome, total_inscritos, arquivada_por)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      aulaFixaId, dataAulaStr, aula.dia_semana, aula.horario,
      aula.categoria_nome, aula.professor_nome,
      participantes.length, professorId
    ]);

    const arquivamentoId = arquivado.insertId;

    // Snapshot dos alunos que participaram
    for (const p of participantes) {
      await conn.query(`
        INSERT INTO aulas_fixas_arquivadas_alunos
          (arquivamento_id, aluno_id, aluno_nome, era_fixo, credito_usado, pacote_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        arquivamentoId, p.aluno_id, p.aluno_nome,
        p.eh_fixo ? 1 : 0,
        p.uso_id ? 1 : 0,
        p.pacote_id || null
      ]);
    }

    // Limpa inscrições da semana corrente
    await conn.query(`DELETE FROM alunos_aulas_fixas WHERE aula_fixa_id = ?`, [aulaFixaId]);

    // Marca como arquivada
    await conn.query(`
      UPDATE aulas_fixas_liberacoes
      SET arquivada = 1
      WHERE id = ?
    `, [lib.id]);

    await conn.commit();
    const back = req.get('Referer') || '/professor/semana';
    res.redirect(back.split('?')[0] + '?msg=arquivada');
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao arquivar aula:', err);
    res.status(500).send('Erro ao arquivar aula.');
  } finally {
    conn.release();
  }
};

// =============================================================================
// AÇÃO: Arquivar TODAS as aulas liberadas da semana de uma vez
// =============================================================================
exports.arquivarTodasSemana = async (req, res) => {
  const professorId = req.session.user?.id;
  let arquivadas = 0;
  let erros = 0;

  try {
    // Pega todas as liberações não-arquivadas
    const [liberacoes] = await db.query(`
      SELECT l.id AS lib_id, l.aula_fixa_id, l.data_aula
      FROM aulas_fixas_liberacoes l
      WHERE l.arquivada = 0
    `);

    for (const l of liberacoes) {
      const { isoDate } = require('../utils/formatarData');
      const dataAulaStr = isoDate(l.data_aula);
      const conn = await db.getConnection();
      try {
        await conn.beginTransaction();

        const [[aula]] = await conn.query(`
          SELECT af.*, c.nome AS categoria_nome, p.nome AS professor_nome
          FROM aulas_fixas af
          JOIN categorias c ON af.categoria_id = c.categoria_id
          JOIN professores p ON af.professor_id = p.id
          WHERE af.id = ?
        `, [l.aula_fixa_id]);

        if (!aula) {
          await conn.rollback();
          conn.release();
          erros++;
          continue;
        }

        const [participantes] = await conn.query(`
          SELECT
            aaf.aluno_id, aaf.eh_fixo, a.nome AS aluno_nome,
            uc.id AS uso_id, uc.pacote_id
          FROM alunos_aulas_fixas aaf
          JOIN alunos a ON a.id = aaf.aluno_id
          LEFT JOIN uso_creditos uc
            ON uc.aluno_id = aaf.aluno_id
           AND uc.aula_fixa_id = aaf.aula_fixa_id
           AND uc.data_utilizacao = ?
          WHERE aaf.aula_fixa_id = ?
        `, [dataAulaStr, l.aula_fixa_id]);

        const [arquivado] = await conn.query(`
          INSERT INTO aulas_fixas_arquivadas
            (aula_fixa_id, data_aula, dia_semana, horario,
             categoria_nome, professor_nome, total_inscritos, arquivada_por)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          l.aula_fixa_id, dataAulaStr, aula.dia_semana, aula.horario,
          aula.categoria_nome, aula.professor_nome,
          participantes.length, professorId
        ]);

        for (const p of participantes) {
          await conn.query(`
            INSERT INTO aulas_fixas_arquivadas_alunos
              (arquivamento_id, aluno_id, aluno_nome, era_fixo, credito_usado, pacote_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `, [
            arquivado.insertId, p.aluno_id, p.aluno_nome,
            p.eh_fixo ? 1 : 0,
            p.uso_id ? 1 : 0,
            p.pacote_id || null
          ]);
        }

        await conn.query(`DELETE FROM alunos_aulas_fixas WHERE aula_fixa_id = ?`, [l.aula_fixa_id]);
        await conn.query(`UPDATE aulas_fixas_liberacoes SET arquivada = 1 WHERE id = ?`, [l.lib_id]);

        await conn.commit();
        arquivadas++;
      } catch (e) {
        await conn.rollback();
        console.error(`Erro ao arquivar aula ${l.aula_fixa_id}:`, e);
        erros++;
      } finally {
        conn.release();
      }
    }

    const back = req.get('Referer') || '/professor/semana';
    res.redirect(back.split('?')[0] + `?msg=lote_arquivado&arquivadas=${arquivadas}`);
  } catch (err) {
    console.error('Erro ao arquivar todas:', err);
    res.status(500).send('Erro ao arquivar todas.');
  }
};

// =============================================================================
// VIEW: Histórico de aulas arquivadas
// =============================================================================
exports.verHistorico = async (req, res) => {
  try {
    const filtroAulaId = req.query.aula_fixa_id ? parseInt(req.query.aula_fixa_id, 10) : null;

    let where = '';
    const params = [];
    if (filtroAulaId) {
      where = 'WHERE arq.aula_fixa_id = ?';
      params.push(filtroAulaId);
    }

    const [arquivos] = await db.query(`
      SELECT
        arq.id,
        arq.aula_fixa_id,
        arq.data_aula,
        arq.dia_semana,
        arq.horario,
        arq.categoria_nome,
        arq.professor_nome,
        arq.total_inscritos,
        arq.arquivada_em
      FROM aulas_fixas_arquivadas arq
      ${where}
      ORDER BY arq.data_aula DESC, arq.horario DESC
      LIMIT 200
    `, params);

    for (const a of arquivos) {
      const { formatarDataBR } = require('../utils/formatarData');
      a.data_fmt = formatarDataBR(a.data_aula);
      a.horario_fmt = String(a.horario || '').slice(0, 5);
      a.arquivada_em_fmt = dayjs(a.arquivada_em).format('DD/MM/YYYY HH:mm');

      const [participantes] = await db.query(`
        SELECT aluno_nome, era_fixo, credito_usado
        FROM aulas_fixas_arquivadas_alunos
        WHERE arquivamento_id = ?
        ORDER BY aluno_nome
      `, [a.id]);
      a.participantes = participantes;
    }

    // Lista de aulas pra filtro
    const [aulasFiltro] = await db.query(`
      SELECT af.id, c.nome AS categoria, af.dia_semana, af.horario
      FROM aulas_fixas af
      JOIN categorias c ON af.categoria_id = c.categoria_id
      ORDER BY c.nome
    `);

    res.render('professor/historicoAulas', {
      arquivos,
      aulasFiltro,
      filtroAulaId,
      msg: req.query.msg
    });
  } catch (err) {
    console.error('Erro no histórico:', err);
    res.status(500).send('Erro ao carregar histórico.');
  }
};

// =============================================================================
// AÇÃO: Limpar histórico de aulas arquivadas
// IMPORTANTE: deleta APENAS de aulas_fixas_arquivadas e aulas_fixas_arquivadas_alunos
// PRESERVA uso_creditos — pra que o histórico de créditos usados nos pacotes
// dos alunos continue intacto.
// =============================================================================
exports.limparHistorico = async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Apaga snapshots de alunos (cascade já faria, mas explícito é mais seguro)
    await conn.query(`DELETE FROM aulas_fixas_arquivadas_alunos`);

    // 2) Apaga os registros de arquivamento em si
    await conn.query(`DELETE FROM aulas_fixas_arquivadas`);

    // NOTA: uso_creditos NÃO é tocado de propósito.
    // O histórico no pacote do aluno usa essa tabela como fonte primária.

    await conn.commit();
    res.redirect('/professor/semana/historico?msg=limpo');
  } catch (err) {
    await conn.rollback();
    console.error('Erro ao limpar histórico:', err);
    res.status(500).send('Erro ao limpar histórico.');
  } finally {
    conn.release();
  }
};

module.exports = {
  painelSemana: exports.painelSemana,
  liberarSemana: exports.liberarSemana,
  liberarTodasSemana: exports.liberarTodasSemana,
  adicionarAlunoFixo: exports.adicionarAlunoFixo,
  removerAlunoFixo: exports.removerAlunoFixo,
  arquivarAula: exports.arquivarAula,
  arquivarTodasSemana: exports.arquivarTodasSemana,
  verHistorico: exports.verHistorico,
  limparHistorico: exports.limparHistorico,
  proximaOcorrencia,
};
