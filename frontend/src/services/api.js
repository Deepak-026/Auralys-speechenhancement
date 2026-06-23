import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10 * 60 * 1000, // 10 min for large file processing
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Network error. Please check your connection.';
    const enriched = new Error(message);
    enriched.status = error.response?.status;
    enriched.data = error.response?.data;
    return Promise.reject(enriched);
  }
);

export default api;
