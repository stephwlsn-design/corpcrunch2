import { useState } from "react";
import ToastContainer from "../ToastContainer/ToastContainer";
import ChatBot from "../elements/ChatBot";
import Breadcrumb from "./Breadcrumb";
import Footer from "./Footer/Footer";
import Header from "./Header/Header";
import CategoryNavigation from "./CategoryNavigation/CategoryNavigation";
import PageHead from "./PageHead";

const Layout = ({
  children,
  breadcrumbCategory,
  breadcrumbPostTitle,
  headTitle,
  seo = {},
}) => {
  const handleMobileMenuOpen = () => {
    if (typeof window !== 'undefined') {
    document.body.classList.add("mobile-menu-visible");
    }
  };
  const handleMobileMenuClose = () => {
    if (typeof window !== 'undefined') {
    document.body.classList.remove("mobile-menu-visible");
    }
  };

  const handleSidebarOpen = () => {
    if (typeof window !== 'undefined') {
    document.body.classList.add("offCanvas__menu-visible");
    }
  };

  const handleSidebarClose = () => {
    if (typeof window !== 'undefined') {
    document.body.classList.remove("offCanvas__menu-visible");
    }
  };

  //Language Toggle
  const [langToggle, setLangToggle] = useState(false);
  const handleLangToggle = () => setLangToggle(!langToggle);

  const [scroll, setScroll] = useState(0);

  // useEffect(() => {
  //   document.addEventListener("scroll", () => {
  //     const scrollCheck = window.scrollY > 100;
  //     if (scrollCheck !== scroll) {
  //       setScroll(scrollCheck);
  //     }
  //   });
  // });

  return (
    <>
      <PageHead
        title={seo.title || headTitle}
        description={seo.description}
        image={seo.image}
        url={seo.url}
        isArticle={seo.isArticle}
        publishedTime={seo.publishedTime}
        author={seo.author}
      />

      <Header
        handleMobileMenuOpen={handleMobileMenuOpen}
        handleMobileMenuClose={handleMobileMenuClose}
        scroll={scroll}
        langToggle={langToggle}
        handleLangToggle={handleLangToggle}
        handleSidebarOpen={handleSidebarOpen}
        handleSidebarClose={handleSidebarClose}
      />

      {/* Category Navigation Bar - Below Header */}
      <CategoryNavigation />

      <main className="main modern-layout">
        <div className="container">
          {breadcrumbCategory && (
            <Breadcrumb
              breadcrumbCategory={breadcrumbCategory}
              breadcrumbPostTitle={breadcrumbPostTitle}
            />
          )}

          {children}
        </div>
      </main>

      <Footer />
      <ToastContainer />
      <ChatBot />
    </>
  );
};

export default Layout;
