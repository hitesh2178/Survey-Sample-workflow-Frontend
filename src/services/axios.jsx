import axios from 'axios';
import store from '../redux/store';
import { logout, setAccessToken } from '../redux/authSlice';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config;
    if (err.response?.status === 401 && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
        const refreshToken = store.getState().auth.refreshToken;
        const { data } = await axios.post('http://localhost:5000/api/auth/refresh-token', { token: refreshToken });
        store.dispatch(setAccessToken(data.accessToken));
        originalConfig.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalConfig);
      } catch (refreshErr) {
        store.dispatch(logout());
        window.location.href = '/signup';
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
