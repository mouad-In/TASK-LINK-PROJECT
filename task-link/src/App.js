import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import TaskLinkLanding from './pages/TaskLinkLanding';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import CreateTask from './pages/CreateTask';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import TaskMap from './pages/TaskMap';
import Reviews from './pages/Reviews';
import Admin from './pages/Admin';
import Notifications from './pages/Notifications';
import Workers from './pages/Workers';



// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  // Allow register if ?role= param present (fresh registration intent), even if stale localStorage
  const isRegisterIntent = location.pathname === '/register' && location.search.includes('?role=');
  if (isAuthenticated && !isRegisterIntent) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing Page - Public */}
        <Route path="/" element={<TaskLinkLanding />} />

        {/* Auth Routes */}
        <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          {/* Common Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/create" element={
            <ProtectedRoute allowedRoles={['client']}>
              <CreateTask />
            </ProtectedRoute>
          } />
          <Route path="/tasks/edit/:id" element={
            <ProtectedRoute allowedRoles={['client']}>
              <CreateTask isEdit />
            </ProtectedRoute>
          } />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/edit-profile/:id" element={<EditProfile />} />

          <Route path="/map" element={<TaskMap />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/workers" element={
            <ProtectedRoute allowedRoles={['client']}>
              <Workers />
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          } />
        </Route>

        {/* Default Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

