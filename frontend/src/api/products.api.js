import axiosInstance from "./axiosInstance";

export const getProductsApi = (params) => axiosInstance.get("/products", { params });
export const getProductByIdApi = (id) => axiosInstance.get(`/products/${id}`);
export const getProductBySlugApi = (slug) => axiosInstance.get(`/products/slug/${slug}`);
export const getProductReviewsApi = (productId, params) =>
  axiosInstance.get(`/products/${productId}/reviews`, { params });
export const addReviewApi = (productId, data) =>
  axiosInstance.post(`/products/${productId}/reviews`, data);
