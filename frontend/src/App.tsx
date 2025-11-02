import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Header from './components/common/Header';
import LoadingSpinner from './components/common/LoadingSpinner';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VolunteerDashboard from './pages/VolunteerDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ServiceRegistration from './pages/ServiceRegistration';
import Profile from './pages/Profile';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show loading spinner until auth check completes
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render anything if auth check failed but we're on a protected route
  // This prevents the flash of "not logged in" message
  if (!isAuthenticated && !isLoading && !['/login', '/signup'].includes(location.pathname)) {
    // Will be redirected by the route guard below
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Header />}
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!isAuthenticated ? <Signup /> : <Navigate to="/" replace />}
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'supervisor' ? <SupervisorDashboard /> : <VolunteerDashboard />
            ) : (
              <Navigate to="/login" state={{ from: location }} replace />
            )
          }
        />
        <Route
          path="/services/:id"
          element={isAuthenticated ? <ServiceDetailPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/services/:id/register"
          element={isAuthenticated ? <ServiceRegistration /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/services/:id/edit"
          element={isAuthenticated ? <EditService /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/services/create"
          element={isAuthenticated ? <CreateService /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  );
};

export default App;