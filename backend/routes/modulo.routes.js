const express = require('express');
const router = express.Router();
const moduloCtrl = require('../controllers/modulo.controller');


// Rutas públicas (no requieren admin)
router.get('/', moduloCtrl.getAll);
router.get('/profesor/:profesor_id', moduloCtrl.getByProfesor);
router.get('/completo/:id', moduloCtrl.getModuloCompleto);

// Rutas protegidas (requieren admin)
router.post('/', moduloCtrl.create);
router.put('/:id', moduloCtrl.update);
router.delete('/:id', moduloCtrl.delete);

module.exports = router;