import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function AIInnovation({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en";
    const categoryDetails = await getCategoryByName("AI Innovation", language);

    return {
      props: {
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching AI Innovation:", error);
    return {
      props: {
        categoryDetails: {
          name: "AI Innovation",
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
