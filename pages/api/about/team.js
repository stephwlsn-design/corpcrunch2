import connectDB from '@/lib/mongoose';
import TeamMember from '@/models/TeamMember';

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
      
      const teamMembers = await TeamMember.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();

      return sendResponse(200, {
        success: true,
        count: teamMembers.length,
        teamMembers: teamMembers.map(member => ({
          id: member._id,
          name: member.name,
          role: member.role,
          imageUrl: member.imageUrl,
          bio: member.bio,
          linkedinUrl: member.linkedinUrl,
          twitterUrl: member.twitterUrl,
          instagramUrl: member.instagramUrl,
          email: member.email,
          order: member.order,
        })),
      });
    } catch (error) {
      console.error('[API /about/team] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to fetch team members',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  if (req.method === 'POST') {
    try {
      await connectDB();
      
      const { name, role, imageUrl, bio, linkedinUrl, twitterUrl, instagramUrl, email, order } = req.body;

      // Validate required fields
      if (!name || !role || !imageUrl) {
        return sendResponse(400, {
          success: false,
          message: 'Name, role, and imageUrl are required',
        });
      }

      const teamMember = new TeamMember({
        name: name.trim(),
        role: role.trim(),
        imageUrl: imageUrl.trim(),
        bio: bio?.trim(),
        linkedinUrl: linkedinUrl?.trim(),
        twitterUrl: twitterUrl?.trim(),
        instagramUrl: instagramUrl?.trim(),
        email: email?.trim(),
        order: order || 0,
        isActive: true,
      });

      await teamMember.save();

      return sendResponse(200, {
        success: true,
        message: 'Team member created successfully',
        data: {
          id: teamMember._id,
          name: teamMember.name,
          role: teamMember.role,
        },
      });
    } catch (error) {
      console.error('[API /about/team] Error:', error);
      return sendResponse(500, {
        success: false,
        message: 'Failed to create team member',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }

  return sendResponse(405, {
    success: false,
    message: 'Method not allowed',
  });
}

