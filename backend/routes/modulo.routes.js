const express = require('express');
const router = express.Router();
const moduloCtrl = require('../controllers/modulo.controller');
const authAdmin = require('../middleware/authAdmin');

// Rutas públicas (no requieren admin)
router.get('/', moduloCtrl.getAll);
router.get('/profesor/:profesor_id', moduloCtrl.getByProfesor);
router.get('/completo/:id', moduloCtrl.getModuloCompleto);

// Rutas protegidas (requieren admin)
router.post('/', authAdmin, moduloCtrl.create);
router.put('/:id', authAdmin, moduloCtrl.update);
router.delete('/:id', authAdmin, moduloCtrl.delete);

module.exports = router;