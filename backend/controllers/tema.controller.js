const db = require('../db');

// Obtener todos los temas con nombre de asignatura y módulo
exports.getAll = async (req, res) => {
  try {
    const [temas] = await db.query('SELECT * FROM tema');
    res.json(temas);
  } catch (error) {
    console.error("Error básico en getAll:", error);
    res.status(500).json({ error: 'Error al obtener temas' });
  }
};


// Obtener temas por asignatura

// Crear nuevo tema
exports.create = async (req, res) => {
  const { titulo, descripcion = '', asignatura_id } = req.body;
  const adminId = req.user?.id;

  if (!titulo || !asignatura_id) {
    return res.status(400).json({ error: 'Título y asignatura_id son requeridos' });
  }

  try {
    const [result] = await db.promise().query(
      'INSERT INTO tema (titulo, descripcion, asignatura_id) VALUES (?, ?, ?)',
      [titulo, descripcion, asignatura_id]
    );

    await db.promise().query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      ['tema', result.insertId, titulo, adminId || null, 'Creación por admin']
    );

    res.status(201).json({
      message: 'Tema creado',
      id_tema: result.insertId,
      tema: { id_tema: result.insertId, titulo, descripcion, asignatura_id }
    });
  } catch (err) {
    console.error('Error en create tema:', err);
    res.status(500).json({ error: 'Error al crear tema' });
  }
};

// Actualizar tema
exports.update = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, asignatura_id } = req.body;

  if (!titulo || !asignatura_id) {
    return res.status(400).json({ error: 'Título y asignatura_id son requeridos' });
  }

  try {
    await db.promise().query(
      'UPDATE tema SET titulo = ?, descripcion = ?, asignatura_id = ? WHERE id_tema = ?',
      [titulo, descripcion, asignatura_id, id]
    );

    res.json({ message: 'Tema actualizado' });
  } catch (err) {
    console.error('Error en update tema:', err);
    res.status(500).json({ error: 'Error al actualizar tema' });
  }
};

// Eliminar tema
exports.delete = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user?.id;

  try {
    const [rows] = await db.promise().query('SELECT * FROM tema WHERE id_tema = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    const tema = rows[0];

    await db.promise().query('DELETE FROM tema WHERE id_tema = ?', [id]);

    await db.promise().query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      ['tema', id, tema.titulo, adminId || null, 'Eliminación por admin']
    );

    res.json({ message: 'Tema eliminado y registrado en historial' });
  } catch (err) {
    console.error('Error en delete tema:', err);
    res.status(500).json({ error: 'Error al eliminar tema' });
  }
};
