import axiosInstance from "./axiosInstance";

export const getCartApi = () => axiosInstance.get("/cart");
export const addToCartApi = (data) => axiosInstance.post("/cart/add", data);
export const updateCartItemApi = (itemId, data) =>
  axiosInstance.put(`/cart/item/${itemId}`, data);
export const removeCartItemApi = (itemId) => axiosInstance.delete(`/cart/item/${itemId}`);
export const clearCartApi = () => axiosInstance.delete("/cart/clear");
