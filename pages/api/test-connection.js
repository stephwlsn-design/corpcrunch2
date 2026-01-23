import connectDB from '@/lib/mongoose';
import Post from '@/models/Post';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const startTime = Date.now();
  
  try {
    console.log('Attempting to connect...');
    await connectDB();
    const connectTime = Date.now() - startTime;
    console.log(`Connected in ${connectTime}ms`);
    
    // Check connection state
    const state = mongoose.connection.readyState;
    const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
    
    // Try to query posts
    let postCount = 0;
    let samplePosts = [];
    
    try {
      postCount = await Post.countDocuments({ 
        publishStatus: 'published', 
        visibility: 'public' 
      });
      
      if (postCount > 0) {
        samplePosts = await Post.find({ 
          publishStatus: 'published', 
          visibility: 'public' 
        })
        .limit(3)
        .select('title slug')
        .lean();
      }
    } catch (queryError) {
      console.error('Query error:', queryError);
    }
    
    const totalTime = Date.now() - startTime;
    
    return res.status(200).json({
      success: true,
      connection: {
        state: states[state] || 'unknown',
        readyState: state,
        connectTime: `${connectTime}ms`,
        totalTime: `${totalTime}ms`,
      },
      database: {
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        postCount: postCount,
        samplePosts: samplePosts.map(p => ({ title: p.title, slug: p.slug })),
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error('Connection error:', error);
    return res.status(200).json({
      success: false,
      error: error.message,
      totalTime: `${totalTime}ms`,
      connectionState: mongoose.connection.readyState,
    });
  }
}
