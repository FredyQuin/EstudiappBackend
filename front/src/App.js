import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
// Importaciones desde auth/
import Login from "./components/auth/Login";
import Registro from "./components/auth/Registro";
import RecuperarContrasena from "./components/auth/RecuperarContrasena";
import ProtectedRoute from "./components/auth/ProtectedRoute";
// Importaciones desde subcarpetas de auth/
import AdminPanel from "./components/auth/admin/AdminPanel";
import ProfesorPanel from "./components/auth/profesor/ProfesorPanel";
import EstudiantePanel from "./components/auth/estudiante/EstudiantePanel";
import NoAutorizado from "./components/auth/shared/NoAutorizado";

const App = () => (
  <Router>
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />
      <Route path="/no-autorizado" element={<NoAutorizado />} />

      {/* Ruta Admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[3]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Rutas Profesor */}
      <Route
        path="/profesor"
        element={
          <ProtectedRoute allowedRoles={[1]}>
            <ProfesorPanel />
          </ProtectedRoute>
        }
      />

      {/* Ruta Estudiante */}
      <Route
        path="/estudiante"
        element={
          <ProtectedRoute allowedRoles={[2]}>
            <EstudiantePanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  </Router>
);

export default App;