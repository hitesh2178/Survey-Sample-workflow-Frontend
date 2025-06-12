import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

// Utility function to decode user info from access token
const decodeUserFromToken = (token) => {
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.user_id,
      full_name: decoded.full_name,
      email: decoded.email,
      role: decoded.role_id,
      role_name: decoded.role_name,
    };
  } catch (err) {
    console.error('Invalid token:', err);
    return null;
  }
};

// Initialize tokens from localStorage
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');
const user = accessToken ? decodeUserFromToken(accessToken) : null;

// Initial state
const initialState = {
  accessToken,
  refreshToken,
  user,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      const { accessToken, refreshToken } = action.payload;
      const user = decodeUserFromToken(accessToken);

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = user;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    },

    setAccessToken: (state, action) => {
      const accessToken = action.payload;
      const user = decodeUserFromToken(accessToken);

      state.accessToken = accessToken;
      state.user = user;

      localStorage.setItem('accessToken', accessToken);
    },

    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { login, logout, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
