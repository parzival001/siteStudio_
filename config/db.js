
  const mysql = require('mysql2/promise');
<<<<<<< HEAD
                            const db = mysql.createPool({
                            host: 'localhost',
                            user: 'root',
                            password: '083665',
                            database: 'sistema_studioarte',
                            waitForConnections: true,
                            connectionLimit: 10,
                            queueLimit: 0

                              //  const db = mysql.createPool({
                              //  host: '127.0.0.1',
                              //  user: 'studiouser',
                              //  password: '083665',
                              //  database: 'sistema_studioarte',
                              //  waitForConnections: true,
                              //  connectionLimit: 10,
                              //  queueLimit: 0
=======
                              // const db = mysql.createPool({
                              // host: 'localhost',
                              // user: 'root',
                              // password: '083665',
                              // database: 'sistema_studioarte',
                              // waitForConnections: true,
                              // connectionLimit: 10,
                              // queueLimit: 0

                                  const db = mysql.createPool({
                                  host: '127.0.0.1',
                                  user: 'studiouser',
                                  password: '083665',
                                  database: 'sistema_studioarte',
                                  waitForConnections: true,
                                  connectionLimit: 10,
                                  queueLimit: 0
>>>>>>> 5749962ad551395c1d2e227958e1d04e844784ba

});


module.exports = db;
