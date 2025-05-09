
const db = require('../db');

exports.listarPacotes = async (req, res) => {
  const [pacotes] = await db.query('SELECT * FROM pacotes');
  res.render('professor/pacotes', { pacotes });
};