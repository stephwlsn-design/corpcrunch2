import connectDB from '@/lib/mongoose';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const startTime = Date.now();
    
    // Try to connect
    await connectDB();
    
    const connectionTime = Date.now() - startTime;
    const readyState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };

    // Test with a ping
    let pingSuccess = false;
    let pingTime = 0;
    try {
      const pingStart = Date.now();
      await mongoose.connection.db.admin().ping();
      pingTime = Date.now() - pingStart;
      pingSuccess = true;
    } catch (error) {
      pingSuccess = false;
    }

    return res.status(200).json({
      success: true,
      database: {
        connected: readyState === 1,
        state: states[readyState] || 'unknown',
        connectionTime: `${connectionTime}ms`,
        ping: pingSuccess ? `OK (${pingTime}ms)` : 'FAILED',
        host: mongoose.connection.host,
        name: mongoose.connection.name,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      database: {
        connected: false,
        state: 'error',
        error: error.message,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
