import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // যেমন: http://localhost:5000
});

// token attach helper
export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
};

// ✅ session invalidated (password changed / admin deleted / token expired)
// -> force logout on this device too, everywhere in the app
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("admin");
      localStorage.removeItem("token");
      setAuthToken(null);

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
