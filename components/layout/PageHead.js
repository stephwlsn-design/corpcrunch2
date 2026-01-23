// components/PageHead.js
import Head from "next/head";

const PageHead = ({
  title = "Corp Crunch — Your Daily Scoop of Corporate Intel",
  description = "Corp Crunch delivers your daily scoop of corporate intelligence — financial insights, global market news, economic trends, and expert analysis you can trust.",
  url = "https://www.corpcrunch.io/",
  image = "https://www.corpcrunch.io/assets/img/logo/logo.png",
  type = "website",
  isArticle = false,
  publishedTime,
  author,
}) => {
  // Ensure title is always a string, not an array
  const safeTitle = Array.isArray(title) 
    ? title.join(' ') 
    : (typeof title === 'string' ? title : String(title || "Corp Crunch — Your Daily Scoop of Corporate Intel"));
  
  // Ensure description is always a string
  const safeDescription = Array.isArray(description)
    ? description.join(' ')
    : (typeof description === 'string' ? description : String(description || ""));
  
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{safeTitle}</title>
      <meta name="description" content={safeDescription} />

      {/* Viewport & Favicon */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="canonical" href={url} />

      {/* ✅ Optional article meta */}
      {isArticle && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {isArticle && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={isArticle ? "article" : type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
};

export default PageHead;
