import axiosInstance from "./axiosInstance";

export const getCouponsApi = (params) => axiosInstance.get("/coupons", { params });
export const getCouponByIdApi = (id) => axiosInstance.get(`/coupons/${id}`);
export const createCouponApi = (data) => axiosInstance.post("/coupons", data);
export const updateCouponApi = (id, data) => axiosInstance.patch(`/coupons/${id}`, data);
export const deleteCouponApi = (id) => axiosInstance.delete(`/coupons/${id}`);
