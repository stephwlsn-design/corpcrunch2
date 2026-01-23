import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryById } from "@/lib/postService";

export default function DynamicCategoryPage({ categoryDetails }) {
  return <CategoryPage categoryDetails={categoryDetails} />;
}

export const getServerSideProps = async ({ params, req }) => {
  try {
    const language = req?.cookies?.language || 'en';
    const categoryDetails = await getCategoryById(params.categoryId, language);
    
    // If category not found, return 404
    if (!categoryDetails) {
      return { notFound: true };
    }

    return { 
      props: { 
        categoryDetails: JSON.parse(JSON.stringify(categoryDetails))
      } 
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { notFound: true };
  }
};
