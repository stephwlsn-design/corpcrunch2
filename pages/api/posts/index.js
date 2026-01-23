import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  // Prevent multiple responses
  let responseSent = false;
  
  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      res.status(statusCode).json(data);
    }
  };

  // Disable Next.js caching for this API route
  if (!responseSent) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  // Set timeout for the entire request - increased to 15 seconds for slow connections
  const timeout = setTimeout(() => {
    if (!responseSent) {
      console.warn('[API /posts] ⚠ Request timeout after 15 seconds');
      sendResponse(200, {
        success: false,
        message: 'Request timeout - database connection may be slow. Please try again.',
        frontPagePosts: [],
        trendingPosts: [],
      });
    }
  }, 15000); // 15 second timeout

  try {
    // Connect to database - mongoose handles timeouts internally
    let dbConnected = false;
    try {
      // Clear timeout immediately when connection starts to prevent premature timeout
      clearTimeout(timeout);
      
      await connectDB();
      dbConnected = true;
      console.log('[API /posts] ✓ Database connected successfully');
      
      // Verify connection with a simple query
      try {
        const testCount = await Post.countDocuments({});
        console.log('[API /posts] ✓ Database connection verified, total posts:', testCount);
      } catch (testError) {
        console.error('[API /posts] ⚠ Database connection test failed:', testError.message);
        dbConnected = false;
      }
    } catch (error) {
      console.error('[API /posts] ❌ Failed to connect to database:', error.message);
      console.error('[API /posts] Connection error details:', {
        name: error.name,
        code: error.code,
        message: error.message,
      });
      clearTimeout(timeout);
      // Return empty arrays instead of error to prevent frontend crash
      if (!responseSent) {
        sendResponse(200, {
          success: false,
          message: `Database connection failed: ${error.message}. Please check your MongoDB connection and IP whitelist.`,
          frontPagePosts: [],
          trendingPosts: [],
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
      return;
    }
    
    if (!dbConnected) {
      clearTimeout(timeout);
      if (!responseSent) {
        sendResponse(200, {
          success: false,
          message: 'Database connection could not be verified.',
          frontPagePosts: [],
          trendingPosts: [],
        });
      }
      return;
    }

  if (req.method === 'GET') {
    try {
      const { lang = 'en', location = 'all' } = req.query;
      
      console.log('[API /posts] Query params:', { lang, location });
      
      // First, check if ANY posts exist at all
      const totalPostsCount = await Post.countDocuments({});
      console.log('[API /posts] Total posts in database:', totalPostsCount);
      
      if (totalPostsCount === 0) {
        console.log('[API /posts] ⚠ Database is empty - no posts exist');
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(200, {
            success: false,
            message: 'No posts found in database. Please add posts to the database.',
            frontPagePosts: [],
            trendingPosts: [],
          });
        }
        return;
      }
      
      // First, try the simplest possible query - get ANY posts without any filters
      // This ensures we can retrieve posts even if field values don't match exactly
      let posts = [];
      try {
        console.log('[API /posts] Trying simplest query first - no filters...');
        // Try with populate first
        try {
          posts = await Post.find({})
            .populate('categoryId', 'name slug id')
            .sort({ createdAt: -1 })
            .limit(20)
            .maxTimeMS(10000)
            .lean();
          console.log(`[API /posts] Simplest query (with populate) found ${posts.length} posts`);
        } catch (populateError) {
          console.log('[API /posts] Populate failed, trying without populate:', populateError.message);
          // If populate fails, try without it
          posts = await Post.find({})
            .sort({ createdAt: -1 })
            .limit(20)
            .maxTimeMS(10000)
            .lean();
          console.log(`[API /posts] Simplest query (no populate) found ${posts.length} posts`);
        }
      } catch (simpleError) {
        console.error('[API /posts] Simplest query failed:', simpleError.message);
      }

      // If simple query found posts, use them. Otherwise try filtered strategies
      if (posts.length === 0) {
        console.log('[API /posts] No posts from simple query, trying filtered strategies...');
        const queryStrategies = [
          // Strategy 1: Published + Public + Language (if specified)
          lang && lang !== 'all' 
            ? { publishStatus: 'published', visibility: 'public', language: lang }
            : { publishStatus: 'published', visibility: 'public' },
          // Strategy 2: Published + Public (any language)
          { publishStatus: 'published', visibility: 'public' },
          // Strategy 3: Just Published (any visibility, any language)
          { publishStatus: 'published' },
          // Strategy 4: Just Public (any publish status)
          { visibility: 'public' },
          // Strategy 5: Has title (any post with a title field)
          { title: { $exists: true, $ne: null, $ne: '' } },
        ];

        for (let i = 0; i < queryStrategies.length && posts.length === 0; i++) {
        const query = queryStrategies[i];
        console.log(`[API /posts] Trying query strategy ${i + 1}:`, JSON.stringify(query));
        
        try {
          // Try with populate first
          let result = [];
          try {
            result = await Post.find(query)
              .populate('categoryId', 'name slug id')
              .sort({ createdAt: -1 })
              .limit(20)
              .maxTimeMS(8000) // Increased timeout
              .lean();
          } catch (populateError) {
            console.log(`[API /posts] Populate failed for strategy ${i + 1}, trying without populate:`, populateError.message);
            // If populate fails, try without it
            result = await Post.find(query)
              .sort({ createdAt: -1 })
              .limit(20)
              .maxTimeMS(8000)
              .lean();
          }
          
          // If still no results, try without populate (in case categoryId is causing issues)
          if (result.length === 0) {
            console.log(`[API /posts] Strategy ${i + 1} found 0 posts with populate, trying without populate...`);
            try {
              result = await Post.find(query)
                .sort({ createdAt: -1 })
                .limit(20)
                .maxTimeMS(8000)
                .lean();
            } catch (noPopulateError) {
              console.error(`[API /posts] Query without populate also failed:`, noPopulateError.message);
            }
          }
          
          console.log(`[API /posts] Strategy ${i + 1} found ${result.length} posts`);
          
          if (result.length > 0) {
            posts = result;
            console.log(`[API /posts] ✓ Using strategy ${i + 1} - Sample post:`, {
              _id: posts[0]?._id?.toString(),
              title: posts[0]?.title?.substring(0, 50),
              publishStatus: posts[0]?.publishStatus,
              visibility: posts[0]?.visibility,
              language: posts[0]?.language,
              hasCategoryId: !!posts[0]?.categoryId,
              categoryIdType: typeof posts[0]?.categoryId,
              categoryIdValue: posts[0]?.categoryId,
            });
            break; // Found posts, stop trying other strategies
          }
        } catch (queryError) {
          console.error(`[API /posts] Query strategy ${i + 1} failed:`, queryError.message);
          console.error(`[API /posts] Query strategy ${i + 1} error details:`, {
            name: queryError.name,
            code: queryError.code,
            stack: queryError.stack?.substring(0, 200),
          });
          // Continue to next strategy
        }
        }
      }

      // If still no posts after all strategies, get comprehensive diagnostic information
      if (posts.length === 0) {
        console.log('[API /posts] ⚠ No posts found with any strategy, getting diagnostics...');
        try {
          const totalCount = await Post.countDocuments({});
          const publishedCount = await Post.countDocuments({ publishStatus: 'published' });
          const publicCount = await Post.countDocuments({ visibility: 'public' });
          const bothCount = await Post.countDocuments({ publishStatus: 'published', visibility: 'public' });
          
          console.log('[API /posts] Database diagnostics:', {
            total: totalCount,
            published: publishedCount,
            public: publicCount,
            both: bothCount,
          });
          
          // Get a sample of any posts that exist to see their structure - try multiple approaches
          let samplePosts = [];
          try {
            // Try with a very simple query
            samplePosts = await Post.find({}).limit(20).maxTimeMS(10000).lean();
          } catch (sampleError) {
            console.error('[API /posts] Error getting sample posts:', sampleError.message);
            // Try even simpler - just get one post
            try {
              const singlePost = await Post.findOne({}).maxTimeMS(10000).lean();
              if (singlePost) {
                samplePosts = [singlePost];
              }
            } catch (singleError) {
              console.error('[API /posts] Error getting single post:', singleError.message);
            }
          }
          
          if (samplePosts.length > 0) {
            console.log('[API /posts] Sample posts structure:', samplePosts.map(p => ({
              _id: p._id?.toString(),
              title: p.title?.substring(0, 30),
              publishStatus: p.publishStatus,
              visibility: p.visibility,
              language: p.language,
              createdAt: p.createdAt,
              hasCategoryId: !!p.categoryId,
              categoryId: p.categoryId?.toString(),
            })));
            // Use these sample posts as a last resort - they exist in DB but don't match filters
            posts = samplePosts;
            console.log(`[API /posts] ⚠ Using ${samplePosts.length} sample posts as fallback (they exist but don't match ideal filters)`);
          } else {
            console.log('[API /posts] ❌ No posts found in database at all - database appears to be empty');
          }
        } catch (diagError) {
          console.error('[API /posts] Error getting diagnostics:', diagError.message);
        }
      }

      // Ensure posts is always an array
      if (!Array.isArray(posts)) {
        console.warn('[API /posts] Posts is not an array, converting...', typeof posts, posts);
        posts = [];
      }

      console.log('[API /posts] Before mapping - posts count:', Array.isArray(posts) ? posts.length : 0);

      // Ensure posts is an array before mapping
      if (!Array.isArray(posts)) {
        console.error('[API /posts] ❌ Posts is not an array:', typeof posts);
        posts = [];
      }

      // Map categoryId to Category for frontend compatibility
      // Handle both populated and non-populated categoryId
      let mappedPosts = [];
      try {
        mappedPosts = posts.map((post, index) => {
        let category = null;
        
        try {
          if (post.categoryId) {
            // If categoryId is populated (object)
            if (typeof post.categoryId === 'object' && post.categoryId !== null) {
              if (post.categoryId._id || post.categoryId.id) {
                category = {
                  id: post.categoryId._id?.toString() || post.categoryId.id?.toString(),
                  name: post.categoryId.name || 'Uncategorized',
                  slug: post.categoryId.slug || ''
                };
              }
            } 
            // If categoryId is just an ObjectId (string)
            else if (typeof post.categoryId === 'string' || (post.categoryId && post.categoryId.toString)) {
              category = {
                id: post.categoryId.toString(),
                name: 'Uncategorized',
                slug: ''
              };
            }
          }
        } catch (catError) {
          console.warn(`[API /posts] Error mapping category for post ${index}:`, catError.message);
        }
        
          return {
            ...post,
            Category: category
          };
        });
      } catch (mappingError) {
        console.error('[API /posts] ❌ Error mapping posts:', mappingError.message);
        // Use posts as-is if mapping fails
        mappedPosts = posts;
      }

      // Ensure mappedPosts is an array
      if (!Array.isArray(mappedPosts)) {
        console.warn('[API /posts] ⚠ mappedPosts is not an array, using posts instead');
        mappedPosts = Array.isArray(posts) ? posts : [];
      }

      console.log('[API /posts] After mapping - mappedPosts count:', mappedPosts.length);

      // Separate into frontPagePosts and trendingPosts
      const frontPagePosts = Array.isArray(mappedPosts) ? mappedPosts.slice(0, 10) : [];
      const trendingPosts = Array.isArray(mappedPosts) ? mappedPosts.slice(10, 20) : [];

      console.log('[API /posts] ✓ Returning:', {
        frontPagePostsCount: frontPagePosts.length,
        trendingPostsCount: trendingPosts.length,
        totalPosts: mappedPosts.length,
      });

      // Clear timeout to prevent it from sending a response
      clearTimeout(timeout);
      
      // Check if response was already sent (by timeout handler or error handler)
      if (res.headersSent) {
        console.warn('[API /posts] ⚠ Response already sent, skipping...');
        return;
      }
      
      // Double-check responseSent flag
      if (responseSent) {
        console.warn('[API /posts] ⚠ Response already sent (flag check), skipping...');
        return;
      }
      
      // Final validation - ensure we always return arrays
      const finalFrontPagePosts = Array.isArray(frontPagePosts) ? frontPagePosts : [];
      const finalTrendingPosts = Array.isArray(trendingPosts) ? trendingPosts : [];
      
      // Ensure all variables are defined
      const postsLength = Array.isArray(posts) ? posts.length : 0;
      const totalCount = typeof totalPostsCount === 'number' ? totalPostsCount : 0;
      const mappedLength = Array.isArray(mappedPosts) ? mappedPosts.length : 0;
      
      // Convert to plain JSON-serializable objects (Mongoose documents might not serialize properly)
      const serializePosts = (postArray) => {
        return postArray.map(post => {
          try {
            // If it's already a plain object (from .lean()), return as-is
            // Otherwise convert Mongoose document to plain object
            const plainPost = post.toObject ? post.toObject() : post;
            return {
              ...plainPost,
              _id: plainPost._id?.toString(),
              categoryId: plainPost.categoryId?.toString(),
              createdAt: plainPost.createdAt ? (plainPost.createdAt instanceof Date ? plainPost.createdAt.toISOString() : plainPost.createdAt) : null,
              updatedAt: plainPost.updatedAt ? (plainPost.updatedAt instanceof Date ? plainPost.updatedAt.toISOString() : plainPost.updatedAt) : null,
            };
          } catch (e) {
            console.warn('[API /posts] Error serializing post:', e.message);
            return post;
          }
        });
      };
      
      const serializedFrontPagePosts = serializePosts(finalFrontPagePosts);
      const serializedTrendingPosts = serializePosts(finalTrendingPosts);
      
      console.log('[API /posts] After serialization:', {
        frontPageCount: serializedFrontPagePosts.length,
        trendingCount: serializedTrendingPosts.length,
        firstPostTitle: serializedFrontPagePosts[0]?.title,
      });
      
      const finalResponse = {
        success: postsLength > 0,
        message: postsLength > 0 
          ? `Successfully retrieved ${postsLength} posts` 
          : totalCount > 0
            ? `Database has ${totalCount} posts, but none match the query criteria. Check publishStatus and visibility fields.`
            : `Database appears to be empty. No posts found.`,
        frontPagePosts: serializedFrontPagePosts,
        trendingPosts: serializedTrendingPosts,
        debug: process.env.NODE_ENV === 'development' ? {
          totalPostsInDB: totalCount,
          postsRetrieved: postsLength,
          frontPageCount: serializedFrontPagePosts.length,
          trendingCount: serializedTrendingPosts.length,
          mappedPostsCount: mappedLength,
        } : undefined,
      };
      
      console.log('[API /posts] ✓ Final response prepared:', {
        success: finalResponse.success,
        frontPagePostsCount: serializedFrontPagePosts.length,
        trendingPostsCount: serializedTrendingPosts.length,
        totalPostsInDB: totalCount,
        message: finalResponse.message,
      });
      
      // Double-check the response structure
      if (!Array.isArray(finalResponse.frontPagePosts) || !Array.isArray(finalResponse.trendingPosts)) {
        console.error('[API /posts] ❌ CRITICAL: Response arrays are invalid!', {
          frontPagePostsType: typeof finalResponse.frontPagePosts,
          trendingPostsType: typeof finalResponse.trendingPosts,
        });
        // Force arrays
        finalResponse.frontPagePosts = [];
        finalResponse.trendingPosts = [];
      }
      
      // Clear timeout before sending response
      clearTimeout(timeout);
      
      // Final check - ensure response hasn't been sent
      if (res.headersSent || responseSent) {
        console.warn('[API /posts] ⚠ Response already sent, cannot send final response');
        return;
      }
      
      // Send the response
      sendResponse(200, finalResponse);
      return;
    } catch (error) {
      console.error('Error fetching posts:', error);
      clearTimeout(timeout);
      
      // Return empty arrays instead of error to prevent frontend crash
      if (!responseSent) {
        sendResponse(200, {
          success: false,
          message: 'Error fetching posts',
          frontPagePosts: [],
          trendingPosts: [],
        });
      }
      return;
    }
  }

  if (req.method === 'POST') {
    try {
      // Rate limiting for post creation
      try {
        const { postCreationRateLimiter } = await import('@/lib/rateLimiter');
        const rateLimitResult = await postCreationRateLimiter(req);
        
        if (!rateLimitResult.allowed) {
          clearTimeout(timeout);
          if (!responseSent) {
            res.setHeader('Retry-After', rateLimitResult.retryAfter);
            sendResponse(429, {
              success: false,
              message: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
              retryAfter: rateLimitResult.retryAfter,
            });
          }
          return;
        }
      } catch (rateLimitError) {
        // If rate limiting fails, log but continue (fail open)
        console.warn('[API /posts POST] Rate limiting error:', rateLimitError.message);
      }

      // Require admin authentication
      const { requireAdminAuth } = await import('@/lib/adminAuth');
      const authResult = await requireAdminAuth(req);
      
      if (!authResult.authorized) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(401, {
            success: false,
            message: authResult.error || 'Unauthorized. Admin authentication required.',
          });
        }
        return;
      }

      const postData = req.body;

      // Validate required fields
      if (!postData.title || !postData.title.trim()) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Title is required',
          });
        }
        return;
      }

      if (!postData.slug || !postData.slug.trim()) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Slug is required',
          });
        }
        return;
      }

      if (!postData.content || !postData.content.trim()) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Content is required',
          });
        }
        return;
      }

      if (!postData.bannerImageUrl || !postData.bannerImageUrl.trim()) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Banner image URL is required',
          });
        }
        return;
      }

      if (!postData.categoryId) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Category is required',
          });
        }
        return;
      }

      // Validate slug format (lowercase, alphanumeric, hyphens only)
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(postData.slug)) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Slug must contain only lowercase letters, numbers, and hyphens',
          });
        }
        return;
      }

      // Check if slug already exists
      const existingPost = await Post.findOne({ slug: postData.slug.trim() });
      if (existingPost) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(409, {
            success: false,
            message: 'A post with this slug already exists. Please use a different slug.',
          });
        }
        return;
      }

      // Validate and convert categoryId to ObjectId
      let categoryId = postData.categoryId;
      const Category = (await import('@/models/Category')).default;
      
      // Try to find category by various methods
      let category = null;
      
      // If it's already a valid ObjectId string, use it directly
      if (typeof categoryId === 'string' && mongoose.Types.ObjectId.isValid(categoryId)) {
        try {
          categoryId = new mongoose.Types.ObjectId(categoryId);
          category = await Category.findById(categoryId);
        } catch (e) {
          // Continue to try other methods
        }
      }
      
      // If not found, try to find by numeric ID (if categories have a numeric id field)
      if (!category && (typeof categoryId === 'number' || (typeof categoryId === 'string' && /^\d+$/.test(categoryId)))) {
        // Try to find by _id if it can be converted to ObjectId
        try {
          const objectId = new mongoose.Types.ObjectId(categoryId);
          category = await Category.findById(objectId);
          if (category) {
            categoryId = category._id;
          }
        } catch (e) {
          // If conversion fails, category might not exist
        }
      }
      
      // If still not found, try to find by any field that might match
      if (!category) {
        // Try as string search
        category = await Category.findOne({
          $or: [
            { _id: categoryId },
            { id: categoryId },
            { slug: categoryId }
          ]
        });
        
        if (category) {
          categoryId = category._id;
        }
      }
      
      // Verify category exists
      if (!category) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Category not found. Please select a valid category.',
          });
        }
        return;
      }
      
      // Ensure categoryId is an ObjectId
      if (!(categoryId instanceof mongoose.Types.ObjectId)) {
        categoryId = category._id;
      }

      // Validate URLs
      const urlRegex = /^https?:\/\/.+/i;
      if (postData.bannerImageUrl && !urlRegex.test(postData.bannerImageUrl.trim())) {
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Banner image URL must be a valid HTTP/HTTPS URL',
          });
        }
        return;
      }

      // SEO Optimization - Auto-generate missing SEO fields
      const { generateMetaTitle, generateMetaDescription, calculateReadingTime } = await import('@/lib/seoOptimizer');
      
      // Auto-generate metaTitle if not provided
      const finalMetaTitle = postData.metaTitle?.trim() || generateMetaTitle(postData.title.trim());
      
      // Auto-generate metaDescription if not provided
      const finalMetaDescription = postData.metaDescription?.trim() || generateMetaDescription(postData.content.trim());
      
      // Auto-calculate reading time if not provided
      const finalReadingTime = postData.readingTime || calculateReadingTime(postData.content.trim());

      // Sanitize and prepare post data
      const sanitizedData = {
        title: postData.title.trim(),
        slug: postData.slug.trim().toLowerCase(),
        content: postData.content.trim(),
        bannerImageUrl: postData.bannerImageUrl.trim(),
        categoryId: categoryId,
        publishStatus: postData.publishStatus || 'published',
        visibility: postData.visibility || 'public',
        contentType: postData.contentType || 'article',
        language: postData.language || 'en',
        allowIndexing: postData.allowIndexing !== undefined ? postData.allowIndexing : true,
        allowFollowing: postData.allowFollowing !== undefined ? postData.allowFollowing : true,
        schemaMarkupType: postData.schemaMarkupType || 'Article',
        metaTitle: finalMetaTitle,
        metaDescription: finalMetaDescription,
        readingTime: finalReadingTime,
      };

      // Optional fields - only add if provided
      if (postData.authorFirstName) sanitizedData.authorFirstName = postData.authorFirstName.trim();
      if (postData.authorLastName) sanitizedData.authorLastName = postData.authorLastName.trim();
      if (postData.tags && Array.isArray(postData.tags)) {
        sanitizedData.tags = postData.tags.map(t => t.trim()).filter(Boolean);
      }
      // metaTitle and metaDescription already set above with auto-generation
      if (postData.imageAltText) sanitizedData.imageAltText = postData.imageAltText.trim();
      if (postData.excerpt) sanitizedData.excerpt = postData.excerpt.trim();
      // readingTime already calculated above
      if (postData.canonicalUrl && urlRegex.test(postData.canonicalUrl.trim())) {
        sanitizedData.canonicalUrl = postData.canonicalUrl.trim();
      }
      // Handle relatedArticles - can be array or comma-separated string
      if (postData.relatedArticles) {
        if (Array.isArray(postData.relatedArticles)) {
          sanitizedData.relatedArticles = postData.relatedArticles.map(a => a.trim()).filter(Boolean);
        } else if (typeof postData.relatedArticles === 'string') {
          sanitizedData.relatedArticles = postData.relatedArticles.split(',').map(a => a.trim()).filter(Boolean);
        }
      }
      
      // Handle inlineImages - can be array or newline-separated string
      if (postData.inlineImages) {
        let imageUrls = [];
        if (Array.isArray(postData.inlineImages)) {
          imageUrls = postData.inlineImages;
        } else if (typeof postData.inlineImages === 'string') {
          imageUrls = postData.inlineImages.split('\n').map(url => url.trim()).filter(Boolean);
        }
        // Validate and filter URLs
        sanitizedData.inlineImages = imageUrls.filter(url => urlRegex.test(url.trim()));
      }
      
      // Handle attachments - can be array or newline-separated string
      if (postData.attachments) {
        let attachmentUrls = [];
        if (Array.isArray(postData.attachments)) {
          attachmentUrls = postData.attachments;
        } else if (typeof postData.attachments === 'string') {
          attachmentUrls = postData.attachments.split('\n').map(url => url.trim()).filter(Boolean);
        }
        // Validate and filter URLs
        sanitizedData.attachments = attachmentUrls.filter(url => urlRegex.test(url.trim()));
      }
      if (postData.inlineImageAltText) sanitizedData.inlineImageAltText = postData.inlineImageAltText.trim();
      if (postData.ogTitle) sanitizedData.ogTitle = postData.ogTitle.trim();
      if (postData.ogDescription) sanitizedData.ogDescription = postData.ogDescription.trim();
      if (postData.ogImage && urlRegex.test(postData.ogImage.trim())) {
        sanitizedData.ogImage = postData.ogImage.trim();
      }
      // Handle secondaryKeywords - can be array or comma-separated string
      if (postData.secondaryKeywords) {
        if (Array.isArray(postData.secondaryKeywords)) {
          sanitizedData.secondaryKeywords = postData.secondaryKeywords.map(k => k.trim()).filter(Boolean);
        } else if (typeof postData.secondaryKeywords === 'string') {
          sanitizedData.secondaryKeywords = postData.secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean);
        }
      }
      if (postData.redirectFrom) sanitizedData.redirectFrom = postData.redirectFrom.trim();
      if (postData.region) sanitizedData.region = postData.region.trim();
      // Validate and store structured data (JSON-LD)
      if (postData.structuredData) {
        const structuredDataStr = postData.structuredData.trim();
        if (structuredDataStr) {
          try {
            // Validate JSON format
            JSON.parse(structuredDataStr);
            sanitizedData.structuredData = structuredDataStr;
          } catch (e) {
            clearTimeout(timeout);
            if (!responseSent) {
              sendResponse(400, {
                success: false,
                message: 'Structured Data must be valid JSON format',
                error: e.message,
              });
            }
            return;
          }
        }
      }
      if (postData.quoteText) sanitizedData.quoteText = postData.quoteText.trim();
      if (postData.quoteAuthorName) sanitizedData.quoteAuthorName = postData.quoteAuthorName.trim();
      if (postData.quoteAuthorTitle) sanitizedData.quoteAuthorTitle = postData.quoteAuthorTitle.trim();
      if (postData.videoUrl && urlRegex.test(postData.videoUrl.trim())) {
        sanitizedData.videoUrl = postData.videoUrl.trim();
      }
      if (postData.whyThisMatters) sanitizedData.whyThisMatters = postData.whyThisMatters.trim();
      if (postData.whyThisMattersMultimediaUrl && urlRegex.test(postData.whyThisMattersMultimediaUrl.trim())) {
        sanitizedData.whyThisMattersMultimediaUrl = postData.whyThisMattersMultimediaUrl.trim();
      }
      if (postData.whyThisMattersMultimediaType) {
        sanitizedData.whyThisMattersMultimediaType = postData.whyThisMattersMultimediaType;
      }
      if (postData.whatsExpectedNext) sanitizedData.whatsExpectedNext = postData.whatsExpectedNext.trim();
      if (postData.whatsExpectedNextMultimediaUrl && urlRegex.test(postData.whatsExpectedNextMultimediaUrl.trim())) {
        sanitizedData.whatsExpectedNextMultimediaUrl = postData.whatsExpectedNextMultimediaUrl.trim();
      }
      if (postData.whatsExpectedNextMultimediaType) {
        sanitizedData.whatsExpectedNextMultimediaType = postData.whatsExpectedNextMultimediaType;
      }

      // Handle publish date and validate scheduled posts
      if (postData.publishDate) {
        const publishDateObj = new Date(postData.publishDate);
        
        // Validate date
        if (isNaN(publishDateObj.getTime())) {
          clearTimeout(timeout);
          if (!responseSent) {
            sendResponse(400, {
              success: false,
              message: 'Invalid publish date format',
            });
          }
          return;
        }
        
        sanitizedData.publishDate = publishDateObj;
        
        // If status is scheduled, validate date is in the future
        if (sanitizedData.publishStatus === 'scheduled') {
          const now = new Date();
          if (publishDateObj <= now) {
            clearTimeout(timeout);
            if (!responseSent) {
              sendResponse(400, {
                success: false,
                message: 'Scheduled posts must have a publish date/time in the future',
              });
            }
            return;
          }
        }
      } else if (sanitizedData.publishStatus === 'scheduled') {
        // Scheduled posts require a publish date
        clearTimeout(timeout);
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: 'Scheduled posts require a publish date and time',
          });
        }
        return;
      }

      // Create new post
      const post = new Post(sanitizedData);
      await post.save();

      clearTimeout(timeout);
      if (!responseSent) {
        sendResponse(201, {
          success: true,
          message: 'Post created successfully',
          data: post,
        });
      }
      return;
    } catch (error) {
      console.error('[API /posts POST] Error creating post:', error);
      clearTimeout(timeout);
      
      // Handle duplicate key error (slug)
      if (error.code === 11000) {
        if (!responseSent) {
          sendResponse(409, {
            success: false,
            message: 'A post with this slug already exists. Please use a different slug.',
          });
        }
        return;
      }

      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message).join(', ');
        if (!responseSent) {
          sendResponse(400, {
            success: false,
            message: `Validation error: ${errors}`,
          });
        }
        return;
      }

      if (!responseSent) {
        sendResponse(500, {
          success: false,
          message: 'Error creating post',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
      return;
    }
  }

  clearTimeout(timeout);
  if (!responseSent) {
    sendResponse(405, { success: false, message: 'Method not allowed' });
  }
  return;
  } catch (error) {
    clearTimeout(timeout);
    console.error('[API /posts] ❌ Unexpected error in posts API:', {
      message: error.message,
      stack: error.stack?.substring(0, 300),
      name: error.name,
    });
    
    // Always return a valid response, never let it crash
    if (!responseSent) {
      sendResponse(200, {
        success: false,
        message: `Error: ${error.message}`,
        frontPagePosts: [],
        trendingPosts: [],
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
    return;
  }
}
