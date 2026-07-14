import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchStocks = (params = {}) => api.get("/stocks", { params }).then(unwrap);
export const fetchStock = (id) => api.get(`/stocks/${id}`).then(unwrap);
export const createStock = (data) => api.post("/stocks", data).then(unwrap);
export const updateStock = (id, data) => api.put(`/stocks/${id}`, data).then(unwrap);
export const deleteStock = (id) => api.delete(`/stocks/${id}`);
export const fetchStockByDealer = (dealerId) => api.get(`/stocks/by-dealer/${dealerId}`).then(unwrap);
