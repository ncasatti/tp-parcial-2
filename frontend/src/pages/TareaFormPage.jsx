import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearTarea, editarTarea, obtenerTarea } from '../services/tareaService.js';
import { listarProyectos } from '../services/proyectoService.js';
import { listarTareas } from '../services/tareaService.js';

export default function TareaFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    proyectoId: '', titulo: '', descripcion: '', responsableId: '',
    prioridad: 'media', estado: 'pendiente', fechaLimite: '',
  });

  useEffect(() => {
    listarProyectos()
      .then(setProyectos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    obtenerTarea(id)
      .then((t) => {
        setForm({
          proyectoId: t.proyectoId, titulo: t.titulo, descripcion: t.descripcion,
          responsableId: t.responsableId, prioridad: t.prioridad,
          estado: t.estado, fechaLimite: t.fechaLimite || '',
        });
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Error al cargar tarea');
        navigate('/tareas');
      })
      .finally(() => setFetching(false));
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (!form.proyectoId) { setUsuarios([]); return; }
    listarTareas({ proyectoId: form.proyectoId, limit: 1 })
      .then(() => {
        const proy = proyectos.find((p) => p.id === Number(form.proyectoId));
        if (proy && proy.integrantes) {
          setUsuarios(proy.integrantes);
        }
      })
      .catch(() => {});
  }, [form.proyectoId, proyectos]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.titulo || !form.descripcion || !form.responsableId || !form.fechaLimite) {
      setError('Completá todos los campos obligatorios');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await editarTarea(id, form);
      } else {
        await crearTarea(form);
      }
      navigate('/tareas');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <p style={{ maxWidth: 600, margin: '60px auto' }}>Cargando...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
      <h2 style={{ marginBottom: 20 }}>{isEdit ? 'Editar Tarea' : 'Nueva Tarea'}</h2>

      {error && <div style={{ color: '#e74c3c', marginBottom: 12, background: '#fdf0ef', padding: 8, borderRadius: 4 }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Proyecto *</label>
          <select name="proyectoId" value={form.proyectoId} onChange={handleChange} required
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}>
            <option value="">Seleccionar proyecto</option>
            {proyectos.filter((p) => p.estado !== 'finalizado').map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.codigo})</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Título *</label>
          <input name="titulo" value={form.titulo} onChange={handleChange} required
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Descripción *</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} required rows={3}
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box', resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Responsable *</label>
          <select name="responsableId" value={form.responsableId} onChange={handleChange} required
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}>
            <option value="">Seleccionar responsable</option>
            {usuarios.map((uid) => (
              <option key={uid} value={uid}>Usuario ID {uid}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Prioridad *</label>
            <select name="prioridad" value={form.prioridad} onChange={handleChange}
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Estado</label>
            <select name="estado" value={form.estado} onChange={handleChange}
              style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }}>
              <option value="pendiente">Pendiente</option>
              {isEdit && <option value="en_progreso">En Progreso</option>}
              {isEdit && <option value="bloqueada">Bloqueada</option>}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>Fecha límite *</label>
          <input type="date" name="fechaLimite" value={form.fechaLimite} onChange={handleChange} required
            style={{ width: '100%', padding: 8, border: '1px solid #ccc', borderRadius: 4, boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading}
            style={{ padding: '10px 24px', background: '#3498db', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {loading ? 'Guardando...' : (isEdit ? 'Guardar Cambios' : 'Crear Tarea')}
          </button>
          <button type="button" onClick={() => navigate('/tareas')}
            style={{ padding: '10px 24px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
