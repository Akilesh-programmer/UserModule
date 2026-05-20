import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchSalesReps = () => api.get("/sales-reps").then(unwrap);
export const createSalesRep = (data) =>
  api.post("/sales-reps", data).then(unwrap);
export const updateSalesRep = (id, data) =>
  api.put(`/sales-reps/${id}`, data).then(unwrap);
export const deleteSalesRep = (id) => api.delete(`/sales-reps/${id}`);
