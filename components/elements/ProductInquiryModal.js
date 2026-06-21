import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import {
  CONTACT_INQUIRY_OPTIONS,
  getInquiryLabel,
  getInquirySubject,
} from '@/lib/productInquiryOptions';
import {
  DEFAULT_PHONE_COUNTRY_CODE,
  PHONE_COUNTRY_CODES,
} from '@/lib/phoneCountryCodes';
import styles from './ProductInquiryModal.module.css';

export default function ProductInquiryModal({
  isOpen,
  onClose,
  initialInquiryTopic = 'general',
  productName = '',
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
    phoneNumber: '',
    inquiryTopic: initialInquiryTopic,
    subject: getInquirySubject(initialInquiryTopic),
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const defaultMessage = productName
      ? `Hi, I would like to learn more about ${productName}.`
      : '';
    setFormData({
      name: '',
      email: '',
      companyName: '',
      phoneCountryCode: DEFAULT_PHONE_COUNTRY_CODE,
      phoneNumber: '',
      inquiryTopic: initialInquiryTopic,
      subject: getInquirySubject(initialInquiryTopic),
      message: defaultMessage,
    });
    setSubmitStatus(null);
  }, [isOpen, initialInquiryTopic, productName]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'inquiryTopic') {
        next.subject = getInquirySubject(value);
        if (!prev.message.trim() && value !== 'general') {
          next.message = `Hi, I would like to learn more about ${getInquiryLabel(value)}.`;
        }
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post('/api/contact', {
        ...formData,
        subject: formData.subject || `Product inquiry: ${getInquiryLabel(formData.inquiryTopic)}`,
        formType: formData.inquiryTopic === 'general' ? 'message' : 'product',
      });

      if (response.data?.success) {
        setSubmitStatus({
          success: true,
          message: response.data.message || "Thanks — we'll be in touch shortly.",
        });
      } else {
        setSubmitStatus({
          success: false,
          message: response.data?.message || 'Failed to send your message. Please try again.',
        });
      }
    } catch (error) {
      setSubmitStatus({
        success: false,
        message:
          error.response?.data?.message ||
          'Failed to send your message. Please try again or email scoop@corpcrunch.io',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-inquiry-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 id="product-inquiry-title" className={styles.title}>Get in Touch</h2>
            <p className={styles.subtitle}>
              {productName
                ? `Tell us what you need to know about ${productName} and our team will follow up.`
                : 'Tell us which product you are interested in and our team will follow up.'}
            </p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="inquiry-name">Name</label>
              <input
                id="inquiry-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="inquiry-email">Email</label>
              <input
                id="inquiry-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="inquiry-company">Company name</label>
            <input
              id="inquiry-company"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Your company or organization"
              disabled={isSubmitting}
            />
          </div>

          <div className={`${styles.row} ${styles.phoneRow}`}>
            <div className={styles.field}>
              <label htmlFor="inquiry-phone-code">Country code</label>
              <select
                id="inquiry-phone-code"
                name="phoneCountryCode"
                className={styles.inquirySelect}
                value={formData.phoneCountryCode}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                {PHONE_COUNTRY_CODES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="inquiry-phone">Phone number</label>
              <div className={styles.phoneInputWrap}>
                <span className={styles.phonePrefix} aria-hidden="true">
                  {formData.phoneCountryCode || '+'}
                </span>
                <input
                  id="inquiry-phone"
                  type="tel"
                  name="phoneNumber"
                  className={styles.phoneInput}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Phone number"
                  inputMode="tel"
                  autoComplete="tel-national"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="inquiry-topic">What are you reaching out about?</label>
            <select
              id="inquiry-topic"
              name="inquiryTopic"
              className={styles.inquirySelect}
              value={formData.inquiryTopic}
              onChange={handleChange}
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

          <div className={styles.field}>
            <label htmlFor="inquiry-subject">Subject</label>
            <input
              id="inquiry-subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="inquiry-message">Message</label>
            <textarea
              id="inquiry-message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {submitStatus && (
            <p
              className={`${styles.status} ${
                submitStatus.success ? styles.statusSuccess : styles.statusError
              }`}
            >
              {submitStatus.message}
            </p>
          )}

          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        <Link
          href={`/contact?inquiry=${encodeURIComponent(formData.inquiryTopic)}`}
          className={styles.altLink}
          onClick={onClose}
        >
          Prefer the full contact page?
        </Link>
      </div>
    </div>
  );
}
