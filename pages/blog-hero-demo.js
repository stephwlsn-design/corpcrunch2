import React from "react";
import Head from "next/head";
import BlogHero from "@/components/elements/BlogHero";

export default function BlogHeroDemo() {
  return (
    <>
      <Head>
        <title>Blog Hero Demo - CorpCrunch</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
        />
      </Head>
      
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Urbanist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
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
    </>
  );
}

