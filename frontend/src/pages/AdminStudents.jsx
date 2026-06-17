import { useEffect, useState } from 'react';
import './AdminStudents.css';

export default function AdminStudents() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsList, setStudentsList] = useState([]);

  // 1. Cargar la lista de cursos disponibles para el Administrador al iniciar
  useEffect(() => {
    fetch('http://listaalumnos.utportfolio.cloud/api/admin/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        if (data.length > 0) {
          setSelectedCourse(data[0].id_curso); // Selecciona el primer curso por defecto
        }
      })
      .catch((err) => console.error('Error al cargar cursos:', err));
  }, []);

  // 2. Cargar los alumnos y sus asistencias cuando cambia el curso o la fecha elegida
  useEffect(() => {
    if (selectedCourse) {
      fetch(`http://listaalumnos.utportfolio.cloud/api/courses/${selectedCourse}/attendance/${date}`)
        .then((res) => res.json())
        .then((data) => setStudentsList(data))
        .catch((err) => console.error('Error al cargar alumnos:', err));
    }
  }, [selectedCourse, date]);

  // 3. Manejar el cambio de estado (Presente, Ausente, Retardo, Justificado) en la interfaz local
  const handleStatusChange = (id_estudiante, nuevoEstado) => {
    setStudentsList((prev) =>
      prev.map((student) =>
        student.id_estudiante === id_estudiante ? { ...student, estado: nuevoEstado } : student
      )
    );
  };

  // 4. Manejar el cambio en las observaciones escritas
  const handleObservationChange = (id_estudiante, texto) => {
    setStudentsList((prev) =>
      prev.map((student) =>
        student.id_estudiante === id_estudiante ? { ...student, observaciones: texto } : student
      )
    );
  };

  // 5. Guardar los registros modificados enviándolos al endpoint masivo que usa sp_upsert_asistencia
  const handleSaveAttendance = async () => {
    const registros = studentsList.map((s) => ({
      id_estudiante: s.id_estudiante,
      estado: s.estado === 'Sin registro' ? 'Presente' : s.estado, // Default preventivo si no se ha tocado
      observaciones: s.observaciones || ''
    }));

    try {
      const res = await fetch('http://listaalumnos.utportfolio.cloud/api/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_curso: selectedCourse, fecha: date, registros })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Asistencias actualizadas y guardadas con éxito por el Administrador.');
      } else {
        alert('Error del servidor: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error de red al intentar guardar la asistencia.');
    }
  };

  return (
    <div className="admin-students">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Control y Auditoría de Asistencias</h2>
        
        {/* Controles de Selección */}
        <div className="admin-filters" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: 'bold' }}>
            Curso: 
            <select 
              value={selectedCourse} 
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px' }}
            >
              {courses.map((c) => (
                <option key={c.id_curso} value={c.id_curso}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </label>

          <label style={{ fontWeight: 'bold' }}>
            Fecha: 
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </label>
        </div>
      </div>

      {/* Tabla Dinámica */}
      <div className="table-wrap" style={{ marginTop: '1.5rem' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Código / Matrícula</th>
              <th>Nombre</th>
              <th>Estado Actual</th>
              <th>Acciones de Asistencia</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            {studentsList.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                  No hay estudiantes inscritos en este curso o cargados en la base de datos.
                </td>
              </tr>
            ) : (
              studentsList.map((student) => (
                <tr key={student.id_estudiante} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.8rem' }}>{student.matricula}</td>
                  <td style={{ padding: '0.8rem' }}>{student.nombre}</td>
                  <td style={{ padding: '0.8rem' }}>
                    <span className={`badge status-${student.estado?.toLowerCase().replace(' ', '-')}`} style={{
                      padding: '0.3rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      backgroundColor: 
                        student.estado === 'Presente' ? '#e2f0d9' :
                        student.estado === 'Ausente' ? '#fce4d6' :
                        student.estado === 'Retardo' ? '#fff2cc' :
                        student.estado === 'Justificado' ? '#deebf7' : '#f2f2f2',
                      color:
                        student.estado === 'Presente' ? '#385723' :
                        student.estado === 'Ausente' ? '#c65911' :
                        student.estado === 'Retardo' ? '#7f6000' :
                        student.estado === 'Justificado' ? '#1f4e78' : '#595959'
                    }}>
                      {student.estado}
                    </span>
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    {/* Botonera interactiva para cambiar los estados ENUM mapeados */}
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button 
                        type="button"
                        onClick={() => handleStatusChange(student.id_estudiante, 'Presente')}
                        style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
                      >
                        Asistencia
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleStatusChange(student.id_estudiante, 'Ausente')}
                        style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
                      >
                        Falta
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleStatusChange(student.id_estudiante, 'Retardo')}
                        style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '4px' }}
                      >
                        Retardo
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleStatusChange(student.id_estudiante, 'Justificado')}
                        style={{ padding: '0.3rem 0.6rem', cursor: 'pointer', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px' }}
                      >
                        Justificar
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '0.8rem' }}>
                    <input 
                      type="text" 
                      value={student.observaciones || ''} 
                      placeholder="Añadir nota..."
                      onChange={(e) => handleObservationChange(student.id_estudiante, e.target.value)}
                      style={{ padding: '0.4rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Botón Global de Guardado */}
      {studentsList.length > 0 && (
        <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
          <button 
            className="action-btn" 
            onClick={handleSaveAttendance}
            style={{ padding: '0.7rem 1.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            Confirmar y Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
}
