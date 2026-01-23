import HeaderTop from "@/components/elements/HeaderTop";
import React from "react";

function PrivacyPolicy() {
  return (
    <div className="container d-flex flex-column min-vh-100 justify-content-between  align-items-center">
      <HeaderTop />

      <div className="content w-75 mt-4">
        <h1 className="mb-4">Corp Crunch Privacy Policy</h1>
        <p>
          Corp Crunch respects your privacy and is committed to protecting your
          personal information. This Privacy Policy explains what information we
          collect, how we use it, and your choices regarding your information.
        </p>

        <div className="mb-4">
          <h4>1. Information We Collect</h4>
          <p>We collect the following information about you:</p>
          <ul>
            <li>
              <strong>Information you provide:</strong> This includes
              information you provide when you create an account, such as your
              name, email address, and username. It may also include information
              you submit through User Content, such as comments and articles.
            </li>
            <li>
              <strong>Usage Data:</strong> We collect information about how you
              use the Service, such as the pages you visit, the searches you
              perform, and the content you access.
            </li>
            <li>
              <strong>Device Information:</strong> We collect information about
              the device you use to access the Service, such as your IP address,
              device type, operating system, and browser type.
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <h4>2. How We Use Your Information</h4>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve the Service.</li>
            <li>
              Send you important information about the Service, such as changes
              to our Terms or Privacy Policy.
            </li>
            <li>Respond to your inquiries and requests.</li>
            <li>Personalize your experience on the Service.</li>
            <li>Analyze how our services can be used.</li>
          </ul>
        </div>

        <div className="mb-4">
          <h4>3. Sharing Your Information</h4>
          <p>
            We may share your information with third-party service providers who
            help us operate the Service. These service providers are
            contractually obligated to keep your information confidential and to
            use it only for the purposes for which we have disclosed it to them.
          </p>
          <p>
            We may also share your information if required to do so by law or in
            the good faith belief that such action is necessary to conform to
            legal requirements or protect the rights or safety of Corp Crunch,
            its users, or the public.
          </p>
        </div>

        <div className="mb-4">
          <h4>4. Your Choices</h4>
          <p>You have choices regarding your information:</p>
          <ul>
            <li>
              <strong>Access and Update Your Information:</strong> You can
              access and update your account information at any time.
            </li>
            <li>
              <strong>Control Your Communications:</strong> You can unsubscribe
              from our marketing emails by following the instructions in the
              emails.
            </li>
            <li>
              <strong>Delete Your Account:</strong> You can delete your account
              by contacting us.
            </li>
          </ul>
        </div>

        <div className="mb-4">
          <h4>5. Cookies</h4>
          <p>
            We use cookies to track your use of the Service and to remember your
            preferences. You can choose to disable cookies in your browser
            settings, but doing so may limit your ability to use certain
            features of the Service.
          </p>
        </div>

        <div className="mb-4">
          <h4>6. Data Security</h4>
          <p>
            We take reasonable steps to protect your information from
            unauthorized access, disclosure, alteration, or destruction.
            However, no internet transmission or electronic storage is 100%
            secure.
          </p>
        </div>

        <div className="mb-4">
          <h4>7. Children's Privacy</h4>
          <p>
            The Service is not directed to children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If you are a parent or guardian and you believe that your child
            under 13 has provided us with personal information, please contact
            us.
          </p>
        </div>

        <div className="mb-4">
          <h4>8. International Transfers</h4>
          <p>
            Your information may be transferred to and processed in countries
            other than your own. These countries may have different data
            protection laws than your own country.
          </p>
        </div>

        <div className="mb-4">
          <h4>9. Changes to this Privacy Policy</h4>
          <p>
            We may revise this Privacy Policy at any time by posting the revised
            Privacy Policy on the Service. You are expected to check this page
            periodically so you are aware of any changes, as they are binding on
            you.
          </p>
        </div>

        <div className="mb-4">
          <h4>10. Contact Us</h4>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at <a href="mailto:scoop@corpcrunch.io">scoop@corpcrunch.io</a>
          </p>
        </div>

        <p className="text-center">
          Thank you for being a trusted user of Corp Crunch!
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
