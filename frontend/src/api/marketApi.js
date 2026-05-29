import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchMarkets = () => api.get("/markets").then(unwrap);
export const fetchActiveMarkets = () => api.get("/markets/active").then(unwrap);
export const createMarket = (data) => api.post("/markets", data).then(unwrap);
export const updateMarket = (id, data) => api.put(`/markets/${id}`, data).then(unwrap);
export const deleteMarket = (id) => api.delete(`/markets/${id}`);
