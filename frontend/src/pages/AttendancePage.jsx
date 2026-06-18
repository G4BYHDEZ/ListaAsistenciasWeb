import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './AttendancePage.css';

export default function AttendancePage() {
  const { courseId } = useParams(); // Captura el id del curso desde la URL
  const [view, setView] = useState('attendance');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Estados para datos de la API
  const [studentsList, setStudentsList] = useState([]);
  const [reportList, setReportList] = useState([]);
  const [historyList, setHistoryList] = useState([]);

  // Efecto 1: Carga alumnos y asistencia de la fecha seleccionada
  useEffect(() => {
    if (view === 'attendance') {
      fetch(`http://listaalumnos.utportfolio.cloud/api/courses/${courseId}/attendance/${date}`)
        .then(res => res.json())
        .then(data => setStudentsList(data))
        .catch(err => console.error(err));
    }
  }, [courseId, date, view]);

  // Efecto 2: Carga reportes o historial según la pestaña activa
  useEffect(() => {
    if (view === 'report') {
      fetch(`http://listaalumnos.utportfolio.cloud/api/courses/${courseId}/summary`)
        .then(res => res.json())
        .then(data => setReportList(data))
        .catch(err => console.error(err));
    } else if (view === 'history') {
      fetch(`http://listaalumnos.utportfolio.cloud/api/courses/${courseId}/history`)
        .then(res => res.json())
        .then(data => setHistoryList(data))
        .catch(err => console.error(err));
    }
  }, [courseId, view]);

  // Manejador del cambio de estado de un alumno en la UI local
  const handleStatusChange = (id_estudiante, field, value) => {
    setStudentsList(prev => prev.map(item => 
      item.id_estudiante === id_estudiante ? { ...item, [field]: value } : item
    ));
  };

  // Guardar la lista completa del día en la Base de Datos
  const handleSaveAttendance = async () => {
    const registros = studentsList.map(s => ({
      id_estudiante: s.id_estudiante,
      estado: s.estado === 'Sin registro' ? 'Presente' : s.estado, // Default preventivo
      observaciones: s.observaciones
    }));

    try {
      const res = await fetch('http://listaalumnos.utportfolio.cloud/api/attendance/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_curso: courseId, fecha: date, registros })
      });
      const data = await res.json();
      if (data.success) {
        alert("Asistencia guardada correctamente.");
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar asistencia.");
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header">
        <div>
          <h2>Control de Asistencia</h2>
          <p className="attendance-meta">Curso ID: {courseId}</p>
        </div>
        <div className="attendance-controls">
          {view === 'attendance' && (
            <label className="date-label">
              Fecha:
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </label>
          )}
          <button className={`toggle-btn ${view === 'attendance' ? 'active' : ''}`} onClick={() => setView('attendance')}>
            Asistencia
          </button>
          <button className={`toggle-btn ${view === 'report' ? 'active' : ''}`} onClick={() => setView('report')}>
            Reporte
          </button>
          <button className={`toggle-btn ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>
            Historial
          </button>
        </div>
      </div>

      <div className="table-wrap">
        {view === 'attendance' && (
          <>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Estudiante</th>
                  <th>Estado</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.map(s => (
                  <tr key={s.id_estudiante}>
                    <td>{s.matricula}</td>
                    <td>{s.nombre}</td>
                    <td>
                      <select 
                        value={s.estado} 
                        onChange={e => handleStatusChange(s.id_estudiante, 'estado', e.target.value)}
                      >
                        <option value="Sin registro">Sin Registro</option>
                        <option value="Presente">Presente</option>
                        <option value="Ausente">Ausente</option>
                        <option value="Retardo">Retardo</option>
                        <option value="Justificado">Justificado</option>
                      </select>
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={s.observaciones || ''} 
                        placeholder="Sin observaciones"
                        onChange={e => handleStatusChange(s.id_estudiante, 'observaciones', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="action-btn" onClick={handleSaveAttendance} style={{ padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
              Guardar Registro de Hoy
            </button>
          </>
        )}

        {view === 'report' && (
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nombre</th>
                <th>Clases</th>
                <th>Pres.</th>
                <th>Aus.</th>
                <th>Ret.</th>
                <th>Just.</th>
                <th>% Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {reportList.map(r => (
                <tr key={r.id_estudiante}>
                  <td>{r.matricula}</td>
                  <td>{r.nombre}</td>
                  <td>{r.total_clases}</td>
                  <td>{r.presentes}</td>
                  <td>{r.ausentes}</td>
                  <td>{r.retardos}</td>
                  <td>{r.justificados}</td>
                  <td><strong>{r.pct_asistencia}%</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === 'history' && (
          <table className="table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Alumnos Evaluados</th>
                <th>Presentes</th>
                <th>Ausentes</th>
                <th>Retardos</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((h, index) => (
                <tr key={index}>
                  <td>{new Date(h.fecha).toLocaleDateString()}</td>
                  <td>{h.alumnos_registrados}</td>
                  <td>{h.presentes}</td>
                  <td>{h.ausentes}</td>
                  <td>{h.retardos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
