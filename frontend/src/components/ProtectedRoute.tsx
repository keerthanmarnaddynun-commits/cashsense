import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowUnverified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowUnverified = false 
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1020] text-white flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold text-gray-400">Loading CashSense OS...</span>
      </div>
    );
  }

  // 1. If not authenticated, redirect to /login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If authenticated but not verified, and this route requires verification
  if (user && !user.isVerified && !allowUnverified) {
    return <Navigate to="/verify-email" replace />;
  }

  // 3. If authenticated, verified, and trying to access verify-email page
  if (user && user.isVerified && allowUnverified && location.pathname === '/verify-email') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
