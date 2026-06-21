import {
  PRIMARY_SITE_URL,
  DEFAULT_OG_IMAGE,
  PUBLISHER_LOGO,
  SITE_NAME,
  ORGANIZATION_SCHEMA,
  WEBSITE_SCHEMA,
} from './siteConfig';
import {
  generateMetaDescription,
  generateMetaTitle,
  generateStructuredData,
} from './seoOptimizer';
import { buildCrossDomainAlternates } from './siteUrl';

export function getCategorySlug(category) {
  if (!category) return '';
  return (
    category.slug?.toLowerCase() ||
    category.name?.toLowerCase().replace(/\s+/g, '-') ||
    ''
  );
}

export function buildArticlePath(post) {
  const category = post?.Category || post?.category || post?.categoryId;
  const categorySlug = getCategorySlug(category);
  const slug = post?.slug || '';
  if (!categorySlug || !slug) return `/blog/${slug}`;
  return `/${categorySlug}/blog/${slug}`;
}

export function buildArticleUrl(post, baseUrl = PRIMARY_SITE_URL) {
  if (post?.canonicalUrl) return post.canonicalUrl;
  return `${baseUrl.replace(/\/$/, '')}${buildArticlePath(post)}`;
}

export function buildCategoryUrl(categorySlug, baseUrl = PRIMARY_SITE_URL) {
  return `${baseUrl.replace(/\/$/, '')}/${categorySlug}`;
}

