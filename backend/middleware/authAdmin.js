const db = require('../db');

// middleware/authAdmin.js
const { authenticate, checkRole } = require('./auth');

// Middleware específico para admin que combina autenticación y verificación de rol
const authAdmin = [
  authenticate,
  checkRole([3]), // Solo rol 3 (admin)
  (req, res, next) => {
    // Puedes añadir lógica adicional específica para admin aquí
    next();
  }
];

module.exports = authAdmin;