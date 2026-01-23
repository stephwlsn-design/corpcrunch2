import axiosInstance from "@/util/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const useCategory = (options = {}) => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("/categories");
        // axiosInstance interceptor returns response.data, so response is { success: true, data: [...] }
        let categories = [];
        
        if (response && response.success && response.data && Array.isArray(response.data)) {
          // Response format: { success: true, data: [...] }
          categories = response.data;
        } else if (response && response.data && Array.isArray(response.data)) {
          // Alternative format: { data: [...] }
          categories = response.data;
        } else if (response && Array.isArray(response)) {
          // Response format: [...]
          categories = response;
        } else {
          // Return empty array if response is not in expected format
          console.warn('Categories API returned unexpected format:', response);
          return [];
        }
        
        // Map _id to id for frontend compatibility
        return categories.map(cat => ({
          ...cat,
          id: cat.id || cat._id
        }));
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Return empty array on error to prevent crashes
        return [];
      }
    },
    ...options,
  });
};

export default useCategory;
