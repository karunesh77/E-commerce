import axiosInstance from "./axiosInstance";

export const getWishlistApi = () => axiosInstance.get("/wishlist");
export const addToWishlistApi = (productId) => axiosInstance.post("/wishlist", { productId });
export const removeFromWishlistApi = (productId) => axiosInstance.delete(`/wishlist/${productId}`);
export const checkWishlistApi = (productId) => axiosInstance.get(`/wishlist/check/${productId}`);
