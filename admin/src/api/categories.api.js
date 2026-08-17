import axiosInstance from "./axiosInstance";

export const getCategoriesApi = (params) => axiosInstance.get("/categories", { params });
export const getCategoryByIdApi = (id) => axiosInstance.get(`/categories/${id}`);
export const createCategoryApi = (formData) =>
  axiosInstance.post("/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateCategoryApi = (id, formData) =>
  axiosInstance.put(`/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteCategoryApi = (id) => axiosInstance.delete(`/categories/${id}`);
