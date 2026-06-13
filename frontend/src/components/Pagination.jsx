export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
      >
        Anterior
      </button>
      <span style={{ fontSize: 14 }}>
        Página {page} de {totalPages}
      </span>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: 4, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
      >
        Siguiente
      </button>
    </div>
  );
}
