import axiosInstance from "./axiosInstance";

export const getCategoriesApi = (params) => axiosInstance.get("/categories", { params });
export const getCategoryBySlugApi = (slug) => axiosInstance.get(`/categories/slug/${slug}`);
