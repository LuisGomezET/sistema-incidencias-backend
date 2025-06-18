const express = require('express');
const cors = require('cors');
const app = express();
const incidenciaRoutes = require('./routes/incidencias');

app.use(cors());
app.use(express.json());

app.use('/api/incidencias', incidenciaRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
