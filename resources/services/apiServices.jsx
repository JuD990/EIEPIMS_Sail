import axios from 'axios';

// Get the base from env
const BASE_API_URL = import.meta.env.VITE_API_BASE_URL; // Should be http://localhost/api
console.log(BASE_API_URL);
const apiService = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

apiService.interceptors.request.use(
  (config) => {
    // 1. DYNAMIC BASE URL LOGIC
    // If the URL is for sanctum, we temporarily change the baseURL to the root
    if (config.url.includes('/sanctum/csrf-cookie')) {
      config.baseURL = BASE_API_URL.replace('/api', ''); 
    } else {
      config.baseURL = BASE_API_URL;
    }

    // 2. CSRF TOKEN
    const csrfToken = document.querySelector('meta[name="csrf-token"]');
    if (csrfToken) {
      const token = csrfToken.getAttribute('content');
      if (token) config.headers['X-CSRF-TOKEN'] = token;
    }

    // 3. AUTH TOKEN
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default apiService;