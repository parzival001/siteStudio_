const mysql = require('mysql2/promise');

// const db = mysql.createPool({
// host: 'localhost',
// user: 'root',
// password: '083665',
// database: 'sistema_studioarte',
// waitForConnections: true,
// connectionLimit: 10,
// queueLimit: 0


const db = mysql.createPool({
st: '127.0.0.1',
er: 'studiouser',
ssword: '083665',
tabase: 'sistema_studioarte',
itForConnections: true,
nnectionLimit: 10,
 queueLimit: 0

});


module.exports = db;
