import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { initializeWithToken } = useAuth();

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://localhost:3000';
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Invalid credentials');
        setIsSubmitting(false);
        return;
      }

      if (data?.access_token) {
        await initializeWithToken(data.access_token);
        navigate('/', { replace: true });
      } else {
        setError('No access token returned from server');
      }
    } catch {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container bg-slate-900 min-h-screen">
      <div className="page-header">
        <h1 className='text-white'>Login</h1>
        <p className="text-sm text-gray-400">Sign in with 42 or with an email/password account.</p>
      </div>

      <div className="login-content">
        <div className="auth-grid">
          <div className="auth-card">
            <div className="text-sm text-white text-center font-medium">Continue with 42</div>
            <p className="text-sm text-gray-400 text-center">Use your 42 account to quickly sign in.</p>
            <a
              className="btn btn-primary w-full text-center mt-2"
              href={`${apiBase}/auth/login`}
            >
              Login with 42
            </a>
          </div>

          <form className="auth-card" onSubmit={handleEmailLogin}>
            <div className="text-sm text-white text-center font-medium">Sign in with email</div>

            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input"
            />

            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="input"
            />

            {error && <div className="error">{error}</div>}

            <button className="btn btn-primary w-full mt-2" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>

          </form>
        </div>

        <div className="box auth-footer flex items-center justify-center gap-3">
          <span className='text-gray-400'>Don’t have an account?</span>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>
    </div>
  );
};
