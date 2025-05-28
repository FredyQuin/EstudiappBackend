import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from "react-router-dom";
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
        body: JSON.stringify({ correo: email, contrasena: password })
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
            <input type="text" placeholder="Correo Electrónico" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Recordarme</label>
            </div>
            <button type="submit">Iniciar Sesión</button>
          </form>
          <div className="extra-links">
            <span>¿Eres nuevo? <Link to="/registro">Regístrate aquí</Link></span>
            <span><Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link></span>
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
        .then(res => res.json())
        .then(data => setContenido(data))
        .catch(err => console.error(err));
    }
  }, []);

  const estructura = contenido.reduce((acc, row) => {
    if (!acc[row.id_modulo]) {
      acc[row.id_modulo] = {
        nombre: row.modulo_nombre,
        asignaturas: {}
      };
    }

    if (!acc[row.id_modulo].asignaturas[row.id_asignatura]) {
      acc[row.id_modulo].asignaturas[row.id_asignatura] = {
        nombre: row.asignatura_nombre,
        competencia: row.competencia,
        temas: [],
        evaluaciones: []
      };
    }

    if (row.id_tema && !acc[row.id_modulo].asignaturas[row.id_asignatura].temas.some(t => t.id === row.id_tema)) {
      acc[row.id_modulo].asignaturas[row.id_asignatura].temas.push({
        id: row.id_tema,
        titulo: row.tema_titulo,
        descripcion: row.descripcion
      });
    }

    if (row.id_evaluacion && !acc[row.id_modulo].asignaturas[row.id_asignatura].evaluaciones.some(e => e.id === row.id_evaluacion)) {
      acc[row.id_modulo].asignaturas[row.id_asignatura].evaluaciones.push({
        id: row.id_evaluacion,
        tipo: row.tipo,
        titulo: row.evaluacion_titulo,
        instrucciones: row.instrucciones,
        fecha: row.fecha
      });
    }

    return acc;
  }, {});

  return (
    <div className="panel-container">
      <h2>Contenido Académico</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Módulo</th>
            <th>Asignatura</th>
            <th>Competencia</th>
            <th>Temas</th>
            <th>Evaluaciones</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(estructura).map(([modId, mod]) =>
            Object.entries(mod.asignaturas).map(([asigId, asig]) => (
              <tr key={`${modId}-${asigId}`}>
                <td>{mod.nombre}</td>
                <td>{asig.nombre}</td>
                <td>{asig.competencia}</td>
                <td>
                  <ul>
                    {asig.temas.map(tema => (
                      <li key={tema.id}><strong>{tema.titulo}</strong>: {tema.descripcion}</li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ul>
                    {asig.evaluaciones.length > 0 ? (
                      asig.evaluaciones.map(evaluacion => (
                        <li key={evaluacion.id}>
                          <strong>{evaluacion.tipo}:</strong> {evaluacion.titulo} - {evaluacion.fecha}
                          <br />
                          {evaluacion.instrucciones}
                        </li>
                      ))
                    ) : (
                      <li>No hay evaluaciones disponibles</li>
                    )}
                  </ul>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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
        <Route path="/registro" element={<Registro />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      </Routes>
    </Router>
  );
};

export default App;
