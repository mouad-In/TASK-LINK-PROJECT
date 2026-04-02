import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// 🔐 REQUEST INTERCEPTOR
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));

    // ✅ Laravel يرجع access_token مش token
    if (user?.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ⚠️ RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Laravel validation error (422)
    if (error.response?.status === 422) {
      console.log('Validation errors:', error.response.data.errors);
    }

    // Unauthorized — token expired أو غير صالح
    if (error.response?.status === 401) {
      localStorage.removeItem('user');

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;