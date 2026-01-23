import axiosInstance from "@/util/axiosInstance";
import { useMutation } from "@tanstack/react-query";

const useShares = () => {
  return useMutation({
    mutationFn: ({ postId }) => {
      return axiosInstance.post(`/posts/${postId}/shares`);
    },
  });
};

export default useShares;
