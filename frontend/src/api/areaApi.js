import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchAreas = () => api.get("/areas").then(unwrap);
export const fetchActiveAreas = (pincodeId) => {
  const params = pincodeId ? `?pincodeId=${pincodeId}` : "";
  return api.get(`/areas/active${params}`).then(unwrap);
};
export const fetchAreasByPincode = (pincodeId) => api.get(`/areas/by-pincode/${pincodeId}`).then(unwrap);
export const createArea = (data) => api.post("/areas", data).then(unwrap);
export const updateArea = (id, data) => api.put(`/areas/${id}`, data).then(unwrap);
export const deleteArea = (id) => api.delete(`/areas/${id}`);
