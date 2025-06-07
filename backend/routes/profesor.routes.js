const express = require('express');
const router = express.Router();
const authProfesor = require('../middleware/authProfesor');
const profesorController = require('../controllers/professor.controller');

// Obtener todos los temas creados por el profesor
router.get('/temas', authProfesor, profesorController.getTemas);

// Crear nuevo tema
router.post('/temas', authProfesor, profesorController.createTema);

// Eliminar tema
router.delete('/temas/:id', authProfesor, profesorController.deleteTema);

module.exports = router;1