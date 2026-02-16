import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navigation } from '../components/layout/Navigation';
import { Footer } from '../components/layout/Footer';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { MainMenu } from '../features/menu/MainMenu';
import { HomePage } from '../features/home/HomePage';
import { LobbyPage } from '../features/lobby/LobbyPage';
import { GamePage } from '../features/game/pages/GamePage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { LoginPage } from '../features/login/LoginPage';
import { RegisterPage } from '../features/login/RegisterPage';
import { TwoFactorPage } from '../features/login/TwoFactorPage';
import { PrivacyPage } from '../features/legal/PrivacyPage';
import { TermsPage } from '../features/legal/TermsPage';

function AppContent() {
  const location = useLocation();
  const isGamePage = location.pathname.startsWith('/game/');

  if (isGamePage) {
    return (
      <Routes>
        <Route
          path="/game/:gameId"
          element={
            <ProtectedRoute>
              <GamePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="app-wrapper">
      <Navigation />
      <main className="app-content">
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
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route
            path="/lobby/:gameId"
            element={
              <ProtectedRoute>
                <LobbyPage />
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
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;