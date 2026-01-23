import connectDB from './mongoose';
import Post from '@/models/Post';
import Category from '@/models/Category';

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
      .limit(100)
      .lean(),
    Category.find({ isActive: true })
      .limit(20)
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
      // First sort by totalViews, then by postCount
      if (b.totalViews !== a.totalViews) {
        return b.totalViews - a.totalViews;
      }
      return b.postCount - a.postCount;
    })
    .slice(0, 9);

  // Fetch trending news for each of these categories
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const categoriesWithTrendingNews = await Promise.all(
    trendingCategories.map(async (category) => {
      const trendingPosts = await Post.find({
        categoryId: category._id,
        publishStatus: 'published',
        visibility: 'public'
      })
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(5)
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
  
  const category = await Category.findById(categoryId).lean();
  if (!category) return null;

  // Increase the number of posts returned for category pages so the
  // "Most Viewed" column can show more than 10 cards.
  const [newest, trending, mostViewed] = await Promise.all([
    Post.find({ categoryId, publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('categoryId', 'name slug')
      .lean(),
    Post.find({ categoryId, publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ sharesCount: -1, createdAt: -1 })
      .limit(20)
      .populate('categoryId', 'name slug')
      .lean(),
    Post.find({ categoryId, publishStatus: 'published', visibility: 'public', language: lang })
      .sort({ viewsCount: -1, createdAt: -1 })
      .limit(20)
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
