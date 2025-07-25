// controllers/authController.js
const db = require('../db');
const { secret } = require('../middleware/auth'); // ojo la ruta
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// =============================================
// REGISTRO DE USUARIO
// =============================================
exports.register = async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol_id } = req.body;

    // Validar campos básicos
    if (!nombre || !correo || !contrasena || !rol_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si ya existe ese correo
    const [existing] = await db.query('SELECT id_usuario FROM usuario WHERE correo = ?', [correo]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar en la base de datos
    const [result] = await db.query(
      'INSERT INTO usuario (nombre, correo, contrasena, rol_id) VALUES (?, ?, ?, ?)',
      [nombre, correo, hashedPassword, rol_id]
    );

    // Generar token JWT
    const token = jwt.sign(
      { id: result.insertId, rol: rol_id },
      secret,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      token,
      user: {
        id: result.insertId,
        nombre,
        correo,
        rol: rol_id
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
