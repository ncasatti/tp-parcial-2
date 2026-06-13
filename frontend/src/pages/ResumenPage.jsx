import { useState, useEffect } from 'react';
import { obtenerResumen } from '../services/tareaService.js';

export default function ResumenPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    obtenerResumen()
      .then(setData)
      .catch((err) => setError(err.response?.data?.error || 'Error al cargar resumen'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>Cargando...</p>;
  if (error) return <p style={{ maxWidth: 800, margin: '0 auto', padding: 16, color: '#e74c3c' }}>{error}</p>;
  if (!data) return null;

  const { total, porEstado, vencidas, porResponsable, criticas } = data;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      <h2 style={{ marginBottom: 20 }}>Resumen de Tareas</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <Card label="Total tareas" value={total} color="#3498db" />
        <Card label="Vencidas" value={vencidas} color="#e74c3c" />
        <Card label="Críticas" value={criticas} color="#e67e22" />
        <Card label="En progreso" value={porEstado?.find((e) => e.estado === 'en_progreso')?.cantidad || 0} color="#f39c12" />
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px' }}>Tareas por Estado</h3>
        {(!porEstado || porEstado.length === 0) ? (
          <p style={{ fontSize: 14, color: '#888' }}>Sin datos</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Estado</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {porEstado.map((e) => (
                <tr key={e.estado} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{e.estado}</td>
                  <td style={{ padding: 8 }}>{e.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 20, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 12px' }}>Tareas por Responsable</h3>
        {(!porResponsable || porResponsable.length === 0) ? (
          <p style={{ fontSize: 14, color: '#888' }}>Sin datos</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f2f2f2', textAlign: 'left' }}>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Responsable</th>
                <th style={{ padding: 8, borderBottom: '1px solid #ddd' }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {porResponsable.map((r) => (
                <tr key={r.responsableId} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{r.responsable?.nombre || `ID ${r.responsableId}`}</td>
                  <td style={{ padding: 8 }}>{r.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Card({ label, value, color }) {
  return (
    <div style={{ border: `1px solid ${color}`, borderRadius: 8, padding: 16, textAlign: 'center' }}>
      <div style={{ fontSize: 28, fontWeight: 'bold', color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#666' }}>{label}</div>
    </div>
  );
}
