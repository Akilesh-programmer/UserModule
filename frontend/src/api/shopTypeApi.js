import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchShopTypes = () => api.get("/shop-types").then(unwrap);
export const fetchActiveShopTypes = () => api.get("/shop-types/active").then(unwrap);
export const createShopType = (data) => api.post("/shop-types", data).then(unwrap);
export const updateShopType = (id, data) => api.put(`/shop-types/${id}`, data).then(unwrap);
export const deleteShopType = (id) => api.delete(`/shop-types/${id}`);
