/**
 * Centralized site configuration for SEO across corpcrunch.io and corpcrunch.ai
 */

export const SITE_NAME = 'Corp Crunch';
export const SITE_TAGLINE = 'Making Media and Advertising Smarter';

export const PRIMARY_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corpcrunch.io';

export const ALTERNATE_SITE_URLS = [
  'https://www.corpcrunch.ai',
  'https://corpcrunch.ai',
];

export const TWITTER_HANDLE = '@corpcrunch';
export const DEFAULT_OG_IMAGE = `${PRIMARY_SITE_URL}/assets/img/logo/logo.png`;
export const PUBLISHER_LOGO = `${PRIMARY_SITE_URL}/assets/img/logo/logo.png`;

export const DEFAULT_DESCRIPTION =
  'Corp Crunch making media and advertising smarter — financial insights, global market news, economic trends, and expert analysis you can trust.';

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: PRIMARY_SITE_URL,
  logo: PUBLISHER_LOGO,
  sameAs: [
    'https://twitter.com/corpcrunch',
    'https://www.linkedin.com/company/corp-crunch',
    'https://www.corpcrunch.ai',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'scoop@corpcrunch.io',
    contactType: 'customer service',
  },
};

export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: PRIMARY_SITE_URL,
  description: DEFAULT_DESCRIPTION,
  publisher: {
    '@type': 'Organization',
    name: SITE_NAME,
    logo: PUBLISHER_LOGO,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${PRIMARY_SITE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};
