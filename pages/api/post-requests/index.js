import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';
import { publicRateLimiter } from '@/lib/rateLimiter';

export default async function handler(req, res) {
  // Apply rate limiting to all requests
  try {
    const rateLimitResult = await publicRateLimiter(req);
    if (!rateLimitResult.allowed) {
      res.setHeader('Retry-After', rateLimitResult.retryAfter);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please try again after ${rateLimitResult.retryAfter} seconds.`,
        retryAfter: rateLimitResult.retryAfter,
      });
    }
  } catch (rateLimitError) {
    console.warn('[API /post-requests] Rate limiting error:', rateLimitError.message);
    // Continue if rate limiting fails (fail open)
  }

  await connectDB();

  if (req.method === 'POST') {
    try {
      const {
        description,
        companyName,
        submitterAddress,
        categoryID,
        title,
        submitterEmail,
        submitterName,
        submitterPhone,
      } = req.body;

      // Log received data for debugging
      console.log('Received article request data:', {
        submitterName,
        submitterEmail,
        submitterPhone,
        companyName,
        submitterAddress,
        categoryID,
        description: description?.substring(0, 50) + '...',
      });

      // Sanitize and validate required fields
      const sanitizedData = {
        submitterName: submitterName?.trim() || '',
        submitterEmail: submitterEmail?.trim().toLowerCase() || '',
        submitterPhone: submitterPhone?.trim() || '',
        companyName: companyName?.trim() || '',
        submitterAddress: submitterAddress?.trim() || '',
        categoryID: categoryID,
        description: description?.trim() || '',
      };

      // Validate required fields
      const missingFields = {};
      if (!sanitizedData.submitterName) missingFields.submitterName = true;
      if (!sanitizedData.submitterEmail) missingFields.submitterEmail = true;
      if (!sanitizedData.submitterPhone) missingFields.submitterPhone = true;
      if (!sanitizedData.companyName) missingFields.companyName = true;
      if (!sanitizedData.submitterAddress) missingFields.submitterAddress = true;
      if (!sanitizedData.categoryID) missingFields.categoryID = true;
      if (!sanitizedData.description) missingFields.description = true;

      if (Object.keys(missingFields).length > 0) {
        console.error('Validation failed - missing fields:', missingFields);
        return res.status(400).json({
          success: false,
          message: 'All fields are required. Please fill in all fields.',
          missingFields,
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedData.submitterEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format',
        });
      }

      // Validate phone number (basic validation - at least 10 digits)
      const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
      if (!phoneRegex.test(sanitizedData.submitterPhone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid phone number format',
        });
      }

      // Validate description length (max 10000 characters)
      if (sanitizedData.description.length > 10000) {
        return res.status(400).json({
          success: false,
          message: 'Description is too long (maximum 10000 characters)',
        });
      }

      // Validate categoryID is a valid ObjectId or number
      if (typeof sanitizedData.categoryID !== 'string' && typeof sanitizedData.categoryID !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID',
        });
      }

      // Escape HTML in user inputs to prevent XSS
      const escapeHtml = (text) => {
        const map = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
      };

      // Create a draft post with the submission details (with sanitized data)
      const postData = {
        title: (title?.trim() || `[Article Request] ${sanitizedData.companyName} - ${Date.now()}`).substring(0, 200),
        slug: `article-request-${Date.now()}`,
        content: `
          <h2>Article Request from ${escapeHtml(sanitizedData.companyName)}</h2>
          <p><strong>Submitted by:</strong> ${escapeHtml(sanitizedData.submitterName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(sanitizedData.submitterEmail)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(sanitizedData.submitterPhone)}</p>
          <p><strong>Company:</strong> ${escapeHtml(sanitizedData.companyName)}</p>
          <p><strong>Location:</strong> ${escapeHtml(sanitizedData.submitterAddress)}</p>
          <hr/>
          <h3>Content Description</h3>
          <p>${escapeHtml(sanitizedData.description)}</p>
        `,
        bannerImageUrl: '/assets/img/default-banner.jpg', // Default placeholder
        categoryId: sanitizedData.categoryID,
        publishStatus: 'draft',
        visibility: 'private',
        excerpt: sanitizedData.description.substring(0, 160),
        // Store submitter information in additional fields
        authorFirstName: sanitizedData.submitterName.split(' ')[0] || sanitizedData.submitterName,
        authorLastName: sanitizedData.submitterName.split(' ').slice(1).join(' ') || '',
        // Custom fields for article requests
        tags: ['article-request', sanitizedData.companyName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').substring(0, 50)],
        metaDescription: `Article request from ${sanitizedData.companyName}: ${sanitizedData.description.substring(0, 100)}...`,
      };

      const post = await Post.create(postData);

      // Return the post ID for payment processing (don't expose sensitive data)
      return res.status(201).json({
        success: true,
        message: 'Article request submitted successfully',
        id: post._id.toString(),
        post: {
          id: post._id.toString(),
          title: post.title,
          slug: post.slug,
        }
      });
    } catch (error) {
      console.error('Error creating article request:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit article request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  // GET method - retrieve post request by ID
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Post ID is required',
        });
      }

      const post = await Post.findById(id).populate('categoryId', 'name slug');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post request not found',
        });
      }

      return res.status(200).json({
        success: true,
        post: {
          id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          status: post.publishStatus,
          visibility: post.visibility,
          category: post.categoryId,
          createdAt: post.createdAt,
          // Include payment order status if available (for future integration)
          PaymentOrder: {
            status: 'PENDING', // Default status
          }
        }
      });
    } catch (error) {
      console.error('Error fetching post request:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch post request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}

