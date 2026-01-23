import axiosInstance from "@/util/axiosInstance";

export const postPayableAmount = async (checkouts) => {
  return await axiosInstance.post("/hdfc-proxy/checkouts", checkouts);
};
