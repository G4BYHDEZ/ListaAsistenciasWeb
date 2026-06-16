import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import AdminStudents from './pages/AdminStudents';
import AdminClasses from './pages/AdminClasses';
import TeacherDashboard from './pages/TeacherDashboard';
import CourseDetail from './pages/CourseDetail';
import AttendancePage from './pages/AttendancePage';
import './App.css';

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/profesor'} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/profesor'} replace /> : <Login />} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><Layout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="classes" element={<AdminClasses />} />
      </Route>
      <Route path="/profesor" element={<ProtectedRoute role="teacher"><Layout /></ProtectedRoute>}>
        <Route index element={<TeacherDashboard />} />
        <Route path=":courseId/subjects/:subjectId/attendance" element={<AttendancePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
