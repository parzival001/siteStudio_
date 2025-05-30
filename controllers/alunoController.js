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
    const { enviarMensagem } = require('../telegramService'); // agora está dentro do try

    // Buscar dados do aluno e da aula
    const [[aluno]] = await db.query('SELECT nome FROM alunos WHERE id = ?', [alunoId]);  
    const [[infoAula]] = await db.query('SELECT data, horario FROM aulas WHERE id = ?', [aulaId]);  
    if (!infoAula) return res.status(404).send('Aula não encontrada');

    const dataFormatada = moment(infoAula.data).format('DD/MM/YYYY');  
    const horarioFormatado = infoAula.horario?.slice(0, 5) || 'horário não informado';  

    await enviarMensagem(`O aluno *${aluno.nome}* se desinscreveu da aula no dia *${dataFormatada}* às *${horarioFormatado}*.`);  

    // Processar data e horário da aula
    const dataBruta = infoAula.data instanceof Date ? infoAula.data.toISOString().split('T')[0] : infoAula.data;  
    const horarioBruto = infoAula.horario || '00:00:00';  
    let [hora, minuto, segundo] = horarioBruto.split(':');  
    const dataHora = moment(dataBruta).set({  
      hour: parseInt(hora || '0'),  
      minute: parseInt(minuto || '0'),  
      second: parseInt(segundo || '0'),  
      millisecond: 0  
    });  

    if (!dataHora.isValid()) {  
      console.error('Data/hora inválida da aula:', { dataBruta, horarioBruto });  
      return res.status(400).send('Data/hora inválida da aula');  
    }  

    const agora = moment().utcOffset('-03:00');  
    const diffHoras = dataHora.diff(agora, 'hours', true);  

    const [registros] = await db.query(
      'SELECT COUNT(*) AS total FROM aulas_alunos WHERE aluno_id = ? AND aula_id != ?',  
      [alunoId, aulaId]  
    );  
    const jaParticipouAntes = registros[0].total > 0;  
    const horasMinimas = jaParticipouAntes ? 12 : 2;  

    if (diffHoras < horasMinimas) {  
      return res.status(403).send(`Você só pode se desinscrever com pelo menos ${horasMinimas} horas de antecedência.`);  
    }  

    // Verifica se está inscrito e obtém o pacote vinculado
    const [[inscricao]] = await db.query(
      'SELECT * FROM aulas_alunos WHERE aluno_id = ? AND aula_id = ?',  
      [alunoId, aulaId]  
    );  
    if (!inscricao) {  
      return res.status(400).send('Você não está inscrito nesta aula.');  
    }

    // Iniciar transação
    await db.query('START TRANSACTION');

    // Remover inscrição
    await db.query('DELETE FROM aulas_alunos WHERE aluno_id = ? AND aula_id = ?', [alunoId, aulaId]);  

    // Atualizar número de vagas
    await db.query('UPDATE aulas SET vagas = vagas + 1 WHERE id = ?', [aulaId]);  

    // Devolver crédito ao pacote (caso tenha sido usado um pacote)
    if (inscricao.pacote_id) {
      await db.query(`
        UPDATE pacotes
        SET aulas_usadas = aulas_usadas - 1
        WHERE id = ?
      `, [inscricao.pacote_id]);
    }

    await db.query('COMMIT');
    res.redirect('/aluno/aulas');

  } catch (err) {
    await db.query('ROLLBACK');
    console.error('Erro ao desinscrever aluno da aula:', err);  
    res.status(500).send('Erro ao desinscrever da aula');  
  }  
};

exports.inscreverAlunoEmAula = async (req, res) => {
  const { aulaId } = req.body;
  const alunoId = req.session.user.id;

  try {
    // Verifica se a aula existe
    const [aulas] = await db.query('SELECT * FROM aulas WHERE id = ?', [aulaId]);
    const aula = aulas[0];

    if (!aula) {
      return res.status(404).send('Aula não encontrada');
    }

    if (aula.vagas <= 0) {
      return res.status(400).send('Aula sem vagas disponíveis');
    }

    // Verifica se o aluno já está inscrito
    const [inscricaoExistente] = await db.query(
      'SELECT * FROM aula_aluno WHERE aula_id = ? AND aluno_id = ?',
      [aulaId, alunoId]
    );

    if (inscricaoExistente.length > 0) {
      return res.status(400).send('Você já está inscrito nesta aula.');
    }

    // Busca pacote válido
    const [pacotes] = await db.query(
      `SELECT * FROM pacotes_aluno 
       WHERE aluno_id = ?
         AND data_validade >= CURDATE()
         AND (
           (passe_livre = 1) OR (passe_livre = 0 AND categoria_id = ?)
         )
         AND quantidade_aulas > aulas_utilizadas
       ORDER BY data_validade ASC`,
      [alunoId, aula.categoria_id]
    );

    if (pacotes.length === 0) {
      return res.status(400).send('Você não possui créditos disponíveis para essa modalidade.');
    }

    const pacote = pacotes[0];

    // Inscreve o aluno
    await db.query(
      'INSERT INTO aula_aluno (aula_id, aluno_id) VALUES (?, ?)',
      [aulaId, alunoId]
    );

    // Atualiza vagas da aula
    await db.query('UPDATE aulas SET vagas = vagas - 1 WHERE id = ?', [aulaId]);

    // Atualiza uso de créditos do pacote
    await db.query(
      'UPDATE pacotes_aluno SET aulas_utilizadas = aulas_utilizadas + 1 WHERE id = ?',
      [pacote.id]
    );

    res.redirect('/aluno/aulas');
  } catch (error) {
    console.error('Erro ao inscrever aluno:', error);
    res.status(500).send('Erro interno ao inscrever o aluno.');
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