export function buildPageUrl(path = '/', baseUrl = PRIMARY_SITE_URL) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, '')}${normalizedPath === '/' ? '/' : normalizedPath}`;
}

export function parseStructuredData(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function buildArticleSeo(post, siteBaseUrl = PRIMARY_SITE_URL) {
  if (!post) return {};

  const category = post.Category || post.category || post.categoryId;
  const categorySlug = getCategorySlug(category);
  const categoryName = category?.name || 'News';
  const authorName =
    [post.authorFirstName, post.authorLastName].filter(Boolean).join(' ') ||
    'Corp Crunch';

  const title =
    post.metaTitle || generateMetaTitle(post.title) || post.title || '';
  const description =
    post.metaDescription ||
    post.excerpt ||
    generateMetaDescription(post.content) ||
    '';

  const publishedTime =
    post.publishDate || post.publishedAt || post.createdAt || null;
  const modifiedTime = post.updatedAt || publishedTime;

  const allowIndexing = post.allowIndexing !== false;
  const allowFollowing = post.allowFollowing !== false;
  const robotsContent = [
    allowIndexing ? 'index' : 'noindex',
    allowFollowing ? 'follow' : 'nofollow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1',
  ].join(', ');

  const url = buildArticleUrl(post, siteBaseUrl);
  const image = post.ogImage || post.bannerImageUrl || DEFAULT_OG_IMAGE;
  const imageAlt = post.imageAltText || post.title || SITE_NAME;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteBaseUrl.replace(/\/$/, ''),
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: buildCategoryUrl(categorySlug, siteBaseUrl),
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: url,
      },
    ],
  };

  const articleSchema = generateStructuredData({
    ...post,
    metaDescription: description,
    canonicalUrl: url,
  });

  const enhancedArticleSchema = {
    ...articleSchema,
    '@type': post.schemaMarkupType || 'Article',
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    image: [image],
    dateModified: modifiedTime,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: PUBLISHER_LOGO },
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.blog-hero-title', 'article p'],
    },
    keywords: post.tags?.join(', ') || post.secondaryKeywords?.join(', ') || '',
  };

  const customSchema = parseStructuredData(post.structuredData);
  const jsonLd = customSchema
    ? [customSchema, breadcrumbSchema]
    : [enhancedArticleSchema, breadcrumbSchema];

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    url,
    image,
    imageAlt,
    ogTitle: post.ogTitle || title,
    ogDescription: post.ogDescription || description,
    isArticle: true,
    author: authorName,
    publishedTime,
    modifiedTime,
    robots: robotsContent,
    keywords: post.secondaryKeywords || post.tags || [],
    language: post.language || 'en',
    articleSection: categoryName,
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd,
  };
}

export function buildCategorySeo(categoryDetails, siteBaseUrl = PRIMARY_SITE_URL) {
  const name = categoryDetails?.name || 'Category';
  const slug =
    categoryDetails?.slug?.toLowerCase() ||
    name.toLowerCase().replace(/\s+/g, '-');
  const title = `${name} News & Insights`;
  const description = `Latest ${name} news, analysis, and expert insights from Corp Crunch. Stay ahead with in-depth coverage of ${name.toLowerCase()} trends and market developments.`;
  const url = buildCategoryUrl(slug, siteBaseUrl);

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    url,
    image: DEFAULT_OG_IMAGE,
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteBaseUrl },
          { '@type': 'ListItem', position: 2, name, item: url },
        ],
      },
    ],
  };
}

export function buildPageSeo({ title, description, path = '/', image, jsonLd, keywords, ogTitle, ogDescription, imageAlt, robots, type }, siteBaseUrl = PRIMARY_SITE_URL) {
  const pageTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const url = buildPageUrl(path, siteBaseUrl);
  const absoluteImage = image
    ? image.startsWith('http')
      ? image
      : `${siteBaseUrl.replace(/\/$/, '')}${image.startsWith('/') ? image : `/${image}`}`
    : DEFAULT_OG_IMAGE;

  return {
    title: pageTitle,
    description: description || '',
    url,
    image: absoluteImage,
    imageAlt: imageAlt || pageTitle,
    ogTitle: ogTitle || pageTitle,
    ogDescription: ogDescription || description || '',
    keywords: keywords || [],
    robots: robots || 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    type: type || 'website',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: jsonLd || [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
      },
    ],
  };
}

function buildBreadcrumbSchema(crumbs, siteBaseUrl) {
  const base = siteBaseUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.path ? `${base}${crumb.path.startsWith('/') ? crumb.path : `/${crumb.path}`}` : base,
    })),
  };
}

function buildSoftwareItemListSchema(products, listName) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: product.name,
        description: product.description,
        url: product.url,
        applicationCategory: product.category || 'BusinessApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          availability: 'https://schema.org/InStock',
          url: product.url,
        },
      },
    })),
  };
}

const PRODUCTS_CATALOG = [
  {
    name: 'Curi',
    description:
      'Turn any URL into a complete marketing engine. Curi discovers your brand, creates content for every platform, and launches full campaigns — all from a single website link. No agency. No guesswork.',
    url: 'https://curi.corpcrunch.io/',
    category: 'BusinessApplication',
  },
  {
    name: 'Qrayt AI',
    description:
      'All-in-one content hyper-personalization platform that creates on-brand content at scale with custom avatars and SEO keyword targeting.',
    url: 'https://qrayt.ai.corpcrunch.io',
    category: 'MarketingApplication',
  },
  {
    name: 'Prowess',
    description:
      'PR-on-demand distribution platform with instant access to Tier 1–4 publishing channels through one unified platform.',
    url: 'https://prowess.corpcrunch.io',
    category: 'BusinessApplication',
  },
  {
    name: 'Cnvrsn',
    description:
      'AI sales pipeline platform that unifies leads, ML scoring, orchestrated sequences, and conversion for modern GTM teams.',
    url: 'https://otto.corpcrunch.io',
    category: 'BusinessApplication',
  },
];

const INTELLIGENT_FINTECH_CATALOG = [
  {
    name: 'Finx OnboardIQ',
    description: 'Secure KYC/KYB onboarding with compliance dossiers, watchlist screening, and audit vaults.',
    url: 'https://finx-onboardiq.corpcrunch.io/finx-onboardiq',
    category: 'FinanceApplication',
  },
  {
    name: 'Finx AML',
    description: 'Anti-money laundering with scenario detection, watchlist screening, risk scoring, and STR automation.',
    url: 'https://finx-aml.corpcrunch.io/',
    category: 'FinanceApplication',
  },
  {
    name: 'Finx FraudIQ',
    description: 'Real-time fraud prevention with velocity tracking, device fingerprinting, and behavioural analytics.',
    url: 'https://finx-fraudiq.corpcrunch.io/',
    category: 'FinanceApplication',
  },
  {
    name: 'Finx Onboard-Verify',
    description: 'Retail KYC and business KYB onboarding with CRA scoring, screening, and wallet limits.',
    url: 'https://finx-onboard-verify.corpcrunch.io/',
    category: 'FinanceApplication',
  },
  {
    name: 'Finx ClearComply',
    description: 'Regulatory compliance with document lifecycle, monitored sources, and auditable workflows.',
    url: 'https://finx-clearcomply.corpcrunch.io/',
    category: 'FinanceApplication',
  },
  {
    name: 'Finx Moneyday',
    description: 'Digital wallet and payments across 50+ currencies with transparent rates and bank-level security.',
    url: 'https://finx-moneyday.corpcrunch.io/',
    category: 'FinanceApplication',
  },
];

const INTELLIGENT_SUSTAINABILITY_CATALOG = [
  {
    name: 'Solvterra',
    description:
      'End-to-end ESG intelligence with emissions monitoring, scope 3 reporting, decarbonisation roadmaps, and climate risk modelling.',
    url: 'https://solvterra.corpcrunch.io/',
    category: 'BusinessApplication',
  },
];

export function buildProductsSeo(siteBaseUrl = PRIMARY_SITE_URL) {
  const title = 'Products — AI, MarTech & Business Intelligence Tools';
  const description =
    'Explore Corp Crunch products: Curi, Qrayt AI content personalization, Prowess PR-on-demand, and Cnvrsn sales intelligence. Enterprise AI for media, advertising, and GTM teams.';
  const url = buildPageUrl('/products', siteBaseUrl);
  const pageTitle = `${title} | ${SITE_NAME}`;
  const image = `${siteBaseUrl.replace(/\/$/, '')}/assets/img/logo/logo.png`;

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: pageTitle,
    description,
    url,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
    about: {
      '@type': 'Thing',
      name: 'Corp Crunch Product Portfolio',
      description: 'AI-powered MarTech, MediaTech, and AdTech products.',
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.heroTitle', '.productName', '.productDesc'],
    },
  };

  return {
    title: pageTitle,
    description,
    url,
    image,
    imageAlt: 'Corp Crunch products — Qrayt AI, Prowess, and Cnvrsn',
    ogTitle: title,
    ogDescription: description,
    keywords: [
      'Corp Crunch products',
      'Curi',
      'Qrayt AI',
      'Prowess PR',
      'Cnvrsn',
      'MarTech',
      'MediaTech',
      'AdTech',
      'AI content personalization',
      'PR on demand',
      'sales intelligence',
    ],
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    type: 'website',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      webPageSchema,
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'Products', path: '/products' },
        ],
        siteBaseUrl
      ),
      buildSoftwareItemListSchema(PRODUCTS_CATALOG, 'Corp Crunch Products'),
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: siteBaseUrl,
        logo: PUBLISHER_LOGO,
        brand: PRODUCTS_CATALOG.map((product) => ({
          '@type': 'Brand',
          name: product.name,
          url: product.url,
        })),
      },
    ],
  };
}

export function buildIntelligentSeo(siteBaseUrl = PRIMARY_SITE_URL) {
  const title = 'Intelligent Technology Solutions';
  const description =
    'Intelligent Technology Solutions by Corp Crunch — enterprise FinTech, sustainability tech, AI & data intelligence, cloud, cybersecurity, and digital engineering for regulated industries.';
  const url = buildPageUrl('/intelligent', siteBaseUrl);
  const pageTitle = `${title} | ${SITE_NAME}`;
  const image = `${siteBaseUrl.replace(/\/$/, '')}/assets/img/logo/Intelligent_Technology_Solutions_Header.png`;
  const allProducts = [...INTELLIGENT_SUSTAINABILITY_CATALOG, ...INTELLIGENT_FINTECH_CATALOG];

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: pageTitle,
    description,
    url,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: image,
      name: 'Intelligent Technology Solutions',
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.heroTitle', '.sectionTitle'],
    },
  };

  return {
    title: pageTitle,
    description,
    url,
    image,
    imageAlt: 'Intelligent Technology Solutions by Corp Crunch',
    ogTitle: title,
    ogDescription: description,
    keywords: [
      'Intelligent Technology Solutions',
      'Corp Crunch ITS',
      'enterprise FinTech',
      'sustainability technology',
      'ESG intelligence',
      'Solvterra',
      'Finx AML',
      'Finx FraudIQ',
      'AI data intelligence',
      'cloud infrastructure',
      'cybersecurity',
      'digital engineering',
    ],
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    type: 'website',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      webPageSchema,
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'Intelligent Technology Solutions', path: '/intelligent' },
        ],
        siteBaseUrl
      ),
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Intelligent Technology Solutions',
        alternateName: 'Corp Crunch ITS',
        url,
        logo: image,
        parentOrganization: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: siteBaseUrl,
        },
        sameAs: [siteBaseUrl, 'https://www.corpcrunch.ai'],
        description,
        knowsAbout: [
          'FinTech',
          'Sustainability Technology',
          'Artificial Intelligence',
          'Cybersecurity',
          'Cloud Infrastructure',
          'Digital Engineering',
        ],
      },
      buildSoftwareItemListSchema(allProducts, 'Intelligent Technology Solutions Product Portfolio'),
      {
        '@context': 'https://schema.org',
        '@type': 'ProfessionalService',
        name: 'Intelligent Technology Solutions',
        url,
        description,
        provider: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: siteBaseUrl,
        },
        areaServed: 'Worldwide',
        serviceType: [
          'AI & Data Intelligence',
          'Cloud & Infrastructure',
          'Cybersecurity',
          'Finance & Risk',
          'Digital Engineering',
          'Emerging Technology Consulting',
        ],
      },
    ],
  };
}

export function buildHomeSeo(siteBaseUrl = PRIMARY_SITE_URL) {
  return buildPageSeo({
    title: `${SITE_NAME} — ${'Making Media and Advertising Smarter'}`,
    description:
      'Corp Crunch delivers financial insights, global market news, economic trends, and expert analysis. Your trusted source for business intelligence and media innovation.',
    path: '/',
    jsonLd: [
      { ...ORGANIZATION_SCHEMA, url: siteBaseUrl },
      { ...WEBSITE_SCHEMA, url: siteBaseUrl },
    ],
  }, siteBaseUrl);
}

const EVENTS_CATALOG = [
  {
    name: 'C3 AIX Summit — Global Ethical AI Trilogy',
    description:
      'A three-year strategic AI summit series for industry, policy, and innovation — adoption, scale, and global leadership in ethical AI.',
    path: '/events',
    location: 'Dubai, UAE',
  },
  {
    name: 'AIX NOW: Adoption & Readiness',
    description:
      'Premier gathering of global leaders in artificial intelligence, fintech, and medtech innovation for enterprises, startups, investors, and policymakers.',
    path: '/events',
    location: 'Dubai, UAE',
  },
  {
    name: 'Corp Crunch Connect',
    description:
      'Industry networking and partnership opportunities across Corp Crunch intellectual properties and summit programming.',
    path: '/events/c3-corp-crunch-connect',
    location: 'Dubai, UAE',
  },
];

function buildEventItemListSchema(events, listName, siteBaseUrl) {
  const base = siteBaseUrl.replace(/\/$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: events.map((event, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Event',
        name: event.name,
        description: event.description,
        url: `${base}${event.path.startsWith('/') ? event.path : `/${event.path}`}`,
        eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
        eventStatus: 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: event.location || 'Dubai, UAE',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Dubai',
            addressCountry: 'AE',
          },
        },
        organizer: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: siteBaseUrl,
        },
      },
    })),
  };
}

export function buildEventsSeo(siteBaseUrl = PRIMARY_SITE_URL) {
  const title = 'Events — C3 AIX Summit & Industry Conferences';
  const description =
    'Discover Corp Crunch events including the C3 AIX Summit, Global Ethical AI Trilogy, partnership opportunities, and executive networking for AI, fintech, and medtech leaders.';
  const url = buildPageUrl('/events', siteBaseUrl);
  const pageTitle = `${title} | ${SITE_NAME}`;
  const image = `${siteBaseUrl.replace(/\/$/, '')}/assets/img/bg/AIX event page.png`;

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: pageTitle,
    description,
    url,
    inLanguage: 'en',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.HeroTitle', '.heroRevealLabel'],
    },
  };

  return {
    title: pageTitle,
    description,
    url,
    image,
    imageAlt: 'C3 AIX Summit — Corp Crunch events',
    ogTitle: title,
    ogDescription: description,
    keywords: [
      'Corp Crunch events',
      'C3 AIX Summit',
      'Global Ethical AI Trilogy',
      'AI summit Dubai',
      'fintech events',
      'medtech conference',
      'ethical AI',
      'event partnerships',
      'Corp Crunch Connect',
    ],
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    type: 'website',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      webPageSchema,
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/events' },
        ],
        siteBaseUrl
      ),
      buildEventItemListSchema(EVENTS_CATALOG, 'Corp Crunch Events', siteBaseUrl),
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: siteBaseUrl,
        logo: PUBLISHER_LOGO,
        event: EVENTS_CATALOG.map((event) => ({
          '@type': 'Event',
          name: event.name,
          description: event.description,
        })),
      },
    ],
  };
}

export function buildAboutSeo(siteBaseUrl = PRIMARY_SITE_URL) {
  const title = 'About Us';
  const description =
    'Learn about Corp Crunch — our mission, leadership team, and vision for smarter media, advertising, and business intelligence across global markets.';
  const url = buildPageUrl('/about', siteBaseUrl);
  const pageTitle = `${title} | ${SITE_NAME}`;

  return {
    title: pageTitle,
    description,
    url,
    image: DEFAULT_OG_IMAGE,
    imageAlt: 'About Corp Crunch',
    ogTitle: `${title} — ${SITE_NAME}`,
    ogDescription: description,
    keywords: [
      'About Corp Crunch',
      'Corp Crunch team',
      'business intelligence',
      'media innovation',
      'company mission',
      'corporate news platform',
    ],
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    type: 'website',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: pageTitle,
        description,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
        mainEntity: {
          '@type': 'Organization',
          name: SITE_NAME,
          url: siteBaseUrl,
          logo: PUBLISHER_LOGO,
        },
      },
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'About Us', path: '/about' },
        ],
        siteBaseUrl
      ),
    ],
  };
}

export function buildLegalPageSeo({ title, description, path }, siteBaseUrl = PRIMARY_SITE_URL) {
  const url = buildPageUrl(path, siteBaseUrl);
  const pageTitle = `${title} | ${SITE_NAME}`;

  return {
    title: pageTitle,
    description,
    url,
    image: DEFAULT_OG_IMAGE,
    imageAlt: pageTitle,
    ogTitle: pageTitle,
    ogDescription: description,
    robots: 'index, follow',
    type: 'website',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
      },
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: title, path },
        ],
        siteBaseUrl
      ),
    ],
  };
}

export function buildEMagazineSeo(siteBaseUrl = PRIMARY_SITE_URL) {
  return buildPageSeo(
    {
      title: 'E-Magazine Library',
      description:
        'Browse Corp Crunch digital magazines — business, technology, finance, and real estate editions available to read and download.',
      path: '/e-magazine',
      keywords: [
        'Corp Crunch magazine',
        'digital magazine',
        'business magazine',
        'e-magazine library',
        'corporate publications',
      ],
      imageAlt: 'Corp Crunch E-Magazine Library',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `E-Magazine Library | ${SITE_NAME}`,
          description:
            'Browse Corp Crunch digital magazines — business, technology, finance, and real estate editions.',
          url: buildPageUrl('/e-magazine', siteBaseUrl),
          isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
        },
        buildBreadcrumbSchema(
          [
            { name: 'Home', path: '/' },
            { name: 'E-Magazine', path: '/e-magazine' },
          ],
          siteBaseUrl
        ),
      ],
    },
    siteBaseUrl
  );
}

export function buildMagazineSeo(magazine, siteBaseUrl = PRIMARY_SITE_URL) {
  if (!magazine?.title) {
    return buildPageSeo(
      {
        title: 'Magazine',
        description: 'Corp Crunch digital magazine edition.',
        path: '/e-magazine',
      },
      siteBaseUrl
    );
  }

  const slug = magazine.title.toLowerCase().replace(/\s+/g, '-');
  const path = `/magazine/${slug}`;
  const description = `Read ${magazine.title} — a Corp Crunch digital magazine edition.`;
  const url = buildPageUrl(path, siteBaseUrl);
  const image = magazine.imageUrl
    ? magazine.imageUrl.startsWith('http')
      ? magazine.imageUrl
      : `${siteBaseUrl.replace(/\/$/, '')}${magazine.imageUrl.startsWith('/') ? magazine.imageUrl : `/${magazine.imageUrl}`}`
    : DEFAULT_OG_IMAGE;

  return {
    title: `${magazine.title} | ${SITE_NAME}`,
    description,
    url,
    image,
    imageAlt: magazine.title,
    ogTitle: magazine.title,
    ogDescription: description,
    robots: 'index, follow, max-image-preview:large',
    type: 'article',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'PublicationIssue',
        name: magazine.title,
        description,
        url,
        publisher: {
          '@type': 'Organization',
          name: SITE_NAME,
          logo: { '@type': 'ImageObject', url: PUBLISHER_LOGO },
        },
      },
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'E-Magazine', path: '/e-magazine' },
          { name: magazine.title, path },
        ],
        siteBaseUrl
      ),
    ],
  };
}

export function buildMakeArticleRequestSeo(siteBaseUrl = PRIMARY_SITE_URL) {
  return buildPageSeo(
    {
      title: 'Request an Article',
      description:
        'Submit an article request to Corp Crunch editorial. Share your topic, angle, and business context for expert coverage consideration.',
      path: '/make-article-request',
      keywords: [
        'article request',
        'Corp Crunch editorial',
        'submit story',
        'press inquiry',
        'guest contribution',
      ],
      robots: 'index, follow',
    },
    siteBaseUrl
  );
}

export function buildEventsSubpageSeo({ title, description, path, keywords = [] }, siteBaseUrl = PRIMARY_SITE_URL) {
  const url = buildPageUrl(path, siteBaseUrl);
  const pageTitle = `${title} | ${SITE_NAME}`;

  return {
    title: pageTitle,
    description,
    url,
    image: `${siteBaseUrl.replace(/\/$/, '')}/assets/img/bg/AIX event page.png`,
    imageAlt: title,
    ogTitle: pageTitle,
    ogDescription: description,
    keywords: ['Corp Crunch events', 'C3 AIX Summit', ...keywords],
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    type: 'website',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description,
        url,
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
      },
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/events' },
          { name: title, path },
        ],
        siteBaseUrl
      ),
    ],
  };
}

export function buildCompanySeo(company, siteBaseUrl = PRIMARY_SITE_URL) {
  const name = company?.name || 'Company';
  const description =
    company?.description ||
    `Latest news, analysis, and coverage about ${name} from Corp Crunch.`;
  const path = `/company/${company?.id || company?._id || ''}`;
  const url = buildPageUrl(path, siteBaseUrl);
  const pageTitle = `${name} News & Coverage | ${SITE_NAME}`;
  const image = company?.logoUrl || DEFAULT_OG_IMAGE;

  return {
    title: pageTitle,
    description,
    url,
    image: image.startsWith('http')
      ? image
      : `${siteBaseUrl.replace(/\/$/, '')}${image.startsWith('/') ? image : `/${image}`}`,
    imageAlt: `${name} logo`,
    ogTitle: pageTitle,
    ogDescription: description,
    robots: 'index, follow',
    type: 'website',
    alternateUrls: buildCrossDomainAlternates(url),
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: pageTitle,
        description,
        url,
        about: {
          '@type': 'Organization',
          name,
          logo: company?.logoUrl || undefined,
        },
        isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: siteBaseUrl },
      },
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: name, path },
        ],
        siteBaseUrl
      ),
    ],
  };
}

export function buildNoIndexPageSeo({ title, description, path = '/' }, siteBaseUrl = PRIMARY_SITE_URL) {
  return buildPageSeo(
    {
      title,
      description,
      path,
      robots: 'noindex, nofollow',
    },
    siteBaseUrl
  );
}
