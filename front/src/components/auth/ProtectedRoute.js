import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

export default ProtectedRoute;