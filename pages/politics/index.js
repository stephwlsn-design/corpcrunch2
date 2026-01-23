import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function Politics({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en";
    const categoryDetails = await getCategoryByName("Politics", language);
    
    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)) 
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching Politics:", error);
    return {
      props: {
        categoryDetails: {
          name: "Politics",
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
