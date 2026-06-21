import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { PAYMENT_STATUS } from "@/config/constants";
import { buildNoIndexPageSeo } from "@/lib/seoHelpers";

const paymentSeo = buildNoIndexPageSeo({
  title: "Payment",
  description: "Corp Crunch payment processing.",
  path: "/payment",
});

const Index = () => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  return (
    <Layout seo={paymentSeo}>
      <div
        className="container p-5"
        style={{ width: "100%", maxWidth: "1000px", margin: "auto" }}
      >
        <h2>Payment Form</h2>
        <p>Payment processing is currently unavailable.</p>
      </div>
    </Layout>
  );
};

export default Index;
