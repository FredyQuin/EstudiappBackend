import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Link,
  useParams
} from "react-router-dom";
import "./App.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", { // Asegúrate que la ruta sea correcta
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Guardar toda la información del usuario
        localStorage.setItem("usuario", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);
        
        // Redirigir según rol (como número)
        switch(data.user.rol) {
          case 1: // Profesor
            navigate("/profesor");
            break;
          case 2: // Estudiante
            navigate("/estudiante");
            break;
          case 3: // Admin
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
          <h2>Bienvenido a estudiapp</h2>
          <p>Tu plataforma integral para el aprendizaje y el desarrollo personal.</p>
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
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Recordarme</label>
            </div>
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

const ProfesorPanel = () => {
  const [contenido, setContenido] = useState([]);

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado?.id_usuario) {
      fetch(`http://localhost:3001/contenido/${usuarioGuardado.id_usuario}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("Contenido recibido:", data);
          setContenido(data);
        })
        .catch((err) => console.error(err));
    }
  }, []);

  // Agrupa la información para obtener módulos únicos.
  const modulos = contenido.reduce((acc, row) => {
    if (!acc[row.id_modulo]) {
      acc[row.id_modulo] = {
        nombre: row.modulo_nombre,
      };
    }
    return acc;
  }, {});

  return (
    <div className="panel-container">
      <h2>Contenido Académico - Módulos</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Módulo</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(modulos).map(([modId, mod]) => (
            <tr key={modId}>
              <td>
                <Link to={`/profesor/modulo/${modId}`}>{mod.nombre}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ModuloDetalle = () => {
  const { id } = useParams();
  const [modulo, setModulo] = useState(null);

  useEffect(() => {
    console.log("Obteniendo detalle para el módulo con ID:", id);
    fetch(`http://localhost:3001/modulo/${id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Datos del módulo:", data);
        setModulo(data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  if (!modulo)
    return (
      <div className="panel-container">
        <h2>Cargando detalles del módulo...</h2>
      </div>
    );

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
      {modulo.periodos && modulo.periodos.length > 0 ? (
        <>
          <h3>Periodos</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Periodo</th>
                <th>Nombre</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Asignatura</th>
                <th>Temas</th>
              </tr>
            </thead>
            <tbody>
              {modulo.periodos.map((periodo) => (
                <tr key={periodo.id_periodo}>
                  <td>{periodo.id_periodo}</td>
                  <td>{periodo.nombre}</td>
                  <td>{periodo.fecha_inicio}</td>
                  <td>{periodo.fecha_fin}</td>
                  <td>{periodo.asignatura_nombre}</td>
                  <td>
                    {periodo.temas && periodo.temas.length > 0 ? (
                      <ul>
                        {periodo.temas.map((tema) => (
                          <li key={tema.id_tema}>
                            <strong>{tema.titulo}</strong>: {tema.descripcion}
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
        <p>No se encontraron periodos para este módulo.</p>
      )}
      <Link to="/profesor">Volver al Panel</Link>
    </div>
  );
};

const AdminPanel = () => (
  <div className="panel-container">
    <h2>Panel de Administración</h2>
    <p>Acceso concedido. Aquí puedes gestionar la plataforma.</p>
  </div>
);

const Registro = () => (
  <div className="panel-container">
    <h2>Registro de Nuevo Usuario</h2>
    <p>Completa el formulario para crear una cuenta.</p>
    <Link to="/">Volver al inicio de sesión</Link>
  </div>
);

const RecuperarContrasena = () => (
  <div className="panel-container">
    <h2>Recuperar Contraseña</h2>
    <p>Ingresa tu correo electrónico para recuperar tu contraseña.</p>
    <Link to="/">Volver al inicio de sesión</Link>
  </div>
);
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
    return null; // O un spinner de carga
  }

  return children;
};

const EstudiantePanel = () => {
  const [modulos, setModulos] = useState([]);
  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (usuario?.id_usuario) {
      fetch(`http://localhost:3001/api/estudiante/${usuario.id_usuario}/modulos`)
        .then(res => res.json())
        .then(data => setModulos(data))
        .catch(err => console.error(err));
    }
  }, [usuario]);

  return (
    <div className="panel-container">
      <h2>Panel del Estudiante</h2>
      <h3>Tus Módulos</h3>
      <div className="modulos-grid">
        {modulos.map(modulo => (
          <div key={modulo.id_modulo} className="modulo-card">
            <h4>{modulo.nombre}</h4>
            <Link to={`/estudiante/modulo/${modulo.id_modulo}`}>Ver contenido</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

const NoAutorizado = () => {
  return (
    <div className="panel-container">
      <h2>Acceso No Autorizado</h2>
      <p>No tienes permisos para acceder a esta página.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Ruta de Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminPanel />
          </ProtectedRoute>
        } />
        
        {/* Ruta de Profesor */}
        <Route path="/profesor" element={
          <ProtectedRoute allowedRoles={[1]}>
            <ProfesorPanel />
          </ProtectedRoute>
        } />
        
        {/* Ruta de Estudiante */}
        <Route path="/estudiante" element={
          <ProtectedRoute allowedRoles={[2]}>
            <EstudiantePanel />
          </ProtectedRoute>
        } />
        
        <Route path="/profesor/modulo/:id" element={
          <ProtectedRoute allowedRoles={[1]}>
            <ModuloDetalle />
          </ProtectedRoute>
        } />
        
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
        <Route path="/no-autorizado" element={<NoAutorizado />} />
      </Routes>
    </Router>
  );
};

export default App;
