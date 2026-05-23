import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchGroups = () => api.get("/groups").then(unwrap);
export const fetchActiveGroups = (categoryId) => {
  const catParam = categoryId ? `&categoryId=${categoryId}` : "";
  return api.get(`/groups/active?activeOnly=true${catParam}`).then(unwrap);
};
export const createGroup = (data) => api.post("/groups", data).then(unwrap);
export const updateGroup = (id, data) =>
  api.put(`/groups/${id}`, data).then(unwrap);
export const deleteGroup = (id) => api.delete(`/groups/${id}`);
