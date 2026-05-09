/**
 * Hostnames where the Intelligent product is served at the site root (/)
 * and middleware rewrites to the /intelligent page internally.
 * Keep in sync with middleware.js routing.
 */
export const INTELLIGENT_SUBDOMAIN_HOSTS = [
  "intelligent.corpcrunch.io",
  "intelligent.corpcrunch.ai",
  "intelligent.localhost",
];

const INTELLIGENT_HOST_SET = new Set(INTELLIGENT_SUBDOMAIN_HOSTS);

export function isIntelligentSubdomainHostname(hostname) {
  if (!hostname) return false;
  const base = String(hostname).split(":")[0];
  return INTELLIGENT_HOST_SET.has(base);
}
