import axios from 'axios';
import crypto from 'crypto';
import store from './redux/store';

const API = axios.create({
  baseURL: 'http://localhost:9000/api',
});

// Hash token function
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Request interceptor to add auth token
API.interceptors.request.use((config) => {
  const { token } = store.getState().auth;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logoutSuccess());
    }
    return Promise.reject(error);
  }
);

export default API;