import BlogDetails from "@/pages/blog/[id]";
import { getPostBySlug } from "@/lib/postService";

// This is a wrapper that redirects to the old blog route
// We'll handle the category-based URL in the blog details page
export default function CategoryBlogDetails({ postsDetails }) {
  return <BlogDetails postsDetails={postsDetails} />;
}

// Recursive function to replace all undefined values with null
// This ensures Next.js can serialize the props correctly
function sanitizeForSerialization(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForSerialization(item));
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        // Convert undefined to null, recursively sanitize other values
        sanitized[key] = value === undefined ? null : sanitizeForSerialization(value);
      }
    }
    return sanitized;
  }
  
  return null;
}

export const getServerSideProps = async ({ params, req }) => {
  try {
    const language = req?.cookies?.language || 'en';
    const { slug, categorySlug } = params;
    
    // Fetch post by slug (category slug is just for URL structure)
    const postsDetails = await getPostBySlug(slug);
    
    if (!postsDetails) {
      return { notFound: true };
    }

    // Verify that the category slug matches the post's category
    const postCategory = postsDetails.Category || postsDetails.category;
    const postCategorySlug = postCategory?.slug?.toLowerCase() || 
                            postCategory?.name?.toLowerCase().replace(/\s+/g, '-') || '';
    
    // If category slug doesn't match, redirect to correct URL
    if (postCategorySlug && postCategorySlug !== categorySlug.toLowerCase()) {
      return {
        redirect: {
          destination: `/${postCategorySlug}/blog/${slug}`,
          permanent: true,
        },
      };
    }

    // Sanitize the entire object to replace all undefined values with null
    // This handles nested objects, arrays, and all fields including prevPost, nextPost, trendingCategories
    const sanitizedPost = sanitizeForSerialization(postsDetails);

    return {
      props: { 
        postsDetails: sanitizedPost
      }
    };
  } catch (error) {
    console.error('Error fetching post details:', error);
    return {
      props: { postsDetails: null },
      notFound: true
    };
  }
};

