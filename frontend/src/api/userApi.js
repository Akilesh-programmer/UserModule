import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchUsers = () => api.get("/users").then(unwrap);
// Used by UserPermissionPage — checks userPermission.read instead of userCreation.read
export const fetchUsersForPermissions = () =>
  api.get("/users?permissionsView=true").then(unwrap);
export const fetchUserById = (id) => api.get(`/users/${id}`).then(unwrap);
export const createUser = (data) => api.post("/users", data).then(unwrap);
export const updateUser = (id, data) =>
  api.put(`/users/${id}`, data).then(unwrap);
export const deleteUser = (id) => api.delete(`/users/${id}`);
