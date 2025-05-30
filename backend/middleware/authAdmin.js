const db = require('../db');

const authAdmin = (req, res, next) => {
  // Verifica en body, params, query y headers
  const id_usuario = req.body?.id_usuario || req.params?.id_usuario || 
                    req.query?.id_usuario || req.headers['x-user-id'];
  
  if (!id_usuario) {
    return res.status(400).json({ 
      error: 'Se requiere identificación de usuario',
      details: 'Debe proporcionar id_usuario en body, params, query o header x-user-id'
    });
  }

  const query = 'SELECT rol_id FROM usuario WHERE id_usuario = ?';
  db.query(query, [id_usuario], (err, result) => {
    if (err) return res.status(500).json({ error: 'Error del servidor al verificar permisos' });
    if (!result.length) return res.status(404).json({ error: 'Usuario no encontrado' });

    const rol_id = result[0].rol_id;
    // Verifica si el rol_id es 3 (admin) según tu estructura actual
    if (rol_id !== 3) return res.status(403).json({ 
      error: 'Acceso no autorizado',
      details: 'Se requieren privilegios de administrador'
    });

    // Almacena información del usuario para uso posterior
    req.user = {
      id: id_usuario,
      rol: rol_id
    };
    
    next();
  });
};

module.exports = authAdmin;