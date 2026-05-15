import api from "./axiosInstance";

export const fetchAllPermissions = () => api.get("/permissions");
export const fetchPermissionByUser = (userId) =>
  api.get(`/permissions/${userId}`);
export const savePermission = (data) => api.post("/permissions", data);
