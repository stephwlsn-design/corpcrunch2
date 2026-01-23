import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function Sustainability({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en";
    const categoryDetails = await getCategoryByName("Sustainability", language);
    
    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)) 
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching Sustainability:", error);
    return {
      props: {
        categoryDetails: {
          name: "Sustainability",
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
