import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center">
        <div className="w-12 h-12 rounded-xl border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
        <p className="mt-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Loading SevaSaathi Workspace...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but role is unauthorized, fallback to homepage
    return <Navigate to="/" replace />;
  }

  return children;
}
