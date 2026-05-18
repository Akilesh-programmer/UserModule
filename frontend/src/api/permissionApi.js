import api from "./axiosInstance";

export const fetchAllPermissions = () => api.get("/permissions");
export const fetchPermissionByUserType = (userTypeId) =>
  api.get(`/permissions/${userTypeId}`);
export const savePermission = (data) => api.post("/permissions", data);
