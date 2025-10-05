const mysql = require('mysql2/promise');

// 1. Define the connection pool using the name 'db'
const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'studiouser',
    password: '083665',
    database: 'sistema_studioarte',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports =   db;