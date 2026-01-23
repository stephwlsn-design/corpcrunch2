import connectDB from '@/lib/mongoose';
import AboutContent from '@/models/AboutContent';

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
      
      const { section } = req.query;

      let query = { isActive: true };
      if (section) {
        query.section = section;
      }

      const contents = await AboutContent.find(query)
        .sort({ createdAt: -1 })
        .lean();

      // If specific section requested, return single object, otherwise return array
      if (section && contents.length > 0) {
        return sendResponse(200, {
          success: true,
          content: {
            id: contents[0]._id,
            section: contents[0].section,
            title: contents[0].title,
            content: contents[0].content,
            subtitle: contents[0].subtitle,
            imageUrl: contents[0].imageUrl,
            metadata: contents[0].metadata,
          },
        });
      }

      return sendResponse(200, {
        success: true,
        count: contents.length,
        contents: contents.map(content => ({
          id: content._id,
          section: content.section,
          title: content.title,
          content: content.content,
          subtitle: content.subtitle,
          imageUrl: content.imageUrl,
          metadata: content.metadata,
        })),
      });
    } catch (error) {
      console.error('[API /about/content] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to fetch content',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  if (req.method === 'POST') {
    try {
      await connectDB();
      
      const { section, title, content, subtitle, imageUrl, metadata } = req.body;

      // Validate required fields
      if (!section) {
        return sendResponse(400, {
          success: false,
          message: 'Section is required',
        });
      }

      // Check if section already exists
      const existing = await AboutContent.findOne({ section });
      if (existing) {
        // Update existing
        existing.title = title?.trim();
        existing.content = content?.trim();
        existing.subtitle = subtitle?.trim();
        existing.imageUrl = imageUrl?.trim();
        existing.metadata = metadata;
        await existing.save();

        return sendResponse(200, {
          success: true,
          message: 'Content updated successfully',
          data: {
            id: existing._id,
            section: existing.section,
          },
        });
      }

      // Create new
      const aboutContent = new AboutContent({
        section: section.trim(),
        title: title?.trim(),
        content: content?.trim(),
        subtitle: subtitle?.trim(),
        imageUrl: imageUrl?.trim(),
        metadata: metadata,
        isActive: true,
      });

      await aboutContent.save();

      return sendResponse(200, {
        success: true,
        message: 'Content created successfully',
        data: {
          id: aboutContent._id,
          section: aboutContent.section,
        },
      });
    } catch (error) {
      console.error('[API /about/content] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to create/update content',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  return sendResponse(405, {
    success: false,
    message: 'Method not allowed',
  });
}

