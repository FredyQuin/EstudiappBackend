import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Link,
  useParams,
} from "react-router-dom";
import "./App.css";

/** ------------------------------
 *  COMPONENTES INDIVIDUALES
 *  ------------------------------ **/

/* ====== LOGIN ====== */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("usuario", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        switch (data.user.rol) {
          case 1:
            navigate("/profesor");
            break;
          case 2:
            navigate("/estudiante");
            break;
          case 3:
            navigate("/admin");
            break;
          default:
            alert("Rol no reconocido");
            navigate("/");
        }
      } else {
        alert(data.error || "Error de autenticación");
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      alert("No se pudo conectar al servidor");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="left-panel">
          <img src="/logo.png" alt="EstudiApp Logo" className="logo-image" />
          <h2>Bienvenido a EstudiApp</h2>
          <p>Tu plataforma integral para el aprendizaje y desarrollo personal.</p>
        </div>
        <div className="right-panel">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Iniciar Sesión</button>
          </form>
          <div className="extra-links">
            <span>
              ¿Eres nuevo? <Link to="/registro">Regístrate aquí</Link>
            </span>
            <span>
              <Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ====== PROTECTED ROUTE ====== */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) {
      navigate("/");
    } else if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
      navigate("/no-autorizado");
    }
  }, [usuario, navigate, allowedRoles]);

  if (!usuario || (allowedRoles && !allowedRoles.includes(usuario.rol))) {
    return null;
  }

  return children;
};

