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


exports.desinscreverAula = async (req, res) => {
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).send('Não autorizado');
  }

  const alunoId = req.session.user.id;
  const aulaId = req.params.aulaId;

  try {
    // Buscar data e horário da aula
    const [[aula]] = await db.query('SELECT data, horario FROM aulas WHERE id = ?', [aulaId]);
    if (!aula) return res.status(404).send('Aula não encontrada');

    // Garantir que a data seja interpretada corretamente como string
    const dataBruta = aula.data instanceof Date ? aula.data.toISOString().split('T')[0] : aula.data;
    const horarioBruto = aula.horario || '00:00:00';

    let [hora, minuto, segundo] = horarioBruto.split(':');
    hora = parseInt(hora || '0');
    minuto = parseInt(minuto || '0');
    segundo = parseInt(segundo || '0');

    const dataHora = moment(dataBruta).set({
      hour: hora,
      minute: minuto,
      second: segundo,
      millisecond: 0
    });

    if (!dataHora.isValid()) {
      console.error('Data/hora inválida da aula:', { dataBruta, horarioBruto });
      return res.status(400).send('Data/hora inválida da aula');
    }

    const agora = moment().utcOffset('-03:00');
    const diffHoras = dataHora.diff(agora, 'hours', true);

    // Verificar se já participou de outras aulas (sem contar essa)
    const [registros] = await db.query(
      'SELECT COUNT(*) AS total FROM aulas_alunos WHERE aluno_id = ? AND aula_id != ?',
      [alunoId, aulaId]
    );
    const jaParticipouAntes = registros[0].total > 0;
    const horasMinimas = jaParticipouAntes ? 12 : 2;

    if (diffHoras < horasMinimas) {
      return res.status(403).send(`Você só pode se desinscrever com pelo menos ${horasMinimas} horas de antecedência.`);
    }

    console.log({
      dataBruta,
      horarioBruto,
      dataHora: dataHora.format(),
      agora: agora.format(),
      diffHoras,
      jaParticipouAntes,
      horasMinimas
    });

    // Verifica se está inscrito
    const [[inscrito]] = await db.query(
      'SELECT * FROM aulas_alunos WHERE aluno_id = ? AND aula_id = ?',
      [alunoId, aulaId]
    );
    if (!inscrito) {
      return res.status(400).send('Você não está inscrito nesta aula.');
    }

    // Remover inscrição
    await db.query('DELETE FROM aulas_alunos WHERE aluno_id = ? AND aula_id = ?', [alunoId, aulaId]);

    // Atualizar número de vagas
    await db.query('UPDATE aulas SET vagas = vagas + 1 WHERE id = ?', [aulaId]);

    res.redirect('/aluno/aulas');
  } catch (err) {
    console.error('Erro ao desinscrever aluno da aula:', err);
    res.status(500).send('Erro ao desinscrever da aula');
  }
};



exports.inscreverAlunoEmAula = async (req, res) => {
  const { alunoId, aulaId } = req.body;

  try {
    // Verificar se o aluno já está inscrito
    const [[jaInscrito]] = await db.query(
      'SELECT 1 FROM aulas_alunos WHERE aluno_id = ? AND aula_id = ?',
      [alunoId, aulaId]
    );
    if (jaInscrito) {
      return res.status(400).send('Aluno já está inscrito nesta aula.');
    }

    // Buscar pacote válido
    const [[pacote]] = await db.query(`
      SELECT id, aulas_disponiveis, aulas_usadas
      FROM pacotes
      WHERE aluno_id = ?
        AND (modalidade_id = (SELECT categoria_id FROM aulas WHERE id = ?) OR passe_livre = 1)
        AND validade >= CURDATE()
        AND aulas_disponiveis > 0
      ORDER BY validade ASC
      LIMIT 1
    `, [alunoId, aulaId]);

    if (!pacote) {
      return res.status(400).send('Nenhum pacote válido disponível para esta modalidade.');
    }

    // Iniciar transação
    await db.query('START TRANSACTION');

    // Verificar se ainda há vagas dentro da transação
    const [[aula]] = await db.query(
      'SELECT vagas FROM aulas WHERE id = ? FOR UPDATE',
      [aulaId]
    );

    if (!aula || aula.vagas <= 0) {
      await db.query('ROLLBACK');
      return res.status(400).send('Não há vagas disponíveis nesta aula.');
    }

    // Inscrever aluno
    await db.query(
      'INSERT INTO aulas_alunos (aula_id, aluno_id) VALUES (?, ?)',
      [aulaId, alunoId]
    );

    // Atualizar pacote
    await db.query(`
      UPDATE pacotes
      SET aulas_disponiveis = aulas_disponiveis - 1,
          aulas_usadas = aulas_usadas + 1
      WHERE id = ?
    `, [pacote.id]);

    // Atualizar vagas da aula
    await db.query('UPDATE aulas SET vagas = vagas - 1 WHERE id = ?', [aulaId]);
      aula.temVaga = aula.vagas > 0;
    // Confirmar transação
    await db.query('COMMIT');

    res.redirect('/professor/aulas');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Erro ao inscrever aluno na aula:', err);
    res.status(500).send('Erro ao inscrever aluno na aula');
  }
};

exports.getAlunosDaAula = async (aulaId) => {
  const [alunos] = await db.query(
    `SELECT al.id, al.nome
     FROM aulas_alunos aa
     JOIN alunos al ON al.id = aa.aluno_id
     WHERE aa.aula_id = ?`,
    [aulaId]
  );
  return alunos;
};



