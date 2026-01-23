import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';
import { requireAdminAuth } from '@/lib/adminAuth';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (dbError) {
    console.error('Database connection error:', dbError);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
    });
  }

  // Require admin authentication for all operations
  let authResult;
  try {
    authResult = await requireAdminAuth(req);
  } catch (authError) {
    console.error('Auth error:', authError);
    return res.status(401).json({
      success: false,
      message: 'Authentication error. Please login again.',
      error: process.env.NODE_ENV === 'development' ? authError.message : undefined,
    });
  }
  
  if (!authResult.authorized) {
    return res.status(401).json({
      success: false,
      message: authResult.error || 'Unauthorized. Admin authentication required.',
    });
  }

  if (req.method === 'GET') {
    try {
      const { 
        contentType, 
        publishStatus, 
        categoryId,
        search,
        page = 1,
        limit = 50,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      const query = {};

      // Filter by content type (article, video, magazine)
      if (contentType && ['article', 'video', 'magazine'].includes(contentType)) {
        query.contentType = contentType;
      }

      // Filter by publish status (draft, review, scheduled, published)
      if (publishStatus && ['draft', 'review', 'scheduled', 'published'].includes(publishStatus)) {
        query.publishStatus = publishStatus;
      }

      // Filter by category
      if (categoryId) {
        query.categoryId = categoryId;
      }

      // Search by title or slug
      if (search && search.trim()) {
        query.$or = [
          { title: { $regex: search.trim(), $options: 'i' } },
          { slug: { $regex: search.trim(), $options: 'i' } },
          { excerpt: { $regex: search.trim(), $options: 'i' } }
        ];
      }

      // Calculate pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Get total count for pagination
      const total = await Post.countDocuments(query);

      // Fetch posts with pagination
      const posts = await Post.find(query)
        .populate('categoryId', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Format posts for response
      const formattedPosts = posts.map(post => ({
        _id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        contentType: post.contentType || 'article',
        publishStatus: post.publishStatus || 'published',
        visibility: post.visibility || 'public',
        bannerImageUrl: post.bannerImageUrl,
        excerpt: post.excerpt,
        authorFirstName: post.authorFirstName,
        authorLastName: post.authorLastName,
        category: post.categoryId ? {
          _id: post.categoryId._id?.toString(),
          name: post.categoryId.name,
          slug: post.categoryId.slug
        } : null,
        viewsCount: post.viewsCount || 0,
        sharesCount: post.sharesCount || 0,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        publishDate: post.publishDate,
        tags: post.tags || [],
        videoUrl: post.videoUrl
      }));

      return res.status(200).json({
        success: true,
        data: formattedPosts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching admin posts:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching posts',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}

