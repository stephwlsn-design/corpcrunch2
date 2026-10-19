import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import styles from './CookieConsentBanner.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-+()]{7,20}$/;

export default function CookieConsentBanner() {
  const { hasConsented, isReady, acceptCookies } = useCookieConsent();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
  });

  const isOpen = !hasConsented;

  useEffect(() => {
    // Replace the pre-hydration boot gate with the interactive React form
    if (typeof document !== 'undefined') {
      document.getElementById('cc-boot-gate')?.remove();
    }
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    if (isOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }

    document.body.style.overflow = '';
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const validateForm = () => {
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phoneNumber = form.phoneNumber.trim();

    if (name.length < 2) {
      return 'Please enter your full name.';
    }
    if (!EMAIL_REGEX.test(email)) {
      return 'Please enter a valid email address.';
    }
    if (!PHONE_REGEX.test(phoneNumber)) {
      return 'Please enter a valid contact number.';
    }
    return null;
  };

  const handleAccept = async (event) => {
    event.preventDefault();
    if (!isReady || isSubmitting) return;

    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    const contact = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phoneNumber: form.phoneNumber.trim(),
    };

    try {
      const status = await acceptCookies(contact);
      if (!status) {
        setFormError('Unable to save your details. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formDisabled = !isReady || isSubmitting;

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
      >
        <div className={styles.iconWrap} aria-hidden="true">
          <span className={styles.icon}>🍪</span>
        </div>

        <h2 id="cookie-consent-title" className={styles.title}>
          Enter your details to continue
        </h2>

        <p id="cookie-consent-description" className={styles.description}>
          Welcome to Corp Crunch. Please provide your name, email, and contact
          number to access corpcrunch.io and corpcrunch.ai. We use cookies to
          improve content and analyze site traffic.
        </p>

        <p className={styles.notice}>
          Name, email, and contact number are required before you can browse this
          site — including if you have visited before.
        </p>

        <form className={styles.form} onSubmit={handleAccept} noValidate>
          <label className={styles.field}>
            <span>Full name *</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
              required
              disabled={formDisabled}
              autoFocus
            />
          </label>

          <label className={styles.field}>
            <span>Email *</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              required
              disabled={formDisabled}
            />
          </label>

          <label className={styles.field}>
            <span>Contact number *</span>
            <input
              type="tel"
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="+1 555 000 0000"
              autoComplete="tel"
              required
              disabled={formDisabled}
            />
          </label>

          {!isReady && (
            <p className={styles.description} style={{ marginBottom: 12 }}>
              Preparing secure form…
            </p>
          )}

          {formError && (
            <p className={styles.formError} role="alert">
              {formError}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.acceptBtn}
              disabled={formDisabled}
            >
              {isSubmitting ? 'Saving…' : 'Accept & continue'}
            </button>
          </div>
        </form>

        <Link
          href="/privacy-policy"
          className={styles.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Read our Privacy Policy
        </Link>
      </div>
    </div>
  );
}
