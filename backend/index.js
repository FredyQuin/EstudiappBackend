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


app.listen(3001, () => {
  console.log('Servidor backend corriendo en puerto 3001');
});
