import axiosInstance from "@/util/axiosInstance";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const useProfile = (options = {}) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axiosInstance.get("/users/me");
      return response;
    },
    ...options,
  });
};
const useEditProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inputs) => {
      const { id, ...userInputs } = inputs;
      return axiosInstance.patch(`/users/${id}`, userInputs);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export { useEditProfile };
export default useProfile;
