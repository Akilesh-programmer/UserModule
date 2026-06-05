import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchExpenseTypes = () => api.get("/expense-types").then(unwrap);
export const fetchActiveExpenseTypes = () => api.get("/expense-types/active").then(unwrap);
export const createExpenseType = (data) => api.post("/expense-types", data).then(unwrap);
export const updateExpenseType = (id, data) => api.put(`/expense-types/${id}`, data).then(unwrap);
export const deleteExpenseType = (id) => api.delete(`/expense-types/${id}`);
