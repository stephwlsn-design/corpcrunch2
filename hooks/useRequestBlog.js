import axiosInstance from "@/util/axiosInstance";
import { useMutation } from "@tanstack/react-query";

const useRequestBlog = () => {
  return useMutation({
    mutationFn: (data) => {
      return axiosInstance.post("/post-requests", data);
    },
  });
};



export const getPaymentStatus = async (id) =>
  axiosInstance.get(`/post-requests/${id}`);

export default useRequestBlog;
