import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function DataInsights({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en";
    const categoryDetails = await getCategoryByName("Data Insights", language);

    return {
      props: {
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching Data Insights:", error);
    return {
      props: {
        categoryDetails: {
          name: "Data Insights",
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
