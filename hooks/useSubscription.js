import axiosInstance from "@/util/axiosInstance";
import { useMutation } from "@tanstack/react-query";

const useSubscription = () => {
  return useMutation({
    mutationFn: (data) => {
      return axiosInstance.post("/subscriptions", data);
    },
  });
};

export default useSubscription;
