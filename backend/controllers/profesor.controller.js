import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ProfesorPanel = () => {
  const [temas, setTemas] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    periodo_id: ''
  });
  
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  // Obtener temas del profesor y periodos disponibles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 1. Verificar token y usuario
        if (!token || !usuario) {
          throw new Error('No se encontró token de autenticación o información de usuario');
        }
        
        // 2. Obtener temas del profesor
        const temasResponse = await fetch('http://localhost:3001/api/profesor/temas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Depuración: mostrar estado y respuesta
        console.log('[DEBUG] Estado respuesta temas:', temasResponse.status);
        const temasText = await temasResponse.text();
        console.log('[DEBUG] Texto respuesta temas:', temasText);
        
        if (!temasResponse.ok) {
          throw new Error(`Error al obtener temas: ${temasResponse.status} ${temasResponse.statusText}`);
        }
        
        const temasData = JSON.parse(temasText);
        setTemas(temasData);
        
        // 3. Obtener periodos disponibles
        const periodosResponse = await fetch('http://localhost:3001/api/periodos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Depuración: mostrar estado y respuesta
        console.log('[DEBUG] Estado respuesta periodos:', periodosResponse.status);
        const periodosText = await periodosResponse.text();
        console.log('[DEBUG] Texto respuesta periodos:', periodosText);
        
        if (!periodosResponse.ok) {
          throw new Error(`Error al obtener periodos: ${periodosResponse.status} ${periodosResponse.statusText}`);
        }
        
        const periodosData = JSON.parse(periodosText);
        setPeriodos(periodosData);
        
      } catch (error) {
        console.error('Error en fetchData:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, usuario]); // Agregado usuario como dependencia

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validar datos antes de enviar
      if (!formData.titulo.trim() || !formData.descripcion.trim() || !formData.periodo_id) {
        throw new Error('Todos los campos son obligatorios');
      }
      
      const response = await fetch('http://localhost:3001/api/profesor/temas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          profesor_id: usuario.id_usuario
        })
      });

      // Depuración de la respuesta
      const responseText = await response.text();
      console.log('[DEBUG] Respuesta crear tema:', response.status, responseText);
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || `Error ${response.status} al crear tema`);
        } catch (e) {
          throw new Error(responseText || `Error ${response.status} al crear tema`);
        }
      }

      const nuevoTema = JSON.parse(responseText);
      setTemas([...temas, nuevoTema]);
      setFormData({
        titulo: '',
        descripcion: '',
        periodo_id: ''
      });
      
      alert('Tema creado exitosamente!');
      
    } catch (error) {
      console.error('Error al crear tema:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este tema?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/profesor/temas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Depuración de la respuesta
      const responseText = await response.text();
      console.log('[DEBUG] Respuesta eliminar tema:', response.status, responseText);
      
      if (!response.ok) {
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.message || `Error ${response.status} al eliminar tema`);
        } catch (e) {
          throw new Error(responseText || `Error ${response.status} al eliminar tema`);
        }
      }

      setTemas(temas.filter(tema => tema.id_tema !== id));
      alert('Tema eliminado correctamente');
      
    } catch (error) {
      console.error('Error al eliminar tema:', error);
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="panel-container">
        <h2>Cargando...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-container">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
        <p>Nota: Revisa la consola para más detalles de depuración</p>
      </div>
    );
  }

  return (
    <div className="panel-container">
      <h2>Panel del Profesor</h2>
      <p className="welcome-message">Bienvenido, {usuario?.nombre}</p>

      <div className="form-container">
        <h3>Crear Nuevo Tema</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="titulo"
            placeholder="Título del tema"
            value={formData.titulo}
            onChange={handleInputChange}
            required
          />
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={handleInputChange}
            required
          />
          <select
            name="periodo_id"
            value={formData.periodo_id}
            onChange={handleInputChange}
            required
          >
            <option value="">Seleccione un período</option>
            {periodos.map(periodo => (
              <option key={periodo.id_periodo} value={periodo.id_periodo}>
                {periodo.nombre} - {periodo.asignatura?.nombre}
              </option>
            ))}
          </select>
          <button type="submit" className="create-button">Crear Tema</button>
        </form>
      </div>

      <div className="temas-list">
        <h3>Tus Temas</h3>
        {temas.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Periodo</th>
                <th>Asignatura</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {temas.map(tema => (
                <tr key={tema.id_tema}>
                  <td>{tema.titulo}</td>
                  <td>{tema.descripcion}</td>
                  <td>{tema.periodo_nombre}</td>
                  <td>{tema.asignatura_nombre}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(tema.id_tema)}
                      className="delete-button"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-content-message">No has creado ningún tema aún.</p>
        )}
      </div>

      <Link to="/" className="logout-link">Cerrar Sesión</Link>
    </div>
  );
};

export default ProfesorPanel;