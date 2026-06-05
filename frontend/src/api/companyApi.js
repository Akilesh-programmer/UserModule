import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchCompanies = () => api.get("/companies").then(unwrap);
export const fetchActiveCompanies = () => api.get("/companies/active").then(unwrap);
export const createCompany = (data) => api.post("/companies", data).then(unwrap);
export const updateCompany = (id, data) => api.put(`/companies/${id}`, data).then(unwrap);
export const deleteCompany = (id) => api.delete(`/companies/${id}`);
