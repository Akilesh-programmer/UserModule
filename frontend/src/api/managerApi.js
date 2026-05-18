import api from "./axiosInstance";

export const fetchManagers = () => api.get("/managers");
export const fetchActiveManagers = (area) =>
  api.get(
    `/managers?activeOnly=true${area ? `&area=${encodeURIComponent(area)}` : ""}`,
  );
export const createManager = (data) => api.post("/managers", data);
export const updateManager = (id, data) => api.put(`/managers/${id}`, data);
export const deleteManager = (id) => api.delete(`/managers/${id}`);
