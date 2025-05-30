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
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email, contrasena: password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("usuario", JSON.stringify(data));
        if (data.rol === "admin") navigate("/admin");
        else if (data.rol === "profesor") navigate("/profesor");
        else if (data.rol === "estudiante") navigate("/usuario");
        else alert("Rol no reconocido");
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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/profesor" element={<ProfesorPanel />} />
        <Route path="/profesor/modulo/:id" element={<ModuloDetalle />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      </Routes>
    </Router>
  );
};

export default App;
