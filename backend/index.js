// index.js (Backend principal)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Importar middlewares de autenticación
const { authenticate, checkRole, secret } = require('./middleware/auth');

// Importar rutas
const usuarioRoutes = require('./routes/usuario.routes');
const moduloRoutes = require('./routes/modulo.routes');
const asignaturaRoutes = require('./routes/asignatura.routes');
const temaRoutes = require('./routes/tema.routes');
const periodoRoutes = require('./routes/periodo.routes');
const historialRoutes = require('./routes/historial.routes');

// Endpoint de Login 
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [results] = await db.query(
      'SELECT id_usuario, nombre, correo, rol_id FROM usuario WHERE correo = ? AND contrasena = ?',
      [correo, contrasena]
    );

    if (!results.length) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = results[0];
    
    // Crear token JWT
    const token = jwt.sign(
      {
        id: user.id_usuario,
        rol: user.rol_id
      },
      secret,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Autenticación exitosa',
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol_id // 1=profesor, 2=estudiante, 3=admin
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Endpoint para verificar token y rol
app.get('/api/auth/verify', authenticate, (req, res) => {
  res.json({
    user: req.user,
    message: 'Token válido',
    permissions: {
      isAdmin: req.user.rol === 3,
      isProfesor: req.user.rol === 1,
      isEstudiante: req.user.rol === 2
    }
  });
});

// Endpoint protegido de ejemplo para admin
app.get('/api/admin/test', authenticate, checkRole([3]), (req, res) => {
  res.json({ message: 'Esta es una ruta solo para administradores' });
});

// Endpoint protegido de ejemplo para profesor
app.get('/api/profesor/test', authenticate, checkRole([1, 3]), (req, res) => {
  res.json({ message: 'Esta es una ruta para profesores y administradores' });
});

// Endpoint protegido de ejemplo para estudiante
app.get('/api/estudiante/test', authenticate, checkRole([2]), (req, res) => {
  res.json({ message: 'Esta es una ruta solo para estudiantes' });
});

// Registrar rutas
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/modulos', require('./routes/modulo.routes'));
app.use('/api/asignaturas', require('./routes/asignatura.routes'));
app.use('/api/temas', require('./routes/tema.routes'));
app.use('/api/periodos', require('./routes/periodo.routes'));
app.use('/api/historial', historialRoutes);


// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});