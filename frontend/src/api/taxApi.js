import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchTaxes = () => api.get("/taxes").then(unwrap);
export const fetchActiveTaxes = () =>
  api.get("/taxes/active").then(unwrap);
export const createTax = (data) => api.post("/taxes", data).then(unwrap);
export const updateTax = (id, data) =>
  api.put(`/taxes/${id}`, data).then(unwrap);
export const deleteTax = (id) => api.delete(`/taxes/${id}`);
