import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchSchemePdfs = () => api.get("/scheme-pdfs").then(unwrap);
export const createSchemePdf = (data) =>
  api.post("/scheme-pdfs", data).then(unwrap);
export const updateSchemePdf = (id, data) =>
  api.put(`/scheme-pdfs/${id}`, data).then(unwrap);
export const deleteSchemePdf = (id) => api.delete(`/scheme-pdfs/${id}`);
