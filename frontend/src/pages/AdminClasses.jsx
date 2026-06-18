import { useEffect, useState } from 'react';
import './AdminClasses.css';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetch('http://listaalumnos.utportfolio.cloud/api/admin/courses')
      .then(res => res.json())
      .then(data => setClasses(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="admin-classes">
      <h2>Cursos Existentes</h2>
      <div className="courses-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
        {classes.map(c => (
          <div key={c.id_curso} className="notice-card" style={{ padding: '1rem' }}>
            <h3>{c.nombre}</h3>
            <p>{c.descripcion}</p>
            <span style={{ color: '#007bff' }}>Semestre: {c.semestre}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
