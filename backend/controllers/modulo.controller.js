const db = require('../db');

// Obtener TODOS los módulos (ya lo teníamos)
exports.getAll = (req, res) => {
  db.query('SELECT * FROM modulo', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener módulos' });
    res.json(results);
  });
};

// Obtener módulos POR PROFESOR
exports.getByProfesor = (req, res) => {
  const { profesor_id } = req.params;
  
  db.query(
    'SELECT * FROM modulo WHERE profesor_id = ?',
    [profesor_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al buscar módulos del profesor' });
      res.json(results);
    }
  );
};

// Obtener módulo ESPECÍFICO con sus relaciones completas
exports.getModuloCompleto = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT m.*, 
     p.nombre AS profesor_nombre,
     GROUP_CONCAT(a.nombre) AS asignaturas
     FROM modulo m
     LEFT JOIN profesor p ON m.profesor_id = p.id_profesor
     LEFT JOIN asignatura a ON a.modulo_id = m.id_modulo
     WHERE m.id_modulo = ?
     GROUP BY m.id_modulo`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener módulo completo' });
      if (!results.length) return res.status(404).json({ error: 'Módulo no encontrado' });
      
      // Formatear respuesta
      const modulo = {
        ...results[0],
        asignaturas: results[0].asignaturas ? results[0].asignaturas.split(',') : []
      };
      
      res.json(modulo);
    }
  );
};

// Crear módulo (ya lo teníamos)
exports.create = (req, res) => {
  const { nombre, profesor_id } = req.body;
  const adminId = req.user.id;

  db.query(
    'INSERT INTO modulo (nombre, profesor_id) VALUES (?, ?)',
    [nombre, profesor_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear módulo' });

      // Registro en historial
      db.query(
        `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`,
        ['modulo', result.insertId, nombre, adminId, 'Creación por admin'],
        (histErr) => {
          if (histErr) console.error('Error en historial:', histErr);
        }
      );

      res.json({ message: 'Módulo creado', id_modulo: result.insertId });
    }
  );
};

// Actualizar módulo (ya lo teníamos)
exports.update = (req, res) => {
  const { id } = req.params;
  const { nombre, profesor_id } = req.body;

  db.query(
    'UPDATE modulo SET nombre = ?, profesor_id = ? WHERE id_modulo = ?',
    [nombre, profesor_id, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar módulo' });
      res.json({ message: 'Módulo actualizado' });
    }
  );
};

// Eliminar módulo (ya lo teníamos)
exports.delete = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query('SELECT * FROM modulo WHERE id_modulo = ?', [id], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ error: 'Módulo no encontrado' });
    const modulo = rows[0];

    db.query('DELETE FROM modulo WHERE id_modulo = ?', [id], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Error al eliminar módulo' });

      db.query(
        `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`,
        ['modulo', id, modulo.nombre, adminId, 'Eliminación por admin'],
        (histErr) => {
          if (histErr) console.error('Error en historial:', histErr);
        }
      );

      res.json({ message: 'Módulo eliminado y registrado en historial' });
    });
  });
};