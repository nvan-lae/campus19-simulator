import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useRef, useEffect, useMemo } from 'react';
import './Navigation.css';

export const Navigation = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/', { replace: true });
  };

  const handleProfile = () => {
    navigate('/profile');
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultAvatarSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235B7C99'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E`;

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
          {isAuthenticated && (
            <>
              <Link to="/lobby" className="navbar-link">
                Lobby
              </Link>
            </>
          )}
          {isAuthenticated ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="navbar-link user-dropdown-toggle"
              >
                <img
                  src={user?.avatarUrl ? `${apiBase}${user.avatarUrl}` : defaultAvatarSvg}
                  alt="Avatar"
                  className="user-avatar-nav"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultAvatarSvg;
                  }}
                />
                {user?.username || 'Loading...'}
                <span className="dropdown-arrow">▼</span>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button
                    onClick={handleProfile}
                    className="dropdown-item"
                  >
                    👤 Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout-item"
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-link">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
