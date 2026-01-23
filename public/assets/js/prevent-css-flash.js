/**
 * Prevent CSS Flash of Unstyled Content (FOUC)
 * This script ensures CSS is loaded before content is displayed
 */
(function() {
  // Check if CSS is loaded
  function isCSSLoaded() {
    const stylesheets = document.styleSheets;
    if (stylesheets.length === 0) return false;
    
    try {
      // Check if critical stylesheets are loaded
      let criticalLoaded = 0;
      for (let i = 0; i < stylesheets.length; i++) {
        const sheet = stylesheets[i];
        try {
          if (sheet.cssRules && sheet.cssRules.length > 0) {
            criticalLoaded++;
          }
        } catch (e) {
          // Cross-origin stylesheet, assume loaded
          criticalLoaded++;
        }
      }
      return criticalLoaded > 0;
    } catch (e) {
      return false;
    }
  }

  // Wait for CSS to load
  function waitForCSS(callback, maxWait = 5000) {
    const startTime = Date.now();
    
    function check() {
      if (isCSSLoaded() || Date.now() - startTime > maxWait) {
        callback();
      } else {
        requestAnimationFrame(check);
      }
    }
    
    check();
  }

  // Hide body until CSS is loaded
  if (document.readyState === 'loading') {
    document.documentElement.style.visibility = 'hidden';
    
    waitForCSS(function() {
      document.documentElement.style.visibility = '';
      // Remove any inline styles that might interfere
      document.documentElement.removeAttribute('style');
    });
  }
})();

