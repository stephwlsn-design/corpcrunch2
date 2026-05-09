import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Menu from "./Menu";
import MobileMenu from "./MobileMenu";
import Sidebar from "./Sidebar";
import LanguageSelector from "@/components/elements/LanguageSelector";
import LocationSelector from "@/components/elements/LocationSelector";
import RegionSelector from "@/components/elements/RegionSelector";
import ThemeToggle from "@/components/elements/ThemeToggle";
import HamburgerIcon from "@/components/elements/HamburgerIcon";
import useCategory from "@/hooks/useCategory";
import { useEffect, useMemo, useState } from "react";
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchCategories();
    // Check auth status safely on client side
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("token") || !!localStorage.getItem("adminToken"));
    }
  }, []);

  const onSigninRoute =
    router.pathname === "/signin" ||
    router.pathname === "/subscribe" ||
    router.pathname === "/payment";
  const isIntelligentPage = router.pathname?.startsWith("/intelligent");

  const logoConfig = isIntelligentPage
    ? {
        srcDark: "/assets/img/logo/Intelligent_Technology_Solutions_Header.png",
        srcLight: "/assets/img/logo/Intelligent_Technology_Solutions_Header.png",
        alt: "Intelligent Technology Solutions",
        width: 660,
        height: 292,
      }
    : {
        srcDark: "/assets/img/logo/Corp Crunch Black Logo.png",
        srcLight: "/assets/img/logo/Corp Crunch White Logo.png",
        alt: "CorpCrunch",
        width: 380,
        height: 124,
      };

  return (
    <>
      <header
        className={`modern-header${isIntelligentPage ? " modern-header--intelligent-page" : ""}`}
      >
        {/* Decorative Top Border */}
        <div className="header__border-top"></div>

        {/* Main Header Content */}
        <div className="header__main">
          <div className="container">
            <div className="header__content">
              {/* Left: Hamburger Menu Button */}
              {!isIntelligentPage && (
                <HamburgerIcon
                  onClick={handleSidebarOpen}
                  ariaLabel="Open sidebar menu"
                  className="header__sidebar-toggle"
                />
              )}

              {/* Center: Logo and Brand Name (centered) */}
              <div className="header__logo header__logo-centered">
                <Link
                  href={isIntelligentPage ? "/intelligent" : "/"}
                  scroll={true}
                  className="corp-crunch-logo"
                  aria-label={isIntelligentPage ? "Go to Intelligent Technology Solutions page" : "Go to homepage"}
                >
                  <Image
                    src={logoConfig.srcDark}
                    alt={logoConfig.alt}
                    width={logoConfig.width}
                    height={logoConfig.height}
                    className={`logo-image logo-dark ${isIntelligentPage ? "intelligent-header-logo" : ""}`}
                    style={isIntelligentPage ? { height: '140px', width: 'auto', maxHeight: 'none', maxWidth: 'none' } : {}}
                    priority
                    unoptimized
                  />
                  <Image
                    src={logoConfig.srcLight}
                    alt={logoConfig.alt}
                    width={logoConfig.width}
                    height={logoConfig.height}
                    className={`logo-image logo-light ${isIntelligentPage ? "intelligent-header-logo" : ""}`}
                    style={isIntelligentPage ? { height: '140px', width: 'auto', maxHeight: 'none', maxWidth: 'none' } : {}}
                    priority
                    unoptimized
                  />
                </Link>
              </div>

              {/* Right: Region, Language, Theme, CTA Button & Mobile Menu */}
              <div className="header__actions">
                {isLoadingCategory ? (
                  <div className="d-flex align-items-center gap-3">
                    <Skeleton width={120} height={38} borderRadius={20} />
                    <Skeleton width={100} height={38} borderRadius={20} />
                    <Skeleton circle width={38} height={38} />
                    <Skeleton width={38} height={38} borderRadius={19} />
                  </div>
                ) : (
                  <>
                    {/* Region Selector */}
                    <div className="header__region-toggle d-none d-md-flex">
                      <RegionSelector intelligentPage={isIntelligentPage} />
                    </div>

                    {/* Language Selector */}
                    <div className="header__language-toggle d-none d-md-flex">
                      <LanguageSelector intelligentPage={isIntelligentPage} />
                    </div>

                    {/* Theme Toggle */}
                    <div className="header__theme-toggle d-none d-md-flex">
                      <ThemeToggle />
                    </div>

                    {!onSigninRoute && (
                      <div className="d-flex align-items-center gap-2">
                        <Link
                          href={isLoggedIn ? "/profile" : "/signin"}
                          scroll={true}
                          className="header__cta-btn d-none d-md-inline-flex"
                          aria-label={isLoggedIn ? "Go to profile" : t('header.signIn')}
                        >
                          <i className="fas fa-user-circle" style={{ fontSize: '20px' }}></i>
                        </Link>
                        {isLoggedIn && (
                          <button
                            onClick={() => {
                              localStorage.removeItem("token");
                              localStorage.removeItem("adminToken");
                              window.location.href = "/signin";
                            }}
                            className="header__cta-btn d-none d-md-inline-flex"
                            style={{ border: 'none', cursor: 'pointer', background: 'transparent' }}
                            aria-label="Logout"
                            title="Logout"
                          >
                            <i className="fas fa-sign-out-alt" style={{ fontSize: '20px' }}></i>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Mobile Navigation Hamburger (Right Side) - Only on Mobile */}
                    {!isIntelligentPage && (
                      <div className="header__mobile-nav-toggle">
                        <HamburgerIcon
                          onClick={handleMobileMenuOpen}
                          ariaLabel="Open navigation menu"
                        />
                      </div>
                    )}
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
        {!isIntelligentPage && <Sidebar handleSidebarClose={handleSidebarClose} />}
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