const express = require('express');
const router = express.Router();
const contenidoTemaController = require('../controllers/contenidoTemaController');

router.get('/:tema_id', contenidoTemaController.getContenidoPorTema);

module.exports = router;
