import BlogDetails from "@/pages/blog/[id]";
import { getPostBySlug } from "@/lib/postService";

// This is a wrapper that redirects to the old blog route
// We'll handle the category-based URL in the blog details page
export default function CategoryBlogDetails({ postsDetails }) {
  return <BlogDetails postsDetails={postsDetails} />;
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

    return {
      props: { 
        postsDetails: JSON.parse(JSON.stringify(postsDetails))
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

