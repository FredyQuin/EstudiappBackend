import { useEffect, useState } from "react";
import "./EstudiantePanel.css";
import { Link } from "react-router-dom";

const EstudiantePanel = () => {
  const [temas, setTemas] = useState([]);
  const [error, setError] = useState(null);
  const [temaActivo, setTemaActivo] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTemas = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/temas", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("No se pudo cargar los temas");

        const data = await res.json();
        const temasPrimerPeriodo = data.filter(t =>
          t.periodo?.toLowerCase().includes("primer")
        );
        setTemas(temasPrimerPeriodo);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los temas");
      }
    };

    fetchTemas();
  }, [token]);

  const handleVerContenido = async (id_tema) => {
    if (temaActivo?.id_tema === id_tema) {
      setTemaActivo(null);
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3001/api/contenido-tema/${id_tema}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("No se pudo obtener el contenido");

      const contenido = await res.json();
      console.log("Contenido recibido:", contenido);

      setTemaActivo({ id_tema, contenido });
    } catch (err) {
      console.error(err);
      alert("Error al obtener contenido del tema");
    }
  };

  return (
    <div className="panel-container estudiante-panel">
      <h2>Bienvenido al Panel del Estudiante</h2>
      <p>Temas disponibles del primer trimestre</p>

      {error && <p className="error-message">{error}</p>}

      <div className="grid-temas">
        {temas.map((tema) => (
          <div className="tema-card" key={tema.id_tema}>
            <h3>{tema.titulo}</h3>
            <p>{tema.descripcion}</p>
            <button
              className="ver-button"
              onClick={() => handleVerContenido(tema.id_tema)}
            >
              {temaActivo?.id_tema === tema.id_tema
                ? "Ocultar"
                : "Ver Contenido"}
            </button>

            {temaActivo?.id_tema === tema.id_tema && (
              <div className="contenido-tema">
                {Array.isArray(temaActivo.contenido) &&
                temaActivo.contenido.length > 0 ? (
                  temaActivo.contenido.map((seccion, i) => (
                    <div key={i} className="seccion-tema">
                      <h4>{seccion.titulo_seccion}</h4>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: seccion.contenido_largo,
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <p>No hay contenido disponible para este tema.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Link to="/" className="logout-link">
        Cerrar sesión
      </Link>
    </div>
  );
};

export default EstudiantePanel;
