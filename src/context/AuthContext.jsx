/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Load auth state from localStorage on mount - simple and reliable
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const savedToken = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('authUser');

        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);
          console.log('✅ Auth state restored from localStorage:', parsedUser.email);
        }
      } catch (err) {
        console.error('❌ Error loading auth state:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const register = async (email, password, name, type, profile = {}) => {
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, type, profile })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      console.log('✅ User registered successfully:', email);

      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      const errorMsg = err.message || 'Registration failed';
      setError(errorMsg);
      console.error('❌ Registration error:', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed');
      }

      if (!data.user || !data.token) {
        throw new Error('Invalid server response - missing user or token');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      console.log('✅ User logged in successfully:', email, 'Type:', data.user.type);

      return { success: true, user: data.user, token: data.token };
    } catch (err) {
      const errorMsg = err.message || 'Login failed';
      setError(errorMsg);
      console.error('❌ Login error:', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    localStorage.clear();
  };

  // update user object in context and localStorage after profile changes
  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('authUser', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving updated user to localStorage', err);
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      error,
      register,
      login,
      logout,
      updateUser,
      isAuthenticated: !!token,
      isClient: user?.type === 'client',
      isProvider: user?.type === 'provider'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