/* ====== PANEL DE ADMIN ====== */
const AdminPanel = () => {
  const [historial, setHistorial] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3001/api/admin/historial", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistorial(data))
      .catch((err) => console.error("Error al cargar historial:", err));
  }, [token]);

  useEffect(() => {
    fetch("http://localhost:3001/api/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, [token]);

  const handleEliminarUsuario = (idUsuario) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    fetch(`http://localhost:3001/api/usuarios/${idUsuario}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setUsuarios((prev) => prev.filter((u) => u.id_usuario !== idUsuario));
          alert("Usuario eliminado correctamente");
        } else {
          alert("Error al eliminar usuario");
        }
      })
      .catch((err) => console.error(err));
  };

  // FILTRAR USUARIOS POR BÚSQUEDA (nombre o correo)
  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="panel-container">
      <h2>Panel de Administración</h2>

      <input
        type="text"
        placeholder="Buscar usuarios por nombre o correo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: "20px", padding: "8px", width: "300px" }}
      />

      <h3>Usuarios Registrados</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((u) => (
            <tr key={u.id_usuario}>
              <td>{u.id_usuario}</td>
              <td>{u.nombre}</td>
              <td>{u.correo}</td>
              <td>
                {u.rol_id === 1
                  ? "Profesor"
                  : u.rol_id === 2
                  ? "Estudiante"
                  : u.rol_id === 3
                  ? "Admin"
                  : "Desconocido"}
              </td>
              <td>
                <button
                  onClick={() => handleEliminarUsuario(u.id_usuario)}
                  style={{
                    background: "#E74C3C",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ margin: "40px 0" }} />

      {/* Historial */}
      <h3>Historial de Eliminaciones</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>Acción</th>
            <th>Elemento</th>
            <th>Fecha</th>
            <th>Usuario</th>
          </tr>
        </thead>
        <tbody>
          {historial.map((h, i) => (
            <tr key={i}>
              <td>{h.accion}</td>
              <td>{h.elemento}</td>
              <td>{new Date(h.fecha).toLocaleString()}</td>
              <td>{h.usuario_nombre}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


/* ====== PANEL DE PROFESOR ====== */
const ProfesorPanel = () => {
  const [contenido, setContenido] = useState([]); // Lista de temas con info de módulo/periodo
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [newTitulo, setNewTitulo] = useState("");
  const [newDescripcion, setNewDescripcion] = useState("");
  const [newPeriodoId, setNewPeriodoId] = useState("");
  const [periodosDisponibles, setPeriodosDisponibles] = useState([]);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  // 1) Traer todos los temas del profesor (según tu endpoint)
  useEffect(() => {
    if (!usuario || !token) return;
    fetch(
      `http://localhost:3001/api/profesor/${usuario.id_usuario}/temas`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => setContenido(data))
      .catch((error) => console.error("Error al cargar temas:", error));
  }, [usuario, token]);

  // 2) Traer lista de periodos disponibles (para el formulario)
  //    Esto asume que tienes un endpoint que regresa todos los periodos de las asignaturas
  useEffect(() => {
    fetch("http://localhost:3001/api/periodos", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPeriodosDisponibles(data))
      .catch((err) => console.error("Error al cargar periodos:", err));
  }, [token]);

  // 3) Función para Agregar un nuevo Tema
  const handleAgregarTema = (e) => {
    e.preventDefault();
    if (!newTitulo || !newDescripcion || !newPeriodoId) {
      alert("Completa todos los campos");
      return;
    }

    const body = {
      titulo: newTitulo,
      descripcion: newDescripcion,
      periodo_id: newPeriodoId,
      profesor_id: usuario.id_usuario,
    };

    fetch("http://localhost:3001/api/temas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((nuevoTema) => {
        // Actualizamos el estado local para que aparezca inmediatamente
        setContenido((prev) => [...prev, nuevoTema]);
        setMostrarFormulario(false);
        setNewTitulo("");
        setNewDescripcion("");
        setNewPeriodoId("");
      })
      .catch((err) => console.error("Error al agregar tema:", err));
  };

  // 4) Función para Eliminar un Tema
  const handleEliminarTema = (idTema) => {
    if (!window.confirm("¿Seguro que deseas eliminar este tema?")) return;

    fetch(`http://localhost:3001/api/temas/${idTema}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (res.ok) {
          // Removerlo del estado local
          setContenido((prev) => prev.filter((t) => t.id_tema !== idTema));
          alert("Tema eliminado");
        } else {
          alert("Error al eliminar el tema");
        }
      })
      .catch((err) => console.error(err));
  };

  // 5) Agrupar temas por módulo (igual que antes)
  const modulos = contenido.reduce((acc, row) => {
    if (!acc[row.id_modulo]) {
      acc[row.id_modulo] = { nombre: row.modulo_nombre, temas: [] };
    }
    acc[row.id_modulo].temas.push(row);
    return acc;
  }, {});

  return (
    <div className="panel-container">
      <h2>Módulos y Temas del Profesor</h2>

      <button
        onClick={() => setMostrarFormulario((prev) => !prev)}
        style={{
          background: "#79C99E",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        {mostrarFormulario ? "Cerrar Formulario" : "Agregar Nuevo Tema"}
      </button>

      {/* ====== FORMULARIO AGREGAR TEMA ====== */}
      {mostrarFormulario && (
        <form
          onSubmit={handleAgregarTema}
          style={{
            background: "#f7f7f7",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "30px",
          }}
        >
          <h3>Nuevo Tema</h3>
          <input
            type="text"
            placeholder="Título del Tema"
            value={newTitulo}
            onChange={(e) => setNewTitulo(e.target.value)}
            required
            style={{ marginBottom: "10px" }}
          />
          <textarea
            placeholder="Descripción"
            value={newDescripcion}
            onChange={(e) => setNewDescripcion(e.target.value)}
            required
            style={{ marginBottom: "10px", resize: "vertical" }}
          />
          <select
            value={newPeriodoId}
            onChange={(e) => setNewPeriodoId(e.target.value)}
            required
            style={{ marginBottom: "10px" }}
          >
            <option value="">Selecciona un Periodo</option>
            {periodosDisponibles.map((p) => (
              <option key={p.id_periodo} value={p.id_periodo}>
                {p.nombre} ({p.asignatura_nombre})
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              background: "#4D5359",
              color: "white",
              border: "none",
              padding: "10px 15px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Guardar Tema
          </button>
        </form>
      )}

      {/* ====== LISTADO DE MÓDULOS Y TEMAS ====== */}
      {Object.entries(modulos).map(([idModulo, modObj]) => (
        <div key={idModulo} style={{ marginBottom: "30px" }}>
          <h3>{modObj.nombre}</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {modObj.temas.map((t) => (
                <tr key={t.id_tema}>
                  <td>{t.titulo}</td>
                  <td>{t.descripcion}</td>
                  <td>
                    <button
                      onClick={() => handleEliminarTema(t.id_tema)}
                      style={{
                        background: "#E74C3C",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <Link to="/">Cerrar Sesión</Link>
    </div>
  );
};

/* ====== DETALLE DE MÓDULO (directorizado por PROFESOR) ====== */
const ModuloDetalle = () => {
  const { id } = useParams();
  const [modulo, setModulo] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/api/modulos/${id}`)
      .then((res) => res.json())
      .then((data) => setModulo(data))
      .catch((err) => console.error(err));
  }, [id]);

  if (!modulo) return <div className="panel-container">Cargando…</div>;

  return (
    <div className="panel-container">
      <h2>Detalles del Módulo</h2>
      <p>
        <strong>ID:</strong> {modulo.id_modulo}
      </p>
      <p>
        <strong>Nombre:</strong> {modulo.nombre}
      </p>
      {modulo.descripcion && (
        <p>
          <strong>Descripción:</strong> {modulo.descripcion}
        </p>
      )}

      {modulo.periodos?.length > 0 ? (
        <>
          <h3>Períodos</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Periodo</th>
                <th>Nombre</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Asignatura</th>
                <th>Temas</th>
              </tr>
            </thead>
            <tbody>
              {modulo.periodos.map((p) => (
                <tr key={p.id_periodo}>
                  <td>{p.id_periodo}</td>
                  <td>{p.nombre}</td>
                  <td>{p.fecha_inicio}</td>
                  <td>{p.fecha_fin}</td>
                  <td>{p.asignatura_nombre}</td>
                  <td>
                    {p.temas?.length > 0 ? (
                      <ul>
                        {p.temas.map((t) => (
                          <li key={t.id_tema}>
                            <strong>{t.titulo}</strong>: {t.descripcion}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No hay temas"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>No se encontraron periodos.</p>
      )}
      <Link to="/profesor">Volver al panel</Link>
    </div>
  );
};

/* ====== PANEL DE ESTUDIANTE ====== */
const EstudiantePanel = () => {
  const [modulos, setModulos] = useState([]);
  const [moduloSeleccionado, setModuloSeleccionado] = useState(null);
  const [temas, setTemas] = useState([]);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const token = localStorage.getItem("token");

  // Cargar módulos del estudiante
  useEffect(() => {
    if (usuario?.id_usuario) {
      fetch(`http://localhost:3001/api/estudiante/${usuario.id_usuario}/modulos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => setModulos(data))
        .catch((err) => console.error(err));
    }
  }, [usuario, token]);

  // Cargar temas cuando se selecciona un módulo
  const cargarTemas = (idModulo) => {
    fetch(`http://localhost:3001/api/modulos/${idModulo}/temas`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setModuloSeleccionado(modulos.find(m => m.id_modulo === idModulo));
        setTemas(data);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="panel-container">
      <h2>Panel del Estudiante</h2>
      
      {moduloSeleccionado ? (
        <div>
          <button 
            onClick={() => {
              setModuloSeleccionado(null);
              setTemas([]);
            }}
            style={{
              background: "#3498db",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "4px",
              marginBottom: "20px",
              cursor: "pointer"
            }}
          >
            Volver a módulos
          </button>
          
          <h3>Temas del módulo: {moduloSeleccionado.nombre}</h3>
          
          {temas.length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Descripción</th>
                  <th>Periodo</th>
                </tr>
              </thead>
              <tbody>
                {temas.map((tema) => (
                  <tr key={tema.id_tema}>
                    <td>{tema.titulo}</td>
                    <td>{tema.descripcion}</td>
                    <td>{tema.periodo_nombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No hay temas disponibles para este módulo.</p>
          )}
        </div>
      ) : (
        <div className="modulos-grid">
          <h3>Selecciona un módulo</h3>
          {modulos.map((m) => (
            <div key={m.id_modulo} className="modulo-card">
              <h4>{m.nombre}</h4>
              <button 
                onClick={() => cargarTemas(m.id_modulo)}
                style={{
                  background: "#2ecc71",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Ver temas
              </button>
            </div>
          ))}
        </div>
      )}
      
      <Link to="/" style={{ marginTop: "20px", display: "block" }}>
        Cerrar Sesión
      </Link>
    </div>
  );
};

/* ====== RUTAS DE REGISTRO, RECUPERAR, NO AUTORIZADO ====== */
const Registro = () => (
  <div className="panel-container">
    <h2>Registro</h2>
    <p>Aquí iría el formulario de registro.</p>
    <Link to="/">Volver al login</Link>
  </div>
);
const RecuperarContrasena = () => (
  <div className="panel-container">
    <h2>Recuperar Contraseña</h2>
    <p>Ingresa tu correo para recuperar tu contraseña.</p>
    <Link to="/">Volver al login</Link>
  </div>
);
const NoAutorizado = () => (
  <div className="panel-container">
    <h2>Acceso No Autorizado</h2>
    <Link to="/">Volver al inicio</Link>
  </div>
);

/** ------------------------------
 *  APP PRINCIPAL
 *  ------------------------------ **/
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      {/* RUTA ADMIN */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* RUTAS PROFESOR */}
      <Route
        path="/profesor"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <ProfesorPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profesor/modulo/:id"
        element={
          <ProtectedRoute allowedRoles={[1]}>
           
          </ProtectedRoute>
        }
      />

      {/* RUTA ESTUDIANTE */}
      <Route
        path="/estudiante"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <EstudiantePanel />
          </ProtectedRoute>
        }
      />
      {}
    </Routes>
  </Router>
);

export default App;

