import Layout from "@/components/layout/Layout";
import BlogHero from "@/components/elements/BlogHero";
import React from "react";
import Head from "next/head";

export default function BlogPage() {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>
      
      <div className="blog-page-wrapper" style={{ margin: 0, padding: 0 }}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap');
          
          * {
            font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }
          
          .blog-page-wrapper {
            font-family: 'Urbanist', sans-serif !important;
            margin: 0;
            padding: 0;
          }
          
          /* Apply Urbanist to all headings and elements within the blog page */
          .blog-page-wrapper h1, 
          .blog-page-wrapper h2, 
          .blog-page-wrapper h3, 
          .blog-page-wrapper h4, 
          .blog-page-wrapper h5, 
          .blog-page-wrapper h6, 
          .blog-page-wrapper p, 
          .blog-page-wrapper span, 
          .blog-page-wrapper a, 
          .blog-page-wrapper button,
          .blog-page-wrapper div,
          .blog-page-wrapper input,
          .blog-page-wrapper textarea {
            font-family: 'Urbanist', sans-serif !important;
          }
          
          body {
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }
        `}</style>
        
        <BlogHero 
          title="Smart Digital Marketing that turns strategy into growth."
          highlightText="Digital Marketing"
          subtitle="We combine strategy, creativity, and performance marketing to help digital brands grow, compete, and scale with confidence."
          mediaUrl="/assets/img/blog/blog01.jpg"
          mediaType="image"
          journalistName="Miranda H. Halim"
          journalistTitle="Head Of Idea"
          journalistImage="/assets/img/others/about_me.png"
          showBuyButton={true}
        />
      </div>
    </>
  );
}

