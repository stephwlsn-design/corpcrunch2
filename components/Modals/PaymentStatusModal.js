import React from "react";
import { PAYMENT_STATUS } from "@/config/constants";
import { useRouter } from "next/router";
import Spinner from "../elements/Spinner";

const PaymentStatusModal = ({
  setShowStatusModal,
  status,
  orderId,
  paymentAmount,
}) => {
  const router = useRouter();

  const handleContinue = () => {
    if (PAYMENT_STATUS.SUCCESS === status) {
      router.push("/");
      setShowStatusModal(false);
    } else {
      setShowStatusModal(false);
    }
  };

  const isPending =
    status !== PAYMENT_STATUS.SUCCESS && status !== PAYMENT_STATUS.FAILED;

  return (
    <div className={"modalContainer"}>
      <div className={"modalContent"}>
        {status === PAYMENT_STATUS.SUCCESS ||
          (status === PAYMENT_STATUS.FAILED && (
            <svg
              onClick={() => setShowStatusModal(false)}
              data-v-a0e00534=""
              width="40"
              height="40"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              className={"closeBtn"}
            >
              <path d="M6.41408 5.00002C6.0236 4.60953 5.3905 4.60953 5.00002 5.00002C4.60953 5.3905 4.60953 6.0236 5.00002 6.41408L10.586 12L5.00002 17.586C4.60953 17.9764 4.60953 18.6095 5.00002 19C5.3905 19.3905 6.0236 19.3905 6.41408 19L12 13.4141L17.586 19C17.9764 19.3905 18.6095 19.3905 19 19C19.3905 18.6095 19.3905 17.9764 19 17.586L13.4141 12L19 6.41408C19.3905 6.0236 19.3905 5.3905 19 5.00002C18.6095 4.60953 17.9764 4.60953 17.586 5.00002L12 10.586L6.41408 5.00002Z"></path>
            </svg>
          ))}
        <span className={"iconCircle"}>
          {status === PAYMENT_STATUS.SUCCESS && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 50 50"
              fill="#4ad295"
            >
              <path d="M 25 2 C 12.309534 2 2 12.309534 2 25 C 2 37.690466 12.309534 48 25 48 C 37.690466 48 48 37.690466 48 25 C 48 12.309534 37.690466 2 25 2 z M 25 4 C 36.609534 4 46 13.390466 46 25 C 46 36.609534 36.609534 46 25 46 C 13.390466 46 4 36.609534 4 25 C 4 13.390466 13.390466 4 25 4 z M 34.988281 14.988281 A 1.0001 1.0001 0 0 0 34.171875 15.439453 L 23.970703 30.476562 L 16.679688 23.710938 A 1.0001 1.0001 0 1 0 15.320312 25.177734 L 24.316406 33.525391 L 35.828125 16.560547 A 1.0001 1.0001 0 0 0 34.988281 14.988281 z"></path>
            </svg>
          )}
          {isPending && <Spinner size={"4rem"} color={"#0056b3"} />}
          {status === PAYMENT_STATUS.FAILED && (
            <svg
              data-v-a0e00534=""
              style={{
                border: "2px solid #FF0000",
                padding: "5px",
                borderRadius: "50%",
              }}
              width="85"
              height="85"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              class="close-icon"
              fill=" #FF0000"
            >
              <path d="M6.41408 5.00002C6.0236 4.60953 5.3905 4.60953 5.00002 5.00002C4.60953 5.3905 4.60953 6.0236 5.00002 6.41408L10.586 12L5.00002 17.586C4.60953 17.9764 4.60953 18.6095 5.00002 19C5.3905 19.3905 6.0236 19.3905 6.41408 19L12 13.4141L17.586 19C17.9764 19.3905 18.6095 19.3905 19 19C19.3905 18.6095 19.3905 17.9764 19 17.586L13.4141 12L19 6.41408C19.3905 6.0236 19.3905 5.3905 19 5.00002C18.6095 4.60953 17.9764 4.60953 17.586 5.00002L12 10.586L6.41408 5.00002Z"></path>
            </svg>
          )}
        </span>
        <div className={"content"}>
          <h4 className={"title"}>
            {" "}
            {status === PAYMENT_STATUS.SUCCESS
              ? "Payment Successful"
              : status === PAYMENT_STATUS.FAILED
              ? "Payment Failed"
              : "Payment Processing"}
          </h4>
          <p className={"description"}>
            {" "}
            {status === PAYMENT_STATUS.SUCCESS ? (
              <div className="mb-4">
                <p>
                  We are delighted to inform you that we have received your
                  payment.
                </p>
                {orderId && (
                  <div className="d-flex justify-content-between px-5">
                    <span>
                      <strong>Order ID</strong>
                    </span>
                    <span>{orderId}</span>
                  </div>
                )}
                {paymentAmount && (
                  <div className="d-flex justify-content-between px-5">
                    <span>
                      <strong>Payment Amount</strong>
                    </span>
                    <span>₹{paymentAmount}</span>
                  </div>
                )}
              </div>
            ) : status === PAYMENT_STATUS.FAILED ? (
              <div className="mb-4">
                <p>
                  Unfortunately we have an issue with your payment. Please try
                  again later.
                </p>
                <div className="d-flex justify-content-between px-5">
                  <span>
                    <strong>Order ID</strong>
                  </span>
                  <span>{orderId}</span>
                </div>
                <div className="d-flex justify-content-between px-5">
                  <span>
                    <strong>Payment Amount</strong>
                  </span>
                  <span>₹{paymentAmount}</span>
                </div>
              </div>
            ) : (
              "Your payment is being processed. We will notify you shortly."
            )}
          </p>
        </div>
        {status === PAYMENT_STATUS.FAILED && (
          <button
            onClick={handleContinue}
            style={{ background: "#ff0000" }}
            className={"button"}
          >
            Try again
          </button>
        )}
        {status === PAYMENT_STATUS.SUCCESS && (
          <button
            style={{ background: "#4ad295" }}
            className={"button"}
            onClick={handleContinue}
          >
            Continue
          </button>
        )}
        {isPending && (
          <button
            style={{ background: "#0056b3" }}
            className={"button"}
            disabled
          >
            Pending...
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusModal;
