import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchManagers = () => api.get("/managers").then(unwrap);
export const fetchActiveManagers = (area) => {
  const areaParam = area ? `&area=${encodeURIComponent(area)}` : "";
  return api.get(`/managers?activeOnly=true${areaParam}`).then(unwrap);
};
export const createManager = (data) => api.post("/managers", data).then(unwrap);
export const updateManager = (id, data) =>
  api.put(`/managers/${id}`, data).then(unwrap);
export const deleteManager = (id) => api.delete(`/managers/${id}`);
