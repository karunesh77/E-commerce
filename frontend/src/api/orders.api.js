import axiosInstance from "./axiosInstance";

export const getMyOrdersApi = (params) => axiosInstance.get("/orders", { params });
export const getOrderByIdApi = (id) => axiosInstance.get(`/orders/${id}`);
export const cancelOrderApi = (id, data) => axiosInstance.put(`/orders/${id}/cancel`, data);
