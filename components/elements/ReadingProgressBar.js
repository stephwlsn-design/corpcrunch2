import { useState, useEffect } from 'react';

export default function ReadingProgressBar() {
  const [readingProgress, setReadingProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Only run on client side
    setIsMounted(true);
    
    const updateReadingProgress = () => {
      // Find the main article content container
      const articleContent = document.querySelector('.blog-details-content');
      if (!articleContent) {
        // Try again after a short delay if element not found
        setTimeout(updateReadingProgress, 200);
        return;
      }

      const windowHeight = window.innerHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Get the article's position and dimensions
      const rect = articleContent.getBoundingClientRect();
      const articleTop = scrollTop + rect.top;
      const articleHeight = rect.height;
      const articleBottom = articleTop + articleHeight;
      
      // Calculate progress (0% when article top reaches viewport top, 100% when article bottom reaches viewport top)
      let progress = 0;
      
      // If article hasn't entered viewport yet
      if (scrollTop + windowHeight < articleTop) {
        progress = 0;
      } 
      // If article has completely scrolled past
      else if (scrollTop > articleBottom) {
        progress = 100;
      } 
      // Article is in viewport - calculate progress
      else {
        // How far into the article we've scrolled
        const scrolledIntoArticle = scrollTop + windowHeight - articleTop;
        // Total distance to scroll through the article
        const totalScrollDistance = articleHeight + windowHeight;
        progress = Math.min(100, Math.max(0, (scrolledIntoArticle / totalScrollDistance) * 100));
      }
      
      setReadingProgress(progress);
    };

    // Use requestAnimationFrame for smoother updates
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateReadingProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Update on scroll
    window.addEventListener('scroll', onScroll, { passive: true });
    // Update on resize
    window.addEventListener('resize', updateReadingProgress);
    // Initial update with delays to ensure DOM is ready
    setTimeout(updateReadingProgress, 100);
    setTimeout(updateReadingProgress, 500);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateReadingProgress);
    };
  }, []);

  // Don't render on server side to avoid hydration mismatch
  if (!isMounted) {
    return null;
  }

  return (
    <div className="reading-progress-bar">
      <div 
        className="reading-progress-fill" 
        style={{ width: `${readingProgress}%` }}
      />
      <style jsx>{`
        .reading-progress-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: rgba(0, 0, 0, 0.1);
          z-index: 9999;
          transition: none;
        }
        
        .reading-progress-fill {
          height: 100%;
          background: #ff0292;
          transition: width 0.1s ease-out;
          box-shadow: 0 0 10px rgba(255, 2, 146, 0.5);
        }
      `}</style>
    </div>
  );
}

