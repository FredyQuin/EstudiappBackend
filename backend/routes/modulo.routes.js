const express = require('express');
const router = express.Router();
const moduloCtrl = require('../controllers/modulo.controller');
const { authenticate, checkRole } = require('../middleware/auth');

// 👨‍🎓 Estudiantes pueden ver módulos sin necesidad de autenticación
router.get('/', moduloCtrl.getAll);
router.get('/profesor/:profesor_id', moduloCtrl.getByProfesor);
router.get('/completo/:id', moduloCtrl.getModuloCompleto);

// 👨‍🏫 Profesores y 👨‍💼 Administradores pueden crear
router.post('/', authenticate, checkRole([1, 3]), moduloCtrl.create);

// 👨‍🏫 Profesores y 👨‍💼 Administradores pueden editar
router.put('/:id', authenticate, checkRole([1, 3]), moduloCtrl.update);

// 👨‍🏫 Profesores y 👨‍💼 Administradores pueden eliminar
router.delete('/:id', authenticate, checkRole([1, 3]), moduloCtrl.delete);

module.exports = router;
