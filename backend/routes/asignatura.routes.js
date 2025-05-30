// routes/asignatura.routes.js
const express = require('express');
const router = express.Router();
const asignaturaCtrl = require('../controllers/asignatura.controller');
const authAdmin = require('../middleware/authAdmin');

// Rutas públicas
router.get('/', asignaturaCtrl.getAll);
router.get('/modulo/:modulo_id', asignaturaCtrl.getByModulo);
router.get('/completa/:id', asignaturaCtrl.getAsignaturaCompleta);

// Rutas protegidas (requieren admin)
router.post('/', authAdmin, asignaturaCtrl.create);
router.put('/:id', authAdmin, asignaturaCtrl.update);
router.delete('/:id', authAdmin, asignaturaCtrl.delete);

module.exports = router;