import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function CyberSecurity({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en";
    const categoryDetails = await getCategoryByName("Cyber Security", language);

    return {
      props: {
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)),
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching Cyber Security:", error);
    return {
      props: {
        categoryDetails: {
          name: "Cyber Security",
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
