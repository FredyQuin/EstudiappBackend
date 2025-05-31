// controllers/asignatura.controller.js
const db = require('../db');

// Obtener todas las asignaturas
exports.getAll = (req, res) => {
  db.query(`
    SELECT a.*, m.nombre AS modulo_nombre 
    FROM asignatura a
    JOIN modulo m ON a.modulo_id = m.id_modulo
  `, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener asignaturas' });
    res.json(results);
  });
};

// Obtener asignaturas por módulo
exports.getByModulo = (req, res) => {
  const { modulo_id } = req.params;
  
  db.query(
    'SELECT * FROM asignatura WHERE modulo_id = ?',
    [modulo_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al buscar asignaturas del módulo' });
      res.json(results);
    }
  );
};

// Obtener asignatura completa con relaciones
exports.getAsignaturaCompleta = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT a.*, 
     m.nombre AS modulo_nombre,
     GROUP_CONCAT(t.titulo) AS temas
     FROM asignatura a
     JOIN modulo m ON a.modulo_id = m.id_modulo
     LEFT JOIN tema t ON t.asignatura_id = a.id_asignatura
     WHERE a.id_asignatura = ?
     GROUP BY a.id_asignatura`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener asignatura completa' });
      if (!results.length) return res.status(404).json({ error: 'Asignatura no encontrada' });
      
      const asignatura = {
        ...results[0],
        temas: results[0].temas ? results[0].temas.split(',') : []
      };
      
      res.json(asignatura);
    }
  );
};

// Crear nueva asignatura
exports.create = (req, res) => {
  const { nombre, modulo_id, competencia } = req.body;
  const adminId = req.user.id;

  db.query(
    'INSERT INTO asignatura (nombre, modulo_id, competencia) VALUES (?, ?, ?)',
    [nombre, modulo_id, competencia],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear asignatura' });

      // Registro en historial
      db.query(
        `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`,
        ['asignatura', result.insertId, nombre, adminId, 'Creación por admin'],
        (histErr) => {
          if (histErr) console.error('Error en historial:', histErr);
        }
      );

      res.json({ message: 'Asignatura creada', id_asignatura: result.insertId });
    }
  );
};

// Actualizar asignatura
exports.update = (req, res) => {
  const { id } = req.params;
  const { nombre, modulo_id, competencia } = req.body;

  db.query(
    'UPDATE asignatura SET nombre = ?, modulo_id = ?, competencia = ? WHERE id_asignatura = ?',
    [nombre, modulo_id, competencia, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar asignatura' });
      res.json({ message: 'Asignatura actualizada' });
    }
  );
};

// Eliminar asignatura
exports.delete = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query('SELECT * FROM asignatura WHERE id_asignatura = ?', [id], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ error: 'Asignatura no encontrada' });
    const asignatura = rows[0];

    db.query('DELETE FROM asignatura WHERE id_asignatura = ?', [id], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Error al eliminar asignatura' });

      db.query(
        `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`,
        ['asignatura', id, asignatura.nombre, adminId, 'Eliminación por admin'],
        (histErr) => {
          if (histErr) console.error('Error en historial:', histErr);
        }
      );

      res.json({ message: 'Asignatura eliminada y registrada en historial' });
    });
  });
};