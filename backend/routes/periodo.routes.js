// routes/periodo.routes.js
const express = require('express');
const router = express.Router();
const periodoCtrl = require('../controllers/periodo.controller');
const authAdmin = require('../middleware/authAdmin');

// Rutas públicas
router.get('/', periodoCtrl.getAll);
router.get('/asignatura/:asignatura_id', periodoCtrl.getByAsignatura);
router.get('/completo/:id', periodoCtrl.getPeriodoCompleto);

// Rutas protegidas (requieren admin)
router.post('/', authAdmin, periodoCtrl.create);
router.put('/:id', authAdmin, periodoCtrl.update);
router.delete('/:id', authAdmin, periodoCtrl.delete);

module.exports = router;