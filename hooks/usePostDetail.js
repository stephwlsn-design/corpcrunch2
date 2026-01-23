import axiosInstance from "@/util/axiosInstance";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

const usePostDetail = (slug, options = {}) => {
  const { language } = useLanguage();
  
  return useQuery({
    queryKey: ["posts", slug, language],
    queryFn: () => {
      return axiosInstance.get(`/posts-by-slug/${slug}`, {
        params: { lang: language }
      });
    },
    ...options,
  });
};

export default usePostDetail;
