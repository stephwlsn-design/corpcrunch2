import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryById } from "@/lib/postService";

export default function DynamicCategoryPage({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticPaths() {
  // For ISR, we'll use fallback: 'blocking' to generate pages on-demand
  return {
    paths: [],
    fallback: 'blocking',
  };
}

export async function getStaticProps({ params }) {
  try {
    const language = "en";
    const categoryDetails = await getCategoryById(params.categoryId, language);
    
    // If category not found, return 404
    if (!categoryDetails) {
      return { notFound: true };
    }

    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails))
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { notFound: true };
  }
}
