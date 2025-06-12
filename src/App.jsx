import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './routes/PrivateRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Unauthorized from './pages/Unauthorized';
import Survey from './pages/Survey';
import SurveyResponse from './pages/SurveyResponse';

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <RoleBasedRoute allowedRoles={['admin']}>
              <Users />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <RoleBasedRoute allowedRoles={['admin', 'manager']}>
              <Roles />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/survey"
          element={
            <PrivateRoute>
              <Survey />
            </PrivateRoute>
          }
        />

        <Route
          path="/survey-response"
          element={
            <PrivateRoute>
              <SurveyResponse />
            </PrivateRoute>
          }
        />

        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
