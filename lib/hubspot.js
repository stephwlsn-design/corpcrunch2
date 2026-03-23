/**
 * HubSpot Private App integration
 * Uses HUBSPOT_ACCESS_TOKEN only — no OAuth, no secret key
 * Required scopes: crm.objects.contacts.read, crm.objects.contacts.write
 */

const HS = 'https://api.hubapi.com';

const headers = () => ({
  Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
});

function isEnabled() {
  return !!process.env.HUBSPOT_ACCESS_TOKEN;
}

function getContactByEmail(email) {
  return fetch(
    `${HS}/crm/v3/objects/contacts/${encodeURIComponent(email)}?idProperty=email&archived=false`,
    { headers: headers() }
  ).then((res) => (res.ok ? res.json() : null));
}

/**
 * Create HubSpot contact (or return existing if 409)
 */
async function hsCreateContact(user) {
  if (!isEnabled()) return null;

  try {
    const res = await fetch(`${HS}/crm/v3/objects/contacts`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        properties: {
          email: user.email,
          firstname: user.firstName ?? '',
          lastname: user.lastName ?? '',
          company: user.companyName ?? '',
          address: user.location ?? '',
          hs_lead_status: 'NEW',
          lifecyclestage: 'lead',
        },
      }),
    });

    if (res.status === 409) return await getContactByEmail(user.email);
    if (!res.ok) throw new Error(`Create contact failed: ${res.statusText}`);

    return res.json();
  } catch (err) {
    console.error('[HubSpot] createContact:', err);
    return null;
  }
}

/**
 * Track login: update last_login property
 * Create custom property in HubSpot: last_login (Date picker)
 */
async function hsTrackLogin(email) {
  if (!isEnabled()) return;

  try {
    const contact = await getContactByEmail(email);
    if (!contact?.id) return;

    await fetch(`${HS}/crm/v3/objects/contacts/${contact.id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        properties: {
          last_login: new Date().toISOString().split('T')[0],
        },
      }),
    });
  } catch (err) {
    console.error('[HubSpot] trackLogin:', err);
  }
}

/**
 * Track page view: update contact with last page viewed
 * Create custom properties in HubSpot: last_page_viewed (Single-line text), last_page_viewed_at (Date)
 * Uses contacts.write only — no Notes scope required
 */
async function hsTrackPageView(email, url) {
  if (!isEnabled()) return;

  try {
    const contact = await getContactByEmail(email);
    if (!contact?.id) return;

    await fetch(`${HS}/crm/v3/objects/contacts/${contact.id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        properties: {
          last_page_viewed: String(url || ''),
          last_page_viewed_at: new Date().toISOString(),
        },
      }),
    });
  } catch (err) {
    console.error('[HubSpot] trackPageView:', err);
  }
}

module.exports = {
  HubSpot: {
    createContact: hsCreateContact,
    trackLogin: hsTrackLogin,
    trackPageView: hsTrackPageView,
    getContactByEmail: getContactByEmail,
  },
  hsCreateContact,
  hsTrackLogin,
  hsTrackPageView,
  hsGetContactByEmail: getContactByEmail,
};
