import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bot } from 'lucide-react';

export default function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex flex-col items-center justify-center space-y-4">
        <Bot className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Loading Session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return <Outlet />;
}
