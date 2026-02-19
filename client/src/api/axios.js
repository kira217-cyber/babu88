// src/api/axios.js
import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:5000
});

// ✅ Automatically attach token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // 🔐 token storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);
