import { useState } from 'react';
import api from '../services/axios';
import { useDispatch } from 'react-redux';
import { login } from '../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import '../Styles/Auth.css';

const Signup = () => {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role_name: '',
  });
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Signup request
      await api.post('/auth/signup', form);
      // Automatically login after signup
      const { data } = await api.post('/auth/signin', {
        email: form.email,
        password: form.password,
      });
      dispatch(login(data));
      navigate('/dashboard');
    } catch (err) {
      setError('Signup failed. Please check your details and try again.');
      console.error('Signup error:', err);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="full_name">Full Name</label>
        <input
          id="full_name"
          type="text"
          placeholder="Enter your full name"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />

        <label htmlFor="role_name">Role</label>
        <select
          id="role_name"
          className="custom-select"
          value={form.role_name}
          onChange={(e) => setForm({ ...form, role_name: e.target.value })}
          required
        >
          <option value="" disabled>
            Select role
          </option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>

        {error && <p style={{ color: 'red', marginBottom: '12px' }}>{error}</p>}

        <button type="submit" className="signup-button">Register</button>
      </form>

      <div className="auth-link">
        Already have an account? <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Signup;
