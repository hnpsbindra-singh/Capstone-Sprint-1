import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NgoPendingApprovalGuard from './NgoPendingApprovalGuard';

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, getRole, user } = useContext(AuthContext);

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

  // Intercept unapproved NGOs and block all actions with the pending approval guard
  if (userRole === 'NGO' && user?.isApproved === false) {
    return <NgoPendingApprovalGuard />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
