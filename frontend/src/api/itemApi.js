import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchItems = (params = {}) => api.get("/items", { params }).then(unwrap);
export const createItem = (data) => api.post("/items", data).then(unwrap);
export const updateItem = (id, data) =>
  api.put(`/items/${id}`, data).then(unwrap);
export const deleteItem = (id) => api.delete(`/items/${id}`);
