import { Link } from "react-router-dom";

const RecuperarContrasena = () => (
  <div className="panel-container">
    <h2>Recuperar Contraseña</h2>
    <p>Ingresa tu correo para recuperar tu contraseña.</p>
    <Link to="/">Volver al login</Link>
  </div>
);

export default RecuperarContrasena;