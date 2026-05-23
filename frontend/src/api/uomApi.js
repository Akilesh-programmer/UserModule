import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchUoms = () => api.get("/unit-of-measures").then(unwrap);
export const fetchActiveUoms = () =>
  api.get("/unit-of-measures/active").then(unwrap);
export const createUom = (data) =>
  api.post("/unit-of-measures", data).then(unwrap);
export const updateUom = (id, data) =>
  api.put(`/unit-of-measures/${id}`, data).then(unwrap);
export const deleteUom = (id) => api.delete(`/unit-of-measures/${id}`);
