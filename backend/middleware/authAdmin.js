const db = require('../db');

const authAdmin = (req, res, next) => {
  // Obtiene el ID de admin de headers, query o body
  const id_usuario = req.headers['x-user-id'] || req.query.id_usuario || req.body.id_usuario;
  
  if (!id_usuario) {
    return res.status(400).json({ 
      error: 'Se requiere identificación de administrador',
      detalles: 'Agrega el header x-user-id con el ID del admin'
    });
  }

  const query = 'SELECT rol_id FROM usuario WHERE id_usuario = ?';
  db.query(query, [id_usuario], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error al verificar permisos' });
    if (!result.length) return res.status(404).json({ error: 'Administrador no encontrado' });
    
    // Verifica si es admin (rol_id = 3 según tu estructura)
    if (result[0].rol_id !== 3) {
      return res.status(403).json({ error: 'Se requieren privilegios de administrador' });
    }
    
    // Adjunta el ID del admin al request para usarlo en los controladores
    req.admin_id = id_usuario;
    next();
  });
};

module.exports = authAdmin;