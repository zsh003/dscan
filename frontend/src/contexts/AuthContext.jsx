import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userData = await authApi.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('认证检查失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (username, password) => {
    try {
      const data = await authApi.login(username, password);
      const { access, refresh, user: userData } = data;
      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(userData);
      navigate('/');
      return true;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('登出请求失败:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      navigate('/login');
    }
  };

  const updateProfile = async (data) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
      return true;
    } catch (error) {
      console.error('更新个人信息失败:', error);
      return false;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 