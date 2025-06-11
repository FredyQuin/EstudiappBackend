const db = require('../db');

// Obtener todas las asignaturas
exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT a.*, m.nombre AS modulo_nombre 
      FROM asignatura a
      JOIN modulo m ON a.modulo_id = m.id_modulo
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asignaturas' });
  }
};

// Obtener asignaturas por módulo
exports.getByModulo = async (req, res) => {
  const { modulo_id } = req.params;

  try {
    const [results] = await db.query(
      'SELECT * FROM asignatura WHERE modulo_id = ?',
      [modulo_id]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar asignaturas del módulo' });
  }
};

// Obtener asignatura completa con relaciones
exports.getAsignaturaCompleta = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      `SELECT a.*, 
        m.nombre AS modulo_nombre,
        GROUP_CONCAT(t.titulo) AS temas
      FROM asignatura a
      JOIN modulo m ON a.modulo_id = m.id_modulo
      LEFT JOIN tema t ON t.asignatura_id = a.id_asignatura
      WHERE a.id_asignatura = ?
      GROUP BY a.id_asignatura`,
      [id]
    );

    if (!results.length) return res.status(404).json({ error: 'Asignatura no encontrada' });

    const asignatura = {
      ...results[0],
      temas: results[0].temas ? results[0].temas.split(',') : []
    };

    res.json(asignatura);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener asignatura completa' });
  }
};

// Crear nueva asignatura
exports.create = async (req, res) => {
  const { nombre, modulo_id, competencia } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO asignatura (nombre, modulo_id, competencia) VALUES (?, ?, ?)',
      [nombre, modulo_id, competencia]
    );

    // Registrar en historial
    await db.query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
      VALUES (?, ?, ?, ?, ?)`,
      ['asignatura', result.insertId, nombre, null, 'Creación por admin']
    );

    res.json({ message: 'Asignatura creada', id_asignatura: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear asignatura' });
  }
};

// Actualizar asignatura
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre, modulo_id, competencia } = req.body;

  try {
    await db.query(
      'UPDATE asignatura SET nombre = ?, modulo_id = ?, competencia = ? WHERE id_asignatura = ?',
      [nombre, modulo_id, competencia, id]
    );
    res.json({ message: 'Asignatura actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar asignatura' });
  }
};
exports.getAll = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id_asignatura, nombre FROM asignatura');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener asignaturas:', error);
    res.status(500).json({ error: 'Error al obtener asignaturas' });
  }
};

// Eliminar asignatura
exports.delete = async (req, res) => {
  const { id } = req.params;
  

  try {
    const [rows] = await db.query(
      'SELECT * FROM asignatura WHERE id_asignatura = ?',
      [id]
    );

    if (!rows.length) return res.status(404).json({ error: 'Asignatura no encontrada' });
    const asignatura = rows[0];

    await db.query(
      'DELETE FROM asignatura WHERE id_asignatura = ?',
      [id]
    );

    await db.query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
      VALUES (?, ?, ?, ?, ?)`,
      ['asignatura', id, asignatura.nombre, null, 'Eliminación por admin']
    );

    res.json({ message: 'Asignatura eliminada y registrada en historial' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar asignatura' });
  }
};
