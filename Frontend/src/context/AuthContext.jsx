import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure Axios Defaults
export const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('alpha-token') || null);
  const [loading, setLoading] = useState(true);

  // Set default auth headers if token exists
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('alpha-token', token);
      fetchCurrentUser();
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('alpha-token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      setToken(response.data.token);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const response = await api.post('/auth/google', googleData);
      setToken(response.data.token);
      setUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Google Login failed';
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('alpha-token');
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/user/profile', profileData);
      setUser(prev => ({ ...prev, ...response.data }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Update profile failed';
    }
  };

  const updateSettings = async (settingsData) => {
    try {
      const response = await api.put('/user/settings', settingsData);
      setUser(prev => ({
        ...prev,
        settings: { ...prev.settings, ...response.data }
      }));
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Update settings failed';
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Forgot password failed';
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const response = await api.post(`/auth/reset-password/${resetToken}`, { password });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Reset password failed';
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/user/account');
      logout();
    } catch (error) {
      throw error.response?.data?.message || 'Delete account failed';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      googleLogin,
      logout,
      updateProfile,
      updateSettings,
      forgotPassword,
      resetPassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
