import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from '../components/layout/Navigation';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainMenu } from '../features/menu/MainMenu';
import { HomePage } from '../features/home/HomePage';
import { LobbyPage } from '../features/lobby/LobbyPage';
import { GamePage } from '../features/game/pages/GamePage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { LoginPage } from '../features/login/LoginPage';
import { RegisterPage } from '../features/login/RegisterPage';
import { TwoFactorPage } from '../features/login/TwoFactorPage';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainMenu />
            </ProtectedRoute>
          }
        />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-2fa" element={<TwoFactorPage />} />
        <Route
          path="/lobby/:gameId"
          element={
            <ProtectedRoute>
              <LobbyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/game/:gameId"
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
  );
}

export default App;
