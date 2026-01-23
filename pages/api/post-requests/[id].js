import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
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
          orderId: post._id.toString(), // Use post ID as order ID for now
          // Include payment order status (mock for now)
          PaymentOrder: {
            status: 'PENDING', // Can be: PENDING, PAID, FAILED, SUCCESS
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

  if (req.method === 'PUT' || req.method === 'PATCH') {
    try {
      const updates = req.body;
      
      const post = await Post.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate('categoryId', 'name slug');

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post request not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Post request updated successfully',
        post: {
          id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          status: post.publishStatus,
        }
      });
    } catch (error) {
      console.error('Error updating post request:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update post request',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
}

