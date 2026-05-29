import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchCities = () => api.get("/cities").then(unwrap);
export const fetchActiveCities = (stateId) => {
  const params = stateId ? `?stateId=${stateId}` : "";
  return api.get(`/cities/active${params}`).then(unwrap);
};
export const fetchCitiesByState = (stateId) => api.get(`/cities/by-state/${stateId}`).then(unwrap);
export const createCity = (data) => api.post("/cities", data).then(unwrap);
export const updateCity = (id, data) => api.put(`/cities/${id}`, data).then(unwrap);
export const deleteCity = (id) => api.delete(`/cities/${id}`);
