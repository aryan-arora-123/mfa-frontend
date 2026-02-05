import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem('accessToken') || null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await api.post('/auth/refresh-token');
        setAccessToken(res.data.accessToken);
        localStorage.setItem('accessToken', res.data.accessToken);
        setUser(res.data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const loginWithTokens = (accessToken, user) => {
    setAccessToken(accessToken);
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
    } catch {
      // ignore
    }
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
  };

  const value = {
    user,
    accessToken,
    loading,
    loginWithTokens,
    logout,
    logoutAll,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

