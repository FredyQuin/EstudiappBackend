import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Registro.css";

const Registro = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol_id: "3", 
  });

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    try {
      const res = await axios.post("http://localhost:3001/api/usuarios", formData);
      setMensaje("¡Usuario registrado exitosamente!");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError("Error al registrar el usuario. Verifica los campos.");
    }
  };

  return (
    <div className="estudiante-panel">
      <h2>Registro de Usuario</h2>
      <p>Completa tus datos para crear una cuenta</p>

      <form onSubmit={handleSubmit} className="registro-form" style={{ maxWidth: "500px", margin: "0 auto" }}>
        <div className="tema-card">
          <label>Nombre:</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />

          <label>Correo:</label>
          <input
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleChange}
            required
          />

          <label>Contraseña:</label>
          <input
            type="password"
            name="contrasena" // 
            value={formData.contrasena}
            onChange={handleChange}
            required
          />

          {/* Eliminado el selector de rol */}
          <button type="submit" className="ver-button">Registrar</button>
        </div>
      </form>

      {mensaje && <p className="success-message">{mensaje}</p>}
      {error && <p className="error-message">{error}</p>}

      <Link to="/" className="logout-link">Volver al login</Link>
    </div>
  );
};

export default Registro;
