import useProfile from "@/hooks/useProfile";
import { useRouter } from "next/router";
import { useState } from "react";

export default function useArticleValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();
  const { refetch: fetchUserProfile } = useProfile({ enabled: false });

  const checkArticleAuthorizedAndSubscription = async () => {
    setIsValidating(true);
    if (typeof window === "undefined") return;

    const token = window.localStorage.getItem("token");
    console.log("token: sds", token);

    if (!token) {
      router.push(`/signin?redirectUrl=${router.asPath}`);
      return;
    }

    const { data } = await fetchUserProfile();

    if (!data?.isSubscriptionValid) {
      router.push(`/subscribe?redirectUrl=${router.asPath}`);
      return;
    }

    setIsValidating(false);
    return true;
  };

  return { isValidating, checkArticleAuthorizedAndSubscription };
}
