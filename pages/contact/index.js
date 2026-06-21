import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import axios from "axios"; // Using standard axios to hit local API
import SocialShareRibbon from "@/components/elements/SocialShareRibbon";
import styles from "./Contact.module.css";
import { buildPageSeo } from "@/lib/seoHelpers";
import {
  CONTACT_INQUIRY_OPTIONS,
  getInquiryLabel,
  getInquirySubject,
  resolveInquiryFromQuery,
} from "@/lib/productInquiryOptions";
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_CODES,
} from "@/lib/phoneCountryCodes";

const contactSeo = buildPageSeo({
  title: "Contact Us",
  description:
    "Get in touch with Corp Crunch. Reach our editorial team for partnerships, press inquiries, and business intelligence requests.",
  path: "/contact",
});

export default function ContactPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
    phoneNumber: "",
    inquiryTopic: "general",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('contact-page-active');
    document.body.classList.add('contact-page-active');
    return () => {
      document.documentElement.classList.remove('contact-page-active');
      document.body.classList.remove('contact-page-active');
    };
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    const inquiryTopic = resolveInquiryFromQuery(router.query);
    const productName = router.query.productName
      ? String(router.query.productName)
      : "";
    setFormData((prev) => ({
      ...prev,
      inquiryTopic,
      subject: getInquirySubject(inquiryTopic),
      message:
        productName && !prev.message.trim()
          ? `Hi, I would like to learn more about ${productName}.`
          : prev.message,
    }));
  }, [router.isReady, router.query.inquiry, router.query.product, router.query.productName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "inquiryTopic") {
        next.subject = getInquirySubject(value);
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Pointing to your local Next.js API route (/api/contact)
      const response = await axios.post("/api/contact", {
        ...formData,
        subject:
          formData.subject ||
          `Product inquiry: ${getInquiryLabel(formData.inquiryTopic)}`,
        formType: formData.inquiryTopic === "general" ? "message" : "product",
      });
      
      if (response.data?.success) {
        setSubmitStatus({ 
            success: true, 
            message: response.data.message || "Message sent successfully! We'll get back to you soon." 
        });
        // Clear form on success
        setFormData({
          name: "",
          email: "",
          companyName: "",
          phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
          phoneNumber: "",
          inquiryTopic: "general",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus({ 
            success: false, 
            message: response.data?.message || "Failed to send message. Please try again." 
        });
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus({ 
        success: false, 
        message: error.response?.data?.message || "Failed to send message. Please try again or email us directly at scoop@corpcrunch.io" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout seo={contactSeo}>
      <SocialShareRibbon />
      <section className="contact-page-modern pt-80 pb-80">
        <div className="container">
          <div className="contact-page__wrapper">
            {/* Left Column - Contact Information */}
            <div className="contact-page__info">
              <div className="contact-page__info-content">
                <div className={`contact-page__logo ${styles.contactPageLogo}`}>
                  <Link href="/" scroll={true} aria-label="Go to homepage">
                    <Image
                      src="/assets/img/logo/Corp Crunch Black Logo.png"
                      alt="CorpCrunch"
                      width={380}
                      height={124}
                      className="logo-dark"
                      priority
                      quality={100}
                      unoptimized
                      style={{ width: 'auto', height: 'auto', maxWidth: '380px', maxHeight: '124px' }}
                    />
                    <Image
                      src="/assets/img/logo/Corp Crunch White Logo.png"
                      alt="CorpCrunch"
                      width={380}
                      height={124}
                      className="logo-light"
                      priority
                      quality={100}
                      unoptimized
                      style={{ width: 'auto', height: 'auto', maxWidth: '380px', maxHeight: '124px' }}
                    />
                  </Link>
                </div>
                
                <h1 className="contact-page__heading">
                  HAVE<br />QUESTIONS?<br />JUST SAY HELLO!
                </h1>
                
                <div className="contact-page__details">
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon"><i className="fas fa-map-marker-alt"></i></div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Office</span>
                      <span className="contact-detail-value">Dubai, UAE </span>
                    </div>
                  </div>
                  
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon"><i className="fas fa-phone"></i></div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Phone</span>
                      <span className="contact-detail-value">+91 7769892323</span>
                    </div>
                  </div>
                  
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon"><i className="fas fa-envelope"></i></div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Email</span>
                      <span className="contact-detail-value">scoop@corpcrunch.io</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div className="contact-page__form-section">
              <Link href="/" className="contact-page__back-link">
                <i className="fas fa-arrow-left"></i>
                <span>Back</span>
              </Link>

              <div className="contact-page__form-wrapper">
                <form className="contact-page__form" onSubmit={handleSubmit}>
                  <div className="contact-form__row">
                    <div className="contact-form__field">
                      <label htmlFor="name">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="contact-form__field">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="contact-form__field">
                    <label htmlFor="companyName">Company name</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your company or organization"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className={`contact-form__row ${styles.phoneRow}`}>
                    <div className="contact-form__field">
                      <label htmlFor="phoneCountryCode">Country code</label>
                      <select
                        id="phoneCountryCode"
                        name="phoneCountryCode"
                        className={styles.inquirySelect}
                        value={formData.phoneCountryCode}
                        onChange={handleInputChange}
                        disabled={isSubmitting}
                      >
                        {PHONE_COUNTRY_CODES.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="contact-form__field">
                      <label htmlFor="phoneNumber">Phone number</label>
                      <div className={styles.phoneInputWrap}>
                        <span className={styles.phonePrefix} aria-hidden="true">
                          {formData.phoneCountryCode || '+'}
                        </span>
                        <input
                          type="tel"
                          id="phoneNumber"
                          name="phoneNumber"
                          className={styles.phoneInput}
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Phone number"
                          inputMode="tel"
                          autoComplete="tel-national"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="contact-form__field">
                    <label htmlFor="inquiryTopic">What are you reaching out about?</label>
                    <select
                      id="inquiryTopic"
                      name="inquiryTopic"
                      className={styles.inquirySelect}
                      value={formData.inquiryTopic}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    >
                      {CONTACT_INQUIRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="contact-form__field">
                    <label htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="contact-form__field">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows="6"
                      disabled={isSubmitting}
                    ></textarea>
                  </div>

                  <p className="contact-form__privacy">
                    By submitting you are agreeing with our{" "}
                    <Link href="/privacy-policy">Privacy Policies</Link> and{" "}
                    <Link href="/terms-of-service">Terms & Conditions</Link>.
                  </p>

                  {submitStatus && (
                    <div className={`contact-form__status ${submitStatus.success ? styles.success : styles.error}`}
                         style={{ color: submitStatus.success ? '#28a745' : '#dc3545', padding: '10px 0', fontWeight: 'bold' }}>
                      {submitStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="contact-form__submit-btn"
                    disabled={isSubmitting}
                  >
                    <span>{isSubmitting ? "Sending..." : "Submit"}</span>
                    {!isSubmitting && <i className="fas fa-arrow-right"></i>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}