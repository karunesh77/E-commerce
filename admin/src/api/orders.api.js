import axiosInstance from "./axiosInstance";

export const getAllOrdersApi = (params) => axiosInstance.get("/orders/admin", { params });
export const getOrderByIdApi = (id) => axiosInstance.get(`/orders/${id}`);
export const updateOrderStatusApi = (id, data) => axiosInstance.put(`/orders/${id}/status`, data);
