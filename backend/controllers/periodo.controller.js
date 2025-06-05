const db = require('../db');

// Obtener todos los períodos
exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT p.*, a.nombre AS asignatura_nombre 
      FROM periodo p
      JOIN asignatura a ON p.asignatura_id = a.id_asignatura
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener períodos' });
  }
};

// Obtener períodos por asignatura
exports.getByAsignatura = async (req, res) => {
  const { asignatura_id } = req.params;

  try {
    const [results] = await db.query(
      'SELECT * FROM periodo WHERE asignatura_id = ? ORDER BY fecha_inicio',
      [asignatura_id]
    );
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar períodos de la asignatura' });
  }
};

// Obtener período completo con relaciones
exports.getPeriodoCompleto = async (req, res) => {
  const { id } = req.params;

  try {
    const [results] = await db.query(
      `SELECT p.*, 
        a.nombre AS asignatura_nombre,
        m.nombre AS modulo_nombre
      FROM periodo p
      JOIN asignatura a ON p.asignatura_id = a.id_asignatura
      JOIN modulo m ON a.modulo_id = m.id_modulo
      WHERE p.id_periodo = ?`,
      [id]
    );

    if (!results.length) return res.status(404).json({ error: 'Período no encontrado' });

    res.json(results[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener período completo' });
  }
};

// Crear nuevo período
exports.create = async (req, res) => {
  const { nombre, fecha_inicio, fecha_fin, asignatura_id } = req.body;

  if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
    return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha fin' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO periodo (nombre, fecha_inicio, fecha_fin, asignatura_id) VALUES (?, ?, ?, ?)',
      [nombre, fecha_inicio, fecha_fin, asignatura_id]
    );

    await db.query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
      VALUES (?, ?, ?, ?, ?)`,
      ['periodo', result.insertId, nombre, null, 'Creación pública sin autenticación']
    );

    res.json({ message: 'Período creado', id_periodo: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear período' });
  }
};

// Actualizar período
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_inicio, fecha_fin, asignatura_id } = req.body;

  if (fecha_inicio && fecha_fin && new Date(fecha_inicio) >= new Date(fecha_fin)) {
    return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha fin' });
  }

  try {
    await db.query(
      'UPDATE periodo SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, asignatura_id = ? WHERE id_periodo = ?',
      [nombre, fecha_inicio, fecha_fin, asignatura_id, id]
    );

    res.json({ message: 'Período actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar período' });
  }
};

// Eliminar período
exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM periodo WHERE id_periodo = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Período no encontrado' });

    const periodo = rows[0];

    await db.query('DELETE FROM periodo WHERE id_periodo = ?', [id]);

    await db.query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
      VALUES (?, ?, ?, ?, ?)`,
      ['periodo', id, periodo.nombre, null, 'Eliminación pública sin autenticación']
    );

    res.json({ message: 'Período eliminado y registrado en historial' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar período' });
  }
};
