// import axios from 'axios';
// import { useAuthStore } from '@/store/authStore';

// export const api = axios.create({
//   baseURL: '/api',
//   headers: { 'Content-Type': 'application/json' },
// });

// // Attach JWT to every request
// api.interceptors.request.use((config) => {
//   const token = useAuthStore.getState().token;
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // Auto-logout on 401
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       useAuthStore.getState().clearAuth();
//     }
//     return Promise.reject(err);
//   }
// );
/// <reference types="vite/client" />
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// In dev: Vite proxy forwards /api → http://localhost:5000/api
// In prod: VITE_API_BASE_URL is set to your Railway backend URL
const baseURL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(err);
  }
);
