/**
 * Admin session management — 12-hour absolute expiry (local clock).
 */

const ADMIN_SESSION_MS = 12 * 60 * 60 * 1000;

export function getAdminSessionDurationMs() {
  return ADMIN_SESSION_MS;
}

/**
 * Local calendar date YYYY-MM-DD (not UTC — avoids IST midnight false logout).
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if admin session is valid (token exists, within session window).
 * @returns {boolean}
 */
export function isAdminSessionValid() {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('adminToken');
  const expiry = localStorage.getItem('adminTokenExpiry');

  if (!token || !expiry) return false;

  const expiryTime = parseInt(expiry, 10);
  if (isNaN(expiryTime) || Date.now() > expiryTime) return false;

  return true;
}

/**
 * Persist admin session after successful login.
 */
export function setAdminSession(token) {
  if (typeof window === 'undefined' || !token) return;
  const expiresAt = Date.now() + ADMIN_SESSION_MS;
  localStorage.setItem('adminToken', token);
  localStorage.setItem('token', token);
  localStorage.setItem('adminTokenExpiry', String(expiresAt));
  localStorage.setItem('adminLoginDate', getLocalDateString());
}

/**
 * Clear admin session from localStorage
 */
export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminToken');
  localStorage.removeItem('token');
  localStorage.removeItem('adminTokenExpiry');
  localStorage.removeItem('adminLoginDate');
}

/**
 * Canonical admin host (www) so localStorage is not lost across apex ↔ www.
 */
export function getCanonicalAdminOrigin() {
  if (typeof window === 'undefined') return null;
  const { protocol, hostname, port } = window.location;
  const bare = hostname.replace(/^www\./i, '').toLowerCase();

  if (bare === 'corpcrunch.io' || bare === 'corpcrunch.ai') {
    const host = `www.${bare}${port ? `:${port}` : ''}`;
    return `${protocol}//${host}`;
  }

  return `${protocol}//${window.location.host}`;
}

/**
 * If on apex corpcrunch host, hard-navigate to www equivalent (keeps path/query).
 * @returns {boolean} true if a redirect was started
 */
export function redirectToCanonicalAdminHost() {
  if (typeof window === 'undefined') return false;
  const canonical = getCanonicalAdminOrigin();
  if (!canonical) return false;

  const currentOrigin = window.location.origin;
  if (canonical === currentOrigin) return false;

  window.location.replace(
    `${canonical}${window.location.pathname}${window.location.search}${window.location.hash}`
  );
  return true;
}
