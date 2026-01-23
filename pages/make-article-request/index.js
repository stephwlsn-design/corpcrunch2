import RequestBlogForm from "@/components/elements/RequestBlogForm";
import Layout from "@/components/layout/Layout";
import AuthAndSubscriptionProtected from "@/components/providers/AuthAndSubscriptionProtected";

const index = () => {
  return (
    // <AuthAndSubscriptionProtected needSubscription={false}>
      <Layout>
        <RequestBlogForm />
      </Layout>
    // </AuthAndSubscriptionProtected>
  );
};

export default index;
