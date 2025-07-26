const db = require('../db');

// Obtener TODOS los módulos
exports.getAll = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM modulo');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener módulos' });
  }
};

// Obtener módulos POR PROFESOR
exports.getByProfesor = async (req, res) => {
  const { profesor_id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT * FROM modulo WHERE profesor_id = $1',
      [profesor_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al buscar módulos del profesor' });
  }
};

// Obtener módulo ESPECÍFICO con sus relaciones completas
exports.getModuloCompleto = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT m.*, 
       p.nombre AS profesor_nombre,
       STRING_AGG(a.nombre, ',') AS asignaturas
       FROM modulo m
       LEFT JOIN profesor p ON m.profesor_id = p.id_profesor
       LEFT JOIN asignatura a ON a.modulo_id = m.id_modulo
       WHERE m.id_modulo = $1
       GROUP BY m.id_modulo, p.nombre`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    const modulo = {
      ...rows[0],
      asignaturas: rows[0].asignaturas
        ? rows[0].asignaturas.split(',')
        : []
    };

    res.json(modulo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener módulo completo' });
  }
};

// Crear módulo
exports.create = async (req, res) => {
  try {
    const { nombre, descripcion, asignatura_id } = req.body;

    if (!nombre || !descripcion || !asignatura_id) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const result = await db.query(
      'INSERT INTO modulo (nombre, descripcion, asignatura_id) VALUES ($1, $2, $3) RETURNING id_modulo',
      [nombre, descripcion, asignatura_id]
    );

    const insertId = result.rows[0].id_modulo;
    const adminId = null;

    await db.query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
       VALUES ($1, $2, $3, $4, $5)`,
      ['modulo', insertId, nombre, adminId, 'Creación pública sin admin']
    );

    res.status(201).json({ id: insertId });
  } catch (error) {
    console.error('Error en create módulo:', error);
    res.status(500).json({ error: 'Error al crear módulo' });
  }
};

// Actualizar módulo
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre, profesor_id } = req.body;

  try {
    await db.query(
      'UPDATE modulo SET nombre = $1, profesor_id = $2 WHERE id_modulo = $3',
      [nombre, profesor_id, id]
    );
    res.json({ message: 'Módulo actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar módulo' });
  }
};

// Eliminar módulo
exports.delete = async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await db.query('SELECT * FROM modulo WHERE id_modulo = $1', [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Módulo no encontrado' });
    }

    const modulo = rows[0];

    await db.query('DELETE FROM modulo WHERE id_modulo = $1', [id]);

    await db.query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
       VALUES ($1, $2, $3, $4, $5)`,
      ['modulo', id, modulo.nombre, null, 'Eliminación pública sin admin']
    );

    res.json({ message: 'Módulo eliminado y registrado en historial' });
  } catch (err) {
    console.error('Error en delete módulo:', err);
    res.status(500).json({ error: 'Error al eliminar módulo' });
  }
};