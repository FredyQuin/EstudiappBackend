const db = require('../db');

// Obtener todos los usuarios
exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM usuario');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Crear nuevo usuario
exports.create = async (req, res) => {
  const { nombre, correo, contrasena, rol_id } = req.body;
  const query = 'INSERT INTO usuario (nombre, correo, contrasena, rol_id) VALUES (?, ?, ?, ?)';
  try {
    const [result] = await db.query(query, [nombre, correo, contrasena, rol_id]);
    res.json({ message: 'Usuario creado', id_usuario: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Actualizar usuario
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contrasena, rol_id } = req.body;
  const query = 'UPDATE usuario SET nombre = ?, correo = ?, contrasena = ?, rol_id = ? WHERE id_usuario = ?';
  try {
    await db.query(query, [nombre, correo, contrasena, rol_id, id]);
    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Eliminar usuario y registrar en historial
exports.delete = async (req, res) => {
  const { id } = req.params;
  const eliminado_por = null; // No autenticado

  try {
    const [rows] = await db.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    const usuario = rows[0];

    await db.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);

    const histQuery = `
      INSERT INTO historial_eliminacion 
      (entidad, id_entidad, nombre_entidad, eliminado_por, descripcion)
      VALUES (?, ?, ?, ?, ?)`;

    await db.query(histQuery, [
      'usuario',
      id,
      usuario.nombre,
      eliminado_por,
      'Eliminado sin autenticación'
    ]);

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente',
      registro_historial: {
        usuario_eliminado: usuario.nombre
      }
    });
  } catch (err) {
    console.error('Error al eliminar usuario o registrar historial:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
