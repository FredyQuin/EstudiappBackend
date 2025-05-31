// routes/profesor.routes.js
const express = require('express');
const router = express.Router();
const authProfesor = require('../middleware/authProfesor');
const profesorController = require('../controllers/profesorController');

router.get('/modulos', authProfesor, profesorController.getModulos);
// ... otras rutas profesor

module.exports = router;