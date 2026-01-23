import axiosInstance from "@/util/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/contexts/LocationContext";

const usePosts = (options = {}) => {
  const { location } = useLocation();
  
  return useQuery({
    queryKey: ["posts", location],
    queryFn: async () => {
      const params = {};
      if (location && location !== 'all') {
        params.location = location;
      }
      const response = await axiosInstance.get("/posts", { params });
      return response;
    },
    ...options,
  });
};

export default usePosts;
