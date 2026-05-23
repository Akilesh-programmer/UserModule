import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchPackingTypes = () =>
  api.get("/packing-types").then(unwrap);
export const fetchActivePackingTypes = () =>
  api.get("/packing-types/active").then(unwrap);
export const createPackingType = (data) =>
  api.post("/packing-types", data).then(unwrap);
export const updatePackingType = (id, data) =>
  api.put(`/packing-types/${id}`, data).then(unwrap);
export const deletePackingType = (id) => api.delete(`/packing-types/${id}`);
