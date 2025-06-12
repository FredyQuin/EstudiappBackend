const db = require('../db');

// Crear secciones del contenido de un tema
exports.createSecciones = async (temaId, secciones) => {
  try {
    for (const seccion of secciones) {
      await db.execute(
        `INSERT INTO contenido_tema 
          (tema_id, titulo_seccion, contenido_largo, tipo_contenido, orden)
         VALUES (?, ?, ?, ?, ?)`,
        [
          temaId,
          seccion.titulo_seccion,
          seccion.contenido_largo,
          seccion.tipo_contenido,
          seccion.orden
        ]
      );
    }
  } catch (err) {
    console.error('Error al insertar contenido_tema:', err);
    throw err;
  }
};

// Obtener contenido por tema
exports.getByTemaId = async (req, res) => {
  const { temaId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT * FROM contenido_tema WHERE tema_id = ? ORDER BY orden`,
      [temaId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener contenido del tema:', error);
    res.status(500).json({ error: 'Error al obtener contenido' });
  }
};



