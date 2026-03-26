import api from "./client";

export const getDashboardStatsApi = () => api.get("/dashboard/stats");
