import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchAllPermissions = () => api.get("/permissions").then(unwrap);
export const fetchPermissionByUserType = (userTypeId) =>
  api.get(`/permissions/${userTypeId}`).then(unwrap);
export const savePermission = (data) =>
  api.post("/permissions", data).then(unwrap);
