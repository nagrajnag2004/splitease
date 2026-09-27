import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('splitease_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      setUser(res.data);
      localStorage.setItem('splitease_user', JSON.stringify(res.data));
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, avatar) => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/auth/register', { name, email, password, avatar });
      setUser(res.data);
      localStorage.setItem('splitease_user', JSON.stringify(res.data));
      return { success: true, data: res.data };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('splitease_user');
  };

  const seedDemoData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post('/seed');
      // Auto login as Alex
      const loginRes = await axiosInstance.post('/auth/login', {
        email: 'alex@splitease.dev',
        password: 'password123'
      });
      setUser(loginRes.data);
      localStorage.setItem('splitease_user', JSON.stringify(loginRes.data));
      return { success: true, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Seeding failed.' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        seedDemoData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
