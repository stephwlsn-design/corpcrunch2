import axiosInstance from "@/util/axiosInstance";
import axios from "axios";

export const fetchIP = async () => {
  return await axios.get("https://api.ipify.org");
};

export const postIpForVisits = async (ipAddress) => {
  return await axiosInstance.post("/visits", { ipAddress });
};
