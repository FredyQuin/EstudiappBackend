// index.js (Backend principal)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');


// Configuración inicial
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET; // ✅ Usa una sola constante

// Middlewares globales
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Importar middlewares de autenticación
const { authenticate, checkRole } = require('./middleware/auth');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const moduloRoutes = require('./routes/modulo.routes');
const asignaturaRoutes = require('./routes/asignatura.routes');
const temaRoutes = require('./routes/tema.routes');
const periodoRoutes = require('./routes/periodo.routes');
const historialRoutes = require('./routes/historial.routes');
const contenidoTemaRoutes = require('./routes/contenidoTema.routes');

// ==============================
// Endpoint de Login (temporal aquí, pero ideal moverlo a auth.routes)
// ==============================
app.post('/api/auth/login', async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    // 1. Buscar por correo
    const result = await db.query(
      'SELECT id_usuario, nombre, correo, contrasena, rol_id FROM usuario WHERE correo = $1',
      [correo]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const user = result.rows[0];

    // 2. Comparar contraseñas
    const esValida = await bcrypt.compare(contrasena, user.contrasena);
    if (!esValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // 3. Crear token
    const token = jwt.sign(
      { id: user.id_usuario, rol: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Autenticación exitosa',
      token,
      user: {
        id: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol_id
      }
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});


// ==============================
// Endpoint para verificar token y rol
// ==============================
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

// ==============================
// Endpoints protegidos de ejemplo
// ==============================
app.get('/api/admin/test', authenticate, checkRole([3]), (req, res) => {
  res.json({ message: 'Ruta solo para administradores' });
});

app.get('/api/profesor/test', authenticate, checkRole([1, 3]), (req, res) => {
  res.json({ message: 'Ruta para profesores y administradores' });
});

app.get('/api/estudiante/test', authenticate, checkRole([2]), (req, res) => {
  res.json({ message: 'Ruta solo para estudiantes' });
});

// ==============================
// Registrar rutas
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/modulos', moduloRoutes);
app.use('/api/asignaturas', asignaturaRoutes);
app.use('/api/temas', temaRoutes);
app.use('/api/periodos', periodoRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/contenido', contenidoTemaRoutes);

// ==============================
// Manejo de errores
// ==============================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ==============================
// Iniciar servidor
// ==============================
app.listen(PORT, () => {
  console.log(`✅ Servidor backend corriendo en http://localhost:${PORT}`);
});
