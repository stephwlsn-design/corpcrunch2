import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function Retail({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export const getServerSideProps = async ({ req }) => {
  try {
    const language = req?.cookies?.language || "en";
    const categoryDetails = await getCategoryByName("Retail", language);
    
    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)) 
      } 
    };
  } catch (error) {
    console.error("Error fetching Retail:", error);
    return {
      props: {
        categoryDetails: {
          name: "Retail",
          posts: [],
          trendingPosts: [],
          mostViewedPosts: [],
          newestPosts: [],
        },
      },
    };
  }
};
