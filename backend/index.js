const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', 
  database: 'estudiapp'
});

// Endpoint Login
app.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;
  const query = `
    SELECT u.id_usuario, u.nombre, r.nombre AS rol
    FROM usuario u
    JOIN rol r ON u.rol_id = r.id_rol
    WHERE u.correo = ? AND u.contrasena = ?
  `;
  db.query(query, [correo, contrasena], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error del servidor' });
    if (results.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });
    res.json(results[0]);
  });
});

// Endpoint para obtener contenido general (por ejemplo, para profesor)
app.get('/contenido/:id_usuario', (req, res) => {
  const { id_usuario } = req.params;
  const query = `
    SELECT 
      m.id_modulo, m.nombre AS modulo_nombre,
      a.id_asignatura, a.nombre AS asignatura_nombre, a.competencia,
      t.id_tema, t.titulo AS tema_titulo, t.descripcion,
      e.id_evaluacion, e.tipo, e.titulo AS evaluacion_titulo, e.instrucciones, e.fecha
    FROM estudiante est
    JOIN usuario u ON est.id_estudiante = u.id_usuario
    JOIN modulo m ON 1=1
    JOIN asignatura a ON a.modulo_id = m.id_modulo
    LEFT JOIN tema t ON t.asignatura_id = a.id_asignatura
    LEFT JOIN evaluacion e ON e.modulo_id = m.id_modulo
    WHERE u.id_usuario = ?
  `;
  db.query(query, [id_usuario], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error del servidor' });
    res.json(results);
  });
});

// Nuevo endpoint para obtener el detalle de un módulo (usable por profesores)
app.get('/modulo/:id_modulo', (req, res) => {
  const { id_modulo } = req.params;
  const query = `
    SELECT 
      m.id_modulo, m.nombre AS modulo_nombre,
      p.id_periodo, p.nombre AS periodo_nombre, p.fecha_inicio, p.fecha_fin,
      a.nombre AS asignatura_nombre,
      t.id_tema, t.titulo AS tema_titulo, t.descripcion
    FROM modulo m
    JOIN asignatura a ON a.modulo_id = m.id_modulo
    JOIN periodo p ON p.asignatura_id = a.id_asignatura
    LEFT JOIN tema t ON t.asignatura_id = a.id_asignatura
    WHERE m.id_modulo = ?
    ORDER BY p.id_periodo, t.id_tema
  `;
  db.query(query, [id_modulo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener el módulo' });
    if (results.length === 0) return res.status(404).json({ error: 'Módulo no encontrado' });
      
    const moduloDetalle = {
      id_modulo: results[0].id_modulo,
      nombre: results[0].modulo_nombre,
      periodos: []
    };

    results.forEach(row => {
      let periodo = moduloDetalle.periodos.find(p => p.id_periodo === row.id_periodo);
      if (!periodo) {
        periodo = {
          id_periodo: row.id_periodo,
          nombre: row.periodo_nombre,
          fecha_inicio: row.fecha_inicio,
          fecha_fin: row.fecha_fin,
          asignatura_nombre: row.asignatura_nombre,
          temas: []
        };
        moduloDetalle.periodos.push(periodo);
      }
      if (row.id_tema && !periodo.temas.some(t => t.id_tema === row.id_tema)) {
        periodo.temas.push({
          id_tema: row.id_tema,
          titulo: row.tema_titulo,
          descripcion: row.descripcion
        });
      }
    });

    res.json(moduloDetalle);
  });
});

app.listen(3001, () => {
  console.log('Servidor backend corriendo en puerto 3001');
});
