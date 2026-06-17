import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Breadcrumbs from './Breadcrumbs';
import './Layout.css';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">U</div>
          <span className="brand-text">Control Asistencia</span>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-role">{isAdmin ? 'Administrador' : 'Docente'}</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {isAdmin ? (
            <>
              <Link to="/admin" className="nav-link">Dashboard</Link>
              <Link to="/admin/students" className="nav-link">Estudiantes</Link>
              <Link to="/admin/classes" className="nav-link">Cursos</Link>
            </>
          ) : (
            <Link to="/teacher" className="nav-link">Mis Cursos</Link>
          )}
        </nav>
        <button className="btn-logout" onClick={handleLogout}>Cerrar sesión</button>
      </aside>
      <main className="main-area">
        <Breadcrumbs />
        <div className="main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
