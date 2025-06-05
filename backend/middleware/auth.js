// middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../db');

const secret = process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro';

// Middleware general de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 
  
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }


    db.query('SELECT id_usuario, rol_id FROM usuario WHERE id_usuario = ?', [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al verificar usuario' });
      if (!results.length) return res.status(404).json({ error: 'Usuario no encontrado' });


      req.user = {
        id: results[0].id_usuario,
        rol: results[0].rol_id
      };
      
      next();
    });
  });
};

// Middleware para verificar roles específicos
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      console.log('Usuario no autenticado al llegar a checkRole');
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!roles.includes(req.user.rol)) {
      console.log(`Rol ${req.user.rol} no autorizado. Requiere: ${roles}`);
      return res.status(403).json({ 
        error: 'Acceso no autorizado',
        requiredRoles: roles,
        currentRole: req.user.rol
      });
    }

    console.log(`Usuario autenticado con rol: ${req.user.rol}`);
    next();
  };
};


module.exports = {
  authenticate,
  checkRole,
  secret
};