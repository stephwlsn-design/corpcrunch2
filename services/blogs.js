import axiosInstance from "@/util/axiosInstance";

export const getPost = async () => {
  return await axiosInstance.get(`/posts`);
};
export const getPostDetails = async (id) => {
  return await axiosInstance.get(`/posts/${id}`);
};

