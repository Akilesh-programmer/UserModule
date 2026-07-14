import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchOrders = (params = {}) => api.get("/orders", { params }).then(unwrap);
export const fetchOrder = (id) => api.get(`/orders/${id}`).then(unwrap);
export const createOrder = (data) => api.post("/orders", data).then(unwrap);
export const approveOrder = (id) => api.put(`/orders/${id}/approve`).then(unwrap);
export const rejectOrder = (id, reason) => api.put(`/orders/${id}/reject`, { reason }).then(unwrap);
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status }).then(unwrap);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data).then(unwrap);
export const deleteOrder = (id) => api.delete(`/orders/${id}`).then(unwrap);
