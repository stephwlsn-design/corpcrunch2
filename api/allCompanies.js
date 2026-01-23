import axiosInstance from "@/util/axiosInstance";

export const getAllCompanies = async () => {
    const data = await axiosInstance.get(`companies/`);
    console.log('companyPostsDetails: ', data);
    return data;
  };
  