// middleware/authEstudiante.js
const { authenticate, checkRole } = require('./auth');

const authEstudiante = [
  authenticate,
  checkRole([2]), // Solo rol 2 (estudiante)
  (req, res, next) => {
    // Lógica adicional para estudiantes si es necesario
    next();
  }
];

module.exports = authEstudiante;