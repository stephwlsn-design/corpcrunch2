import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const { slug } = req.query;
      const { lang = 'en' } = req.query;

      const post = await Post.findOneAndUpdate(
        { slug },
        { $inc: { viewsCount: 1 } },
        { new: true }
      )
        .populate('categoryId', 'name slug')
        .lean();

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      // Get previous and next posts
      const allPosts = await Post.find({
        publishStatus: 'published',
        visibility: 'public',
      })
        .sort({ createdAt: -1 })
        .select('slug title bannerImageUrl')
        .lean();

      const currentIndex = allPosts.findIndex((p) => p.slug === slug);
      const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
      const nextPost =
        currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

      // Map categoryId to Category for frontend compatibility
      const Category = post.categoryId ? {
        id: post.categoryId._id || post.categoryId.id,
        name: post.categoryId.name,
        slug: post.categoryId.slug,
        createdAt: post.categoryId.createdAt || post.createdAt
      } : null;

      return res.status(200).json({
        success: true,
        ...post,
        prevPost,
        nextPost,
        Category, // Uppercase for frontend compatibility
        category: post.categoryId, // Keep lowercase for backward compatibility
      });
    } catch (error) {
      console.error('Error fetching post:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching post',
        error: error.message,
      });
    }
  }

  // UPDATE (PUT/PATCH) - Requires authentication
  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      // Require admin authentication
      const { requireAdminAuth } = await import('@/lib/adminAuth');
      const authResult = await requireAdminAuth(req);
      
      if (!authResult.authorized) {
        return res.status(401).json({
          success: false,
          message: authResult.error || 'Unauthorized. Admin authentication required.',
        });
      }

      const { slug } = req.query;
      const postData = req.body;

      // Find existing post
      const existingPost = await Post.findOne({ slug });
      if (!existingPost) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      // Validate slug if it's being changed
      if (postData.slug && postData.slug !== slug) {
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(postData.slug.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Slug must contain only lowercase letters, numbers, and hyphens',
          });
        }

        // Check if new slug already exists
        const slugExists = await Post.findOne({ slug: postData.slug.trim(), _id: { $ne: existingPost._id } });
        if (slugExists) {
          return res.status(409).json({
            success: false,
            message: 'A post with this slug already exists',
          });
        }
      }

      // Validate categoryId if provided
      if (postData.categoryId) {
        const Category = (await import('@/models/Category')).default;
        let categoryId = postData.categoryId;
        
        if (typeof categoryId === 'string' && mongoose.Types.ObjectId.isValid(categoryId)) {
          categoryId = new mongoose.Types.ObjectId(categoryId);
        }
        
        const category = await Category.findById(categoryId);
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category not found',
          });
        }
        postData.categoryId = categoryId;
      }

      // URL validation regex
      const urlRegex = /^https?:\/\/.+/i;

      // Update fields
      const updateData = {};
      
      // Required fields
      if (postData.title) updateData.title = postData.title.trim();
      if (postData.slug) updateData.slug = postData.slug.trim().toLowerCase();
      if (postData.content) updateData.content = postData.content.trim();
      if (postData.bannerImageUrl) {
        if (!urlRegex.test(postData.bannerImageUrl.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Banner image URL must be a valid HTTP/HTTPS URL',
          });
        }
        updateData.bannerImageUrl = postData.bannerImageUrl.trim();
      }
      if (postData.categoryId) updateData.categoryId = postData.categoryId;

      // Optional fields
      if (postData.authorFirstName !== undefined) updateData.authorFirstName = postData.authorFirstName?.trim() || null;
      if (postData.authorLastName !== undefined) updateData.authorLastName = postData.authorLastName?.trim() || null;
      if (postData.tags !== undefined) {
        updateData.tags = Array.isArray(postData.tags) 
          ? postData.tags.map(t => t.trim()).filter(Boolean)
          : [];
      }
      if (postData.metaTitle !== undefined) updateData.metaTitle = postData.metaTitle?.trim() || null;
      if (postData.metaDescription !== undefined) updateData.metaDescription = postData.metaDescription?.trim() || null;
      if (postData.imageAltText !== undefined) updateData.imageAltText = postData.imageAltText?.trim() || null;
      if (postData.publishStatus !== undefined) {
        updateData.publishStatus = postData.publishStatus;
        
        // If changing to scheduled, validate publish date
        if (postData.publishStatus === 'scheduled') {
          const publishDate = postData.publishDate ? new Date(postData.publishDate) : existingPost.publishDate;
          if (!publishDate || publishDate <= new Date()) {
            return res.status(400).json({
              success: false,
              message: 'Scheduled posts must have a publish date/time in the future',
            });
          }
        }
      }
      
      if (postData.publishDate !== undefined) {
        if (postData.publishDate) {
          const publishDateObj = new Date(postData.publishDate);
          
          // Validate date
          if (isNaN(publishDateObj.getTime())) {
            return res.status(400).json({
              success: false,
              message: 'Invalid publish date format',
            });
          }
          
          // If status is scheduled, validate date is in the future
          const finalStatus = postData.publishStatus !== undefined ? postData.publishStatus : existingPost.publishStatus;
          if (finalStatus === 'scheduled' && publishDateObj <= new Date()) {
            return res.status(400).json({
              success: false,
              message: 'Scheduled posts must have a publish date/time in the future',
            });
          }
          
          updateData.publishDate = publishDateObj;
        } else {
          updateData.publishDate = null;
        }
      }
      
      if (postData.visibility !== undefined) {
        // Validate visibility enum
        const validVisibilities = ['public', 'private', 'internal', 'members-only'];
        if (!validVisibilities.includes(postData.visibility)) {
          return res.status(400).json({
            success: false,
            message: `Invalid visibility. Must be one of: ${validVisibilities.join(', ')}`,
          });
        }
        updateData.visibility = postData.visibility;
      }
      if (postData.excerpt !== undefined) updateData.excerpt = postData.excerpt?.trim() || null;
      if (postData.readingTime !== undefined) updateData.readingTime = postData.readingTime ? Number(postData.readingTime) : null;
      if (postData.canonicalUrl !== undefined) {
        if (postData.canonicalUrl && !urlRegex.test(postData.canonicalUrl.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Canonical URL must be a valid HTTP/HTTPS URL',
          });
        }
        updateData.canonicalUrl = postData.canonicalUrl?.trim() || null;
      }
      // Handle relatedArticles - can be array or comma-separated string
      if (postData.relatedArticles !== undefined) {
        if (Array.isArray(postData.relatedArticles)) {
          updateData.relatedArticles = postData.relatedArticles.map(a => a.trim()).filter(Boolean);
        } else if (typeof postData.relatedArticles === 'string') {
          updateData.relatedArticles = postData.relatedArticles.split(',').map(a => a.trim()).filter(Boolean);
        } else {
          updateData.relatedArticles = [];
        }
      }
      
      // Handle inlineImages - can be array or newline-separated string
      if (postData.inlineImages !== undefined) {
        let imageUrls = [];
        if (Array.isArray(postData.inlineImages)) {
          imageUrls = postData.inlineImages;
        } else if (typeof postData.inlineImages === 'string') {
          imageUrls = postData.inlineImages.split('\n').map(url => url.trim()).filter(Boolean);
        }
        updateData.inlineImages = imageUrls.filter(url => urlRegex.test(url.trim()));
      }
      
      // Handle attachments - can be array or newline-separated string
      if (postData.attachments !== undefined) {
        let attachmentUrls = [];
        if (Array.isArray(postData.attachments)) {
          attachmentUrls = postData.attachments;
        } else if (typeof postData.attachments === 'string') {
          attachmentUrls = postData.attachments.split('\n').map(url => url.trim()).filter(Boolean);
        }
        updateData.attachments = attachmentUrls.filter(url => urlRegex.test(url.trim()));
      }
      if (postData.inlineImageAltText !== undefined) updateData.inlineImageAltText = postData.inlineImageAltText?.trim() || null;
      if (postData.allowIndexing !== undefined) updateData.allowIndexing = postData.allowIndexing;
      if (postData.allowFollowing !== undefined) updateData.allowFollowing = postData.allowFollowing;
      if (postData.schemaMarkupType !== undefined) updateData.schemaMarkupType = postData.schemaMarkupType;
      if (postData.ogTitle !== undefined) updateData.ogTitle = postData.ogTitle?.trim() || null;
      if (postData.ogDescription !== undefined) updateData.ogDescription = postData.ogDescription?.trim() || null;
      if (postData.ogImage !== undefined) {
        if (postData.ogImage && !urlRegex.test(postData.ogImage.trim())) {
          return res.status(400).json({
            success: false,
            message: 'OG Image URL must be a valid HTTP/HTTPS URL',
          });
        }
        updateData.ogImage = postData.ogImage?.trim() || null;
      }
      // Handle secondaryKeywords - can be array or comma-separated string
      if (postData.secondaryKeywords !== undefined) {
        if (Array.isArray(postData.secondaryKeywords)) {
          updateData.secondaryKeywords = postData.secondaryKeywords.map(k => k.trim()).filter(Boolean);
        } else if (typeof postData.secondaryKeywords === 'string') {
          updateData.secondaryKeywords = postData.secondaryKeywords.split(',').map(k => k.trim()).filter(Boolean);
        } else {
          updateData.secondaryKeywords = [];
        }
      }
      if (postData.redirectFrom !== undefined) updateData.redirectFrom = postData.redirectFrom?.trim() || null;
      if (postData.language !== undefined) updateData.language = postData.language;
      if (postData.region !== undefined) updateData.region = postData.region?.trim() || null;
      
      // Validate and store structured data (JSON-LD)
      if (postData.structuredData !== undefined) {
        const structuredDataStr = postData.structuredData?.trim();
        if (structuredDataStr) {
          try {
            // Validate JSON format
            JSON.parse(structuredDataStr);
            updateData.structuredData = structuredDataStr;
          } catch (e) {
            return res.status(400).json({
              success: false,
              message: 'Structured Data must be valid JSON format',
              error: e.message,
            });
          }
        } else {
          updateData.structuredData = null;
        }
      }
      if (postData.quoteText !== undefined) updateData.quoteText = postData.quoteText?.trim() || null;
      if (postData.quoteAuthorName !== undefined) updateData.quoteAuthorName = postData.quoteAuthorName?.trim() || null;
      if (postData.quoteAuthorTitle !== undefined) updateData.quoteAuthorTitle = postData.quoteAuthorTitle?.trim() || null;
      if (postData.contentType !== undefined) updateData.contentType = postData.contentType;
      if (postData.videoUrl !== undefined) {
        if (postData.videoUrl && !urlRegex.test(postData.videoUrl.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Video URL must be a valid HTTP/HTTPS URL',
          });
        }
        updateData.videoUrl = postData.videoUrl?.trim() || null;
      }
      if (postData.whyThisMatters !== undefined) updateData.whyThisMatters = postData.whyThisMatters?.trim() || null;
      if (postData.whyThisMattersMultimediaUrl !== undefined) {
        if (postData.whyThisMattersMultimediaUrl && !urlRegex.test(postData.whyThisMattersMultimediaUrl.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Why This Matters multimedia URL must be a valid HTTP/HTTPS URL',
          });
        }
        updateData.whyThisMattersMultimediaUrl = postData.whyThisMattersMultimediaUrl?.trim() || null;
      }
      if (postData.whyThisMattersMultimediaType !== undefined) updateData.whyThisMattersMultimediaType = postData.whyThisMattersMultimediaType;
      if (postData.whatsExpectedNext !== undefined) updateData.whatsExpectedNext = postData.whatsExpectedNext?.trim() || null;
      if (postData.whatsExpectedNextMultimediaUrl !== undefined) {
        if (postData.whatsExpectedNextMultimediaUrl && !urlRegex.test(postData.whatsExpectedNextMultimediaUrl.trim())) {
          return res.status(400).json({
            success: false,
            message: 'What\'s Expected Next multimedia URL must be a valid HTTP/HTTPS URL',
          });
        }
        updateData.whatsExpectedNextMultimediaUrl = postData.whatsExpectedNextMultimediaUrl?.trim() || null;
      }
      if (postData.whatsExpectedNextMultimediaType !== undefined) updateData.whatsExpectedNextMultimediaType = postData.whatsExpectedNextMultimediaType;

      // Update the post
      Object.assign(existingPost, updateData);
      await existingPost.save();

      return res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: existingPost,
      });
    } catch (error) {
      console.error('Error updating post:', error);
      
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A post with this slug already exists',
        });
      }

      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(e => e.message).join(', ');
        return res.status(400).json({
          success: false,
          message: `Validation error: ${errors}`,
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error updating post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  // DELETE - Requires authentication
  if (req.method === 'DELETE') {
    try {
      // Require admin authentication
      const { requireAdminAuth } = await import('@/lib/adminAuth');
      const authResult = await requireAdminAuth(req);
      
      if (!authResult.authorized) {
        return res.status(401).json({
          success: false,
          message: authResult.error || 'Unauthorized. Admin authentication required.',
        });
      }

      const { slug } = req.query;

      const post = await Post.findOne({ slug });
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found',
        });
      }

      await Post.deleteOne({ _id: post._id });

      return res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting post:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting post',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
