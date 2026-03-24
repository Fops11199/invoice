import api from "./client";

export const listClientsApi = () => api.get("/clients");
export const createClientApi = (payload) => api.post("/clients", payload);
