import RequestBlogForm from "@/components/elements/RequestBlogForm";
import Layout from "@/components/layout/Layout";
import { buildMakeArticleRequestSeo } from "@/lib/seoHelpers";

const articleRequestSeo = buildMakeArticleRequestSeo();

const index = () => {
  return (
    // <AuthAndSubscriptionProtected needSubscription={false}>
    <Layout seo={articleRequestSeo}>
      <RequestBlogForm />
    </Layout>
    // </AuthAndSubscriptionProtected>
  );
};

export default index;
