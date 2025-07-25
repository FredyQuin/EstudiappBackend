// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController'); // 👈 asegúrate de que esta ruta exista y esté bien escrita

// Ruta de registro
router.post('/register', authController.register);

// Ruta de login (si quieres)
router.post('/login', authController.login);

module.exports = router;
