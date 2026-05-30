import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchPincodes = () => api.get("/pincodes").then(unwrap);
export const fetchActivePincodes = (cityId) => {
  const params = cityId ? `?cityId=${cityId}` : "";
  return api.get(`/pincodes/active${params}`).then(unwrap);
};
export const fetchPincodesByCity = (cityId) => api.get(`/pincodes/by-city/${cityId}`).then(unwrap);
export const createPincode = (data) => api.post("/pincodes", data).then(unwrap);
export const updatePincode = (id, data) => api.put(`/pincodes/${id}`, data).then(unwrap);
export const deletePincode = (id) => api.delete(`/pincodes/${id}`);
