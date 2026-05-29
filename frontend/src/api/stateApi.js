import api from "./axiosInstance";

const unwrap = (r) => ({ ...r, data: r.data.data.data });

export const fetchStates = () => api.get("/states").then(unwrap);
export const fetchActiveStates = () => api.get("/states/active").then(unwrap);
export const createState = (data) => api.post("/states", data).then(unwrap);
export const updateState = (id, data) => api.put(`/states/${id}`, data).then(unwrap);
export const deleteState = (id) => api.delete(`/states/${id}`);
