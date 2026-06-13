import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listarTareas } from '../services/tareaService.js';
import { listarProyectos } from '../services/proyectoService.js';
import { useAuth } from '../context/AuthContext.jsx';
import EstadoBadge from '../components/EstadoBadge.jsx';
import PrioridadBadge from '../components/PrioridadBadge.jsx';
import Pagination from '../components/Pagination.jsx';

export default function TareaListPage() {
  const { usuario, isAdminOrLider } = useAuth();
  const [tareas, setTareas] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtros, setFiltros] = useState({
    proyectoId: '', responsableId: '', estado: '', prioridad: '',
    sortBy: 'createdAt', order: 'DESC',
  });

  const fetchTareas = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { ...filtros, page, limit: 10 };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const data = await listarTareas(params);
      setTareas(data.tareas);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [filtros, page]);

  useEffect(() => { fetchTareas(); }, [fetchTareas]);

  useEffect(() => {
    listarProyectos().then(setProyectos).catch(() => {});
  }, []);

  function handleFilterChange(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
    setPage(1);
  }

  function vencida(tarea) {
    if (tarea.estado === 'finalizada' || tarea.estado === 'cancelada') return false;
    if (!tarea.fechaLimite) return false;
    return new Date(tarea.fechaLimite) < new Date(new Date().toDateString());
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
      <h2 style={{ marginBottom: 16 }}>Listado de Tareas</h2>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, padding: 12, background: '#f9f9f9', borderRadius: 8, border: '1px solid #eee' }}>
        <select name="proyectoId" value={filtros.proyectoId} onChange={handleFilterChange} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }}>
          <option value="">Todos los proyectos</option>
          {proyectos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        {isAdminOrLider && (
          <input name="responsableId" value={filtros.responsableId} onChange={handleFilterChange}
            placeholder="ID responsable" style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4, width: 140 }} />
        )}
        <select name="estado" value={filtros.estado} onChange={handleFilterChange} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }}>
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="bloqueada">Bloqueada</option>
          <option value="finalizada">Finalizada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <select name="prioridad" value={filtros.prioridad} onChange={handleFilterChange} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }}>
          <option value="">Todas las prioridades</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </select>
        <select name="sortBy" value={filtros.sortBy} onChange={handleFilterChange} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }}>
          <option value="createdAt">Fecha creación</option>
          <option value="titulo">Título</option>
          <option value="prioridad">Prioridad</option>
          <option value="fechaLimite">Fecha límite</option>
        </select>
        <select name="order" value={filtros.order} onChange={handleFilterChange} style={{ padding: 6, border: '1px solid #ccc', borderRadius: 4 }}>
          <option value="DESC">Descendente</option>
          <option value="ASC">Ascendente</option>
        </select>
      </div>

      {error && <div style={{ color: '#e74c3c', marginBottom: 12 }}>{error}</div>}

      {loading ? (
        <p>Cargando...</p>
      ) : tareas.length === 0 ? (
        <p>No se encontraron tareas.</p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: 8, borderBottom: '2px solid #ddd' }}>Título</th>
                <th style={{ padding: 8, borderBottom: '2px solid #ddd' }}>Proyecto</th>
                <th style={{ padding: 8, borderBottom: '2px solid #ddd' }}>Responsable</th>
                <th style={{ padding: 8, borderBottom: '2px solid #ddd' }}>Estado</th>
                <th style={{ padding: 8, borderBottom: '2px solid #ddd' }}>Prioridad</th>
                <th style={{ padding: 8, borderBottom: '2px solid #ddd' }}>Fecha Límite</th>
                <th style={{ padding: 8, borderBottom: '2px solid #ddd' }}></th>
              </tr>
            </thead>
            <tbody>
              {tareas.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{t.titulo}</td>
                  <td style={{ padding: 8 }}>{t.proyecto?.codigo || '-'}</td>
                  <td style={{ padding: 8 }}>{t.responsable?.nombre || '-'}</td>
                  <td style={{ padding: 8 }}>
                    <EstadoBadge estado={t.estado} />
                    {vencida(t) && <span style={{ marginLeft: 4, color: '#e74c3c', fontWeight: 'bold' }}>VENCIDA</span>}
                  </td>
                  <td style={{ padding: 8 }}><PrioridadBadge prioridad={t.prioridad} /></td>
                  <td style={{ padding: 8 }}>{t.fechaLimite || '-'}</td>
                  <td style={{ padding: 8 }}>
                    <Link to={`/tareas/${t.id}`} style={{ color: '#3498db' }}>Ver</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
