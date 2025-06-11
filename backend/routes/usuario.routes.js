const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuario.controller');

// Rutas públicas sin autenticación
router.get('/', usuarioCtrl.getAll);
router.post('/', usuarioCtrl.create);
router.put('/:id', usuarioCtrl.update);
router.delete('/:id', usuarioCtrl.delete);

module.exports = router;
