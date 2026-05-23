import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchCategories = () => api.get("/categories").then(unwrap);
export const fetchActiveCategories = () =>
  api.get("/categories?activeOnly=true").then(unwrap);
export const createCategory = (data) =>
  api.post("/categories", data).then(unwrap);
export const updateCategory = (id, data) =>
  api.put(`/categories/${id}`, data).then(unwrap);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);
