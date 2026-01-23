import axiosInstance from "@/util/axiosInstance";
import { useQuery } from "@tanstack/react-query";

const useCompanies = (options = {}) => {
  return useQuery({
    queryKey: ["companies"],
    queryFn: () => axiosInstance.get("/companies"),
    ...options,
  });
};

export default useCompanies;
