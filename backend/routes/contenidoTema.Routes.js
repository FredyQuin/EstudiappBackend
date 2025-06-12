const express = require('express');
const router = express.Router();
const contenidoCtrl = require('../controllers/contenidoTema.controller');


// Ruta para obtener el contenido de un tema por su ID
router.get('/:temaId', contenidoCtrl.getByTemaId);

module.exports = router;
