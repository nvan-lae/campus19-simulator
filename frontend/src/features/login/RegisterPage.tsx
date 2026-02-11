import { useState, useMemo, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { initializeWithToken } = useAuth();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBase = useMemo(() => {
    return (
      import.meta.env.VITE_API_URL?.replace(/\/$/, '') ||
      'https://localhost:3000'
    );
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBase}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || data?.error || 'Registration failed');
        setIsSubmitting(false);
        return;
      }

      if (data?.access_token) {
        await initializeWithToken(data.access_token);
        navigate('/', { replace: true });
      } else {
        // Fallback: try to login
        const loginRes = await fetch(`${apiBase}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData?.access_token) {
          await initializeWithToken(loginData.access_token);
          navigate('/', { replace: true });
        } else {
          setError('Registration succeeded but automatic login failed');
        }
      }
    } catch {
      setError('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Register</h1>
        <p className="text-sm text-gray-200/90">Create an account with your email.</p>
      </div>

      <div className="login-content">
        <div className="auth-grid">
          <form className="auth-card" onSubmit={handleSubmit}>
            <div className="text-sm text-gray-700 dark:text-gray-200 text-center">Create account</div>

            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="input"
            />

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

            <input
              required
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="input"
            />

            {error && <div className="error">{error}</div>}

            <button className="btn btn-primary w-full mt-2" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Create account'}
            </button>
          </form>

          <div className="auth-card">
            <div className="text-sm text-gray-700 dark:text-gray-200 text-center">Quick signup</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Use your 42 account to create an account instantly.</p>
            <a
              className="btn btn-primary w-full mt-2"
              href={`${apiBase}/auth/login`}
            >
              Sign up with 42
            </a>
          </div>
        </div>

        <div className="box auth-footer flex items-center justify-center gap-3">
          <span className='text-gray-400'>Already have an account?</span>
          <Link to="/login" className="btn btn-secondary">Login</Link>
        </div>
      </div>
    </div>
  );
};
