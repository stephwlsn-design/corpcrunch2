import RequestBlogForm from "@/components/elements/RequestBlogForm";
import Layout from "@/components/layout/Layout";


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
