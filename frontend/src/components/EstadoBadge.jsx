const COLORS = {
  pendiente: '#f39c12',
  en_progreso: '#3498db',
  bloqueada: '#e74c3c',
  finalizada: '#27ae60',
  cancelada: '#95a5a6',
};

export default function EstadoBadge({ estado }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 12,
      background: COLORS[estado] || '#95a5a6', color: '#fff', fontSize: 12, fontWeight: 600
    }}>
      {estado?.replace('_', ' ')}
    </span>
  );
}
