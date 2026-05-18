import api from "./axiosInstance";

export const fetchSalesReps = () => api.get("/sales-reps");
export const createSalesRep = (data) => api.post("/sales-reps", data);
export const updateSalesRep = (id, data) => api.put(`/sales-reps/${id}`, data);
export const deleteSalesRep = (id) => api.delete(`/sales-reps/${id}`);
