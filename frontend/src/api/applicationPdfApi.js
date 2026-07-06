import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchApplicationPdfs = () =>
  api.get("/application-pdfs").then(unwrap);
export const createApplicationPdf = (data) =>
  api.post("/application-pdfs", data).then(unwrap);
export const updateApplicationPdf = (id, data) =>
  api.put(`/application-pdfs/${id}`, data).then(unwrap);
export const deleteApplicationPdf = (id) =>
  api.delete(`/application-pdfs/${id}`);
