import api from "./axiosInstance";

export const loginUser = (credentials) => api.post("/auth/login", credentials);
export const logoutUser = () => api.post("/auth/logout");
