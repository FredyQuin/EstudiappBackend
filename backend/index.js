const cors = require('cors');
const db = require('./db');
const express = require('express');
const app = express();


// Middlewares esenciales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({  
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'x-user-id']
}));


// Rutas
const usuarioRouter = require('./routes/usuario.routes');
app.use('/api/usuarios', usuarioRouter);

const moduloRoutes = require('./routes/modulo.routes');
app.use('/api/modulos', moduloRoutes); // ← Exactamente así

const asignaturaRoutes = require('./routes/asignatura.routes');
app.use('/api/asignaturas', asignaturaRoutes);
// ... otras rutas ...
const periodoRoutes = require('./routes/periodo.routes');
app.use('/api/periodos', periodoRoutes);

const temaRoutes = require('./routes/tema.routes');
app.use('/api/temas', temaRoutes);

app.listen(3001, () => {
  console.log('Servidor backend corriendo en puerto 3001');
});

//actualizacion
