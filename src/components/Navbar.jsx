import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/authSlice';
import '../Styles/Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { accessToken, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar">
      {/* Left: Logo */}
      <div className="nav-logo">
        <Link to="/" className="logo-link">
          Survey
        </Link>
      </div>

      {/* Right: Navigation */}
      <div className="nav-links">
        {accessToken ? (
          <>
            {/* Admin-specific links */}
            {user?.role_name === 'admin' && (
              <>
                <Link to="/users" className="nav-link">Users</Link>
                <Link to="/roles" className="nav-link">Roles</Link>
              </>
            )}

            {/* All authenticated users */}
            <Link to="/survey" className="nav-link">To Go Survey</Link>

            {/* User Info and Logout */}
            <span className="user-info">👤 {user?.full_name} ({user?.role_name})</span>
            <button className="logout-button" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            {/* Guests */}
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="nav-link">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
