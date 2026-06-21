import connectDB from './mongoose';
import Post from '@/models/Post';
import Category from '@/models/Category';
import Company from '@/models/Company';

export async function getPosts(options = {}) {
  const { lang = 'en', location = 'all', limit = 20 } = options;

  await connectDB();

  // Parallel fetch for different sections of the home page
  const [newest, trending, mostViewed, videoPosts] = await Promise.all([
    // Newest posts
    Post.find({ publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean(),

    // Trending (by shares)
    Post.find({ publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ sharesCount: -1, createdAt: -1 })
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean(),

    // Most Viewed
    Post.find({ publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean(),

    // Video posts (contentType = 'video' or has videoUrl)
    // Increase limit for video posts to show more videos
    Post.find({
      publishStatus: 'published',
      visibility: 'public',
      language: lang,
      $or: [
        { contentType: 'video' },
        { videoUrl: { $exists: true, $ne: null, $ne: '' } },
        { video_url: { $exists: true, $ne: null, $ne: '' } }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(Math.max(limit, 10)) // Ensure at least 10 videos, or use the provided limit if higher
      .populate('categoryId', 'name slug')
      .lean()
  ]);

  return {
    frontPagePosts: newest.map(serializePost),
    trendingPosts: trending.map(serializePost),
    mostViewedPosts: mostViewed.map(serializePost),
    videoPosts: videoPosts.map(serializePost),
    totalPosts: newest.length
  };
}

export async function getPostBySlug(slug) {
  await connectDB();

  const post = await Post.findOneAndUpdate(
    { slug },
    { $inc: { viewsCount: 1 } },
    { new: true }
  )
    .populate('categoryId', 'name slug')
    .lean();

  if (!post) return null;

  // Get prev/next efficiently and trending categories
  const [allPosts, allCategories] = await Promise.all([
    Post.find({
      publishStatus: 'published',
      visibility: 'public',
    })
      .sort({ createdAt: -1 })
      .select('slug title bannerImageUrl')
      .limit(20)  // Reduced from 100 — only need prev/next neighbour
      .lean(),
    Category.find({ isActive: true })
      .limit(10)
      .lean()
  ]);

  // Get post counts per category for trending calculation
  const categoryCounts = await Post.aggregate([
    { $match: { publishStatus: 'published', visibility: 'public' } },
    { $group: { _id: '$categoryId', count: { $sum: 1 }, totalViews: { $sum: '$viewsCount' } } },
    { $sort: { totalViews: -1, count: -1 } }
  ]);

  // Create a map of category counts for quick lookup
  const categoryCountMap = new Map();
  categoryCounts.forEach(cat => {
    categoryCountMap.set(cat._id.toString(), {
      postCount: cat.count,
      totalViews: cat.totalViews
    });
  });

  // Map all categories with their counts, including those with 0 posts
  const allCategoriesWithCounts = allCategories.map(category => {
    const counts = categoryCountMap.get(category._id.toString()) || { postCount: 0, totalViews: 0 };
    return {
      ...category,
      _id: category._id.toString(),
      id: category._id.toString(),
      postCount: counts.postCount,
      totalViews: counts.totalViews
    };
  });

  // Sort by totalViews and postCount, then take top 9
  const trendingCategories = allCategoriesWithCounts
    .sort((a, b) => {
      if (b.totalViews !== a.totalViews) {
        return b.totalViews - a.totalViews;
      }
      return b.postCount - a.postCount;
    })
    .slice(0, 5); // Reduced from 9 to 5 to cut page data

  // Fetch minimal trending news per category (3 posts, key fields only)
  const categoriesWithTrendingNews = await Promise.all(
    trendingCategories.map(async (category) => {
      const trendingPosts = await Post.find({
        categoryId: category._id,
        publishStatus: 'published',
        visibility: 'public'
      })
        .sort({ viewsCount: -1, createdAt: -1 })
        .limit(3)  // Reduced from 5
        .select('title slug bannerImageUrl categoryId createdAt excerpt')  // Only key fields
        .populate('categoryId', 'name slug')
        .lean();

      return {
        ...category,
        trendingNews: trendingPosts.map(serializePost)
      };
    })
  );

  const currentIndex = allPosts.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  return {
    ...serializePost(post),
    prevPost,
    nextPost,
    trendingCategories: categoriesWithTrendingNews
  };
}

export async function getCategoryById(categoryId, lang = 'en') {
  await connectDB();

  // Try by ObjectId first; if that fails (e.g. param is a slug like 'fintech-growth'),
  // fall back to slug then name lookup so both URL styles work.
  let category = null;
  try {
    category = await Category.findById(categoryId).lean();
  } catch (_) {
    // Not a valid ObjectId — will try slug/name below
  }

  if (!category) {
    // Try matching by slug field
    category = await Category.findOne({ slug: categoryId }).lean();
  }

  if (!category) {
    // Try matching by name (case-insensitive, convert slug → spaces)
    const nameGuess = categoryId.replace(/-/g, ' ');
    category = await Category.findOne({
      name: { $regex: new RegExp(`^${nameGuess}$`, 'i') }
    }).lean();
  }

  if (!category) return null;

  // Fetch only the essential fields needed for category page cards.
  // This keeps page data well under the 128 kB Next.js threshold.
  const postSelect = 'title slug bannerImageUrl excerpt content createdAt viewsCount sharesCount authorFirstName authorLastName quoteText quoteAuthorName contentType';

  // IMPORTANT: use category._id (ObjectId), NOT the raw categoryId param
  // (which may be a slug string like "fintech-growth" that Mongoose can't cast to ObjectId)
  const resolvedId = category._id;

  const [newest, trending, mostViewed] = await Promise.all([
    Post.find({ categoryId: resolvedId, publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ createdAt: -1 })
      .limit(10)
      .select(postSelect)
      .populate('categoryId', 'name slug')
      .lean(),
    Post.find({ categoryId: resolvedId, publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ sharesCount: -1, createdAt: -1 })
      .limit(10)
      .select(postSelect)
      .populate('categoryId', 'name slug')
      .lean(),
    Post.find({ categoryId: resolvedId, publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(10)
      .select(postSelect)
      .populate('categoryId', 'name slug')
      .lean()
  ]);

  // Also fetch categories for navigation (optional, don't fail if it errors)
  let categories = [];
  try {
    const { getCategories } = await import('./categoryService');
    categories = await getCategories();
  } catch (err) {
    console.warn('Failed to fetch categories in getCategoryById:', err.message);
  }

  return {
    ...category,
    _id: category._id?.toString(),
    id: category._id?.toString(),
    posts: newest.map(serializePost),
    newestPosts: newest.map(serializePost),
    trendingPosts: trending.map(serializePost),
    mostViewedPosts: mostViewed.map(serializePost),
    categories: categories
  };
}

export async function getCategoryByName(categoryName, lang = 'en') {
  await connectDB();

  const category = await Category.findOne({
    name: { $regex: new RegExp(`^${categoryName}$`, 'i') }
  }).lean();

  if (!category) {
    return {
      name: categoryName,
      posts: [],
      trendingPosts: [],
      mostViewedPosts: [],
      newestPosts: []
    };
  }

  const categoryDetails = await getCategoryById(category._id, lang);
  return categoryDetails;
}

// Helper to serialize post for frontend
function serializePost(post) {
  if (!post) return null;

  const serialized = {
    ...post,
    _id: post._id?.toString(),
    id: post._id?.toString(),
    categoryId: post.categoryId?._id?.toString() || post.categoryId?.toString()
  };

  if (post.categoryId && typeof post.categoryId === 'object') {
    serialized.Category = {
      id: post.categoryId._id?.toString(),
      name: post.categoryId.name,
      slug: post.categoryId.slug
    };
    serialized.category = serialized.Category;
  }

  return serialized;
}

export async function getSitemapData() {
  await connectDB();

  const [posts, categories, companies] = await Promise.all([
    Post.find({ publishStatus: 'published', visibility: 'public' })
      .select('slug updatedAt publishDate createdAt categoryId')
      .populate('categoryId', 'name slug')
      .lean(),
    Category.find({ isActive: true }).select('slug name updatedAt').lean(),
    Company.find({ isActive: true }).select('_id updatedAt').lean(),
  ]);

  const serializedPosts = posts.map((post) => {
    const category = post.categoryId;
    const categorySlug =
      category?.slug?.toLowerCase() ||
      category?.name?.toLowerCase().replace(/\s+/g, '-') ||
      '';

    return {
      slug: post.slug,
      categorySlug,
      lastmod: post.updatedAt || post.publishDate || post.createdAt,
      path: categorySlug ? `/${categorySlug}/blog/${post.slug}` : `/blog/${post.slug}`,
    };
  });

  const serializedCategories = categories.map((cat) => ({
    slug: cat.slug?.toLowerCase() || cat.name?.toLowerCase().replace(/\s+/g, '-'),
    lastmod: cat.updatedAt,
  }));

  const serializedCompanies = companies.map((company) => ({
    path: `company/${company._id.toString()}`,
    lastmod: company.updatedAt,
  }));

  return { posts: serializedPosts, categories: serializedCategories, companies: serializedCompanies };
}
