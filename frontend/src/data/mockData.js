const users = [
  { id: 1, email: 'admin@universidad.edu', password: 'admin123', name: 'Admin U', role: 'admin' },
  { id: 2, email: 'profesor@universidad.edu', password: 'prof123', name: 'Dr. García', role: 'teacher' },
  { id: 3, email: 'maria@universidad.edu', password: 'prof123', name: 'Mtra. López', role: 'teacher' },
];

export function getUsers() { return users; }
export function getUserByEmail(email) { return users.find(u => u.email === email); }
