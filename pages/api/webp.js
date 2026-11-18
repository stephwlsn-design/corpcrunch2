import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import {
  FALLBACK_IMAGE,
  isGifOrSvg,
  isOptimizableImage,
  resolveImageSrc,
} from '@/util/imageUtils';

export const config = {
  api: {
    responseLimit: false,
  },
};

const PUBLIC_ROOT = path.join(process.cwd(), 'public');
const MAX_BYTES = 8 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 8000;

function clamp(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

function isSafePublicPath(filePath) {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(PUBLIC_ROOT + path.sep) || resolved === PUBLIC_ROOT;
}

async function readLocalAsset(src) {
  const relative = decodeURIComponent(src.split('?')[0]).replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_ROOT, relative);
  if (!isSafePublicPath(filePath)) {
    throw new Error('Invalid local image path');
  }
  return fs.readFile(filePath);
}

async function fetchRemote(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
        'User-Agent': 'CorpCrunchImage/1.0',
      },
    });
    if (!response.ok) {
      throw new Error(`Upstream ${response.status}`);
    }
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    if (contentType.includes('text/html') || contentType.includes('application/json')) {
      throw new Error('Upstream did not return an image');
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > MAX_BYTES) {
      throw new Error('Image too large');
    }
    return buffer;
  } finally {
    clearTimeout(timer);
  }
}

async function loadSource(urlParam) {
  const resolved = resolveImageSrc(urlParam);
  if (!resolved || isGifOrSvg(resolved)) {
    return readLocalAsset(FALLBACK_IMAGE);
  }
  if (resolved.startsWith('/') && !resolved.startsWith('//')) {
    try {
      return await readLocalAsset(resolved);
    } catch {
      return readLocalAsset(FALLBACK_IMAGE);
    }
  }
  if (!isOptimizableImage(resolved)) {
    return readLocalAsset(FALLBACK_IMAGE);
  }
  try {
    return await fetchRemote(resolved);
  } catch {
    return readLocalAsset(FALLBACK_IMAGE);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const width = clamp(req.query.w, 16, 1200, 800);
  const quality = clamp(req.query.q, 1, 90, 70);
  const urlParam = typeof req.query.url === 'string' ? req.query.url : FALLBACK_IMAGE;

  try {
    const input = await loadSource(urlParam);
    const output = await sharp(input, { failOn: 'none', animated: false })
      .rotate()
      .resize({
        width,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Content-Length', String(output.length));
    return res.status(200).send(output);
  } catch (error) {
    console.error('[api/webp]', error.message);
    try {
      const fallback = await sharp(await readLocalAsset(FALLBACK_IMAGE))
        .resize({ width, withoutEnlargement: true, fit: 'inside' })
        .webp({ quality: 70 })
        .toBuffer();
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(200).send(fallback);
    } catch {
      return res.status(500).end('Image conversion failed');
    }
  }
}
