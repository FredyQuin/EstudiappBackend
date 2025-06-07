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
        
        // Obtener temas del profesor
        const temasResponse = await fetch('http://localhost:3001/api/profesor/temas', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!temasResponse.ok) {
          throw new Error('Error al obtener temas');
        }
        
        const temasData = await temasResponse.json();
        setTemas(temasData);
        
        // Obtener periodos disponibles
        const periodosResponse = await fetch('http://localhost:3001/api/periodos', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!periodosResponse.ok) {
          throw new Error('Error al obtener periodos');
        }
        
        const periodosData = await periodosResponse.json();
        setPeriodos(periodosData);
        
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear tema');
      }

      const nuevoTema = await response.json();
      setTemas([...temas, nuevoTema]);
      setFormData({
        titulo: '',
        descripcion: '',
        periodo_id: ''
      });
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar tema');
      }

      setTemas(temas.filter(tema => tema.id_tema !== id));
      alert('Tema eliminado correctamente');
      
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="panel-container">
        <div className="loading-spinner"></div>
        <p>Cargando contenido...</p>
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