import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck } from 'lucide-react';

export const TwoFactorPage = () => {
  const navigate = useNavigate();
  const { initializeWithToken } = useAuth();
  const [searchParams] = useSearchParams();

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://localhost:3000';
  }, []);

  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const userIdParam = searchParams.get('userId');
    if (!userIdParam) {
      // No userId provided, redirect back to login
      navigate('/login', { replace: true });
      return;
    }
    setUserId(parseInt(userIdParam, 10));
  }, [searchParams, navigate]);

  const handleVerify2FA = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${apiBase}/auth/2fa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token: twoFactorCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || 'Invalid verification code');
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

  if (!userId) {
    return null;
  }

  return (
    <div className="page-container bg-slate-900 min-h-screen">
      <div className="page-header">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-8 h-8 text-green-500" />
          <h1 className='text-white'>Two-Factor Authentication</h1>
        </div>
        <p className="text-sm text-gray-400">Enter the 6-digit code from your authenticator app</p>
      </div>

      <div className="login-content">
        <form className="auth-card max-w-md mx-auto" onSubmit={handleVerify2FA}>
          <div className="text-sm text-white text-center font-medium mb-4">Verification Required</div>

          <input
            required
            type="text"
            maxLength={6}
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="input text-center text-3xl tracking-[0.5em] font-mono"
            autoFocus
            autoComplete="off"
          />

          {error && <div className="error">{error}</div>}

          <button 
            className="btn btn-primary w-full mt-4" 
            type="submit" 
            disabled={isSubmitting || twoFactorCode.length !== 6}
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>

          <button 
            type="button" 
            className="btn btn-secondary w-full mt-2" 
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};
