import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchDashboardStats = () => api.get("/dashboard/stats").then(unwrap);
