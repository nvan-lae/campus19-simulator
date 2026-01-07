import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from '../components/layout/Navigation';
import { HomePage } from '../features/home/HomePage';
import { LobbyPage } from '../features/lobby/LobbyPage';
import { GamePage } from '../features/game/pages/GamePage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { LoginPage } from '../features/login/LoginPage';
import '../styles/App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lobby" element={<LobbyPage />} />
        <Route path="/game/:matchId" element={<GamePage />} />
        <Route path="/profile/:userId" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
