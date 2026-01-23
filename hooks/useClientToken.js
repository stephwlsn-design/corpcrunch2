import axiosInstance from "@/util/axiosInstance";
import { useQuery } from "@tanstack/react-query";

export const PAYMENT_TYPE = {
  PAYMENT_TO_CREATE_ARTICLE: "create-article",
  PAYMENT_TO_MAKE_SUBSCRIPTION: "subscription",
};

const useClientToken = (options = {}) => {
  console.log("checking");
  return useQuery({
    queryKey: ["client_token"],
    queryFn: async () => {
      const response = await axiosInstance.get("/clientToken");
      return response;
    },
    ...options,
  });
};

export default useClientToken;
