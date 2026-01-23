import HeaderTop from "@/components/elements/HeaderTop";
import React from "react";

const CancellationRefundPolicy = () => {
  return (
    <div className="container d-flex flex-column min-vh-100 justify-content-between  align-items-center">
      <HeaderTop />

      <div className="content w-75 mt-4">
        <h1 className="mb-4">Corp Crunch Cancellation and Refund Policy</h1>
        <p>
          This Cancellation and Refund Policy applies to all subscriptions for
          Corp Crunch's online corporate news service.
        </p>

        <div className="mb-4">
          <h4>1. Cancellations</h4>
          <p>
            You can cancel your Corp Crunch subscription at any time. Here's
            how:
          </p>
          <ul>
            <li>
              <strong>Through Your Account:</strong> Log in to your account and
              navigate to the billing section. There will be an option to cancel
              your subscription.
            </li>
            <li>
              <strong>Contact Us:</strong> You can also cancel your subscription
              by contacting our customer support team at{" "}
              <a href="mailto:scoop@corpcrunch.io">scoop@corpcrunch.io</a>
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <h4>2. Refunds</h4>
          <p>
            <strong>Monthly Subscriptions:</strong>
            We are a digital information and content creation company; we cannot
            undo the consumed content. Although a refund is the last resort, we
            are happy to provide you a refund if you like. Alternatively, you
            can also use our exceptional services offered to you until the time
            your subscription is valid. Thereafter, if you choose, you can
            cancel your subscription.
          </p>
          <p>
            <strong>Annual Subscriptions:</strong>
            We are a digital information and content creation company; we cannot
            undo the consumed content. Although a refund is the last resort, we
            are happy to provide you a refund if you like. Alternatively, you
            can also use our exceptional services offered to you until the time
            your subscription is valid. Thereafter, if you choose, you can
            cancel your subscription.
          </p>
        </div>

        <div className="mb-4">
          <h4>3. Prorated Refunds</h4>
          <p>
            Corp Crunch does not offer prorated refunds for any unused portion
            of a subscription term.
          </p>
        </div>

        <div className="mb-4">
          <h4>4. Exceptions</h4>
          <p>
            We are a digital information and content creation company; we cannot
            undo the consumed content. Although a refund is the last resort, we
            are happy to provide you a refund if you like. Alternatively, you
            can also use our exceptional services offered to you until the time
            your subscription is valid. Thereafter, if you choose, you can
            cancel your subscription.
          </p>
        </div>

        <div className="mb-4">
          <h4>5. Changes to This Policy</h4>
          <p>
            Corp Crunch may revise this Cancellation and Refund Policy at any
            time by posting the revised Policy here. You are expected to check
            this page periodically so you are aware of any changes, as they are
            binding on you.
          </p>
        </div>

        <div className="mb-4">
          <h4>6. Contact Us</h4>
          <p>
            If you have any questions about this Cancellation and Refund Policy,
            please contact us at{" "}
            <a href="mailto:scoop@corpcrunch.io">scoop@corpcrunch.io</a>
          </p>
        </div>

        <p className="text-center">
          Thank you for being a trusted user of Corp Crunch!
        </p>
      </div>
    </div>
  );
};

export default CancellationRefundPolicy;
