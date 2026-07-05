import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if session token exists in cookie by calling get profile on mount
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token || token === 'null' || token === 'undefined' || token === 'none') {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/user/profile');
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        // Ignored on initial load if no cookie session is found
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', userData);
      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginWithGoogle = async (googleData) => {
    setError(null);
    try {
      const res = await api.post('/auth/google', googleData);
      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } catch (err) {
      // Proceed with local logout regardless of network state
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/user/profile');
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error("Could not refresh session state:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, loginWithGoogle, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be called inside an AuthProvider wrapper');
  }
  return context;
}
