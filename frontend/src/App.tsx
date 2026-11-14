import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import LecturePage from './pages/LecturePage';
import ChatPage from './pages/ChatPage';
import ConfusionMapPage from './pages/ConfusionMapPage';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'student' | 'professor' }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/professor"
            element={
              <ProtectedRoute role="professor">
                <ProfessorDashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/lecture/:id"
            element={
              <ProtectedRoute>
                <LecturePage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/chat/:lectureId"
            element={
              <ProtectedRoute role="student">
                <ChatPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/confusion-map/:lectureId"
            element={
              <ProtectedRoute role="professor">
                <ConfusionMapPage />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
