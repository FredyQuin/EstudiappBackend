const db = require('../db');

// Obtener todos los roles
exports.getAll = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM rol'); 
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

// Crear nuevo rol
exports.create = async (req, res) => {
  const { nombre } = req.body; 
  const query = 'INSERT INTO rol (nombre) VALUES (?)';
  try {
    const [result] = await db.query(query, [nombre]);
    res.json({ message: 'Rol creado', id_rol: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear rol' });
  }
};

// Actualizar rol
exports.update = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body; 
  const query = 'UPDATE rol SET nombre = ? WHERE id_rol = ?';
  try {
    await db.query(query, [nombre, id]);
    res.json({ message: 'Rol actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

// Eliminar rol
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM rol WHERE id_rol = ?', [id]);
    res.json({ message: 'Rol eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
};
