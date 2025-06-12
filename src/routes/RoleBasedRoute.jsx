import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const RoleBasedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) return <Navigate to="/login" />;
  if (!allowedRoles.includes(user.role_name)) return <Navigate to="/unauthorized" />;

  return children;
};

export default RoleBasedRoute;
