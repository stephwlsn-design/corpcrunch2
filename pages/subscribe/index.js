import { postPayableAmount } from "@/services/payment";
import Spinner from "@/components/elements/Spinner";
import Layout from "@/components/layout/Layout";
import PaymentStatusModal from "@/components/Modals/PaymentStatusModal";
import AuthAndSubscriptionProtected from "@/components/providers/AuthAndSubscriptionProtected";
import { PAYMENT_STATUS, planDetails } from "@/config/constants";
import useProfile from "@/hooks/useProfile";
import { notifyError, notifyMessage } from "@/util/toast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";

const PaymentPlans = () => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isTransactionInProcessing, setIsTransactionInProcessing] = useState({
    "3_MONTHS": false,
    "6_MONTHS": false,
    "1_YEAR": false,
  });

  const { query, push } = useRouter();

  const { refetch, data, isLoading } = useProfile();
  const disableBtnWhileRedirecting = Object.values(
    isTransactionInProcessing
  ).some((isProcessing) => isProcessing);

  const alreadySubscribed = data?.isSubscriptionValid;

  useEffect(() => {
    if (query.payment_redirect === "true") {
      setShowStatusModal(true);
      switch (data?.paymentStatus) {
        case PAYMENT_STATUS.PAID:
          setPaymentStatus(PAYMENT_STATUS.SUCCESS);
          break;
        case PAYMENT_STATUS.FAILED:
          setPaymentStatus(PAYMENT_STATUS.FAILED);
          break;
        default:
          setPaymentStatus(PAYMENT_STATUS.PENDING);
          const interval = setInterval(() => {
            refetch();
          }, 1000);
          return () => clearTimeout(interval);
      }
    }
    if (data?.isSubscriptionValid === true) {
      notifyMessage("You are subscribed, redirecting you to home page");
      setTimeout(() => push("/"), 4000);
    }
  }, [data, query.payment_redirect]);

  const handlePayment = async (planId) => {
    setIsTransactionInProcessing((prev) => ({ ...prev, [planId]: true }));
    try {
      const res = await postPayableAmount({ planID: planId });
      if (res) {
        notifyMessage(
          "We're redirecting you to our payment gateway for payment"
        );
        window.location.href = res.payment_url;
      }
    } catch (error) {
      notifyError(error?.response?.data?.message);
    } finally {
      setIsTransactionInProcessing((prev) => ({ ...prev, [planId]: false }));
    }
  };
  return (
    <AuthAndSubscriptionProtected needSubscription={false}>
      <Layout>
        <div className="container py-4">
          <div className="row">
            <div className="col-md-4">
              {planDetails.map((plan) => (
                <div className="card mb-3" key={plan.id}>
                  <div className="card-body">
                    <h5 className="card-title">{plan.title}</h5>
                    <div className="mb-3 full-width">
                      <ul>
                        {plan.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                      {isLoading ? (
                        <Skeleton width="100%" height={50} />
                      ) : (
                        <button
                          style={{
                            cursor: disableBtnWhileRedirecting
                              ? "not-allowed"
                              : "pointer",
                          }}
                          onClick={() => {
                            !disableBtnWhileRedirecting &&
                              handlePayment(plan.id);
                          }}
                          disabled={
                            disableBtnWhileRedirecting || alreadySubscribed
                          }
                          className="submitBtn me-2 full-width"
                        >
                          {isTransactionInProcessing[plan.id] ? (
                            <Spinner size={"small"} />
                          ) : (
                            plan.btnText
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-8">
              <div className="card">
                <div className="card-body">
                  <h4 className="p-4">
                    Truth is UNBIASED. REAL. PROGRESSIVE. AND ABSOLUTE.
                  </h4>
                  <p className="card-text mb-4 px-4">
                    Let’s cut through the noise to deliver you, daily industry
                    scoops you can TRUST. Stay ahead of the curve in the
                    ever-evolving world with Corp Crunch.
                  </p>
                  <h6 className="card-title mt-3 px-4">
                    More reasons to join our community:
                  </h6>
                  <ul className="mt-3">
                    <li className="mx-3">
                      <strong>An Ad-Free Reading:</strong> Ditch the click-bait.
                      Experience a clean, FOCUSED, and uninterrupted reading
                      experience.
                    </li>

                    <li className="mx-3">
                      Premium Magazines and E-magazines powered with industry
                      insights.
                    </li>

                    <li className="mx-3">
                      <strong>Networking events:</strong> Join our Corp Crunch
                      exclusive C-suite community. Expand your circles with
                      like-minded professionals, boost a growth-mindset, and
                      unlock professional growth.
                    </li>
                    <li className="mx-3">
                      <strong>Unparalleled Depth:</strong> We go beyond the
                      surface and bring you AUTHENTICITY.
                    </li>
                    <li className="mx-3">
                      <strong>Exclusive Content:</strong> Gain access to
                      subscriber-only features like reports, interviews with
                      industry leaders, and forward-looking industry trend
                      reports, research and content crafted to shape a world of
                      VANGUARDS and INDUSTRY PROFESSIONALS.
                    </li>
                    <li className="mx-3">
                      <strong>In-depth Analysis:</strong> Gain a deeper
                      understanding of the complex forces SHAPING the world and
                      the industry landscape.
                    </li>
                    <li className="mx-3">
                      <strong>Tailored for You:</strong> Our articles are
                      tailored for you to cover all industries from A to Z.
                    </li>
                    <li className="mx-3">
                      <strong>Stay Informed, Stay Ahead:</strong> Get a daily
                      digest of the most important stories delivered ensuring
                      you NEVER MISS A BEAT.
                    </li>
                    <li className="mx-3">
                      <strong>Trusted Source:</strong> Make informed decisions
                      with RELIABLE and insightful industry scoops.
                    </li>
                  </ul>
                  <p className="card-text mt-4 px-4">
                    Be a part of our family today! And EARN A BADGE for taking
                    one step closer to transforming the world.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showStatusModal && (
          <PaymentStatusModal
            orderId={data?.orderID}
            paymentAmount={data?.orderAmount}
            status={paymentStatus}
            setShowStatusModal={setShowStatusModal}
          />
        )}
      </Layout>
    </AuthAndSubscriptionProtected>
  );
};

export default PaymentPlans;
