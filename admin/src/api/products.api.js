import axiosInstance from "./axiosInstance";

export const getProductsApi = (params) => axiosInstance.get("/products", { params });
export const getProductByIdApi = (id) => axiosInstance.get(`/products/${id}`);
export const createProductApi = (data) => axiosInstance.post("/products", data);
export const updateProductApi = (id, data) => axiosInstance.put(`/products/${id}`, data);
export const deleteProductApi = (id) => axiosInstance.delete(`/products/${id}`);
export const uploadProductImagesApi = (id, formData) =>
  axiosInstance.post(`/products/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteProductImageApi = (id, imageId) =>
  axiosInstance.delete(`/products/${id}/images/${imageId}`);
