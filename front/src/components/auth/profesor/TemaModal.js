import React, { useEffect, useState } from 'react';

const TemaModal = ({ isOpen, onClose, onSave, temaEditando, periodos, asignaturas }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido_introduccion: '',
    contenido_aspectos: '',
    contenido_conclusion: '',
    asignatura_id: '',
    periodo_id: ''
  });

  const [periodosFiltrados, setPeriodosFiltrados] = useState([]);

  useEffect(() => {
    if (temaEditando) {
      const asignaturaId = temaEditando.asignatura_id?.toString() || '';
      setFormData({
        titulo: temaEditando.titulo || '',
        descripcion: temaEditando.descripcion || '',
        contenido_introduccion: temaEditando.contenido_introduccion || '',
        contenido_aspectos: temaEditando.contenido_aspectos || '',
        contenido_conclusion: temaEditando.contenido_conclusion || '',
        asignatura_id: asignaturaId,
        periodo_id: temaEditando.periodo_id?.toString() || ''
      });

      const filtrados = periodos.filter(p => p.asignatura_id === parseInt(asignaturaId));
      setPeriodosFiltrados(filtrados);
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        contenido_introduccion: '',
        contenido_aspectos: '',
        contenido_conclusion: '',
        asignatura_id: '',
        periodo_id: ''
      });
      setPeriodosFiltrados([]);
    }
  }, [temaEditando, periodos]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'asignatura_id' ? { periodo_id: '' } : {})
    }));

    if (name === 'asignatura_id') {
      const filtrados = periodos.filter(p => p.asignatura_id === parseInt(value));
      setPeriodosFiltrados(filtrados);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.asignatura_id || !formData.periodo_id) {
      alert('Debes seleccionar asignatura y período.');
      return;
    }

    onSave(formData); // El backend debe saber cómo guardar contenido_tema también
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{temaEditando ? 'Editar Tema' : 'Crear Nuevo Tema'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="titulo"
            placeholder="Título"
            value={formData.titulo}
            onChange={handleChange}
            required
          />
          <textarea
            name="descripcion"
            placeholder="Descripción"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
          <textarea
            name="contenido_introduccion"
            placeholder="Introducción"
            value={formData.contenido_introduccion}
            onChange={handleChange}
            required
          />
          <textarea
            name="contenido_aspectos"
            placeholder="Aspectos clave (puedes usar <ul><li>...</li></ul>)"
            value={formData.contenido_aspectos}
            onChange={handleChange}
            required
          />
          <textarea
            name="contenido_conclusion"
            placeholder="Conclusión"
            value={formData.contenido_conclusion}
            onChange={handleChange}
            required
          />

          <select
            name="asignatura_id"
            value={formData.asignatura_id}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una asignatura</option>
            {asignaturas.map(a => (
              <option key={a.id_asignatura} value={a.id_asignatura}>
                {a.nombre}
              </option>
            ))}
          </select>

          <select
            name="periodo_id"
            value={formData.periodo_id}
            onChange={handleChange}
            required
            disabled={!formData.asignatura_id}
          >
            <option value="">Seleccione un período</option>
            {periodosFiltrados.map(p => (
              <option key={p.id_periodo} value={p.id_periodo}>
                {p.nombre}
              </option>
            ))}
          </select>

          <button type="submit" className="create-button">
            {temaEditando ? 'Actualizar' : 'Guardar'}
          </button>
          <button type="button" onClick={onClose} className="retry-button">
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default TemaModal;
