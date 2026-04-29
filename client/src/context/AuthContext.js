import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        { email, password }
      );
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.admin);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (username, email, password, confirmPassword) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        { username, email, password, confirmPassword }
      );
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.admin);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
