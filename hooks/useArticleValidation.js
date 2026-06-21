import { useState } from "react";

/**
 * Article access validation — public reading enabled.
 * Kept for compatibility if re-wired in article pages later.
 */
export default function useArticleValidation() {
  const [isValidating] = useState(false);

  const checkArticleAuthorizedAndSubscription = async () => true;

  return { isValidating, checkArticleAuthorizedAndSubscription };
}
