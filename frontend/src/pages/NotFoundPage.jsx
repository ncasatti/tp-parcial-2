import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <h1 style={{ fontSize: 72, color: '#ccc', margin: 0 }}>404</h1>
      <p style={{ fontSize: 18, color: '#888', margin: '8px 0 20px' }}>Página no encontrada</p>
      <Link to="/tareas" style={{ color: '#3498db', textDecoration: 'none' }}>
        Volver al inicio
      </Link>
    </div>
  );
}
