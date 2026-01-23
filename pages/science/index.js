import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function Science({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export const getServerSideProps = async ({ req }) => {
  try {
    const language = req?.cookies?.language || "en";
    const categoryDetails = await getCategoryByName("Science", language);
    
    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)) 
      } 
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
    };
  }
};
