import api from "./client";

export const listClientsApi = () => api.get("/clients/");
export const createClientApi = (payload) => api.post("/clients/", payload);
export const getClientApi = (id) => api.get(`/clients/${id}`);
export const updateClientApi = (id, payload) => api.put(`/clients/${id}`, payload);
export const deleteClientApi = (id) => api.delete(`/clients/${id}`);
