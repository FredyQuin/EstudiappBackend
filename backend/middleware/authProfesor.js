// middleware/authProfesor.js
const { authenticate, checkRole } = require('./auth');

const authProfesor = [
  authenticate,
  checkRole([1, 3]), // Rol 1 (profesor) y 3 (admin)
  (req, res, next) => {
    // Lógica adicional para profesores si es necesario
    next();
  }
];

module.exports = authProfesor;  