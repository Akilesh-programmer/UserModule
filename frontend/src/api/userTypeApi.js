import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchUserTypes = () => api.get("/user-types").then(unwrap);
export const fetchActiveUserTypes = () =>
  api.get("/user-types?activeOnly=true").then(unwrap);
export const fetchUserTypeById = (id) =>
  api.get(`/user-types/${id}`).then(unwrap);
export const createUserType = (data) =>
  api.post("/user-types", data).then(unwrap);
export const updateUserType = (id, data) =>
  api.put(`/user-types/${id}`, data).then(unwrap);
export const deleteUserType = (id) => api.delete(`/user-types/${id}`);
