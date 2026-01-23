import connectDB from '@/lib/mongoose';
import Category from '@/models/Category';
import Post from '@/models/Post';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { categoryId } = req.query;
      const { lang = 'en', limit = 10 } = req.query;

      // Find category by ID or slug
      const category = await Category.findOne({
        $or: [
          { _id: categoryId },
          { id: categoryId },
          { slug: categoryId }
        ]
      }).lean();

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found',
        });
      }

      // Base query for published posts in this category
      const baseQuery = {
        categoryId: category._id,
        publishStatus: 'published',
        visibility: 'public',
      };

      if (lang !== 'all') {
        baseQuery.language = lang;
      }

      // Calculate trending score (last 30 days get boost)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Fetch all posts for this category
      const allPosts = await Post.find(baseQuery)
        .populate('categoryId', 'name slug id')
        .lean();

      // Map and calculate trending scores
      const postsWithScores = allPosts.map(post => {
        const postDate = new Date(post.createdAt || post.publishDate || 0);
        const isRecent = postDate >= thirtyDaysAgo;
        const score = (post.viewsCount || 0) * (isRecent ? 2 : 1) + (post.sharesCount || 0) * 2;
        
        return {
          ...post,
          trendingScore: score,
          Category: post.categoryId ? {
            id: post.categoryId._id || post.categoryId.id,
            name: post.categoryId.name,
            slug: post.categoryId.slug
          } : null
        };
      });

      // Sort by trending score
      const trendingPosts = postsWithScores
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, parseInt(limit));

      // Separate by content type
      const trendingNews = trendingPosts.filter(post => 
        !post.contentType || post.contentType === 'article' || post.contentType === 'news'
      ).slice(0, 5);

      const trendingArticles = trendingPosts.filter(post => 
        post.contentType === 'article' || (!post.contentType && !post.videoUrl)
      ).slice(0, 5);

      const trendingStories = trendingPosts.filter(post => 
        post.contentType === 'story' || (!post.contentType && !post.videoUrl)
      ).slice(0, 5);

      const trendingVideos = trendingPosts.filter(post => 
        post.contentType === 'video' || post.videoUrl
      ).slice(0, 5);

      // Return trending content by type
      return res.status(200).json({
        success: true,
        category: {
          id: category._id || category.id,
          name: category.name,
          slug: category.slug
        },
        trendingNews: trendingNews.map(post => ({
          _id: post._id?.toString(),
          id: post._id?.toString(),
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || post.content?.substring(0, 150),
          bannerImageUrl: post.bannerImageUrl,
          createdAt: post.createdAt,
          viewsCount: post.viewsCount || 0,
          sharesCount: post.sharesCount || 0,
          Category: post.Category
        })),
        trendingArticles: trendingArticles.map(post => ({
          _id: post._id?.toString(),
          id: post._id?.toString(),
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || post.content?.substring(0, 150),
          bannerImageUrl: post.bannerImageUrl,
          createdAt: post.createdAt,
          viewsCount: post.viewsCount || 0,
          sharesCount: post.sharesCount || 0,
          Category: post.Category
        })),
        trendingStories: trendingStories.map(post => ({
          _id: post._id?.toString(),
          id: post._id?.toString(),
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || post.content?.substring(0, 150),
          bannerImageUrl: post.bannerImageUrl,
          createdAt: post.createdAt,
          viewsCount: post.viewsCount || 0,
          sharesCount: post.sharesCount || 0,
          Category: post.Category
        })),
        trendingVideos: trendingVideos.map(post => ({
          _id: post._id?.toString(),
          id: post._id?.toString(),
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt || post.content?.substring(0, 150),
          bannerImageUrl: post.bannerImageUrl,
          videoUrl: post.videoUrl,
          createdAt: post.createdAt,
          viewsCount: post.viewsCount || 0,
          sharesCount: post.sharesCount || 0,
          Category: post.Category
        }))
      });
    } catch (error) {
      console.error('Error fetching trending content:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching trending content',
        error: error.message,
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

