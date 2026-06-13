import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { usuario, isAdminOrLider, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 24px', background: '#1a1a2e', color: '#eee', marginBottom: 24
    }}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <Link to="/tareas" style={{ color: '#eee', textDecoration: 'none', fontWeight: 'bold', fontSize: 18 }}>
          Tareas
        </Link>
        {isAdminOrLider && (
          <Link to="/tareas/nueva" style={{ color: '#ccc', textDecoration: 'none' }}>
            + Nueva Tarea
          </Link>
        )}
        {isAdminOrLider && (
          <Link to="/resumen" style={{ color: '#ccc', textDecoration: 'none' }}>
            Resumen
          </Link>
        )}
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 14 }}>
          {usuario?.nombre} ({usuario?.rol})
        </span>
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 14px', border: '1px solid #e74c3c', borderRadius: 4,
            background: 'transparent', color: '#e74c3c', cursor: 'pointer', fontSize: 13
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
