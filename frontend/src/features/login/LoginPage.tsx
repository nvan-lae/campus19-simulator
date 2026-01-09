import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { initializeWithToken } = useAuth();

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3000';
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      initializeWithToken(token).then(() => {
        navigate('/', { replace: true });
      }).catch(() => {
        // Failed to login, stay on login page
      });
    }
  }, [navigate, initializeWithToken]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Login</h1>
        <p className="text-sm text-gray-200/90">Use your 42 account to sign in.</p>
      </div>

      <div className="login-content">
        <div className="box flex flex-col gap-3">
          <div className="text-sm text-gray-700 dark:text-gray-200">Continue with 42</div>
          <a
            className="btn btn-primary w-full text-center"
            href={`${apiBase}/auth/login`}
          >
            Login with 42
          </a>
        </div>

        <div className="box text-center text-sm text-gray-500 dark:text-gray-400">
          We only support 42 login for now.
        </div>
      </div>
    </div>
  );
};
