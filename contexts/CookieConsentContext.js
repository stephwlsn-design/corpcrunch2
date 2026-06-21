import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  COOKIE_CONSENT_KEY,
  VISITOR_ID_KEY,
  getCookieValue,
  clearClientCookie,
  fetchConsentFromServer,
  persistConsentToServer,
  setCachedConsentStatus,
  enableGoogleAnalytics,
  denyGoogleAnalytics,
} from '@/lib/cookieConsent';

const CookieConsentContext = createContext({
  consent: null,
  hasConsented: false,
  isReady: false,
  acceptCookies: () => {},
  declineCookies: () => {},
});

async function migrateLegacyClientCookies() {
  const legacyConsent = getCookieValue(COOKIE_CONSENT_KEY);
  if (legacyConsent !== 'accepted' && legacyConsent !== 'declined') {
    return null;
  }

  const action = legacyConsent === 'accepted' ? 'accept' : 'decline';
  const legacyVisitorId = legacyConsent === 'accepted' ? getCookieValue(VISITOR_ID_KEY) : null;
  const migrated = await persistConsentToServer(action, { visitorId: legacyVisitorId });
  if (!migrated) {
    return null;
  }

  clearClientCookie(COOKIE_CONSENT_KEY);
  clearClientCookie(VISITOR_ID_KEY);
  return migrated;
}

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initConsent() {
      let status = await fetchConsentFromServer();

      if (!status) {
        status = await migrateLegacyClientCookies();
      }

      if (cancelled) return;

      setCachedConsentStatus(status);
      setConsent(status);

      if (status === 'accepted') {
        enableGoogleAnalytics();
      }

      setReady(true);
    }

    initConsent();
    return () => {
      cancelled = true;
    };
  }, []);

  const acceptCookies = useCallback(async () => {
    const status = await persistConsentToServer('accept');
    if (!status) return null;

    setCachedConsentStatus(status);
    setConsent(status);
    enableGoogleAnalytics();

    return status;
  }, []);

  const declineCookies = useCallback(async () => {
    const status = await persistConsentToServer('decline');
    if (!status) return;

    setCachedConsentStatus(status);
    setConsent(status);
    denyGoogleAnalytics();
  }, []);

  return (
    <CookieConsentContext.Provider
      value={{
        consent: ready ? consent : null,
        hasConsented: ready && consent === 'accepted',
        isReady: ready,
        acceptCookies,
        declineCookies,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  return useContext(CookieConsentContext);
}
