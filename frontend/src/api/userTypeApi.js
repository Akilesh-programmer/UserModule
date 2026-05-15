import api from "./axiosInstance";

export const fetchUserTypes = () => api.get("/user-types");
export const fetchActiveUserTypes = () =>
  api.get("/user-types?activeOnly=true");
export const fetchUserTypeById = (id) => api.get(`/user-types/${id}`);
export const createUserType = (data) => api.post("/user-types", data);
export const updateUserType = (id, data) => api.put(`/user-types/${id}`, data);
export const deleteUserType = (id) => api.delete(`/user-types/${id}`);
