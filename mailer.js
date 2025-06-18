const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const mensajeHTML = (incidencia) => `
  <h2>📄 Incidencia</h2>
  <ul>
    <li><strong>Nombre:</strong> ${incidencia.nombre}</li>
    <li><strong>Correo:</strong> ${incidencia.email}</li>
    <li><strong>Tipo:</strong> ${incidencia.tipo}</li>
    <li><strong>Descripción:</strong> ${incidencia.descripcion}</li>
    <li><strong>Estado:</strong> ${incidencia.estado}</li>
    <li><strong>Fecha:</strong> ${incidencia.fecha}</li>
    <li><strong>Hora:</strong> ${incidencia.hora}</li>
    <li><strong>Ticket:</strong> ${incidencia.ticket}</li>
  </ul>
`;

const enviarCorreoNuevo = (incidencia) => {
  const adminMsg = {
    from: 'Sistema de Incidencias',
    to: process.env.EMAIL_ADMIN,
    subject: `🛎️ Nueva incidencia: ${incidencia.ticket}`,
    html: mensajeHTML(incidencia)
  };

  const userMsg = {
    from: 'Sistema de Incidencias',
    to: incidencia.email,
    subject: `✅ Confirmación de incidencia: ${incidencia.ticket}`,
    html: `
      <p>Hola ${incidencia.nombre},</p>
      <p>Tu incidencia ha sido registrada correctamente.</p>
      ${mensajeHTML(incidencia)}
    `
  };

  return Promise.all([
    transporter.sendMail(adminMsg),
    transporter.sendMail(userMsg)
  ]);
};

const enviarCorreoActualizacion = (incidencia) => {
  const msg = {
    from: 'Sistema de Incidencias',
    to: incidencia.email,
    subject: `🔄 Actualización de estado: ${incidencia.ticket}`,
    html: `
      <p>Hola ${incidencia.nombre},</p>
      <p>Tu incidencia ha sido actualizada al estado: <strong>${incidencia.estado}</strong>.</p>
      ${mensajeHTML(incidencia)}
    `
  };

  return transporter.sendMail(msg);
};

module.exports = {
  enviarCorreoNuevo,
  enviarCorreoActualizacion
};
