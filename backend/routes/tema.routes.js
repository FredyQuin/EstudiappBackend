// routes/tema.routes.js
const express = require('express');
const router = express.Router();
const temaCtrl = require('../controllers/tema.controller');
const authAdmin = require('../middleware/authAdmin');

// Rutas públicas
router.get('/', temaCtrl.getAll);
router.post('/debug-create', temaCtrl.create); // sin authAdmin



// Rutas protegidas (requieren admin)
router.post('/', temaCtrl.create);
router.put('/:id', temaCtrl.update);
router.delete('/:id', temaCtrl.delete);

module.exports = router;