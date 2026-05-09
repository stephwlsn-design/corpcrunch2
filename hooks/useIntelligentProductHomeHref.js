import { useState, useEffect } from "react";
import { isIntelligentSubdomainHostname } from "@/lib/intelligentSubdomain";

/**
 * URL for the Intelligent product landing page in the browser.
 * On intelligent.* hosts, use "/" so the address bar stays clean (middleware rewrites).
 * Elsewhere (e.g. corpcrunch.io), use "/intelligent".
 *
 * Initial state matches SSR to avoid hydration mismatch; updates after mount.
 */
export function useIntelligentProductHomeHref() {
  const [href, setHref] = useState("/intelligent");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setHref(
      isIntelligentSubdomainHostname(window.location.hostname)
        ? "/"
        : "/intelligent"
    );
  }, []);

  return href;
}
