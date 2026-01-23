import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function Technology({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en"; // Default language for ISR
    const categoryDetails = await getCategoryByName("Technology", language);
    
    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)) 
      },
      revalidate: 60, // Rebuild page every 60 seconds
    };
  } catch (error) {
    console.error("Error fetching Technology:", error);
    return {
      props: {
        categoryDetails: {
          name: "Technology",
          posts: [],
          trendingPosts: [],
          mostViewedPosts: [],
          newestPosts: [],
        },
      },
      revalidate: 60,
    };
  }
}
