import CategoryPage from "@/components/layout/CategoryPage/CategoryPage";
import { getCategoryByName } from "@/lib/postService";

export default function SportTech({ categoryDetails }) {
    return <CategoryPage categoryDetails={categoryDetails} />;
}

export async function getStaticProps() {
    try {
        const language = "en";

        // Try multiple name variants — the DB may store it as any of these
        let categoryDetails = await getCategoryByName("Sport Tech", language);

        if (!categoryDetails || !categoryDetails.id) {
            categoryDetails = await getCategoryByName("SportsTech", language);
        }
        if (!categoryDetails || !categoryDetails.id) {
            categoryDetails = await getCategoryByName("sport-tech", language);
        }
        if (!categoryDetails || !categoryDetails.id) {
            categoryDetails = await getCategoryByName("Sports Tech", language);
        }

        return {
            props: {
                categoryDetails: JSON.parse(JSON.stringify(categoryDetails)),
            },
            revalidate: 60,
        };
    } catch (error) {
        console.error("Error fetching Sport Tech category:", error);
        return {
            props: {
                categoryDetails: {
                    name: "Sport Tech",
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
