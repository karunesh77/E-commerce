import axiosInstance from "./axiosInstance";

export const createRazorpayOrderApi = (data) => axiosInstance.post("/payments/create-order", data);
export const verifyPaymentApi = (data) => axiosInstance.post("/payments/verify", data);
export const placeCodOrderApi = (data) => axiosInstance.post("/payments/cod", data);
