// Mock HDFC Payment Gateway Proxy
// In production, this would integrate with actual HDFC payment gateway

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { postID, planID } = req.body;

      // Validate required fields
      if (!postID) {
        return res.status(400).json({
          success: false,
          message: 'Post ID is required',
        });
      }

      // Define payment amounts based on plan
      const paymentAmounts = {
        '3_MONTHS': 750.00,
        '6_MONTHS': 1050.00,
        '1_YEAR': 1500.00,
        'DEFAULT': 1050.00, // Default if no plan specified
      };

      const amount = paymentAmounts[planID] || paymentAmounts.DEFAULT;

      // In production, this would:
      // 1. Create order in HDFC payment gateway
      // 2. Get payment URL from gateway
      // 3. Store order details in database
      // 4. Return payment URL to client

      // For development/testing, return a mock payment URL
      const mockPaymentUrl = `${req.headers.origin || 'http://localhost:3001'}/make-article-request?payment_redirect=true&post_id=${postID}`;

      console.log('Payment checkout initiated:', {
        postID,
        planID: planID || 'No plan (guest)',
        amount,
        paymentUrl: mockPaymentUrl,
      });

      // Simulate payment gateway response
      return res.status(200).json({
        success: true,
        message: 'Payment checkout created successfully',
        payment_url: mockPaymentUrl,
        order_id: `ORDER_${Date.now()}`,
        amount: amount,
        currency: 'INR',
        postID: postID,
        planID: planID || null,
      });

    } catch (error) {
      console.error('Error creating payment checkout:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment checkout',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed. Use POST.',
  });
}

