import { Link } from 'react-router-dom';
import './Navigation.css';

export const Navigation = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Campus19
        </Link>
        <div className="navbar-menu">
          <Link to="/" className="navbar-link">
            Home
          </Link>
          <Link to="/lobby" className="navbar-link">
            Lobby
          </Link>
          <Link to="/profile" className="navbar-link">
            Profile
          </Link>
          <Link to="/login" className="navbar-link">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};
