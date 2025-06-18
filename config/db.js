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
   host: '127.0.0.1',
   user: 'root',
   password: 'KWA220816L0g1t3ch@',
   database: 'sistema_studioarte',
   waitForConnections: true,
   connectionLimit: 10,
   queueLimit: 0
});


module.exports = db;
