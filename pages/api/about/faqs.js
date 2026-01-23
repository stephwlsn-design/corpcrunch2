import connectDB from '@/lib/mongoose';
import FAQ from '@/models/FAQ';

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

  if (req.method === 'GET') {
    try {
      await connectDB();
      
      const faqs = await FAQ.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return sendResponse(200, {
        success: true,
        count: faqs.length,
        faqs: faqs.map(faq => ({
          id: faq._id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
        })),
      });
    } catch (error) {
      console.error('[API /about/faqs] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to fetch FAQs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  if (req.method === 'POST') {
    try {
      await connectDB();
      
      const { question, answer, order } = req.body;

      // Validate required fields
      if (!question || !answer) {
        return sendResponse(400, {
          success: false,
          message: 'Question and answer are required',
        });
      }

      const faq = new FAQ({
        question: question.trim(),
        answer: answer.trim(),
        order: order || 0,
        isActive: true,
      });

      await faq.save();

      return sendResponse(200, {
        success: true,
        message: 'FAQ created successfully',
        data: {
          id: faq._id,
          question: faq.question,
        },
      });
    } catch (error) {
      console.error('[API /about/faqs] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to create FAQ',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  return sendResponse(405, {
    success: false,
    message: 'Method not allowed',
  });
}

