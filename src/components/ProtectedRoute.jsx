import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useHealthStore from '../store/healthStore';

const ProtectedRoute = () => {
  const isAuthenticated = useHealthStore((state) => state.user.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
