require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: 0
});

// Manejo de errores
connection.getConnection((err, conn) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        ('Conexión a la base de datos exitosa.');
        conn.release();
    }
});

module.exports = connection.promise();
