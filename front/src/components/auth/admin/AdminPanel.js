import { useEffect, useState } from "react";

const AdminPanel = () => {
  const [historial, setHistorial] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [usuarioActual, setUsuarioActual] = useState(null); // Estado para el usuario a editar
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:3001/api/historial", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setHistorial(data))
      .catch((err) => console.error("Error al cargar historial:", err));
  }, [token]);

  useEffect(() => {
    fetch("http://localhost:3001/api/usuarios", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setUsuarios(data))
      .catch((err) => console.error("Error al cargar usuarios:", err));
  }, [token]);

  const handleEliminarUsuario = (idUsuario) => {
    if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

    fetch(`http://localhost:3001/api/usuarios/${idUsuario}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.ok) {
          setUsuarios((prev) =>
            prev.filter((u) => u.id_usuario !== idUsuario)
          );
          alert("Usuario eliminado correctamente");
        } else {
          alert("Error al eliminar usuario");
        }
      })
      .catch((err) => console.error(err));
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioActual(usuario); // Establecer el usuario actual para editar
  };

  const handleGuardarCambios = async () => {
    if (!usuarioActual) return;

    console.log('Datos a enviar:', usuarioActual); // Verifica los datos que se envían

    try {
      const res = await fetch(`http://localhost:3001/api/usuarios/${usuarioActual.id_usuario}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre: usuarioActual.nombre,
          correo: usuarioActual.correo,
          contrasena: usuarioActual.contrasena, // Si deseas permitir la actualización de la contraseña
          rol_id: usuarioActual.rol_id // Asegúrate de que esto sea el ID del rol
        }),
      });

      if (res.ok) {
        setUsuarios((prev) =>
          prev.map((u) => (u.id_usuario === usuarioActual.id_usuario ? usuarioActual : u))
        );
        alert("Usuario actualizado correctamente");
        setUsuarioActual(null); // Cerrar el modal
      } else {
        alert("Error al actualizar usuario");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="panel-container">
      <h2>Panel de Administración</h2>

      <input
        type="text"
        placeholder="Buscar usuarios por nombre o correo"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ marginBottom: "20px", padding: "8px", width: "300px" }}
      />

      <h3>Usuarios Registrados</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map((usuario) => (
            <tr key={usuario.id_usuario}>
              <td>{usuario.id_usuario}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.correo}</td>
              <td>
                <button onClick={() => handleEditarUsuario(usuario)}>Editar</button>
                <button onClick={() => handleEliminarUsuario(usuario.id_usuario)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {usuarioActual && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Usuario</h3>
            <input
              type="hidden" // Campo oculto para el ID de usuario
              value={usuarioActual.id_usuario}
              onChange={(e) => setUsuarioActual({ ...usuarioActual, id_usuario: e.target.value })}
            />
            <input
              type="text"
              value={usuarioActual.nombre}
              onChange={(e) => setUsuarioActual({ ...usuarioActual, nombre: e.target.value })}
              placeholder="Nombre"
            />
            <input
              type="text"
              value={usuarioActual.correo}
              onChange={(e) => setUsuarioActual({ ...usuarioActual, correo: e.target.value })}
              placeholder="Correo"
            />
            <input
              type="password"
              value={usuarioActual.contrasena} // Si deseas permitir la actualización de la contraseña
              onChange={(e) => setUsuarioActual({ ...usuarioActual, contrasena: e.target.value })}
              placeholder="Contraseña (dejar vacío si no se desea cambiar)"
            />
            <select
              value={usuarioActual.rol_id} // Asegúrate de que esto sea el ID del rol
              onChange={(e) => setUsuarioActual({ ...usuarioActual, rol_id: e.target.value })}
            >
              <option value="1">Profesor</option> {/* Asegúrate de que estos valores coincidan con los IDs en tu base de datos */}
              <option value="2">Estudiante</option>
            </select>
            <button onClick={handleGuardarCambios}>Guardar Cambios</button>
            <button onClick={() => setUsuarioActual(null)}>Cancelar</button>
          </div>
        </div>
      )}

      <hr style={{ margin: "40px 0" }} />

      <h3>Historial de Eliminaciones</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Entidad</th>
            <th>Nombre Eliminado</th>
            <th>Eliminado Por</th>
            <th>Descripción</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {historial.length > 0 ? (
            historial.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td>{h.entidad}</td>
                <td>{h.nombre_entidad}</td>
                <td>{h.nombre_usuario || "Desconocido"}</td>
                <td>{h.descripcion}</td>
                <td>{new Date(h.fecha).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6">No hay registros aún.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
