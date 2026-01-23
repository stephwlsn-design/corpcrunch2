import axiosInstance from "@/util/axiosInstance";

export const getCategories = async () => {
  return await axiosInstance.get(`/categories`);
};
