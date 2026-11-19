/**
 * Fixes duplicate / broken article banners.
 *
 * 1) Auto articles pointing at /api/media/... (404 on production until deploy)
 *    get a fresh unique AI image written to public/ + DB update.
 * 2) Posts sharing the same library banner are redistributed across the
 *    topic library so cards stop looking identical.
 *
 * Usage:
 *   node scripts/articles/fix-images.js            # redistribute + regenerate broken auto
 *   node scripts/articles/fix-images.js --ai-only   # only regenerate auto /api/media banners
 *   node scripts/articles/fix-images.js --dry
 */
require('./engine/env');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { createArticleImage } = require('./engine/image');
const { SECTIONS } = require('./engine/config');

const dry = process.argv.includes('--dry');
const aiOnly = process.argv.includes('--ai-only');
const libOnly = process.argv.includes('--lib-only');

const LIBRARY = fs
  .readdirSync(path.join(__dirname, '..', '..', 'public', 'assets', 'img', 'articles'))
  .filter((f) => f.endsWith('.webp') && f !== 'generic-1.webp')
  .map((f) => f.replace(/\.webp$/, ''));

const TOPIC_KEYWORDS = [
  // More specific topics first so "Hyundai + AI agents" doesn't become a car image.
  { keys: ['cyber', 'saas', 'identity', 'ransomware', 'malware', 'zero trust', 'infosec', 'breach', 'phishing'], images: ['datacenter-1', 'chip-1'] },
  { keys: ['nvidia', 'chip', 'semiconductor', 'gpu', 'silicon', 'tsmc'], images: ['chip-1'] },
  { keys: ['ai agent', 'ai agents', 'artificial intelligence', 'machine learning', 'llm', 'openai', 'chatgpt'], images: ['ai-1', 'datacenter-1'] },
  { keys: [' ai ', 'ai-', 'ai/', ' ai.', 'agent'], images: ['ai-1'] },
  { keys: ['bank', 'earnings', 'finance', 'investor', 'equity', 'stock', 'jpmorgan', 'payment'], images: ['markets-1', 'markets-2', 'corporate-1', 'corporate-2'] },
  { keys: ['electric vehicle', 'automotive', 'tesla', 'ev ', 'nissan', 'mercedes', 'stellantis'], images: ['auto-2', 'ev-1b'] },
  { keys: ['retail', 'consumer', 'fmcg', 'brand', 'supermarket'], images: ['retail-1', 'retail-2'] },
  { keys: ['trade', 'tariff', 'export', 'import', 'customs'], images: ['trade-1', 'trade-2'] },
  // Region + topic before generic energy so Africa renewables don't get arctic climate stock.
  { keys: ['africa', 'african', 'ghana', 'kenya', 'nigeria', 'senegal', 'morocco', 'egypt'], images: ['africa-renewable-1', 'retail-1'] },
  { keys: ['solar', 'wind turbine', 'mini-grid', 'distributed power', 'renewable'], images: ['africa-renewable-1', 'climate-1'] },
  { keys: ['oil', 'energy', 'gas', 'climate', 'esg'], images: ['oil-energy-1', 'climate-1'] },
  { keys: ['crypto', 'bitcoin', 'fintech'], images: ['crypto-1'] },
  { keys: ['policy', 'politics', 'election', 'government', 'parliament'], images: ['politics-1', 'politics-2'] },
  { keys: ['legal', 'lawsuit', 'court', 'regulator'], images: ['legal-1'] },
  { keys: ['india', 'rupee', 'mumbai', 'delhi'], images: ['india-1'] },
  { keys: ['asia', 'china', 'japan', 'korea', 'singapore'], images: ['asia-1'] },
  { keys: ['europe', 'eu', 'germany', 'uk', 'london'], images: ['europe-1'] },
  { keys: ['health', 'pharma', 'drug', 'medical'], images: ['health-1'] },
  { keys: ['cloud', 'data centre', 'data center', 'server'], images: ['datacenter-1'] },
  { keys: ['gold', 'commodity', 'commodities'], images: ['gold-commodities-1'] },
  { keys: ['media', 'advertising', 'marketing'], images: ['media-1', 'media-2'] },
  { keys: ['labor', 'workplace', 'employment', 'jobs'], images: ['labor-1', 'workplace-1'] },
  { keys: ['deal', 'merger', 'acquisition', 'm&a'], images: ['deal-1'] },
  { keys: ['geo', 'defense', 'war', 'geopolit'], images: ['geopolitics-1'] },
  { keys: ['central bank', 'fed', 'ecb', 'rate cut', 'interest rate'], images: ['central-bank-1', 'central-bank-2'] },
  { keys: ['gadget', 'wearable', 'sport'], images: ['gadget-1'] },
];

