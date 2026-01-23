import useProfile from "@/hooks/useProfile";
import { notifyError } from "@/util/toast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Preloader from "../elements/Preloader";

export default function AuthAndSubscriptionProtected({
  children,
  needSubscription,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const router = useRouter();

  const { refetch: fetchUserProfile } = useProfile({ enabled: false });
  useEffect(() => {
    const checkSubscriptionAndAuthentication = async () => {
      const hasToken =
        typeof window !== "undefined" && window?.localStorage?.getItem("token");
      if (hasToken) {
        if (needSubscription) {
          const { data } = await fetchUserProfile();

          if (!data?.isSubscriptionValid) {
            notifyError("Please subscribe to access the premium content");

            if (data?.manageSubscriptionUrl) {
              window.location.href = data?.manageSubscriptionUrl;
            } else {
              router.push("/subscribe");
            }
          } else {
            setIsSubscribed(true);
          }
        }
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.push(`/signin?redirectUrl=${router.pathname}`);
      }
      setIsLoading(false);
    };

    checkSubscriptionAndAuthentication();
  }, []);

  if (isLoading || !isAuthenticated) {
  }

  if (needSubscription && !isSubscribed) {
    return <Preloader />;
  }

  return children;
}
