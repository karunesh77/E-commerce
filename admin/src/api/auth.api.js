import axiosInstance from "./axiosInstance";

export const loginApi = (data) => axiosInstance.post("/auth/login", data);
export const logoutApi = () => axiosInstance.post("/auth/logout");
export const getMeApi = () => axiosInstance.get("/auth/me");
export const refreshTokenApi = () => axiosInstance.post("/auth/refresh-token");
