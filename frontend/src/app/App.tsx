import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from '../components/layout/Navigation';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthProvider } from '../contexts/AuthContext';
import { HomePage } from '../features/home/HomePage';
import { LobbyPage } from '../features/lobby/LobbyPage';
import { GamePage } from '../features/game/pages/GamePage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { LoginPage } from '../features/login/LoginPage';
import { RegisterPage } from '../features/login/RegisterPage';
import '../styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <LobbyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/game/:matchId"
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
