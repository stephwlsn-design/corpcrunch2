import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import PaymentForm from "@/components/forms/PaymentForm";
import SuccessModal from "@/components/Modals/PaymentStatusModal";
import { PAYMENT_STATUS } from "@/config/constants";

const Index = () => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  return (
    <Layout>
      <div
        className="container p-5"
        style={{ width: "100%", maxWidth: "1000px", margin: "auto" }}
      >
        <h2>Payment Form</h2> 
        <PaymentForm setShowStatusModal={setShowStatusModal} />
      </div>
      {showStatusModal && (
        <SuccessModal
          status={PAYMENT_STATUS.SUCCESS}
          setShowStatusModal={setShowStatusModal}
        />
      )}
    </Layout>
  );
};

export default Index;
