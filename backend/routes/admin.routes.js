// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const adminController = require('../controllers/adminController');

router.get('/dashboard', authAdmin, adminController.getDashboard);


module.exports = router;