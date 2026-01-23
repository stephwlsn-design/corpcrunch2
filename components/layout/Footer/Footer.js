import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer1() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="modern-footer">
        <div className="container">
          {/* Navigation Buttons Section */}
          <div className="footer__navigation">
            <Link href="/" className="footer__nav-btn">
              {t('header.home')}
            </Link>
            <Link href="/about" className="footer__nav-btn">
              {t('header.about')}
            </Link>
            <Link href="/products" className="footer__nav-btn">
              {t('header.products')}
            </Link>
            <Link href="/events" className="footer__nav-btn">
              {t('header.events')}
            </Link>
            <Link href="/contact" className="footer__nav-btn">
              {t('header.contact')}
            </Link>
          </div>
          
          <div className="footer__content">
            {/* Left: Legal & Request Links */}
            <div className="footer__left">
              <div className="footer__links">
                <Link href="/make-article-request" className="footer__link">
                  {t('footer.requestArticle')}
                </Link>
                <span className="footer__separator">•</span>
                <Link href="/privacy-policy" className="footer__link">
                  {t('footer.privacyPolicy')}
                </Link>
                <span className="footer__separator">•</span>
                <Link href="/terms-of-service" className="footer__link">
                  {t('footer.termsCondition')}
                </Link>
              </div>
            </div>

            {/* Center: Large Logo & Name */}
            <div className="footer__center">
              <div className="footer__logo">
                <Link href="/" className="footer__logo-link">
                  <Image
                    src="/assets/img/logo/Corp Crunch Black Logo.png"
                    alt="CorpCrunch"
                    width={250}
                    height={80}
                    className="footer__logo-image logo-dark"
                    unoptimized
                  />
                  <Image
                    src="/assets/img/logo/Corp Crunch White Logo.png"
                    alt="CorpCrunch"
                    width={250}
                    height={80}
                    className="footer__logo-image logo-light"
                    unoptimized
                  />
                </Link>
              </div>
              
            </div>

            {/* Right: Copyright */}
            <div className="footer__right">
              <div className="footer__copyright">
                © 2026 CorpCrunch. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
