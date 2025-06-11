// controllers/authController.js
const db = require('../db');
const { secret } = require('./auth');
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  db.query(
    'SELECT id_usuario, nombre, correo, rol_id FROM usuario WHERE correo = ? AND contrasena = ?',
    [correo, contrasena],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Error en el servidor' });
      if (results.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });

      const user = results[0];
      
      // Crear token JWT
      const token = jwt.sign(
        {
          id: user.id_usuario,
          rol: user.rol_id
        },
        secret,
        { expiresIn: '8h' }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id_usuario,
          nombre: user.nombre,
          correo: user.correo,
          rol: user.rol_id
        }
      });
    }
  );
};

exports.verifyToken = (req, res) => {
  // El middleware ya verificó el token
  res.json({
    user: req.user,
    message: 'Token válido'
  });
};