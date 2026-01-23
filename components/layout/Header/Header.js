import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Menu from "./Menu";
import MobileMenu from "./MobileMenu";
import Sidebar from "./Sidebar";
import SearchBar from "@/components/elements/SearchBar";
import LanguageSelector from "@/components/elements/LanguageSelector";
import LocationSelector from "@/components/elements/LocationSelector";
import ThemeToggle from "@/components/elements/ThemeToggle";
import HamburgerIcon from "@/components/elements/HamburgerIcon";
import useCategory from "@/hooks/useCategory";
import { useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Header1 = ({
  scroll,
  handleMobileMenuOpen,
  handleMobileMenuClose,
  handleSidebarClose,
  handleSidebarOpen,
}) => {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    refetch: fetchCategories,
    data: categories,
    isLoading: isLoadingCategory,
  } = useCategory({ enabled: false });

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSigninRoute =
    router.pathname === "/signin" ||
    router.pathname === "/subscribe" ||
    router.pathname === "/payment";

  return (
    <>
      <header className="modern-header">
        {/* Decorative Top Border */}
        <div className="header__border-top"></div>
        
        {/* Main Header Content */}
        <div className="header__main">
          <div className="container">
            <div className="header__content">
              {/* Left: Hamburger Menu Button */}
              <HamburgerIcon 
                onClick={handleSidebarOpen}
                ariaLabel="Open sidebar menu"
                className="header__sidebar-toggle"
              />
              
              {/* Center: Logo and Brand Name (centered) */}
              <div className="header__logo header__logo-centered">
                <Link
                  href="/"
                  scroll={true}
                  className="corp-crunch-logo"
                  aria-label="Go to homepage"
                >
                  <Image
                    src="/assets/img/logo/Corp Crunch Black Logo.png"
                    alt="CorpCrunch"
                    width={380}
                    height={124}
                    className="logo-image logo-dark"
                    priority
                    unoptimized
                  />
                  <Image
                    src="/assets/img/logo/Corp Crunch White Logo.png"
                    alt="CorpCrunch"
                    width={380}
                    height={124}
                    className="logo-image logo-light"
                    priority
                    unoptimized
                  />
                </Link>
              </div>
              
              {/* Right: Language, Theme, CTA Button & Mobile Menu */}
              <div className="header__actions">
                {isLoadingCategory ? (
                  <div className="d-flex align-items-center gap-3">
                    <Skeleton width={100} height={38} borderRadius={20} />
                    <Skeleton circle width={38} height={38} />
                    <Skeleton width={38} height={38} borderRadius={19} />
                  </div>
                ) : (
                  <>
                {/* Language Selector */}
                <div className="header__language-toggle d-none d-md-flex">
                  <LanguageSelector />
                </div>
                
                {/* Theme Toggle */}
                <div className="header__theme-toggle d-none d-md-flex">
                  <ThemeToggle />
                </div>
                
                {!onSigninRoute && (
                  <Link 
                    href="/signin" 
                    scroll={true}
                    className="header__cta-btn d-none d-md-inline-flex"
                    aria-label={t('header.signIn')}
                  >
                    <i className="fas fa-user-circle" style={{ fontSize: '20px' }}></i>
                  </Link>
                )}
                
                {/* Mobile Navigation Hamburger (Right Side) - Only on Mobile */}
                <div className="header__mobile-nav-toggle">
                  <HamburgerIcon 
                    onClick={handleMobileMenuOpen}
                    ariaLabel="Open navigation menu"
                  />
                </div>
                </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Bottom Border */}
        <div className="header__border-bottom"></div>
        
        {/* Mobile Menu */}
        <MobileMenu handleMobileMenuClose={handleMobileMenuClose} />
        
        {/* Sidebar */}
        <Sidebar handleSidebarClose={handleSidebarClose} />
      </header>
      
      {/* Sticky Header Spacer */}
      <div
        id="header-fixed-height"
        className={`${scroll ? "active-height" : ""}`}
      />
    </>
  );
};

export default Header1;
