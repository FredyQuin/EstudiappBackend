// controllers/periodo.controller.js
const db = require('../db');

// Obtener todos los períodos
exports.getAll = (req, res) => {
  db.query(`
    SELECT p.*, a.nombre AS asignatura_nombre 
    FROM periodo p
    JOIN asignatura a ON p.asignatura_id = a.id_asignatura
  `, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener períodos' });
    res.json(results);
  });
};

// Obtener períodos por asignatura
exports.getByAsignatura = (req, res) => {
  const { asignatura_id } = req.params;
  
  db.query(
    'SELECT * FROM periodo WHERE asignatura_id = ? ORDER BY fecha_inicio',
    [asignatura_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al buscar períodos de la asignatura' });
      res.json(results);
    }
  );
};

// Obtener período completo con relaciones
exports.getPeriodoCompleto = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT p.*, 
     a.nombre AS asignatura_nombre,
     m.nombre AS modulo_nombre
     FROM periodo p
     JOIN asignatura a ON p.asignatura_id = a.id_asignatura
     JOIN modulo m ON a.modulo_id = m.id_modulo
     WHERE p.id_periodo = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener período completo' });
      if (!results.length) return res.status(404).json({ error: 'Período no encontrado' });
      
      res.json(results[0]);
    }
  );
};

// Crear nuevo período
exports.create = (req, res) => {
  const { nombre, fecha_inicio, fecha_fin, asignatura_id } = req.body;
  const adminId = req.user.id;

  // Validación de fechas
  if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
    return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha fin' });
  }

  db.query(
    'INSERT INTO periodo (nombre, fecha_inicio, fecha_fin, asignatura_id) VALUES (?, ?, ?, ?)',
    [nombre, fecha_inicio, fecha_fin, asignatura_id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Error al crear período' });

      // Registro en historial
      db.query(
        `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`,
        ['periodo', result.insertId, nombre, adminId, 'Creación por admin'],
        (histErr) => {
          if (histErr) console.error('Error en historial:', histErr);
        }
      );

      res.json({ message: 'Período creado', id_periodo: result.insertId });
    }
  );
};

// Actualizar período
exports.update = (req, res) => {
  const { id } = req.params;
  const { nombre, fecha_inicio, fecha_fin, asignatura_id } = req.body;

  // Validación de fechas
  if (fecha_inicio && fecha_fin && new Date(fecha_inicio) >= new Date(fecha_fin)) {
    return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha fin' });
  }

  db.query(
    'UPDATE periodo SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, asignatura_id = ? WHERE id_periodo = ?',
    [nombre, fecha_inicio, fecha_fin, asignatura_id, id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Error al actualizar período' });
      res.json({ message: 'Período actualizado' });
    }
  );
};

// Eliminar período
exports.delete = (req, res) => {
  const { id } = req.params;
  const adminId = req.user.id;

  db.query('SELECT * FROM periodo WHERE id_periodo = ?', [id], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ error: 'Período no encontrado' });
    const periodo = rows[0];

    db.query('DELETE FROM periodo WHERE id_periodo = ?', [id], (delErr) => {
      if (delErr) return res.status(500).json({ error: 'Error al eliminar período' });

      db.query(
        `INSERT INTO historial_eliminacion 
        (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`,
        ['periodo', id, periodo.nombre, adminId, 'Eliminación por admin'],
        (histErr) => {
          if (histErr) console.error('Error en historial:', histErr);
        }
      );

      res.json({ message: 'Período eliminado y registrado en historial' });
    });
  });
};