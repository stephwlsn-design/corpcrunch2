import axiosInstance from "@/util/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const useCompanyPosts = (companyId, options = {}) => {
  return useQuery({
    queryKey: ["companies", companyId, "posts"],
    queryFn: async () => {
      const response = await axiosInstance.get(`companies/${companyId}/posts`);
      return response;
    },
    ...options,
  });
};

export default useCompanyPosts;
