import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    try {
      const stored = localStorage.getItem('usuario');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const loginUsuario = useCallback((tokenValue, usuarioData) => {
    localStorage.setItem('token', tokenValue);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
    setToken(tokenValue);
    setUsuario(usuarioData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  }, []);

  const isAuthenticated = !!token;
  const isAdminOrLider = usuario && (usuario.rol === 'admin' || usuario.rol === 'lider');
  const isAdmin = usuario?.rol === 'admin';

  const value = useMemo(() => ({
    usuario,
    token,
    isAuthenticated,
    isAdminOrLider,
    isAdmin,
    loginUsuario,
    logout,
  }), [usuario, token, isAuthenticated, isAdminOrLider, isAdmin, loginUsuario, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

export default AuthContext;
