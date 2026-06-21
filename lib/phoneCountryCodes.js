export const PHONE_COUNTRY_CODES = [
  { value: '+971', label: 'UAE (+971)' },
  { value: '+91', label: 'India (+91)' },
  { value: '+1', label: 'United States (+1)' },
  { value: '+44', label: 'United Kingdom (+44)' },
  { value: '+966', label: 'Saudi Arabia (+966)' },
  { value: '+974', label: 'Qatar (+974)' },
  { value: '+973', label: 'Bahrain (+973)' },
  { value: '+968', label: 'Oman (+968)' },
  { value: '+965', label: 'Kuwait (+965)' },
  { value: '+61', label: 'Australia (+61)' },
  { value: '+65', label: 'Singapore (+65)' },
  { value: '+49', label: 'Germany (+49)' },
  { value: '+33', label: 'France (+33)' },
  { value: '+39', label: 'Italy (+39)' },
  { value: '+34', label: 'Spain (+34)' },
  { value: '+31', label: 'Netherlands (+31)' },
  { value: '+41', label: 'Switzerland (+41)' },
  { value: '+81', label: 'Japan (+81)' },
  { value: '+86', label: 'China (+86)' },
  { value: '+82', label: 'South Korea (+82)' },
  { value: '+27', label: 'South Africa (+27)' },
  { value: '+55', label: 'Brazil (+55)' },
  { value: '+52', label: 'Mexico (+52)' },
  { value: '+60', label: 'Malaysia (+60)' },
  { value: '+62', label: 'Indonesia (+62)' },
  { value: '+63', label: 'Philippines (+63)' },
  { value: '+92', label: 'Pakistan (+92)' },
  { value: '+94', label: 'Sri Lanka (+94)' },
  { value: '+880', label: 'Bangladesh (+880)' },
  { value: '+20', label: 'Egypt (+20)' },
  { value: '+234', label: 'Nigeria (+234)' },
  { value: '+254', label: 'Kenya (+254)' },
];

export const DEFAULT_PHONE_COUNTRY_CODE = '+971';

export function formatPhoneNumber(countryCode = '', phoneNumber = '') {
  const code = String(countryCode || '').trim();
  const number = String(phoneNumber || '').trim();
  if (!code && !number) return '';
  if (!number) return code;
  if (!code) return number;
  return `${code} ${number}`;
}
