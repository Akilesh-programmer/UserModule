import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRoute = error.config?.url?.includes("/auth/login");
    // Only redirect to login on 401 (token expired/missing)
    // 403 (permission denied) is passed through so pages can handle it with toast
    if (!isAuthRoute && error.response?.status === 401) {
      localStorage.removeItem("user");
      localStorage.removeItem("permissions");
      globalThis.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
