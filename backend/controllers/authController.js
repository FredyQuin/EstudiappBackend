// controllers/authController.js
const db = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const secret = process.env.JWT_SECRET;

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
    const existing = await db.query('SELECT id_usuario FROM usuario WHERE correo = $1', [correo]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'El correo ya está registrado' });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Insertar en la base de datos
    const insertResult = await db.query(
      'INSERT INTO usuario (nombre, correo, contrasena, rol_id) VALUES ($1, $2, $3, $4) RETURNING id_usuario',
      [nombre, correo, hashedPassword, rol_id]
    );

    const newUserId = insertResult.rows[0].id_usuario;

    // Generar token JWT
    const token = jwt.sign(
      { id: newUserId, rol: rol_id },
      secret,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      token,
      user: {
        id: newUserId,
        nombre,
        correo,
        rol_id
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// =============================================
// LOGIN DE USUARIO
// =============================================
// LOGIN DE USUARIO
exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    // Buscar el usuario solo por correo
    const result = await db.query(
      'SELECT id_usuario, nombre, correo, contrasena, rol_id FROM usuario WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    // Comparar la contraseña con bcrypt
    const validPassword = await bcrypt.compare(contrasena, user.contrasena);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol_id },
      secret,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol_id: user.rol_id
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

