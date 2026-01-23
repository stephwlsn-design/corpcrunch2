import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function FinTechGrowth({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export const getServerSideProps = async ({ req }) => {
  try {
    const language = req?.cookies?.language || "en";
    const categoryDetails = await getCategoryByName("FinTech Growth", language);

    return {
      props: {
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)),
      },
    };
  } catch (error) {
    console.error("Error fetching FinTech Growth:", error);
    return {
      props: {
        categoryDetails: {
          name: "FinTech Growth",
          posts: [],
          trendingPosts: [],
          mostViewedPosts: [],
          newestPosts: [],
        },
      },
    };
  }
};
