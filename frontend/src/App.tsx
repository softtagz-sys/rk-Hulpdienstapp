import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
    );
  }

  if (!isAuthenticated) {
    return (
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
    );
  }

  return (
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Header />
          <Routes>
            <Route
                path="/"
                element={
                  user?.role === 'supervisor' ?
                      <SupervisorDashboard /> :
                      <VolunteerDashboard />
                }
            />
            <Route path="/services/:id" element={<ServiceDetailPage />} />
            <Route path="/services/:id/register" element={<ServiceRegistration />} />
            <Route path="/services/:id/edit" element={<EditService />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/services/create" element={<CreateService />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
  );
};

export default App;