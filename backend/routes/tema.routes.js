// routes/tema.routes.js
const express = require('express');
const router = express.Router();
const temaCtrl = require('../controllers/tema.controller');
const authAdmin = require('../middleware/authAdmin');

// Rutas públicas
router.get('/', temaCtrl.getAll);
router.get('/asignatura/:asignatura_id', temaCtrl.getByAsignatura);
router.get('/completo/:id', temaCtrl.getTemaCompleto);

// Rutas protegidas (requieren admin)
router.post('/', authAdmin, temaCtrl.create);
router.put('/:id', authAdmin, temaCtrl.update);
router.delete('/:id', authAdmin, temaCtrl.delete);

module.exports = router;