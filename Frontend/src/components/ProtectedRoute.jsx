import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, getRole } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = getRole();

  if (role) {
    if (Array.isArray(role)) {
      if (!role.includes(userRole)) {
        return <Navigate to="/login" replace />;
      }
    } else if (userRole !== role) {
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
