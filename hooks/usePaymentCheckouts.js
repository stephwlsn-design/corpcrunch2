import axiosInstance from "@/util/axiosInstance";
import { useMutation } from "@tanstack/react-query";

const usePaymentCheckouts = () => {
  return useMutation({
    mutationFn: (data) => {
      console.log("data: ", data);
      return axiosInstance.post("/payments/checkouts", data);
    },
  });
};

export default usePaymentCheckouts;