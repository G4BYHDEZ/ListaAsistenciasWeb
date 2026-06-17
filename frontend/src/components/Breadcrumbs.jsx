import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) return null;

  const crumbs = [];
  let acc = '';

  for (const s of segments) {
    acc += '/' + s;
    let label;

    if (acc === '/admin') label = 'Inicio';
    else if (acc === '/admin/students') label = 'Estudiantes';
    else if (acc === '/admin/classes') label = 'Cursos';
    else if (acc === '/teacher') label = 'Inicio';
    else if (s === 'attendance') label = 'Asistencia';
    else if (s === 'subjects') label = 'Materias';
    else if (!isNaN(s)) label = s;

    if (!label) label = s.charAt(0).toUpperCase() + s.slice(1);

    crumbs.push({ path: acc, label });
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {crumbs.map((c, i) => (
        <span key={c.path} className="crumb">
          {i > 0 && <span className="crumb-sep">›</span>}
          {i < crumbs.length - 1 ? (
            <Link to={c.path}>{c.label}</Link>
          ) : (
            <span className="crumb-current">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
