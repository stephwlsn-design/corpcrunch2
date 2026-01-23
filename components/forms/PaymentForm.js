import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dropin from "braintree-web-drop-in";
import { PAYMENT_TYPE } from "@/hooks/useClientToken";
import usePaymentCheckouts from "@/hooks/usePaymentCheckouts";
import useSubscription from "@/hooks/useSubscription";
import { notifySuccess } from "@/util/toast";
import Spinner from "../elements/Spinner";

function PaymentForm({ setShowStatusModal }) {
  const [braintreeInstance, setBraintreeInstance] = useState(undefined);
  const {
    mutateAsync: mutateAsyncSubscription,
    isPending: isSubscriptionPending,
  } = useSubscription();
  const { mutateAsync: mutateAsyncPayment, isPending: isPaymentPending } =
    usePaymentCheckouts();
  const {
    push,
    query: { type, priceId, postRequestID },
  } = useRouter();

  useEffect(() => {
    const initializeBraintree = async () => {
      try {
        const instance = await dropin.create({
          authorization: "sandbox_csqbrwwp_sff9tcgy2w3n9ppn",
          container: "#braintree-drop-in-div",
        });
        setBraintreeInstance(instance);
      } catch (error) {
        console.error("Error initializing Braintree:", error);
      }
    };

    initializeBraintree();
  }, []);

  const handlePayment = async () => {
    setShowStatusModal(true);
    // if (braintreeInstance) {
    //   braintreeInstance.requestPaymentMethod(async (error, payload) => {
    //     if (error) {
    //       console.error("Error requesting payment method:", error);
    //     } else {
    //       const paymentMethodNonce = payload.nonce;

    //       let requestData;
    //       if (type === PAYMENT_TYPE.PAYMENT_TO_CREATE_ARTICLE) {
    //         requestData = {
    //           postRequestID: Number(postRequestID),
    //           paymentMethodNonce,
    //         };
    //         const otp_res = await mutateAsyncPayment(requestData);

    //         if (otp_res.success) {
    //           notifySuccess(
    //             "We have received your payment, Thank you !\nOur Team will contact you soon"
    //           );

    //           setTimeout(() => {
    //             push("/");
    //           }, 2000);
    //         }
    //       }

    //       if (type === PAYMENT_TYPE.PAYMENT_TO_MAKE_SUBSCRIPTION) {
    //         requestData = {
    //           priceId: priceId === "MONTHLY" ? "monthly" : "yearly",
    //           paymentMethodNonce,
    //         };
    //         const sub_res = await mutateAsyncSubscription(requestData);

    //         if (sub_res.success) {
    //           notifySuccess("We have received your payment, Thank you !");

    //           setTimeout(() => {
    //             push("/");
    //           }, 2000);
    //         }
    //       }
    //     }
    //   });
    // }
  };

  return (
    <div>
      <div id="braintree-drop-in-div" style={{ minHeight: "300px" }} />
      <button
        className="btn mt-3"
        type="button"
        disabled={
          !braintreeInstance || isSubscriptionPending || isPaymentPending
        }
        onClick={handlePayment}
      >
        {isSubscriptionPending || isPaymentPending ? (
          <Spinner size="small" />
        ) : (
          "Pay"
        )}
      </button>
    </div>
  );
}

export default PaymentForm;
