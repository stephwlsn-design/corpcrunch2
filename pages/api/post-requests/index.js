import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';

export default async function handler(req, res) {
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

      // Validate required fields (trim strings to handle whitespace)
      const missingFields = {};
      if (!submitterName?.trim()) missingFields.submitterName = true;
      if (!submitterEmail?.trim()) missingFields.submitterEmail = true;
      if (!submitterPhone?.trim()) missingFields.submitterPhone = true;
      if (!companyName?.trim()) missingFields.companyName = true;
      if (!submitterAddress?.trim()) missingFields.submitterAddress = true;
      if (!categoryID) missingFields.categoryID = true;
      if (!description?.trim()) missingFields.description = true;

      if (Object.keys(missingFields).length > 0) {
        console.error('Validation failed - missing fields:', missingFields);
        return res.status(400).json({
          success: false,
          message: 'All fields are required. Please fill in all fields.',
          missingFields,
          receivedData: {
            hasName: !!submitterName,
            hasEmail: !!submitterEmail,
            hasPhone: !!submitterPhone,
            hasCompany: !!companyName,
            hasAddress: !!submitterAddress,
            hasCategoryID: !!categoryID,
            hasDescription: !!description,
          }
        });
      }

      // Create a draft post with the submission details
      const postData = {
        title: title || `[Article Request] ${companyName} - ${Date.now()}`,
        slug: `article-request-${Date.now()}`,
        content: `
          <h2>Article Request from ${companyName}</h2>
          <p><strong>Submitted by:</strong> ${submitterName}</p>
          <p><strong>Email:</strong> ${submitterEmail}</p>
          <p><strong>Phone:</strong> ${submitterPhone}</p>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Location:</strong> ${submitterAddress}</p>
          <hr/>
          <h3>Content Description</h3>
          <p>${description}</p>
        `,
        bannerImageUrl: '/assets/img/default-banner.jpg', // Default placeholder
        categoryId: categoryID,
        publishStatus: 'draft',
        visibility: 'private',
        excerpt: description.substring(0, 160),
        // Store submitter information in additional fields
        authorFirstName: submitterName.split(' ')[0] || submitterName,
        authorLastName: submitterName.split(' ').slice(1).join(' ') || '',
        // Custom fields for article requests
        tags: ['article-request', companyName.toLowerCase().replace(/\s+/g, '-')],
        metaDescription: `Article request from ${companyName}: ${description.substring(0, 100)}...`,
      };

      const post = await Post.create(postData);

      // Return the post ID for payment processing
      return res.status(201).json({
        success: true,
        message: 'Article request submitted successfully',
        id: post._id.toString(),
        post: {
          id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          submitterName,
          submitterEmail,
          submitterPhone,
          companyName,
          submitterAddress,
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

