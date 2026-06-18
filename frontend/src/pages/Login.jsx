import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth(); // Traemos la función para guardar estado
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    try {
      // Hacemos la validación directa aquí
      const response = await fetch('http://localhost:5099/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      // Si las credenciales están mal (Ej: error 401 de sp_login)
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || 'Credenciales incorrectas.');
        return;
      }

      // Si el login en la Base de Datos es correcto
      const userData = await response.json();
      
      // Guardamos al usuario globalmente en el Context
      login(userData);

      // Redireccionamos según el rol asignado en la BD
      navigate(userData.role === 'admin' ? '/admin' : '/profesor');

    } catch (err) {
      // Si el backend sigue apagado, aquí atrapas el "Failed to fetch" de forma amigable
      console.error(err);
      setError('No se pudo conectar con el servidor. Verifica que el backend esté encendido.');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">U</div>
          <h1>Sistema de Asistencia</h1>
          <p className="login-sub">Universidad - Control de Asistencia</p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>Correo institucional</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="ejemplo@universidad.edu"
              required
            />
          </label>
          <label>
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          {error && <p className="login-error" style={{ color: 'red', marginTop: '0.5rem' }}>{error}</p>}
          <button type="submit" className="btn-login">Iniciar sesión</button>
        </form>
        <div className="login-footer">
        </div>
      </div>
    </div>
  );
}