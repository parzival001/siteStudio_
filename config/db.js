const mysql = require('mysql2/promise');

// const db = mysql.createPool({
//   host: 'mysql.hostinger.com',
//   user: 'u491967152_jessica01',
//   password: 'Ca083665@',
//   database: 'u491967152_sistema_studio',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

 const db = mysql.createPool({
  host: 'localhost',
  user: 'studiouser',
  password: '083665',
  database: 'sistema_studioarte',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


module.exports = db;
