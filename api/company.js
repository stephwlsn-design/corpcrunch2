import axiosInstance from "@/util/axiosInstance";

export const getCompanyDetails = async (id) => {
  const data = await axiosInstance.get(`companies/${id}`);
  return data;
};

export const getAllCompaniesPost = async (id) => {
  // The route will be changed and the return value also will be update.
  // In the future, this will be updated as the backend issue is resolved.
  const data = await axiosInstance.get(`/posts`);
  return { posts: data?.trendingPosts };
};
