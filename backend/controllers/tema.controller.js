// controllers/tema.controller.js
const db = require('../db');

// Obtener todos los temas
exports.getAll = (req, res) => {
  db.query(`
    SELECT t.*, a.nombre AS asignatura_nombre 
    FROM tema t
    JOIN asignatura a ON t.asignatura_id = a.id_asignatura
    ORDER BY t.id_tema
  `, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener temas' });
    res.json(results);
  });
};

// Obtener temas por asignatura
exports.getByAsignatura = (req, res) => {
  const { asignatura_id } = req.params;
  
  db.query(
    `SELECT t.*, 
     COUNT(c.id_contenido) AS total_contenidos
     FROM tema t
     LEFT JOIN contenido c ON c.tema_id = t.id_tema
     WHERE t.asignatura_id = ?
     GROUP BY t.id_tema
     ORDER BY t.id_tema`,
    [asignatura_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al buscar temas de la asignatura' });
      res.json(results);
    }
  );
};

// Obtener tema completo con relaciones
exports.getTemaCompleto = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT t.*, 
     a.nombre AS asignatura_nombre,
     m.nombre AS modulo_nombre,
     JSON_ARRAYAGG(
       IF(c.id_contenido IS NOT NULL, 
         JSON_OBJECT(
           'id', c.id_contenido,
           'tipo', c.tipo,
           'titulo', c.titulo,
           'url', c.url,
           'fecha_creacion', c.fecha_creacion
         ), 
         NULL
       )
     ) AS contenidos
     FROM tema t
     JOIN asignatura a ON t.asignatura_id = a.id_asignatura
     JOIN modulo m ON a.modulo_id = m.id_modulo
     LEFT JOIN contenido c ON c.tema_id = t.id_tema
     WHERE t.id_tema = ?
     GROUP BY t.id_tema`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener tema completo' });
      if (!results.length) return res.status(404).json({ error: 'Tema no encontrado' });
      
      // Filtrar valores nulos del array de contenidos
      const tema = {
        ...results[0],
        contenidos: results[0].contenidos ? results[0].contenidos.filter(c => c) : []
      };
      
      res.json(tema);
    }
  );
};

// Crear nuevo tema
exports.create = (req, res) => {
  const { titulo, descripcion, asignatura_id } = req.body;
  const adminId = req.user.id;

  if (!titulo || !asignatura_id) {
    return res.status(400).json({ error: 'Título y asignatura_id son requeridos' });
  }

  db.query(
    'INSERT INTO tema (titulo, descripcion, asignatura_id) VALUES (?, ?, ?)',
    [titulo, descripcion, asignatura_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear tema' });

      // Registro en historial
      db.query(
        `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`,
        ['tema', result.insertId, titulo, adminId, 'Creación por admin'],
        (histErr) => {
          if (histErr) console.error('Error en historial:', histErr);
        }
      );

      res.json({ 
        message: 'Tema creado', 
        id_tema: result.insertId,
        tema: { id_tema: result.insertId, titulo, descripcion, asignatura_id }
      });
    }
  );
};

// Actualizar tema
exports.update = (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, asignatura_id } = req.body;

  db.query(
    'UPDATE tema SET titulo = ?, descripcion = ?, asignatura_id = ? WHERE id_tema = ?',
    [titulo, descripcion, asignatura_id, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar tema' });
      res.json({ message: 'Tema actualizado' });
    }
  );
};

// Eliminar tema
exports.delete = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query('SELECT * FROM tema WHERE id_tema = ?', [id], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ error: 'Tema no encontrado' });
    const tema = rows[0];

    db.query('DELETE FROM tema WHERE id_tema = ?', [id], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Error al eliminar tema' });

      db.query(
        `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`,
        ['tema', id, tema.titulo, adminId, 'Eliminación por admin'],
        (histErr) => {
          if (histErr) console.error('Error en historial:', histErr);
        }
      );

      res.json({ message: 'Tema eliminado y registrado en historial' });
    });
  });
};