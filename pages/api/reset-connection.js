import { resetConnection } from '@/lib/mongoose';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    resetConnection();
    return res.status(200).json({
      success: true,
      message: 'MongoDB connection cache reset successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error resetting connection',
      error: error.message,
    });
  }
}
