// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: '5341', // reemplaza con tu contraseña si tienes una
  database: 'sistema_incidencias',
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Conectado a MySQL');
});

module.exports = connection;
