import { useState, useMemo } from "react";
import ToastContainer from "../ToastContainer/ToastContainer";
import ChatBot from "../elements/ChatBot";
import Breadcrumb from "./Breadcrumb";
import Footer from "./Footer/Footer";
import Header from "./Header/Header";
import CategoryNavigation from "./CategoryNavigation/CategoryNavigation";
import PageHead from "./PageHead";
import { useSiteBaseUrl } from "@/contexts/SiteUrlContext";
import { localizeSeoForDomain } from "@/lib/siteUrl";

const Layout = ({
  children,
  breadcrumbCategory,
  breadcrumbPostTitle,
  headTitle,
  seo = {},
  categories = null, // Accept categories as prop to avoid duplicate fetches
  hideCategoryNavigation = false,
  hideFooter = false,
  hideChatbot = false,
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
  const siteBaseUrl = useSiteBaseUrl();

  const resolvedSeo = useMemo(() => {
    const baseSeo = Object.keys(seo).length > 0 ? seo : headTitle ? { title: headTitle } : {};
    return localizeSeoForDomain(baseSeo, siteBaseUrl);
  }, [seo, headTitle, siteBaseUrl]);

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
        title={resolvedSeo.title || headTitle}
        description={resolvedSeo.description}
        image={resolvedSeo.image}
        imageAlt={resolvedSeo.imageAlt}
        url={resolvedSeo.url}
        type={resolvedSeo.type}
        isArticle={resolvedSeo.isArticle}
        publishedTime={resolvedSeo.publishedTime}
        modifiedTime={resolvedSeo.modifiedTime}
        author={resolvedSeo.author}
        articleSection={resolvedSeo.articleSection}
        ogTitle={resolvedSeo.ogTitle}
        ogDescription={resolvedSeo.ogDescription}
        robots={resolvedSeo.robots}
        keywords={resolvedSeo.keywords}
        language={resolvedSeo.language}
        jsonLd={resolvedSeo.jsonLd}
        alternateUrls={resolvedSeo.alternateUrls}
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
      {!hideCategoryNavigation && <CategoryNavigation categories={categories} />}

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

      {!hideFooter && <Footer />}
      <ToastContainer />
      {!hideChatbot && <ChatBot />}
    </>
  );
};

export default Layout;
