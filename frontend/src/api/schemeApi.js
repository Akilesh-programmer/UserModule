import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchSchemes = (params = {}) => api.get("/schemes", { params }).then(unwrap);
export const createScheme = (data) => api.post("/schemes", data).then(unwrap);
export const updateScheme = (id, data) =>
  api.put(`/schemes/${id}`, data).then(unwrap);
export const deleteScheme = (id) => api.delete(`/schemes/${id}`);
