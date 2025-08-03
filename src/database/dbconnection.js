const mysql = require('mysql2');

const dbConfig = {
    host: "na01-sql.pebblehost.com",
    port: 3306,
    user: "customer_923555_SnS",
    password: "+Go!y!KyEj7OeS7^kRWIrNpP",
    database: "customer_923555_SnS"
};

const pool = mysql.createPool(dbConfig).promise();

module.exports = pool;