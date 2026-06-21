export const CONTACT_INQUIRY_OPTIONS = [
  { value: 'general', label: 'General Inquiry' },
  { value: 'curi', label: 'Curi' },
  { value: 'qrayt-ai', label: 'Qrayt AI' },
  { value: 'prowess', label: 'Prowess' },
  { value: 'cnvrsn', label: 'Cnvrsn (Otto)' },
  { value: 'solvterra', label: 'Solvterra' },
  { value: 'finx-onboardiq', label: 'Finx OnboardIQ' },
  { value: 'finx-aml', label: 'Finx AML' },
  { value: 'finx-fraudiq', label: 'Finx FraudIQ' },
  { value: 'finx-onboard-verify', label: 'Finx Onboard-Verify' },
  { value: 'finx-clearcomply', label: 'Finx ClearComply' },
  { value: 'finx-moneyday', label: 'Finx Moneyday' },
  { value: 'intelligent-its', label: 'Intelligent Technology Solutions' },
  { value: 'events-partnerships', label: 'Events & Partnerships' },
  { value: 'editorial-press', label: 'Editorial / Press' },
  { value: 'other', label: 'Other' },
];

export const PRODUCT_ID_TO_INQUIRY = {
  'prod-curi': 'curi',
  'prod-1': 'qrayt-ai',
  'prod-2': 'prowess',
  'prod-3': 'cnvrsn',
};

export function getInquiryLabel(value) {
  return CONTACT_INQUIRY_OPTIONS.find((option) => option.value === value)?.label || 'General Inquiry';
}

export function getInquirySubject(value) {
  if (!value || value === 'general') return '';
  return `Product inquiry: ${getInquiryLabel(value)}`;
}

export function resolveInquiryFromQuery(query = {}) {
  const raw = query.inquiry || query.product;
  if (!raw) return 'general';

  const normalized = String(raw).toLowerCase().trim();
  const byValue = CONTACT_INQUIRY_OPTIONS.find((option) => option.value === normalized);
  if (byValue) return byValue.value;

  const byLabel = CONTACT_INQUIRY_OPTIONS.find(
    (option) => option.label.toLowerCase() === normalized
  );
  if (byLabel) return byLabel.value;

  const byProductId = PRODUCT_ID_TO_INQUIRY[normalized];
  if (byProductId) return byProductId;

  return 'general';
}
