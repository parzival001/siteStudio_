
const mysql = require('mysql2/promise');


const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'studiouser',
  password: '083665',
  database: 'sistema_studioarte',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0

  // const db = mysql.createPool({
  // host: 'localhost',
  // user: 'root',
  // password: '083665',
  // database: 'sistema_studioarte',
  // waitForConnections: true,
  // connectionLimit: 10,
  // queueLimit: 0

});

async function queryComLog(sql, params = []) {
  console.time(`Query SQL`);
  const resultado = await pool.query(sql, params);
  console.timeEnd(`Query SQL`);
  return resultado;
}

module.exports = { pool, queryComLog };
module.exports = db;
