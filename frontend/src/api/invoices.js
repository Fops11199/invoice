import api from "./client";

export const listInvoicesApi = () => api.get("/invoices/");
export const getInvoiceApi = (id) => api.get(`/invoices/${id}`);
export const createInvoiceApi = (payload) => api.post("/invoices/", payload);
export const updateInvoiceStatusApi = (id, status) => api.patch(`/invoices/${id}/status`, { status });
export const downloadInvoicePdfApi = (id) => api.get(`/invoices/${id}/pdf`, { responseType: "blob" });
export const downloadInvoiceCsvApi = (id) => api.get(`/invoices/${id}/csv`, { responseType: "blob" });
export const sendInvoiceApi = (id) => api.post(`/invoices/${id}/send`);
