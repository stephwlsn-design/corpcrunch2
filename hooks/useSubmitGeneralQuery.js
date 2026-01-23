import axiosInstance from "@/util/axiosInstance";
import { useMutation } from "@tanstack/react-query";

const useSubmitGeneralQuery = () => {
  return useMutation({
    mutationFn: ({ message, name, email }) => {
      return axiosInstance.post("/support-email", {
        body: message,
        senderName: name,
        email,
      });
    },
  });
};

export default useSubmitGeneralQuery;
