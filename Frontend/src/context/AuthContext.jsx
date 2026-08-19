import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        return jwtDecode(savedToken);
      } catch (error) {
        console.error('Error decoding stored JWT on initial state:', error);
        return null;
      }
    }
    return null;
  });

  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check token expiration if 'exp' field is present
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setToken(null);
          setUser(null);
        } else {
          setToken(storedToken);
          setUser(decoded);
        }
      } catch (error) {
        console.error('Error decoding stored JWT on mount:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUser(null);
      }
    }
  }, []);

  const login = (tokenString, userId) => {
    localStorage.setItem('token', tokenString);
    if (userId !== undefined && userId !== null) {
      localStorage.setItem('userId', userId.toString());
    }
    try {
      const decoded = jwtDecode(tokenString);
      setToken(tokenString);
      setUser(decoded);
    } catch (error) {
      console.error('Error decoding JWT on login:', error);
      setToken(tokenString);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setToken(null);
    setUser(null);
    try {
      navigate('/login');
    } catch (e) {
      window.location.href = '/login';
    }
  };

  const isAuthenticated = Boolean(token);

  const getUserId = () => {
    return localStorage.getItem('userId') || user?.sub || null;
  };

  const getRole = () => {
    return user?.role;
  };

  const getUsername = () => {
    return user?.sub;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated,
        getUserId,
        getRole,
        getUsername
      }}
    >
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
