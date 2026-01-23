import useCategory from "@/hooks/useCategory";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Skeleton from "react-loading-skeleton";

export default function Menu({
  handleMobileMenuOpen,
  handleSidebarOpen,
  offCanvasNav,
  logoAlt,
  white,
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    refetch: fetchCategories,
    data: categories,
    isLoading: isLoadingCategory,
  } = useCategory({ enabled: false });

  const onSigninRoute =
    router.pathname === "/signin" ||
    router.pathname === "/subscribe" ||
    router.pathname === "/payment";
  const pathCategory = router.asPath.split("/").at(-1);
  useEffect(() => {
    if (!onSigninRoute) {
      fetchCategories();
    }
  }, []);

  return (
    <>
      <div className="tgmenu__wrap">
        <nav
          className="tgmenu__nav"
          style={{
            position: "relative",
            top: "5px",
            flexWrap: "nowrap",
          }}
        >
          {/* <div className="logo d-block d-md-none d-sm-block d-xs-block">
            <Link href="/" className="logo-dark">
              <img src="/assets/img/logo/logo.png" alt="Logo" />
            </Link>
            <Link href="/" className="logo-light">
              <img src="/assets/img/logo/w_logo.png" alt="Logo" />
            </Link>
          </div> */}
          {logoAlt && (
            <div className="d-flex gap-4 align-items-center">
              <div className="offcanvas-toggle" onClick={handleSidebarOpen}>
                <button 
                  type="button" 
                  className="hamburger-menu-btn"
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: '5px',
                    fontSize: '24px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <i className="flaticon-menu-bar" />
                </button>
              </div>
              <div className="logo">
                <Link href="/">
                  <img
                    src={`assets/img/logo/${white ? "w_logo" : "logo"}.png`}
                    alt="Logo"
                  />
                </Link>
              </div>
            </div>
          )}
          {offCanvasNav && false && (
            <div className="offcanvas-toggle" onClick={handleSidebarOpen}>
              <button 
                type="button" 
                className="hamburger-menu-btn"
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '5px',
                  fontSize: '24px',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <i className="flaticon-menu-bar" style={{ color: '#000' }} />
              </button>
            </div>
          )}
        </nav>
        {!onSigninRoute && (
          <div className="mobile-nav-toggler" onClick={handleMobileMenuOpen}>
            <i className="fas fa-bars" />
          </div>
        )}
      </div>
      <style jsx>{`
        .hamburger-menu-btn {
          background: transparent !important;
          border: none !important;
        }
        .hamburger-menu-btn:hover i {
          color: #ff0292 !important;
        }
        .hamburger-menu-btn i {
          color: #000 !important;
          transition: color 0.3s ease;
        }
      `}</style>
    </>
  );
}
