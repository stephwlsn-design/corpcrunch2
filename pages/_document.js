import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html suppressHydrationWarning>
      <Head>
        {/* DNS Prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://ottoplatform-410578063330.us-central1.run.app" />

        {process.env.NODE_ENV === 'development' && (
          <script async src="http://localhost:8000/pixel.js?id=OTTO-PX-26CDE319"></script>
        )}
        <script async src="https://ottoplatform-410578063330.us-central1.run.app/pixel.js?id=OTTO-PX-8C2138ED"></script>
        <script async src="https://ottoplatform-410578063330.us-central1.run.app/pixel.js?id=OTTO-PX-FE92E881"></script>

        {/* Google Analytics (gtag.js) */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-8MJ7BXCFYK"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', {
                analytics_storage: 'denied',
                ad_storage: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });
              gtag('config', 'G-8MJ7BXCFYK', { anonymize_ip: true });
            `,
          }}
        />

        {/* Preconnect to font services for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Fonts with font-display: swap for better performance */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />

        {/* Critical CSS - served from public/assets/css/ at runtime */}
        {/* Note: 'Unable to locate stylesheet' in dev logs is harmless Next.js noise - CSS IS loaded correctly */}
        <link rel="stylesheet" href="/assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assets/css/main.css" />
        <link rel="stylesheet" href="/assets/css/modern-theme.css" />
        <link rel="stylesheet" href="/assets/css/modern-overrides.css" />

        {/* Preload other CSS for faster loading */}
        <link
          rel="preload"
          href="/assets/css/flaticon.css"
          as="style"
        />
        <link
          rel="preload"
          href="/assets/css/fontawesome-all.min.css"
          as="style"
        />
      </Head>
      <body suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('togglETHeme');
                  if (theme) {
                    var parsedTheme = JSON.parse(theme);
                    if (parsedTheme === 'dark-theme') {
                      document.documentElement.classList.add('dark-theme');
                      document.body.classList.add('dark-theme');
                    } else {
                      document.body.classList.add('light-theme');
                    }
                  } else {
                    document.body.classList.add('light-theme');
                  }
                } catch(e) {
                  document.body.classList.add('light-theme');
                }
                
                // Ensure CSS files are loaded - retry mechanism for multiple tabs
                var cssRetryCount = {};
                var maxRetries = 5;
                
                function ensureCSSLoaded() {
                  var cssFiles = [
                    '/assets/css/bootstrap.min.css',
                    '/assets/css/main.css',
                    '/assets/css/modern-theme.css',
                    '/assets/css/modern-overrides.css'
                  ];
                  
                  cssFiles.forEach(function(href) {
                    var link = document.querySelector('link[href="' + href + '"]');
                    var isLoaded = link && (link.sheet || link.href);
                    
                    if (!isLoaded) {
                      var retryKey = href;
                      cssRetryCount[retryKey] = (cssRetryCount[retryKey] || 0) + 1;
                      
                      if (cssRetryCount[retryKey] <= maxRetries) {
                        // CSS not loaded, try to load it
                        var newLink = document.createElement('link');
                        newLink.rel = 'stylesheet';
                        newLink.href = href + '?v=' + Date.now(); // Cache busting
                        newLink.onload = function() {
                          console.log('Successfully loaded: ' + href);
                          cssRetryCount[retryKey] = 0; // Reset on success
                        };
                        newLink.onerror = function() {
                          console.error('Failed to load: ' + href + ' (attempt ' + cssRetryCount[retryKey] + ')');
                          // Retry after increasing delay
                          var delay = Math.min(500 * cssRetryCount[retryKey], 2000);
                          setTimeout(function() {
                            ensureCSSLoaded();
                          }, delay);
                        };
                        
                        // Remove existing link if present
                        if (link && link.parentNode) {
                          link.parentNode.removeChild(link);
                        }
                        
                        document.head.appendChild(newLink);
                      } else {
                        console.error('Max retries reached for: ' + href);
                      }
                    } else {
                      // Reset retry count on success
                      cssRetryCount[href] = 0;
                    }
                  });
                }
                
                // Check CSS loading on DOM ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', ensureCSSLoaded);
                } else {
                  ensureCSSLoaded();
                }
                
                // Also check after delays to catch any race conditions with multiple tabs
                setTimeout(ensureCSSLoaded, 100);
                setTimeout(ensureCSSLoaded, 300);
                setTimeout(ensureCSSLoaded, 500);
                setTimeout(ensureCSSLoaded, 1000);
                
                // Periodic check for CSS (useful when multiple tabs are open)
                var checkInterval = setInterval(function() {
                  var allLoaded = true;
                  var cssFiles = [
                    '/assets/css/bootstrap.min.css',
                    '/assets/css/main.css',
                    '/assets/css/modern-theme.css',
                    '/assets/css/modern-overrides.css'
                  ];
                  
                  cssFiles.forEach(function(href) {
                    var link = document.querySelector('link[href*="' + href.split('/').pop() + '"]');
                    if (!link || !link.sheet) {
                      allLoaded = false;
                    }
                  });
                  
                  if (allLoaded) {
                    clearInterval(checkInterval);
                  } else {
                    ensureCSSLoaded();
                  }
                }, 2000);
                
                // Stop checking after 10 seconds
                setTimeout(function() {
                  clearInterval(checkInterval);
                }, 10000);
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
