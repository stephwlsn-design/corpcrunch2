import connectDB from './mongoose';
import Category from '@/models/Category';

/**
 * Get all active categories
 * Direct MongoDB query - no API double-hop
 */
export async function getCategories() {
  await connectDB();
  
  const categories = await Category.find({ isActive: true })
    .sort({ name: 1 })
    .limit(50)
    .maxTimeMS(5000)
    .lean();

  return categories.map(cat => ({
    ...cat,
    _id: cat._id?.toString(),
    id: cat._id?.toString(),
  }));
}

