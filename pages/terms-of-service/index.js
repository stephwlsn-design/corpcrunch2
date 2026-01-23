import HeaderTop from "@/components/elements/HeaderTop";
import React from "react";

function TermsOfService() {
  return (
    <div className="container d-flex flex-column min-vh-100 justify-content-between  align-items-center">
      <HeaderTop />

      <div className="content w-75 mt-4">
        <h1 className="mb-4">Corp Crunch Terms of Service</h1>
        <p>
          Welcome to Corp Crunch! These Terms of Service ("Terms") govern your
          access and use of the Corp Crunch website, mobile applications, and
          all associated services (collectively, the "Service"). By accessing or
          using the Service, you agree to be bound by these Terms. If you do not
          agree to all of these Terms, you are not authorized to use the
          Service.
        </p>

        <div className="mb-4">
          <h4>1. Our Service</h4>
          <p>
            Corp Crunch provides a platform for users to access and share daily
            insights and news related to the corporate world ("Corporate
            Intel"). This Corporate Intel may include, but is not limited to,
            news articles, financial data, rumors, and analysis.
          </p>
        </div>

        <div className="mb-4">
          <h4>2. User Accounts</h4>
          <p>
            You may be required to create an account to access certain features
            of the Service. You are responsible for maintaining the
            confidentiality of your account information, including your username
            and password. You agree to be responsible for all activities that
            occur under your account.
          </p>
        </div>

        <div className="mb-4">
          <h4>3. User Content</h4>
          <p>
            The Service may allow you to submit content, including comments,
            articles, and other materials ("User Content"). You retain all
            ownership rights to your User Content. However, by submitting User
            Content, you grant Corp Crunch a non-exclusive, royalty-free,
            worldwide license to use, reproduce, modify, publish, and distribute
            your User Content in connection with the Service.
          </p>
        </div>

        <div className="mb-4">
          <h4>4. Acceptable Use</h4>
          <p>
            You agree to use the Service only for lawful purposes and in
            accordance with these Terms. You agree not to use the Service:
          </p>
          <ul>
            <li>To harm, threaten, or abuse others.</li>
            <li>To defame, disparage, or invade the privacy of others.</li>
            <li>To upload or share illegal content.</li>
            <li>To interfere with the Service or its servers.</li>
            <li>To impersonate any person or entity.</li>
          </ul>
        </div>

        <div className="mb-4">
          <h4>5. Disclaimers</h4>
          <p>
            The Corporate Intel provided on the Service is for informational
            purposes only and should not be considered investment advice. Corp
            Crunch does not guarantee the accuracy, completeness, or timeliness
            of the Corporate Intel. You are solely responsible for your
            investment decisions.
          </p>
          <p>
            The Service is provided "as is" and without warranties of any kind,
            express or implied. Corp Crunch disclaims all warranties, including
            but not limited to, warranties of merchantability, fitness for a
            particular purpose, and non-infringement.
          </p>
        </div>

        <div className="mb-4">
          <h4>6. Limitation of Liability</h4>
          <p>
            Corp Crunch shall not be liable for any damages arising out of your
            use of the Service, including but not limited to, direct, indirect,
            incidental, consequential, or punitive damages.
          </p>
        </div>

        <div className="mb-4">
          <h4>7. Copyright</h4>
          <p>
            The content on the Service, including but not limited to text,
            graphics, logos, and images, is protected by copyright. You may not
            reproduce, modify, distribute, or commercially exploit any of the
            content without the express written permission of Corp Crunch.
          </p>
        </div>

        <div className="mb-4">
          <h4>8. Termination</h4>
          <p>
            Corp Crunch may terminate your access to the Service at any time,
            with or without cause.
          </p>
        </div>

        <div className="mb-4">
          <h4>9. Governing Law</h4>
          <p>
            These Terms shall be governed by and construed in accordance with
            universal laws without regard to its conflict of law provisions.
          </p>
        </div>

        <div className="mb-4">
          <h4>10. Dispute Resolution</h4>
          <p>
            Any dispute arising out of or relating to these Terms shall be
            resolved by binding arbitration in accordance with the state rules.
          </p>
        </div>

        <div className="mb-4">
          <h4>11. Entire Agreement</h4>
          <p>
            These Terms constitute the entire agreement between you and Corp
            Crunch regarding your use of the Service.
          </p>
        </div>

        <div className="mb-4">
          <h4>12. Changes to the Terms</h4>
          <p>
            Corp Crunch may revise these Terms at any time by posting the
            revised Terms on the Service. You are expected to check this page
            periodically so you are aware of any changes, as they are binding on
            you. By continuing to use the Service after the revised Terms are
            posted, you agree to be bound by the revised Terms.
          </p>
        </div>

        <div className="mb-4">
          <h4>13. Contact Us</h4>
          <p>
            If you have any questions about these Terms, please contact us at{" "}
            <a href="mailto:scoop@corpcrunch.io">scoop@corpcrunch.io</a>
          </p>
        </div>

        <p className="text-center">
          Thank you for being a trusted user of Corp Crunch!
        </p>
      </div>
    </div>
  );
}

export default TermsOfService;
