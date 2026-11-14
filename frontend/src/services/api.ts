import axios from 'axios';
import toast from 'react-hot-toast';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No backend running: auth calls fall back to demo mode, so stay quiet
    if (!error.response && error.config?.url?.startsWith('/api/auth')) {
      return Promise.reject(error);
    }

    if (error.response) {
      const message = error.response.data?.error?.message || 'An error occurred';
      toast.error(message);
      
      // Redirect to login on 401
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      toast.error('Network error');
    }
    
    return Promise.reject(error);
  }
);
