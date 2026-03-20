/**
 * Admin session management - 2hr expiry + new day re-login
 */

/**
 * Check if admin session is valid (token exists, within 2hr, same calendar day)
 * @returns {boolean}
 */
export function isAdminSessionValid() {
  if (typeof window === 'undefined') return false;

  const token = localStorage.getItem('adminToken');
  const loginDate = localStorage.getItem('adminLoginDate');
  const expiry = localStorage.getItem('adminTokenExpiry');

  if (!token || !loginDate || !expiry) return false;

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  if (today !== loginDate) return false; // New day - require re-login

  const expiryTime = parseInt(expiry, 10);
  if (isNaN(expiryTime) || Date.now() > expiryTime) return false; // 2h passed

  return true;
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
