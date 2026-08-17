import axiosInstance from "./axiosInstance";

export const getDashboardStatsApi = () => axiosInstance.get("/admin/dashboard");
export const getAllUsersApi = (params) => axiosInstance.get("/admin/users", { params });
export const updateUserRoleApi = (userId, role) =>
  axiosInstance.patch(`/admin/users/${userId}/role`, { role });
export const deleteUserApi = (userId) => axiosInstance.delete(`/admin/users/${userId}`);
export const getSalesReportApi = (params) => axiosInstance.get("/admin/sales-report", { params });
export const getTopProductsApi = (params) => axiosInstance.get("/admin/top-products", { params });
export const getInventoryStatusApi = (params) => axiosInstance.get("/admin/inventory", { params });
