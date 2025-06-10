// historial.routes.js
const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historial.controller');

router.get('/', historialController.obtenerHistorial);

module.exports = router;
