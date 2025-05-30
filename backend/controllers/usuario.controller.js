const db = require('../db');

// Obtener todos los usuarios
exports.getAll = (req, res) => {
  db.query('SELECT * FROM usuario', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener usuarios' });
    res.json(results);
  });
};

// Crear nuevo usuario
exports.create = (req, res) => {
  const { nombre, correo, contrasena, rol_id } = req.body;
  const query = 'INSERT INTO usuario (nombre, correo, contrasena, rol_id) VALUES (?, ?, ?, ?)';
  db.query(query, [nombre, correo, contrasena, rol_id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al crear usuario' });
    res.json({ message: 'Usuario creado', id_usuario: result.insertId });
  });
};

// Actualizar usuario
exports.update = (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contrasena, rol_id } = req.body;
  const query = 'UPDATE usuario SET nombre = ?, correo = ?, contrasena = ?, rol_id = ? WHERE id_usuario = ?';
  db.query(query, [nombre, correo, contrasena, rol_id, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar usuario' });
    res.json({ message: 'Usuario actualizado' });
  });
};

// Eliminar usuario y registrar en historial
exports.delete = (req, res) => {
  const { id } = req.params;
  const eliminado_por = req.body.eliminado_por;

  db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id], (err, rows) => {
    if (err || !rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    const usuario = rows[0];

    db.query('DELETE FROM usuario WHERE id_usuario = ?', [id], (err) => {
      if (err) return res.status(500).json({ error: 'Error al eliminar usuario' });

      const histQuery = `
        INSERT INTO historial_eliminacion (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
        VALUES (?, ?, ?, ?, ?)`;
      db.query(histQuery, ['usuario', id, usuario.nombre, eliminado_por, 'Eliminación manual por admin']);

      res.json({ message: 'Usuario eliminado y registrado en historial' });
    });
  });
};
