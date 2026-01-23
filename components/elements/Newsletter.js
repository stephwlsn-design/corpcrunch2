import { useState } from "react";
import useGlobalState from "@/hooks/useGlobalState";
import { validateEmail } from "@/util";
import { notifyError } from "@/util/toast";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Newsletter() {
  const { t } = useLanguage();
  const { handleSubscription, isSubscribing, setEmail, email } = useGlobalState();
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setErrorMessage("");
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage("Please enter your email address");
      return;
    }
    if (validateEmail(email) === false) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    handleSubscription(email);
  };

  return (
    <section className="newsletter-modern pt-80 pb-80">
      <div className="container">
        <div className="newsletter-modern__wrap">
          <div className="newsletter-modern__content">
            <div className="newsletter-modern__title">
              <span className="newsletter-modern__subtitle">{t('newsletter.subTitle', 'NEWSLETTER')}</span>
              <h2 className="newsletter-modern__heading">{t('newsletter.title', 'Subscribe to our Newsletter')}</h2>
              <p className="newsletter-modern__description">
                Stay updated with our latest news, articles, and exclusive content.
              </p>
            </div>
            <div className="newsletter-modern__form-wrapper">
              <form className="newsletter-modern__form" onSubmit={handleSubmit}>
                <div className="newsletter-modern__input-group">
                  <input
                    type="email"
                    className="newsletter-modern__input"
                    placeholder={t('newsletter.emailPlaceholder', 'Enter your email address')}
                    value={email}
                    onChange={handleChange}
                    required
                  />
                  <button 
                    className="newsletter-modern__submit" 
                    type="submit" 
                    disabled={isSubscribing}
                    style={{ 
                      background: 'var(--tg-theme-secondary, #2551e7)',
                      borderColor: 'var(--tg-common-color-white, #ffffff)' 
                    }}
                  >
                    {isSubscribing ? (
                      <span>{t('newsletter.subscribing', 'Subscribing...')}</span>
                    ) : (
                      <>
                        <span>{t('newsletter.subscribe', 'Subscribe')}</span>
                        <i className="fas fa-paper-plane" />
                      </>
                    )}
                  </button>
                </div>
                {errorMessage && (
                  <p className="newsletter-modern__error">
                    {errorMessage}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

