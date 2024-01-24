const mysql = require('mysql');
require('dotenv').config();

const connect = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3308,
    connectionLimit: 10,
    multipleStatements: true
});

module.exports = connect;
