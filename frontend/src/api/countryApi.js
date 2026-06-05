import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchCountries = () => api.get("/countries").then(unwrap);
export const fetchActiveCountries = () => api.get("/countries/active").then(unwrap);
export const createCountry = (data) => api.post("/countries", data).then(unwrap);
export const updateCountry = (id, data) => api.put(`/countries/${id}`, data).then(unwrap);
export const deleteCountry = (id) => api.delete(`/countries/${id}`);
