import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerTarea, obtenerHistorial, iniciarTarea, bloquearTarea, finalizarTarea, cancelarTarea } from '../services/tareaService.js';
import { useAuth } from '../context/AuthContext.jsx';
import EstadoBadge from '../components/EstadoBadge.jsx';
import PrioridadBadge from '../components/PrioridadBadge.jsx';

export default function TareaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, isAdminOrLider } = useAuth();
  const [tarea, setTarea] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accionMsg, setAccionMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([obtenerTarea(id), obtenerHistorial(id)])
      .then(([t, h]) => { setTarea(t); setHistorial(h); })
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar la tarea'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAccion(accionFn, label) {
    setAccionMsg('');
    try {
      const t = await accionFn(id);
      setTarea(t);
      const h = await obtenerHistorial(id);
      setHistorial(h);
      setAccionMsg(`${label} exitoso`);
    } catch (err) {
      setAccionMsg(err.response?.data?.error || `Error al ${label}`);
    }
  }

  function vencida() {
    if (!tarea) return false;
    if (tarea.estado === 'finalizada' || tarea.estado === 'cancelada') return false;
    if (!tarea.fechaLimite) return false;
    return new Date(tarea.fechaLimite) < new Date(new Date().toDateString());
  }

  function puedeIniciar() { return tarea.estado === 'pendiente'; }
  function puedeBloquear() { return tarea.estado === 'en_progreso'; }
  function puedeFinalizar() { return tarea.estado === 'en_progreso' && isAdminOrLider; }
  function puedeCancelar() { return tarea.estado !== 'finalizada' && tarea.estado !== 'cancelada' && isAdminOrLider; }
  function esColaboradorPropietario() {
    return usuario?.rol === 'colaborador' && tarea.responsableId === usuario.id;
  }
  function puedeIniciarColab() { return puedeIniciar() && esColaboradorPropietario(); }
  function puedeBloquearColab() { return puedeBloquear() && esColaboradorPropietario(); }
  function puedeEditar() {
    if (tarea.estado === 'finalizada' || tarea.estado === 'cancelada') return false;
    if (isAdminOrLider) return true;
    return esColaboradorPropietario();
  }

  if (loading) return <p style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>Cargando...</p>;
  if (error) return <p style={{ maxWidth: 800, margin: '0 auto', padding: 16, color: '#e74c3c' }}>{error}</p>;
  if (!tarea) return <p style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>Tarea no encontrada</p>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      <button onClick={() => navigate('/tareas')} style={{ marginBottom: 16, padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: 'pointer' }}>
        ← Volver
      </button>

      {accionMsg && (
        <div style={{
          padding: 8, marginBottom: 12, borderRadius: 4,
          background: accionMsg.includes('exit') ? '#d4edda' : '#fdf0ef',
          color: accionMsg.includes('exit') ? '#155724' : '#e74c3c'
        }}>
          {accionMsg}
        </div>
      )}

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>{tarea.titulo}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {puedeIniciarColab() && (
              <button onClick={() => handleAccion(iniciarTarea, 'Inicio')} style={btnStyle('#3498db')}>Iniciar</button>
            )}
            {puedeBloquearColab() && (
              <button onClick={() => handleAccion(bloquearTarea, 'Bloqueo')} style={btnStyle('#e67e22')}>Bloquear</button>
            )}
            {puedeFinalizar() && (
              <button onClick={() => handleAccion(finalizarTarea, 'Finalización')} style={btnStyle('#27ae60')}>Finalizar</button>
            )}
            {puedeCancelar() && (
              <button onClick={() => handleAccion(cancelarTarea, 'Cancelación')} style={btnStyle('#e74c3c')}>Cancelar</button>
            )}
            {puedeEditar() && (
              <button onClick={() => navigate(`/tareas/${tarea.id}/editar`)} style={btnStyle('#f39c12')}>Editar</button>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
          <div><strong>Proyecto:</strong> {tarea.proyecto?.nombre || '-'} ({tarea.proyecto?.codigo || '-'})</div>
          <div><strong>Responsable:</strong> {tarea.responsable?.nombre || '-'}</div>
          <div><strong>Estado:</strong> <EstadoBadge estado={tarea.estado} /> {vencida() && <span style={{ color: '#e74c3c', fontWeight: 'bold', marginLeft: 4 }}>VENCIDA</span>}</div>
          <div><strong>Prioridad:</strong> <PrioridadBadge prioridad={tarea.prioridad} /></div>
          <div><strong>Fecha límite:</strong> {tarea.fechaLimite || '-'}</div>
          <div><strong>Creada:</strong> {tarea.createdAt ? new Date(tarea.createdAt).toLocaleString() : '-'}</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <strong>Descripción:</strong>
          <p style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap' }}>{tarea.descripcion}</p>
        </div>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 24 }}>
        <h3 style={{ margin: '0 0 12px' }}>Historial de cambios</h3>
        {historial.length === 0 ? (
          <p style={{ fontSize: 14, color: '#888' }}>Sin registros</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd' }}>Fecha</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd' }}>Usuario</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd' }}>Acción</th>
                <th style={{ padding: 6, borderBottom: '1px solid #ddd' }}>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 6 }}>{new Date(h.fechaHora).toLocaleString()}</td>
                  <td style={{ padding: 6 }}>{h.usuario?.nombre || '-'}</td>
                  <td style={{ padding: 6 }}>{h.accion}</td>
                  <td style={{ padding: 6, fontSize: 12 }}>
                    {h.accion === 'cambio_estado' && `Estado: ${h.valorAnterior?.estado} → ${h.valorNuevo?.estado}`}
                    {h.accion === 'creacion' && 'Tarea creada'}
                    {h.accion === 'cancelacion' && 'Tarea cancelada'}
                    {h.accion === 'edicion' && Object.keys(h.valorAnterior || {}).join(', ')}
                    {h.accion === 'reasignacion' && `Responsable: ${h.valorAnterior?.responsableId} → ${h.valorNuevo?.responsableId}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function btnStyle(color) {
  return {
    padding: '6px 12px', border: 'none', borderRadius: 4,
    background: color, color: '#fff', cursor: 'pointer', fontSize: 13
  };
}
