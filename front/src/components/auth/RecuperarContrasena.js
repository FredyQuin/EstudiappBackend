import { useState } from "react";
import { Link } from "react-router-dom";

const RecuperarContrasena = () => {
  const [correo, setCorreo] = useState("");
  const [nuevaContrasena, setNuevaContrasena] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simula el envío
    console.log("Correo:", correo);
    console.log("Nueva contraseña:", nuevaContrasena);

    setMensaje("Tu contraseña ha sido cambiada exitosamente");
    setCorreo("");
    setNuevaContrasena("");
  };

  return (
    <div className="panel-container">
      <h2>Recuperar Contraseña</h2>
      <p>Ingresa tu correo y una nueva contraseña.</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
        <label>Correo:</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          required
        />

        <label>Nueva Contraseña:</label>
        <input
          type="password"
          value={nuevaContrasena}
          onChange={(e) => setNuevaContrasena(e.target.value)}
          required
        />

        <button type="submit" className="ver-button">Cambiar contraseña</button>
      </form>

      {mensaje && <p className="success-message">{mensaje}</p>}
      <Link to="/">Volver al login</Link>
    </div>
  );
};

export default RecuperarContrasena;
