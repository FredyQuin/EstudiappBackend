import { Link } from "react-router-dom";

const NoAutorizado = () => (
  <div className="panel-container">
    <h2>Acceso No Autorizado</h2>
    <Link to="/">Volver al inicio</Link>
  </div>
);

export default NoAutorizado;