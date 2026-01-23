import axios from "axios";

const baseApiUrl = "https://recroot-next.vercel.app/api";
export const apiCall = axios.create({
  baseURL: baseApiUrl,
  headers: {
    Authorization: "",
    "Content-Type": "application/json",
  },
});
