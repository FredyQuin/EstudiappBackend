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
          <h2>Bienvenido a la pagina</h2>
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
            <span>¿Eres nuevo? <Link to="/registro">Regístrate aquí</Link></span>
            <span><Link to="/recuperar-contrasena">¿Olvidaste tu contraseña?</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  return (
    <div className="panel-container">
      <h2>Panel de Administración</h2>
      <p>Acceso concedido. Aquí puedes gestionar la plataforma.</p>
    </div>
  );
};


const ProfesorPanel = () => {
  const [contenido, setContenido] = useState([]);
  const [userId, setUserId] = useState(null); 

  useEffect(() => {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    if (usuarioGuardado?.id_usuario) {
      setUserId(usuarioGuardado.id_usuario);
      fetch(`http://localhost:3001/contenido/${usuarioGuardado.id_usuario}`)
        .then(res => res.json())
        .then(data => setContenido(data))
        .catch(err => console.error(err));
    }
  }, []);


  const estructura = {};
  contenido.forEach(row => {
    if (!estructura[row.id_modulo]) {
      estructura[row.id_modulo] = {
        nombre: row.modulo_nombre,
        asignaturas: {}
      };
    }
    if (!estructura[row.id_modulo].asignaturas[row.id_asignatura]) {
      estructura[row.id_modulo].asignaturas[row.id_asignatura] = {
        nombre: row.asignatura_nombre,
        competencia: row.competencia,
        temas: [],
        evaluaciones: []
      };
    }

   
    if (row.id_tema && !estructura[row.id_modulo].asignaturas[row.id_asignatura].temas.some(t => t.id === row.id_tema)) {
      estructura[row.id_modulo].asignaturas[row.id_asignatura].temas.push({
        id: row.id_tema,
        titulo: row.tema_titulo,
        descripcion: row.descripcion
      });
    }

    if (row.id_evaluacion && !estructura[row.id_modulo].asignaturas[row.id_asignatura].evaluaciones.some(e => e.id === row.id_evaluacion)) {
      estructura[row.id_modulo].asignaturas[row.id_asignatura].evaluaciones.push({
        id: row.id_evaluacion,
        tipo: row.tipo,
        titulo: row.evaluacion_titulo,
        instrucciones: row.instrucciones,
        fecha: row.fecha
      });
    }
  });

  return (
    <div className="panel-container">
      <h2>Contenido Académico</h2>
      {Object.entries(estructura).map(([modId, mod]) => (
        <div key={modId}>
          <h3>Módulo: {mod.nombre}</h3>
          {Object.entries(mod.asignaturas).map(([asigId, asig]) => (
            <div key={asigId}>
              <h4>Asignatura: {asig.nombre}</h4>
              <p><strong>Competencia:</strong> {asig.competencia}</p>
              <ul>
                {asig.temas.map(tema => (
                  <li key={tema.id}><strong>{tema.titulo}</strong>: {tema.descripcion}</li>
                ))}
              </ul>
              <h5>Evaluaciones:</h5>
              <ul>
                {asig.evaluaciones.map(evalua => (
                  <li key={evalua.id}>
                    [{evalua.tipo}] <strong>{evalua.titulo}</strong> - {evalua.fecha} <br />
                    {evalua.instrucciones}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const Registro = () => {
  return (
    <div className="panel-container">
      <h2>Registro de Nuevo Usuario</h2>
      <p>Completa el formulario para crear una cuenta.</p>
      <Link to="/">Volver al inicio de sesión</Link>
    </div>
  );
};

const RecuperarContrasena = () => {
  return (
    <div className="panel-container">
      <h2>Recuperar Contraseña</h2>
      <p>Ingresa tu correo electrónico para recuperar tu contraseña.</p>
      <Link to="/">Volver al inicio de sesión</Link>
    </div>
  );
};



const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminPanel />} />
        
        <Route path="/registro" element={<Registro />} />
        <Route path="/profesor" element={<ProfesorPanel />} />
        <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      </Routes>
    </Router>
  );
};

export default App;