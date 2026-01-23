import axiosInstance from "@/util/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const useCategoryDetails = (categoryId, options = {}) => {
  return useQuery({
    queryKey: ["categories", categoryId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/categories/${categoryId}`);
      return response;
    },
    ...options,
  });
};

export default useCategoryDetails;
