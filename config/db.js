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

// 2. The helper function must use the defined variable name 'db'
async function queryComLog(sql, params = []) {
    console.time(`Query SQL`);
    // FIX: Change 'pool' to 'db'
    const resultado = await db.query(sql, params);
    console.timeEnd(`Query SQL`);
    return resultado;
}

// 3. Use a single module.exports to provide both the pool and the helper function
module.exports = {
    db, // Exports the raw connection pool object
    queryComLog // Exports the logging function
};