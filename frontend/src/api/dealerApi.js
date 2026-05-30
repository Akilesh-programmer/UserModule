import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchDealers = () => api.get("/dealers").then(unwrap);
export const fetchActiveDealers = () => api.get("/dealers/active").then(unwrap);
export const createDealer = (data) => api.post("/dealers", data).then(unwrap);
export const updateDealer = (id, data) => api.put(`/dealers/${id}`, data).then(unwrap);
export const deleteDealer = (id) => api.delete(`/dealers/${id}`);
