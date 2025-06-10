const express = require('express');
const router = express.Router();
const usuarioCtrl = require('../controllers/usuario.controller');


// Todas las rutas requieren autenticación de admin


router.get('/', (req, res) => {
  // Ahora puedes acceder a req.user.id (del middleware)
  usuarioCtrl.getAll(req, res);
});

router.post('/', usuarioCtrl.create);
router.put('/:id', usuarioCtrl.update);
router.delete('/:id', usuarioCtrl.delete);

module.exports = router;