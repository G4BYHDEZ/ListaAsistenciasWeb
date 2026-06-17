import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './TeacherDashboard.css';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  
  // Estados para controlar la visualización de la tabla de asistencia
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [studentsList, setStudentsList] = useState([]);

  // 1. Cargar los cursos asignados al profesor
  useEffect(() => {
    if (user?.id) {
      fetch(`http://listaalumnos.utportfolio.cloud:5000/api/teacher/${user.id}/courses`)
        .then(res => res.json())
        .then(data => setCourses(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  // 2. Cargar los alumnos cada vez que se selecciona un curso o cambia la fecha
  useEffect(() => {
    if (selectedCourse) {
      fetch(`http://listaalumnos.utportfolio.cloud:5000/api/courses/${selectedCourse.id_curso}/attendance/${date}`)
        .then(res => res.json())
        .then(data => setStudentsList(data))
        .catch(err => console.error("Error al cargar alumnos:", err));
    }
  }, [selectedCourse, date]);

  // 3. Cambiar el estado de asistencia de un alumno (Presente, Ausente, Retardo, Justificado)
  const handleStatusChange = (id_estudiante, nuevoEstado) => {
    setStudentsList(prev => prev.map(student => 
      student.id_estudiante === id_estudiante ? { ...student, estado: nuevoEstado } : student
    ));
  };

  // 4. Modificar las observaciones de un alumno
  const handleObservationChange = (id_estudiante, texto) => {
    setStudentsList(prev => prev.map(student => 
      student.id_estudiante === id_estudiante ? { ...student, observaciones: texto } : student
    ));
  };

  // 5. Guardar la lista de asistencia en la base de datos (Ejecuta tu sp_upsert_asistencia)
  const handleSaveAttendance = async () => {
    const registros = studentsList.map(s => ({
      id_estudiante: s.id_estudiante,
      estado: s.estado === 'Sin registro' ? 'Presente' : s.estado,
      observaciones: s.observaciones || ''
    }));

    try {
      const res = await fetch('http://listaalumnos.utportfolio.cloud:5000/api/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_curso: selectedCourse.id_curso, fecha: date, registros })
      });
      
      if (res.ok) {
        alert("Lista de asistencia guardada con éxito.");
      } else {
        alert("Hubo un error al guardar los cambios.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor.");
    }
  };

  // --- VISTA 1: TABLA DE ASISTENCIA (Si hay un curso seleccionado) ---
  if (selectedCourse) {
    return (
      <div className="teacher-dashboard">
        {/* Encabezado de la tabla */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <button 
              onClick={() => setSelectedCourse(null)} 
              style={{ marginBottom: '0.5rem', padding: '0.4rem 0.8rem', cursor: 'pointer', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              ← Volver a Cursos
            </button>
            <h2>Asistencia: {selectedCourse.nombre}</h2>
            <p style={{ color: '#666', margin: 0 }}>{selectedCourse.descripcion}</p>
          </div>

          <div>
            <label style={{ fontWeight: 'bold' }}>
              Fecha de Registro:
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                style={{ marginLeft: '0.5rem', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </label>
          </div>
        </div>

        {/* Estructura de la Tabla */}
        <div className="table-wrap" style={{ marginTop: '1.5rem' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Acciones Rápidas</th>
                <th>Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {studentsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty" style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                    No hay estudiantes inscritos en esta clase.
                  </td>
                </tr>
              ) : (
                studentsList.map(student => (
                  <tr key={student.id_estudiante} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.8rem' }}>{student.matricula}</td>
                    <td style={{ padding: '0.8rem' }}>{student.nombre}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{
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
                        placeholder="Nota o motivo..."
                        onChange={e => handleObservationChange(student.id_estudiante, e.target.value)}
                        style={{ padding: '0.4rem', width: '100%', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Botón de Enviar a Base de Datos */}
        {studentsList.length > 0 && (
          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button 
              onClick={handleSaveAttendance}
              style={{ padding: '0.7rem 1.5rem', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Guardar Lista de Asistencia
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- VISTA 2: CUADRÍCULA DE CURSOS ASIGNADOS (Por Defecto) ---
  return (
    <div className="teacher-dashboard">
      <h2>Mis Cursos Asignados</h2>
      {courses.length === 0 ? (
        <p className="empty">Hola {user?.name}, no tienes cursos asignados actualmente.</p>
      ) : (
        <div className="courses-grid" style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {courses.map(course => (
            <div key={course.id_curso} className="notice-card" style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>{course.nombre}</h3>
              <p>{course.descripcion}</p>
              <small style={{ display: 'block', color: '#666' }}>Semestre: {course.semestre}</small>
              <br />
              <button 
                className="action-btn" 
                style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                onClick={() => setSelectedCourse(course)} // Al hacer clic guarda el objeto y gatilla la tabla
              >
                Gestionar Asistencia
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
