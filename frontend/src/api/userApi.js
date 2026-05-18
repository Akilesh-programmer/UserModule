import api from "./axiosInstance";

export const fetchUsers = () => api.get("/users");
// Used by UserPermissionPage — checks userPermission.read instead of userCreation.read
export const fetchUsersForPermissions = () =>
  api.get("/users?permissionsView=true");
export const fetchUserById = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post("/users", data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
