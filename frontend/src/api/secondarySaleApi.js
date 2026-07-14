import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchSecondarySales = (params = {}) => api.get("/secondary-sales", { params }).then(unwrap);
export const fetchSecondarySale = (id) => api.get(`/secondary-sales/${id}`).then(unwrap);
export const createSecondarySale = (data) => api.post("/secondary-sales", data).then(unwrap);
export const markDelivered = (id) => api.put(`/secondary-sales/${id}/delivered`).then(unwrap);
export const markReturned = (id, reason) => api.put(`/secondary-sales/${id}/returned`, { reason }).then(unwrap);
