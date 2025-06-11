// routes/contenidotema.routes.js
const express = require('express');
const router = express.Router();
const contenidoCtrl = require('../controllers/contenidotema.controller');

// Ruta para obtener el contenido por tema
router.get('/:temaId', contenidoCtrl.getByTemaId);

// (Opcional) Si deseas exponer la creación o eliminación desde frontend
// router.post('/', contenidoCtrl.createSecciones); // Normalmente usado solo internamente
// router.delete('/:temaId', contenidoCtrl.deleteByTemaId); // También opcional

module.exports = router;
