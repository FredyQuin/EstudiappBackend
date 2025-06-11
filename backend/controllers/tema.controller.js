const db = require('../db');
const contenidoController = require('./contenidotema.controller.js');

// Obtener todos los temas con nombre de asignatura y periodo
exports.getAll = async (req, res) => {
  try {
    const [temas] = await db.query(`
      SELECT 
        t.id_tema,
        t.titulo,
        t.descripcion,
        t.asignatura_id,
        t.periodo_id,
        a.nombre AS asignatura,
        p.nombre AS periodo
      FROM tema t
      LEFT JOIN asignatura a ON t.asignatura_id = a.id_asignatura
      LEFT JOIN periodo p ON t.periodo_id = p.id_periodo
    `);
    res.json(temas);
  } catch (error) {
    console.error("Error en getAll:", error);
    res.status(500).json({ error: 'Error al obtener temas' });
  }
};

// Crear nuevo tema con secciones
exports.create = async (req, res) => {
  const {
    titulo,
    descripcion,
    asignatura_id,
    periodo_id,
    contenido_introduccion,
    contenido_aspectos,
    contenido_conclusion
  } = req.body;

  try {
    const [result] = await db.execute(
      'INSERT INTO tema (titulo, descripcion, asignatura_id, periodo_id) VALUES (?, ?, ?, ?)',
      [titulo, descripcion, asignatura_id, periodo_id]
    );

    const temaId = result.insertId;

    // Guardar secciones del contenido
    await contenidoController.createSecciones(temaId, [
      {
        titulo_seccion: 'Introducción',
        contenido_largo: contenido_introduccion,
        tipo_contenido: 'texto',
        orden: 1
      },
      {
        titulo_seccion: 'Aspectos clave',
        contenido_largo: contenido_aspectos,
        tipo_contenido: 'lista',
        orden: 2
      },
      {
        titulo_seccion: 'Conclusión',
        contenido_largo: contenido_conclusion,
        tipo_contenido: 'texto',
        orden: 3
      }
    ]);

    res.status(201).json({ id: temaId, message: 'Tema y contenido creados' });
  } catch (error) {
    console.error('Error en create tema:', error);
    res.status(500).json({ error: 'Error al crear tema con contenido' });
  }
};

// Actualizar tema
exports.update = async (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    descripcion,
    asignatura_id,
    periodo_id,
    contenido_introduccion,
    contenido_aspectos,
    contenido_conclusion
  } = req.body;

  if (!titulo || !asignatura_id || !periodo_id) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    await db.query(
      'UPDATE tema SET titulo = ?, descripcion = ?, asignatura_id = ?, periodo_id = ? WHERE id_tema = ?',
      [titulo, descripcion, asignatura_id, periodo_id, id]
    );

    // Eliminar contenido previo y reinsertar actualizado
    await contenidoController.deleteByTemaId(id);
    await contenidoController.createSecciones(id, [
      {
        titulo_seccion: 'Introducción',
        contenido_largo: contenido_introduccion,
        tipo_contenido: 'texto',
        orden: 1
      },
      {
        titulo_seccion: 'Aspectos clave',
        contenido_largo: contenido_aspectos,
        tipo_contenido: 'lista',
        orden: 2
      },
      {
        titulo_seccion: 'Conclusión',
        contenido_largo: contenido_conclusion,
        tipo_contenido: 'texto',
        orden: 3
      }
    ]);

    res.json({ message: 'Tema actualizado correctamente' });
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
    const [rows] = await db.query('SELECT * FROM tema WHERE id_tema = ?', [id]);

    if (!rows.length) {
      return res.status(404).json({ error: 'Tema no encontrado' });
    }

    const tema = rows[0];

    // Eliminar contenido del tema
    await contenidoController.deleteByTemaId(id);

    // Eliminar el tema
    await db.query('DELETE FROM tema WHERE id_tema = ?', [id]);

    // Registrar en historial
    await db.query(
      `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      ['tema', id, tema.titulo, adminId || null, 'Eliminación por admin']
    );

    res.json({ message: 'Tema y contenido eliminados' });
  } catch (err) {
    console.error('Error en delete tema:', err);
    res.status(500).json({ error: 'Error al eliminar tema' });
  }
};
