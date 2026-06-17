import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_cursos: 0, total_alumnos: 0, total_asistencias: 0 });

  useEffect(() => {
    fetch('http://listaalumnos.utportfolio.cloud:5000/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="admin-dashboard">
      <h2>Panel de Administración</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-num">{stats.total_cursos}</span>
          <span className="stat-label">Cursos Activos</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.total_alumnos}</span>
          <span className="stat-label">Estudiantes Registrados</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{stats.total_asistencias}</span>
          <span className="stat-label">Asistencias Tomadas</span>
        </div>
      </div>

      <div className="admin-actions">
        <button className="action-btn" onClick={() => navigate('/admin/students')}>
          Ver Estudiantes
        </button>
        <button className="action-btn" onClick={() => navigate('/admin/classes')}>
          Ver Cursos
        </button>
      </div>
    </div>
  );
}
