import axiosInstance from "@/util/axiosInstance";
import { useMutation } from "@tanstack/react-query";

const useViews = () => {
  return useMutation({
    mutationFn: ({ postId }) => {
      return axiosInstance.post(`/posts/${postId}/views`);
    },
  });
};

export default useViews;

