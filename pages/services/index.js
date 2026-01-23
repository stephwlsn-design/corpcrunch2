import Layout from "@/components/layout/Layout";
import data from "@/util/blogData";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// Use mock blog data for this page
const blogItems = data.filter((item) => item.group === "blog").slice(0, 6);

export default function ServicesPage() {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const sectionRef = useRef(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const sectionHeight = sectionRef.current.offsetHeight;
      const windowHeight = window.innerHeight;
      
      // Calculate progress from 0 to 1 as we scroll through the entire section
      // We start sliding when the top of the section hits the top of the viewport
      const scrollDistance = sectionHeight - windowHeight;
      const progress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
      
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <Layout headerStyle={1} headTitle={"Services"}>
      {/* Hero banner */}
      <section className="blog-services-hero">
        <div className="blog-services-container blog-services-hero-grid">
          {/* Left label & description */}
          <div className="blog-services-left">
            <div className="blog-pill">
              <span className="blog-pill-label">Blog_</span>
              <span className="blog-pill-grid">
                {Array.from({ length: 9 }).map((_, index) => (
                  <span key={index} className="blog-pill-dot" />
                ))}
              </span>
            </div>
            <p className="blog-hero-copy">
              We craft high-performance, scalable, and user-focused web
              solutions tailored to your business goals.
            </p>
          </div>

          {/* Right main hero heading */}
          <div className="blog-services-right">
            <h1 className="blog-hero-heading">
              <span>CREATING</span>
              <span>DIGITAL</span>
              <span>EXCELLENCE</span>
            </h1>
          </div>
        </div>
      </section>

      {/* Blog rows: image left, content right */}
      <section className="blog-list-section" ref={sectionRef} style={{ height: `${blogItems.length * 100}vh` }}>
        <div className="blog-horizontal-sticky-wrapper">
          <div 
            className="blog-horizontal-track"
            style={{
              transform: `translateX(-${scrollProgress * (blogItems.length - 1) * 100}vw)`,
              display: 'flex',
              width: `${blogItems.length * 100}vw`,
              willChange: 'transform'
            }}
          >
            {blogItems.map((item, index) => {
              const itemProgress = scrollProgress * (blogItems.length - 1);
              const relativeProgress = itemProgress - index;
              const absProgress = Math.abs(relativeProgress);
              const isActive = absProgress < 0.5;
              
              return (
                <div 
                  key={item.id} 
                  className="blog-horizontal-slide"
                  style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div 
                    className="blog-row-parallax-inner"
                    style={{
                      transform: `scale(${1 - absProgress * 0.15})`,
                      opacity: 1 - absProgress * 0.8,
                      filter: `blur(${absProgress * 4}px)`,
                      willChange: 'transform, opacity, filter'
                    }}
                  >
                    <article 
                      className={`blog-row ${isActive ? 'active' : ''}`}
                      style={{ 
                        zIndex: index + 1
                      }}
                    >
                      <div className="blog-row-border-wrapper">
                        <div className="blog-row-image-wrap" style={{ transform: `translateX(${relativeProgress * -100}px)`, willChange: 'transform' }}>
                          <div className="blog-row-image-card">
                            <Image
                              src={`/assets/img/blog/${item.img}`}
                              alt={item.title}
                              width={560}
                              height={360}
                              className="blog-row-image"
                            />
                            <div className="blog-row-meta">
                              <span className="blog-row-category">{item.category}</span>
                              <span className="blog-row-dot">•</span>
                              <span className="blog-row-author">{item.author}</span>
                              <span className="blog-row-dot">•</span>
                              <span className="blog-row-date">{item.date}</span>
                            </div>
                          </div>
                        </div>
                        <div className="blog-row-content" style={{ transform: `translateX(${relativeProgress * 100}px)`, willChange: 'transform' }}>
                          <p className="blog-row-eyebrow">Front-end Development</p>
                          <h2 className="blog-row-title">{item.title}</h2>
                          <p className="blog-row-text">
                            Tailored front-end development services that prioritize
                            performance, security, and an intuitive user experience.
                            These stories are powered by our in-house content engine and
                            curated for digital-first brands.
                          </p>
                          <button className="blog-row-button" type="button">
                            <span>Learn More</span>
                            <span className="blog-row-button-icon">→</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="blog-faqs-section">
        {/* Top gradient line */}
        <div className="blog-faqs-top-line"></div>
        
        <div className="blog-services-container">
          {/* Header Section - Separate */}
          <div className="blog-faqs-header-section">
            <div className="blog-faqs-header">
              <div className="blog-faqs-icon">
                <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Top face - Light green */}
                  <path d="M20 20L40 10L60 20L50 30L30 30Z" fill="#7effb2" stroke="#111" strokeWidth="2"/>
                  {/* Front face - Blue with U-shaped cutout */}
                  <path d="M20 20L30 30L30 50L20 50Z" fill="#7fd0ff" stroke="#111" strokeWidth="2"/>
                  <path d="M30 30L50 30L50 50L30 50Z" fill="#7fd0ff" stroke="#111" strokeWidth="2"/>
                  <path d="M50 30L60 20L60 50L50 50Z" fill="#7fd0ff" stroke="#111" strokeWidth="2"/>
                  {/* U-shaped cutout */}
                  <path d="M35 40L45 40L45 50L35 50Z" fill="#f0f0f2" stroke="#111" strokeWidth="1.5"/>
                  {/* Right side face - Light gray */}
                  <path d="M40 10L50 30L50 50L40 60L40 30Z" fill="#d0d0d0" stroke="#111" strokeWidth="2"/>
                  {/* Top edge */}
                  <path d="M20 20L40 10L60 20" stroke="#111" strokeWidth="2" fill="none"/>
                  {/* Front edges */}
                  <path d="M20 20L30 30" stroke="#111" strokeWidth="2" fill="none"/>
                  <path d="M50 30L60 20" stroke="#111" strokeWidth="2" fill="none"/>
                  <path d="M30 50L50 50" stroke="#111" strokeWidth="2" fill="none"/>
                  <path d="M20 50L30 50" stroke="#111" strokeWidth="2" fill="none"/>
                  <path d="M50 50L60 50" stroke="#111" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h2 className="blog-faqs-title">FAQs</h2>
              <div className="blog-faqs-dots">
                {Array.from({ length: 40 }).map((_, index) => (
                  <span key={index} className="blog-faqs-dot"></span>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs List Section */}
          <div className="blog-faqs-list">
            {[
              {
                question: "What services do you offer?",
                answer: "We offer comprehensive web development services including front-end development, back-end development, full-stack solutions, UI/UX design, and digital strategy consulting."
              },
              {
                question: "How long does a typical project take?",
                answer: "Project timelines vary based on scope and complexity. A typical website project takes 4-8 weeks, while larger applications may take 3-6 months. We provide detailed timelines during the initial consultation."
              },
              {
                question: "Do you provide ongoing support?",
                answer: "Yes, we offer ongoing maintenance and support packages to ensure your website or application stays up-to-date, secure, and performing optimally."
              },
              {
                question: "What is your development process?",
                answer: "Our process includes discovery and planning, design and prototyping, development and testing, deployment, and ongoing support. We maintain transparent communication throughout each phase."
              },
              {
                question: "Can you work with our existing team?",
                answer: "Absolutely! We excel at collaborating with in-house teams, providing expertise where needed and integrating seamlessly with your existing workflows and processes."
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                className={`blog-faq-item ${expandedFAQ === index ? 'blog-faq-item-expanded' : ''}`}
              >
                <button 
                  className="blog-faq-question" 
                  type="button"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  <span className="blog-faq-toggle">
                    {expandedFAQ === index ? '−' : '+'}
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div className="blog-faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Page-specific styles */}
      <style jsx global>{`
        .blog-services-hero {
          background: var(--tg-common-color-gray, #f0f0f2);
          border-top: 2px solid var(--tg-theme-secondary, #2551e7);
          border-bottom: 2px solid var(--tg-theme-secondary, #2551e7);
          padding: 80px 0 60px;
        }

        :global(.dark-theme) .blog-services-hero {
          background: var(--tg-dark-color-1, #181818);
          border-top-color: var(--tg-theme-secondary-light, #4d6feb);
          border-bottom-color: var(--tg-theme-secondary-light, #4d6feb);
        }

        .blog-services-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 0;
        }

        .blog-services-hero-grid {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
        }

        .blog-services-left {
          max-width: 360px;
        }

        .blog-pill {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 18px;
          border-radius: 10px;
          background: linear-gradient(90deg, #ff8bff 0%, #7effb2 50%, #7fd0ff 100%);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.08);
          margin-bottom: 28px;
          min-width: 210px;
        }

        .blog-pill-label {
          font-family: "Urbanist", system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.04em;
          color: #111;
        }

        .blog-pill-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-gap: 3px;
        }

        .blog-pill-dot {
          width: 4px;
          height: 4px;
          border-radius: 1px;
          background: #000;
        }

        .blog-hero-copy {
          font-size: 16px;
          line-height: 1.6;
          color: var(--tg-body-color, #111);
          max-width: 320px;
        }

        :global(.dark-theme) .blog-hero-copy {
          color: var(--tg-body-color, #aeaeae);
        }

        .blog-services-right {
          flex: 1;
          display: flex;
          justify-content: flex-end;
        }

        .blog-hero-heading {
          font-family: "Urbanist", system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
          font-size: clamp(3.2rem, 5vw, 4.8rem);
          font-weight: 900;
          letter-spacing: 0.02em;
          line-height: 1.05;
          text-align: right;
          color: var(--tg-heading-color, #111);
        }

        :global(.dark-theme) .blog-hero-heading {
          color: var(--tg-common-color-white, #fff);
        }

        .blog-hero-heading span {
          display: block;
        }

        .blog-list-section {
          background: var(--tg-common-color-gray, #f0f0f2);
          padding: 0;
          position: relative;
          overflow: visible;
          width: 100%;
        }

        .blog-horizontal-sticky-wrapper {
          position: sticky;
          top: 0;
          height: 100vh;
          width: 100%;
          overflow: hidden;
        }

        .blog-horizontal-track {
          height: 100%;
          will-change: transform;
        }

        .blog-services-container {
          position: relative;
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .blog-row {
          width: 95%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          padding: 0;
          border-radius: 40px;
          overflow: hidden;
          min-height: 550px;
          border: 1.5px solid var(--tg-theme-secondary, #2551e7);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.05);
          /* Direct control transitions are handled via inline styles for smoothness */
          transition: border-color 0.4s ease;
        }

        :global(.dark-theme) .blog-row {
          border-color: rgba(37, 81, 231, 0.4);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
        }

        .blog-row.active {
          border-color: var(--tg-theme-secondary, #2551e7);
        }

        :global(.dark-theme) .blog-row.active {
          border-color: var(--tg-theme-secondary-light, #4d6feb);
        }

        .blog-row-border-wrapper {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          gap: 60px;
          padding: 50px;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: 40px;
          transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .blog-row-image-wrap {
          flex: 1;
          display: flex;
          justify-content: center;
          opacity: 0;
          transform: translateX(-30px) scale(0.9);
          transition: border-color 0.4s ease;
          min-width: 45%;
        }

        .blog-row-content {
          flex: 1.2;
          opacity: 0;
          transform: translateX(30px) scale(0.9);
          transition: border-color 0.4s ease;
          padding-right: 20px;
        }

        .blog-row.active .blog-row-content {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        .blog-row.active .blog-row-image-wrap {
          opacity: 1;
          transform: translateX(0) scale(1);
        }

        :global(.dark-theme) .blog-row {
          background-color: var(--tg-dark-color-2, #222) !important;
        }

        .blog-row-image-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          width: 100%;
          max-width: 500px;
          aspect-ratio: 16/10;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
        }

        .blog-row-image {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.8s ease;
        }

        .blog-row:hover .blog-row-image {
          transform: scale(1.05);
        }

        .blog-row-meta {
          position: absolute;
          left: 20px;
          bottom: 18px;
          right: 20px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          padding: 12px 18px;
          border-radius: 999px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          color: #fff;
        }

        /* FAQs Section */
        :global(.dark-theme) .blog-list-section {
          background: var(--tg-dark-color-1, #181818);
        }

        .blog-faqs-section {
          background: var(--tg-common-color-gray, #f0f0f2);
          padding: 0;
          position: relative;
        }

        :global(.dark-theme) .blog-faqs-section {
          background: var(--tg-dark-color-1, #181818);
        }

        .blog-faqs-top-line {
          height: 2px;
          background: linear-gradient(to right, #7fd0ff 0%, #2551e7 100%);
          width: 100%;
        }

        .blog-faqs-header-section {
          padding: 80px 0 40px;
          border-bottom: 2px solid var(--tg-theme-secondary, #2551e7);
          margin-bottom: 60px;
        }

        :global(.dark-theme) .blog-faqs-header-section {
          border-bottom-color: var(--tg-theme-secondary-light, #4d6feb);
        }

        .blog-faqs-header {
          display: flex;
          align-items: center;
          gap: 30px;
          padding: 0 20px;
        }

        .blog-faqs-title {
          font-family: "Urbanist", sans-serif;
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--tg-heading-color, #111);
          margin: 0;
          flex: 1;
        }

        :global(.dark-theme) .blog-faqs-title {
          color: var(--tg-common-color-white, #fff);
        }

        .blog-faqs-dot {
          width: 6px;
          height: 6px;
          background: var(--tg-heading-color, #111);
          border-radius: 50%;
        }

        :global(.dark-theme) .blog-faqs-dot {
          background: var(--tg-common-color-white, #fff);
        }

        .blog-faq-item {
          background: var(--tg-common-color-white, #ffffff);
          border: 1px solid rgba(37, 81, 231, 0.1);
          border-radius: 24px;
          margin-bottom: 24px;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        :global(.dark-theme) .blog-faq-item {
          background: var(--tg-dark-color-2, #222);
          border-color: rgba(255, 255, 255, 0.08);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .blog-faq-item-expanded {
          border-color: var(--tg-theme-secondary, #2551e7);
          box-shadow: 0 20px 40px rgba(37, 81, 231, 0.08);
        }

        :global(.dark-theme) .blog-faq-item-expanded {
          border-color: var(--tg-theme-secondary-light, #4d6feb);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .blog-faq-question {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 30px 40px;
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
        }

        .blog-faq-question span:first-child {
          font-size: 20px;
          font-weight: 700;
          color: var(--tg-heading-color, #111);
          line-height: 1.4;
          font-family: "Urbanist", sans-serif;
        }

        :global(.dark-theme) .blog-faq-question span:first-child {
          color: var(--tg-common-color-white, #fff);
        }

        .blog-faq-toggle {
          font-size: 24px;
          color: var(--tg-theme-secondary, #2551e7);
          font-weight: 700;
        }

        :global(.dark-theme) .blog-faq-toggle {
          color: var(--tg-theme-secondary-light, #4d6feb);
        }

        .blog-faq-answer p {
          font-size: 17px;
          line-height: 1.7;
          color: var(--tg-body-color, #333);
          margin: 0;
          padding: 0 40px 30px;
        }

        @media (max-width: 991.98px) {
          .blog-row {
            flex-direction: column;
            gap: 40px;
            padding: 0;
            border-radius: 30px;
            width: 90%;
          }
          
          .blog-row-border-wrapper {
            flex-direction: column;
            padding: 40px 30px;
            gap: 30px;
          }

          .blog-row-image-wrap, .blog-row-content {
            min-width: 100%;
            padding-right: 0;
          }
        }

        @media (max-width: 767.98px) {
          .blog-row-border-wrapper {
            padding: 30px 20px;
          }
          
          .blog-faq-question {
            padding: 24px 20px;
          }
          
          .blog-faq-answer p {
            padding: 0 20px 24px;
          }
        }
      `}</style>
    </Layout>
  );
}


