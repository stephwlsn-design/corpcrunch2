import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function DigitalRetail({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en";
    const categoryDetails = await getCategoryByName("Digital Retail", language);

    return {
      props: {
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching Digital Retail:", error);
    return {
      props: {
        categoryDetails: {
          name: "Digital Retail",
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
