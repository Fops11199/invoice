import api from "./client";

export const getPaymentMethodsApi = () => api.get("/settings/payment-methods");
export const createPaymentMethodApi = (payload) => api.post("/settings/payment-methods", payload);
export const updatePaymentMethodApi = (id, payload) => api.put(`/settings/payment-methods/${id}`, payload);
export const deletePaymentMethodApi = (id) => api.delete(`/settings/payment-methods/${id}`);
export const setDefaultPaymentMethodApi = (id) => api.patch(`/settings/payment-methods/${id}/default`);
export const updateProfileApi = (payload) => api.put("/auth/me", payload);
export const uploadLogoApi = (file) => { const fd = new FormData(); fd.append("file", file); return api.post("/auth/me/logo", fd, { headers: { "Content-Type": "multipart/form-data" } }); };
