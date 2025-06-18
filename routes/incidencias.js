const express = require('express');
const router = express.Router();
const db = require('../db');
const ExcelJS = require('exceljs');
const { enviarCorreoNuevo, enviarCorreoActualizacion } = require('../mailer');

// Obtener todas las incidencias
router.get('/', (req, res) => {
  db.query('SELECT * FROM incidencias ORDER BY fecha DESC, hora DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Obtener incidencia por ticket
router.get('/ticket/:ticket', (req, res) => {
  db.query('SELECT * FROM incidencias WHERE ticket = ?', [req.params.ticket], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Incidencia no encontrada' });
    res.json(results[0]);
  });
});

// Crear incidencia
router.post('/', (req, res) => {
  const { nombre, email, tipo, descripcion, estado, fecha, hora, ticket } = req.body;
  const sql = 'INSERT INTO incidencias (nombre, email, tipo, descripcion, estado, fecha, hora, ticket) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(sql, [nombre, email, tipo, descripcion, estado, fecha, hora, ticket], (err, result) => {
    if (err) {
      console.error("❌ Error al insertar:", err);
      return res.status(500).json({ error: err });
    }

    const incidencia = { id: result.insertId, ...req.body };

    enviarCorreoNuevo(incidencia)
      .then(() => console.log("✅ Correos enviados"))
      .catch((error) => console.error("❌ Error al enviar correos:", error));

    res.json({ id: result.insertId, message: 'Incidencia creada' });
  });
});

// Actualizar estado
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!estado) return res.status(400).json({ error: 'Falta el campo estado' });

  db.query('SELECT * FROM incidencias WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) return res.status(404).json({ error: 'Incidencia no encontrada' });

    const incidencia = results[0];
    incidencia.estado = estado;

    db.query('UPDATE incidencias SET estado = ? WHERE id = ?', [estado, id], (err) => {
      if (err) return res.status(500).json({ error: err });

      enviarCorreoActualizacion(incidencia)
        .then(() => console.log("✅ Correo de actualización enviado"))
        .catch((error) => console.error("❌ Error al enviar actualización:", error));

      res.json({ message: 'Estado actualizado correctamente' });
    });
  });
});

// Eliminar incidencia
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM incidencias WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('❌ Error al eliminar incidencia:', err);
      return res.status(500).json({ error: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Incidencia no encontrada' });
    }

    res.json({ message: 'Incidencia eliminada exitosamente' });
  });
});

// Exportar incidencias a Excel
router.get('/export', (req, res) => {
  db.query('SELECT * FROM incidencias', async (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Incidencias');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'nombre', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Tipo', key: 'tipo', width: 20 },
      { header: 'Descripción', key: 'descripcion', width: 30 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Hora', key: 'hora', width: 15 },
      { header: 'Ticket', key: 'ticket', width: 25 }
    ];

    rows.forEach(row => sheet.addRow(row));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=incidencias.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  });
});

module.exports = router;
