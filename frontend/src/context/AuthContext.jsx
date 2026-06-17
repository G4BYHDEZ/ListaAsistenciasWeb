import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('asistencia-user');
    return saved ? JSON.parse(saved) : null;
  });

  // El login aquí solo guarda los datos que el componente Login ya validó
  function login(userData) {
    setUser(userData);
    localStorage.setItem('asistencia-user', JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('asistencia-user');
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}