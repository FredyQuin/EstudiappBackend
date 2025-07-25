// controllers/authController.js
const db = require('../db');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET;

// ==================== REGISTRO ====================
exports.register = async (req, res) => {
  const { nombre, correo, contrasena, rol_id } = req.body;

  // Validar campos básicos
  if (!nombre || !correo || !contrasena || !rol_id) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  try {
    const result = await db.query(
      `INSERT INTO usuario (nombre, correo, contrasena, rol_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nombre, correo, rol_id`,
      [nombre, correo, contrasena, rol_id]
    );

    const newUser = result.rows[0];

    // Crear token JWT
    const token = jwt.sign(
      { id: newUser.id_usuario, rol: newUser.rol_id },
      secret,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: '✅ Usuario registrado exitosamente',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Error en registro:', err);

    // Manejo de error por correo duplicado
    if (err.code === '23505') {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// ==================== LOGIN ====================
exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    const result = await db.query(
      `SELECT id_usuario, nombre, correo, contrasena, rol_id
       FROM usuario WHERE correo = $1`,
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = result.rows[0];

    // 👇 Aquí deberías usar bcrypt para comparar contraseñas encriptadas.
    if (user.contrasena !== contrasena) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol_id },
      secret,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: '✅ Login exitoso',
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
    