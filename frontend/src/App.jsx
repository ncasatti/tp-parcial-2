import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import TareaListPage from './pages/TareaListPage.jsx';
import TareaDetailPage from './pages/TareaDetailPage.jsx';
import TareaFormPage from './pages/TareaFormPage.jsx';
import ResumenPage from './pages/ResumenPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/tareas" replace />} />
            <Route path="tareas" element={<TareaListPage />} />
            <Route path="tareas/nueva" element={
              <ProtectedRoute roles={['admin', 'lider']}><TareaFormPage /></ProtectedRoute>
            } />
            <Route path="tareas/:id" element={<TareaDetailPage />} />
            <Route path="tareas/:id/editar" element={<TareaFormPage />} />
            <Route path="resumen" element={
              <ProtectedRoute roles={['admin', 'lider']}><ResumenPage /></ProtectedRoute>
            } />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
