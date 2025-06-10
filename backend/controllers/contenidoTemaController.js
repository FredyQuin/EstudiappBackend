// controllers/contenidoTemaController.js
const db = require('../db');

exports.getContenidoPorTema = async (req, res) => {
  const temaId = req.params.tema_id;
  try {
    const [rows] = await db.execute(
      'SELECT * FROM contenido_tema WHERE tema_id = ? ORDER BY orden ASC',
      [temaId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener el contenido:', err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};
