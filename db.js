const mysql = require('mysql2');
require('dotenv').config(); // Asegura que las variables .env se carguen

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Error de conexión:", err);
    throw err;
  }
  console.log('✅ Conectado a MySQL');
});

module.exports = connection;
