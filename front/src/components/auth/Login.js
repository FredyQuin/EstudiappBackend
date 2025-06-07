import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

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
          case 1: navigate("/profesor"); break;
          case 2: navigate("/estudiante"); break;
          case 3: navigate("/admin"); break;
          default: alert("Rol no reconocido"); navigate("/");
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

export default Login;