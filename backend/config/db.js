var db = require('mysql2-promise')();

 db.configure({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'leaderboard_db',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;
