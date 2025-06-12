// historial.controller.js
const db = require('../db'); //

exports.obtenerHistorial = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM historial_eliminacion ORDER BY fecha_eliminacion DESC');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
};
