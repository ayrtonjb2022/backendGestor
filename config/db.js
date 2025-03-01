require('dotenv').config();
const mysql = require('mysql2');
const url = require('url');

// Parsear la URL de la base de datos si es necesario (para Railway)
const dbUrl = process.env.DATABASE_URL;
const parsedUrl = url.parse(dbUrl);

// Crear la conexión a la base de datos utilizando el pool de conexiones
const connection = mysql.createPool({
    host: parsedUrl.hostname,
    user: parsedUrl.auth.split(':')[0],
    password: parsedUrl.auth.split(':')[1],
    database: parsedUrl.pathname.split('/')[1],
    port: parsedUrl.port || 3306,
    waitForConnections: true,
    connectionLimit: process.env.DB_CONNECTION_LIMIT || 10,
    queueLimit: 0
});

// Manejo de errores de conexión
connection.getConnection((err, conn) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conexión a la base de datos exitosa.');
        conn.release();
    }
});

// Exportar la conexión con promesas
module.exports = connection.promise();
