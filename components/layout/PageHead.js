import Head from 'next/head';
import {
  SITE_NAME,
  PRIMARY_SITE_URL,
  TWITTER_HANDLE,
  DEFAULT_OG_IMAGE,
  DEFAULT_DESCRIPTION,
} from '@/lib/siteConfig';
import { buildCrossDomainAlternates } from '@/lib/siteUrl';

const PageHead = ({
  title = `${SITE_NAME} — Making Media and Advertising Smarter`,
  description = DEFAULT_DESCRIPTION,
  url = PRIMARY_SITE_URL,
  image = DEFAULT_OG_IMAGE,
  imageAlt,
  type = 'website',
  isArticle = false,
  publishedTime,
  modifiedTime,
  author,
  articleSection,
  ogTitle,
  ogDescription,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  keywords = [],
  language = 'en',
  jsonLd = [],
  alternateUrls = [],
}) => {
  const safeTitle = Array.isArray(title)
    ? title.join(' ')
    : typeof title === 'string'
      ? title
      : String(title || SITE_NAME);

  const safeDescription = Array.isArray(description)
    ? description.join(' ')
    : typeof description === 'string'
      ? description
      : String(description || '');

  const safeOgTitle = ogTitle || safeTitle;
  const safeOgDescription = ogDescription || safeDescription;
  const safeImageAlt = imageAlt || safeTitle;
  const keywordString = Array.isArray(keywords)
    ? keywords.filter(Boolean).join(', ')
    : typeof keywords === 'string'
      ? keywords
      : '';

  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  const crossDomainUrls =
    alternateUrls.length > 0 ? alternateUrls : buildCrossDomainAlternates(url);
  const xDefaultUrl =
    crossDomainUrls.find((entry) => entry.includes('corpcrunch.io')) || url;

  return (
    <Head>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />
      {keywordString && <meta name="keywords" content={keywordString} />}
      <meta name="robots" content={robots} />
      <meta name="googlebot" content={robots} />
      <meta httpEquiv="content-language" content={language} />

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="canonical" href={url} />

      {crossDomainUrls.map((altUrl) => (
        <link key={`alt-${altUrl}`} rel="alternate" hrefLang={language} href={altUrl} />
      ))}
      <link rel="alternate" hrefLang="x-default" href={xDefaultUrl} />

      {isArticle && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {isArticle && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {isArticle && author && (
        <meta property="article:author" content={author} />
      )}
      {isArticle && articleSection && (
        <meta property="article:section" content={articleSection} />
      )}
      {isArticle && keywordString && (
        <meta property="article:tag" content={keywordString} />
      )}

      <meta property="og:type" content={isArticle ? 'article' : type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={language === 'en' ? 'en_US' : language} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={safeOgTitle} />
      <meta property="og:description" content={safeOgDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={safeImageAlt} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={safeOgTitle} />
      <meta name="twitter:description" content={safeOgDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={safeImageAlt} />

      {schemas.map((schema, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </Head>
  );
};

export default PageHead;
