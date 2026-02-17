import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-links">
          <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          <span className="footer-divider">•</span>
          <Link to="/terms" className="footer-link">Terms of Service</Link>
        </div>
        <div className="footer-copyright">
          © {new Date().getFullYear()} Campus19 Simulator
        </div>
      </div>
    </footer>
  );
};