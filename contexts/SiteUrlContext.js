import { createContext, useContext } from 'react';
import { PRIMARY_SITE_URL } from '@/lib/siteConfig';

const SiteUrlContext = createContext(PRIMARY_SITE_URL);

export function SiteUrlProvider({ siteBaseUrl, children }) {
  return (
    <SiteUrlContext.Provider value={siteBaseUrl || PRIMARY_SITE_URL}>
      {children}
    </SiteUrlContext.Provider>
  );
}

export function useSiteBaseUrl() {
  return useContext(SiteUrlContext);
}
