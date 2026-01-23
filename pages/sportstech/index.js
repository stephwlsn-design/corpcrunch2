import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function SportsTech({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
  try {
    const language = "en";
    const categoryDetails = await getCategoryByName("SportsTech", language);
    
    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails)) 
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching SportsTech:", error);
    return {
      props: {
        categoryDetails: {
          name: "SportsTech",
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
