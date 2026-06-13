const COLORS = {
  baja: '#27ae60',
  media: '#f39c12',
  alta: '#e67e22',
  critica: '#e74c3c',
};

export default function PrioridadBadge({ prioridad }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 12,
      background: COLORS[prioridad] || '#95a5a6', color: '#fff', fontSize: 12, fontWeight: 600
    }}>
      {prioridad}
    </span>
  );
}
