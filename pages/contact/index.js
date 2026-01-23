import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Layout from "@/components/layout/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import axiosInstance from "@/util/axiosInstance";
import SocialShareRibbon from "@/components/elements/SocialShareRibbon";
import styles from "./Contact.module.css";

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axiosInstance.post("/contact", {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        formType: 'message',
      });
      
      if (response.data?.success) {
        setSubmitStatus({ success: true, message: response.data.message || "Message sent successfully! We'll get back to you soon." });
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setSubmitStatus({ success: false, message: response.data?.message || "Failed to send message. Please try again." });
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
    <Layout headTitle="Contact Us - CorpCrunch">
      <SocialShareRibbon />
      <section className="contact-page-modern pt-80 pb-80">
        <div className="container">
          <div className="contact-page__wrapper">
            {/* Left Column - Contact Information */}
            <div className="contact-page__info">
              <div className="contact-page__info-content">
                {/* Logo */}
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
                  HAVE
                  <br />
                  QUESTIONS?
                  <br />
                  JUST SAY HELLO!
                </h1>
                
                <div className="contact-page__details">
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon">
                      <i className="fas fa-map-marker-alt"></i>
                    </div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Office</span>
                      <span className="contact-detail-value">Pune, India 411015</span>
                    </div>
                  </div>
                  
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon">
                      <i className="fas fa-phone"></i>
                    </div>
                    <div className="contact-detail-content">
                      <span className="contact-detail-label">Phone</span>
                      <span className="contact-detail-value">+91 7769892323</span>
                    </div>
                  </div>
                  
                  <div className="contact-detail-item">
                    <div className="contact-detail-icon">
                      <i className="fas fa-envelope"></i>
                    </div>
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
                      />
                    </div>
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
                    ></textarea>
                  </div>

                  <p className="contact-form__privacy">
                    By submitting you are agreeing with our{" "}
                    <Link href="/privacy-policy">Privacy Policies</Link> and{" "}
                    <Link href="/terms-of-service">Terms & Conditions</Link>.
                  </p>

                  {submitStatus && (
                    <div className={`contact-form__status ${submitStatus.success ? "success" : "error"}`}>
                      {submitStatus.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="contact-form__submit-btn"
                    disabled={isSubmitting}
                  >
                    <span>Submit</span>
                    <i className="fas fa-arrow-right"></i>
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
