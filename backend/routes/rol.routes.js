const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Obtener todos los usuarios
router.get('/', usuarioController.getAll);

// Crear nuevo usuario
router.post('/', usuarioController.create);

// Actualizar usuario
router.put('/:id', usuarioController.update); // Ruta para actualizar un usuario

// Eliminar usuario
router.delete('/:id', usuarioController.delete);

module.exports = router;