function pickTopicImages(title = '', excerpt = '') {
  const text = `${title} ${excerpt}`.toLowerCase();
  const hits = [];
  for (const row of TOPIC_KEYWORDS) {
    if (row.keys.some((k) => text.includes(k))) hits.push(...row.images);
  }
  return [...new Set(hits.length ? hits : LIBRARY)];
}

function leastUsed(candidates, usage) {
  let best = candidates[0];
  let bestN = Infinity;
  for (const c of candidates) {
    const n = usage.get(c) || 0;
    if (n < bestN) {
      best = c;
      bestN = n;
    }
  }
  return best;
}

async function regenerateAuto(col, post, catSlug) {
  const section = SECTIONS[catSlug] || Object.values(SECTIONS).find((s) => s.slug === catSlug) || SECTIONS.finance;
  const sectionSlug = section.slug || catSlug || 'finance';
  const log = (...a) => console.log(...a);
  const image = await createArticleImage({
    scene: post.imageAltText || section.scene,
    slug: post.slug,
    sectionSlug,
    sectionLabel: section.label,
    fallbackImage: section.fallbackImage,
    uniqueness: `${post.title} | ${post.excerpt || ''}`.slice(0, 180),
    log,
  });
  if (dry) {
    console.log(`  DRY would set ${post.slug} → ${image.url}`);
    return;
  }
  const abs = image.url.startsWith('http')
    ? image.url
    : `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corpcrunch.io').replace(/\/$/, '')}${image.url}`;
  // Prefer a production-safe library path when the AI file lives under
  // /generated/ (those assets 404 until the next static deploy).
  const liveUrl =
    image.url.includes('/articles/generated/') && image.source === 'ai'
      ? `/assets/img/articles/${section.fallbackImage || 'generic-1'}.webp`
      : image.url;
  const liveAbs = liveUrl.startsWith('http')
    ? liveUrl
    : `${(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.corpcrunch.io').replace(/\/$/, '')}${liveUrl}`;

  let structuredData = post.structuredData;
  try {
    const sd =
      typeof structuredData === 'string' ? JSON.parse(structuredData) : structuredData;
    if (sd && typeof sd === 'object') {
      sd.image = Array.isArray(sd.image) ? [liveAbs] : liveAbs;
      structuredData = JSON.stringify(sd, null, 2);
    }
  } catch {
    /* keep existing */
  }

  await col.updateOne(
    { _id: post._id },
    {
      $set: {
        bannerImageUrl: liveUrl,
        ogImage: liveAbs,
        twitterImage: liveAbs,
        imageSource: image.source,
        whyThisMattersMultimediaUrl: liveUrl,
        inlineImages: [liveUrl],
        ...(structuredData ? { structuredData } : {}),
        updatedAt: new Date(),
      },
    }
  );
  console.log(`  updated ${post.slug} → ${liveUrl}${liveUrl !== image.url ? ` (ai saved as ${image.url})` : ''}`);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const col = mongoose.connection.collection('posts');
  const cats = await mongoose.connection.collection('categories').find({}).project({ slug: 1 }).toArray();
  const catMap = Object.fromEntries(cats.map((c) => [String(c._id), c.slug]));

  // --- 1) Regenerate broken / missing unique AI banners for auto articles
  if (!libOnly) {
    const autos = await col
      .find({
        autoGenerated: true,
        $or: [
          { bannerImageUrl: { $regex: '^/api/media/articles/' } },
          { bannerImageUrl: { $exists: false } },
          { bannerImageUrl: '' },
          { bannerImageUrl: null },
        ],
      })
      .toArray();
    console.log(`Auto articles needing unique images: ${autos.length}`);
    for (const post of autos) {
      const catSlug = catMap[String(post.categoryId)] || 'finance';
      console.log(`\n[AI] ${post.slug} (${catSlug})`);
      try {
        await regenerateAuto(col, post, catSlug);
      } catch (e) {
        console.error(`  FAILED: ${e.message}`);
      }
    }
  }

  // --- 2) Redistribute duplicate library banners (auto articles only —
  // never overwrite original/manual editorial images).
  if (!aiOnly) {
    const usage = new Map();
    const all = await col
      .find({
        autoGenerated: true,
        bannerImageUrl: { $exists: true, $ne: '' },
      })
      .project({
        title: 1,
        excerpt: 1,
        slug: 1,
        bannerImageUrl: 1,
        categoryId: 1,
        structuredData: 1,
        autoGenerated: 1,
      })
      .toArray();

    for (const p of all) {
      const m = String(p.bannerImageUrl || '').match(/\/assets\/img\/articles\/([^/.]+)/);
      if (m) usage.set(m[1], (usage.get(m[1]) || 0) + 1);
    }

    const byBanner = new Map();
    for (const p of all) {
      const url = p.bannerImageUrl;
      if (!url || url.includes('/api/media/')) continue;
      if (!byBanner.has(url)) byBanner.set(url, []);
      byBanner.get(url).push(p);
    }

    let changed = 0;
    for (const [url, group] of byBanner) {
      if (group.length < 2) continue;
      // Keep the newest (first if sorted) on the shared image; reassign the rest.
      const sorted = group.sort((a, b) => String(b._id).localeCompare(String(a._id)));
      const keep = sorted[0];
      console.log(`\n[LIB] ${url} used ${group.length}x — keeping ${keep.slug}`);
      for (const post of sorted.slice(1)) {
        const candidates = pickTopicImages(post.title, post.excerpt).filter((img) => {
          const current = String(url).includes(`${img}.webp`);
          return !current;
        });
        const pool = candidates.length ? candidates : LIBRARY.filter((img) => !String(url).includes(`${img}.webp`));
        const pick = leastUsed(pool.length ? pool : LIBRARY, usage);
        const nextUrl = `/assets/img/articles/${pick}.webp`;
        usage.set(pick, (usage.get(pick) || 0) + 1);
        const prevKey = String(url).match(/\/assets\/img\/articles\/([^/.]+)/)?.[1];
        if (prevKey) usage.set(prevKey, Math.max(0, (usage.get(prevKey) || 1) - 1));
        if (dry) {
          console.log(`  DRY ${post.slug} → ${nextUrl}`);
        } else {
          const abs = `https://www.corpcrunch.io${nextUrl}`;
          let structuredData;
          try {
            const raw = post.structuredData;
            const sd = typeof raw === 'string' ? JSON.parse(raw) : raw;
            if (sd && typeof sd === 'object') {
              sd.image = Array.isArray(sd.image) ? [abs] : abs;
              structuredData = JSON.stringify(sd, null, 2);
            }
          } catch {
            /* ignore */
          }
          await col.updateOne(
            { _id: post._id },
            {
              $set: {
                bannerImageUrl: nextUrl,
                ogImage: abs,
                twitterImage: abs,
                whyThisMattersMultimediaUrl: nextUrl,
                inlineImages: [nextUrl],
                ...(structuredData ? { structuredData } : {}),
                updatedAt: new Date(),
              },
            }
          );
          console.log(`  ${post.slug} → ${nextUrl}`);
        }
        changed += 1;
      }
    }
    console.log(`\nLibrary redistribute updates: ${changed}`);
  }

  await mongoose.disconnect();
  console.log(dry ? '\nDry run complete.' : '\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
