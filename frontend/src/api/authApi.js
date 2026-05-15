import api from "./axiosInstance";

export const loginUser = (credentials) => api.post("/auth/login", credentials);
