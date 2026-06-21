import { getStaticPages } from '@/lib/getStaticPages';
import {
  getStaticPageMeta,
  isIndexablePath,
  normalizeSitemapPath,
  toSitemapUrlPath,
} from '@/lib/sitemapConfig';
import { getSitemapData } from '@/lib/postService';

function buildEntry(path, meta = {}, lastmod = null) {
  const normalizedPath = normalizeSitemapPath(path);
  const staticMeta = getStaticPageMeta(normalizedPath ? `/${normalizedPath}` : '/');

  return {
    path: normalizedPath,
    priority: meta.priority || staticMeta.priority,
    changefreq: meta.changefreq || staticMeta.changefreq,
    lastmod,
  };
}

export async function getFullSitemapData() {
  const seen = new Set();
  const entries = [];

  const addEntry = (path, meta = {}, lastmod = null) => {
    const normalizedPath = normalizeSitemapPath(path);
    const key = normalizedPath || '/';

    if (!isIndexablePath(toSitemapUrlPath(key))) {
      return;
    }

    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    entries.push(buildEntry(normalizedPath, meta, lastmod));
  };

  for (const route of getStaticPages()) {
    addEntry(route);
  }

  const { posts, categories, companies } = await getSitemapData();

  for (const category of categories) {
    addEntry(category.slug, { priority: '0.8', changefreq: 'daily' }, category.lastmod);
  }

  for (const company of companies || []) {
    addEntry(company.path, { priority: '0.6', changefreq: 'monthly' }, company.lastmod);
  }

  for (const post of posts) {
    const postPath = String(post.path || '').replace(/^\/+/, '');
    addEntry(postPath, { priority: '0.7', changefreq: 'weekly' }, post.lastmod);
  }

  entries.sort((a, b) => {
    const pathA = a.path || '';
    const pathB = b.path || '';
    if (pathA === pathB) return 0;
    if (!pathA) return -1;
    if (!pathB) return 1;
    return pathA.localeCompare(pathB);
  });

  return { entries };
}
