// routes/asignatura.routes.js
const express = require('express');
const router = express.Router();
const asignaturaCtrl = require('../controllers/asignatura.controller');

// Rutas públicas
router.get('/', asignaturaController.getAll);
router.get('/modulo/:modulo_id', asignaturaCtrl.getByModulo);
router.get('/completa/:id', asignaturaCtrl.getAsignaturaCompleta);


router.post('/', asignaturaCtrl.create);
router.put('/:id', asignaturaCtrl.update);
router.delete('/:id', asignaturaCtrl.delete);

module.exports = router;