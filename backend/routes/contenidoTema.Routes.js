const express = require('express');
const router = express.Router();
const contenidoCtrl = require('../controllers/contenidotema.controller');

// Ruta GET para obtener contenido por tema
router.get('/:temaId', contenidoCtrl.getByTemaId);

module.exports = router;
