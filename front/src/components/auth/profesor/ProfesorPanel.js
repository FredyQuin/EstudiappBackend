import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TemaModal from './TemaModal';

const ProfesorPanel = () => {
  const [temas, setTemas] = useState([]);
  const [periodos, setPeriodos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [temaActual, setTemaActual] = useState(null);

  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [temasRes, periodosRes, asignaturasRes] = await Promise.all([
          fetch('http://localhost:3001/api/temas', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:3001/api/periodos', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:3001/api/asignaturas', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (!temasRes.ok || !periodosRes.ok || !asignaturasRes.ok) {
          throw new Error('Error al cargar datos');
        }

        const [temasData, periodosData, asignaturasData] = await Promise.all([
          temasRes.json(),
          periodosRes.json(),
          asignaturasRes.json()
        ]);

        setTemas(temasData);
        setPeriodos(periodosData);
        setAsignaturas(asignaturasData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleSaveTema = async (data) => {
    try {
      const method = temaActual ? 'PUT' : 'POST';
      const url = temaActual
        ? `http://localhost:3001/api/temas/${temaActual.id_tema}`
        : 'http://localhost:3001/api/temas';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...data,
          profesor_id: usuario.id_usuario
        })
      });

      if (!res.ok) throw new Error('Error al guardar tema');

      const temaGuardado = await res.json();

      setTemas(prev =>
        temaActual
          ? prev.map(t => (t.id_tema === temaGuardado.id_tema ? temaGuardado : t))
          : [...prev, temaGuardado]
      );

      setIsModalOpen(false);
      setTemaActual(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar tema?')) return;

    try {
      const res = await fetch(`http://localhost:3001/api/temas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al eliminar tema');

      setTemas(prev => prev.filter(t => t.id_tema !== id));
      alert('Tema eliminado');
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="panel-container">
        <div className="loading-spinner" />
        <p>Cargando contenido...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-container">
        <h2>Error</h2>
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Reintentar
        </button>
      </div>
    );
  }

 return (
  <div className="panel-container">
    <h2>Panel del Profesor</h2>
    <p className="welcome-message">Bienvenido, {usuario?.nombre}</p>

    <button className="create-button" onClick={() => {
      setTemaActual(null);
      setIsModalOpen(true);
    }}>
      Crear Nuevo Tema
    </button>

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
                <td>{tema.periodo || 'Sin período'}</td>
                <td>{tema.asignatura || 'Sin asignatura'}</td>
                <td>
                  <button
                    onClick={() => {
                      setTemaActual(tema);
                      setIsModalOpen(true);
                    }}
                    className="create-button"
                  >
                    Editar
                  </button>
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

    <TemaModal
      isOpen={isModalOpen}
      onClose={() => {
        setIsModalOpen(false);
        setTemaActual(null);
      }}
      onSave={handleSaveTema}
      temaEditando={temaActual}
      periodos={periodos}
      asignaturas={asignaturas}
    />
  </div>
);

};

export default ProfesorPanel;
