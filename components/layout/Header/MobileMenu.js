import useCategory from "@/hooks/useCategory";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Skeleton from "react-loading-skeleton";
import LanguageSelector from "@/components/elements/LanguageSelector";
import ThemeToggle from "@/components/elements/ThemeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const MobileMenu = ({ handleMobileMenuClose }) => {
  const { t } = useLanguage();
  const {
    refetch: fetchCategories,
    data: categories,
    isLoading: isLoadingCategory,
  } = useCategory({ enabled: false });

  const router = useRouter();

  const onSigninRoute =
    router.pathname === "/signin" ||
    router.pathname === "/subscribe" ||
    router.pathname === "/payment";

  useEffect(() => {
    if (!onSigninRoute) {
      fetchCategories();
    }
  }, []);

  const renderCategories = () =>
    onSigninRoute
      ? "null"
      : isLoadingCategory
        ? Array.from({ length: 5 }).map((_, index) => (
          <li
            style={{
              padding: "20px 0 23px",
              width: "140px",
              margin: "0 auto",
            }}
            key={index}
          >
            <Skeleton height={20} width={100} />
          </li>
        ))
        : Array.isArray(categories) && categories.length > 0 ? (
          categories.map((category) => {
            const categoryId = category.id || category._id;
            return (
              <li
                key={categoryId}
                className={router.pathname == category.name ? "active" : ""}
              >
                <Link href={`/category/${categoryId}`}>{category.name}</Link>
              </li>
            );
          })
        ) : null;

  if (onSigninRoute) return null;
  return (
    <>
      <div className="tgmobile__menu">
        <nav className="tgmobile__menu-box">
          <div className="close-btn" onClick={handleMobileMenuClose}>
            <i className="fas fa-times" />
          </div>
          <div className="nav-logo">
            <Link href="/" scroll={true} className="logo-dark">
              <img src="/assets/img/logo/logo.png" alt="Logo" />
            </Link>
            <Link href="/" scroll={true} className="logo-light">
              <img src="/assets/img/logo/w_logo.png" alt="Logo" />
            </Link>
          </div>
          <div className="tgmobile__menu-outer">
            <ul className="navigation justify-content-center text-center">
              <li className={router.pathname === '/' ? 'active' : ''}>
                <Link href="/" scroll={true} onClick={handleMobileMenuClose}>{t('header.home')}</Link>
              </li>
              <li className={router.pathname === '/products' ? 'active' : ''}>
                <Link href="/products" scroll={true} onClick={handleMobileMenuClose}>Product</Link>
              </li>
              <li className={router.pathname === '/events' ? 'active' : ''}>
                <Link href="/events" scroll={true} onClick={handleMobileMenuClose}>{t('header.events')}</Link>
              </li>
              <li className={router.pathname === '/e-magazine' ? 'active' : ''}>
                <Link href="/e-magazine" scroll={true} onClick={handleMobileMenuClose}>E magazine</Link>
              </li>
              <li className={router.pathname === '/contact' ? 'active' : ''}>
                <Link href="/contact" scroll={true} onClick={handleMobileMenuClose}>{t('header.contact')}</Link>
              </li>
              <li className={router.pathname === '/signin' ? 'active' : ''}>
                <Link href="/signin" scroll={true} onClick={handleMobileMenuClose}>{t('header.signIn')}</Link>
              </li>
              <li className={router.pathname === '/profile' ? 'active' : ''}>
                <Link href="/profile" scroll={true} onClick={handleMobileMenuClose}>{t('header.profile')}</Link>
              </li>
              <li className={router.pathname === '/make-article-request' ? 'active' : ''}>
                <Link href="/make-article-request" scroll={true} onClick={handleMobileMenuClose}>{t('footer.requestArticle')}</Link>
              </li>
            </ul>
            
            {/* Mobile Language and Theme Controls */}
            <div className="mobile-menu-controls">
              <div className="mobile-control-item">
                <LanguageSelector />
              </div>
              <div className="mobile-control-item">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div
        className="tgmobile__menu-backdrop"
        onClick={handleMobileMenuClose}
      />
    </>
  );
};

export default MobileMenu;
