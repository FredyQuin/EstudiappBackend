const db = require('../db');

const { authenticate, checkRole } = require('./auth');

// Middleware específico para admin que combina autenticación y verificación de rol
const authAdmin = [
  authenticate,
  checkRole([3]), // Solo rol 3 (admin)
  (req, res, next) => {

    next();
  }
];

module.exports = authAdmin;