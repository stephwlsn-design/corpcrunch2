import axiosInstance from "@/util/axiosInstance";

export const subscribe = async (email) => {
  return await axiosInstance.post(`/newsletter-subscriptions`, { email });
};
