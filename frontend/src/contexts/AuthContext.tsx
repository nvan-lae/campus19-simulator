import { createContext, useContext, useEffect, useState, type ReactNode, useMemo } from 'react';
import type { User } from '../types/game';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  initializeWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [isLoading] = useState(false); // Not loading by default

  const apiBase = useMemo(() => {
    return import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'https://localhost:3000';
  }, []);

  type BackendUser = Omit<User, 'avatar'> & {
    avatarUrl?: string;
  };

  // Map backend field names to frontend field names
  // Backend uses "avatarUrl", frontend User type uses "avatar"
  const normalizeUser = (data: BackendUser): User => {
    const { avatarUrl, ...rest } = data;
    return { ...rest, avatar: avatarUrl } as User;
  };

  // On mount, if we have a token, fetch user data in the background (non-blocking)
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');

    if (!storedToken) {
      console.log('[Auth] No stored token');
      return;
    }

    console.log('[Auth] Loading user data from stored token');
    let isMounted = true;

    // Load user data asynchronously, don't block with isLoading
    const loadUser = async () => {
      try {
        const res = await fetch(`${apiBase}/users/me`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!isMounted) return;

        if (res.ok) {
          const rawData = await res.json();
          const userData = normalizeUser(rawData);
          console.log('[Auth] User loaded:', userData.username);
          
          // Fetch stats separately
          try {
            const statsRes = await fetch(`${apiBase}/users/me/stats`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (statsRes.ok) {
              const stats = await statsRes.json();
              if (!isMounted) return;
              setUser({ ...userData, stats });
            } else {
              if (!isMounted) return;
              setUser(userData);
            }
          } catch {
            // If stats fetch fails, still set user without stats
            if (!isMounted) return;
            setUser(userData);
          }
        } else if (res.status === 401) {
          if (!isMounted) return;
          console.log('[Auth] Token invalid (401), clearing');
          localStorage.removeItem('access_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('[Auth] Error loading user:', err);
      }
    };

    loadUser();
    return () => {
      isMounted = false;
    };
  }, [apiBase]);

  const login = async (newToken: string) => {
    try {
      const res = await fetch(`${apiBase}/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to verify token');
      }

      const rawLoginData = await res.json();
      const userData = normalizeUser(rawLoginData);
      
      // Fetch stats
      try {
        const statsRes = await fetch(`${apiBase}/users/me/stats`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        
        if (statsRes.ok) {
          const stats = await statsRes.json();
          localStorage.setItem('access_token', newToken);
          setToken(newToken);
          setUser({ ...userData, stats });
        } else {
          localStorage.setItem('access_token', newToken);
          setToken(newToken);
          setUser(userData);
        }
      } catch {
        localStorage.setItem('access_token', newToken);
        setToken(newToken);
        setUser(userData);
      }
    } catch (err) {
      console.error('Login error:', err);
      localStorage.removeItem('access_token');
      setToken(null);
      setUser(null);
      throw err;
    }
  };

  const initializeWithToken = async (newToken: string) => {
    // Same as login but for when we get a token from OAuth callback
    return login(newToken);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser,
    initializeWithToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
