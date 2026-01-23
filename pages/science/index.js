import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function Science({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en";
    const categoryDetails = await getCategoryByName("Science", language);
    
    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)) 
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching Science:", error);
    return {
      props: {
        categoryDetails: {
          name: "Science",
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
