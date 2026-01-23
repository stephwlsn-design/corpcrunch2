import Image from "next/image";

export default function HeroBanner() {
  return (
    <>
      <section className="hero-banner-area">
        <div className="container">
          <div className="hero-banner-content">
            <div className="hero-banner-logo">
              {/* Black Logo for Day Theme (Light Background) */}
              <Image
                src="/assets/img/logo/Corp Crunch Black Logo.png"
                alt="Corp Crunch"
                width={1200}
                height={400}
                className="hero-logo hero-logo-day"
                priority
                quality={85}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                style={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "1200px",
                  objectFit: "contain",
                }}
              />
              {/* White Logo for Night Theme (Dark Background) */}
              <Image
                src="/assets/img/logo/Corp Crunch White Logo.png"
                alt="Corp Crunch"
                width={1200}
                height={400}
                className="hero-logo hero-logo-night"
                priority
                quality={85}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                style={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "1200px",
                  objectFit: "contain",
                }}
              />
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`
        .hero-banner-area {
          width: 100%;
          padding: 0 0;
          background: transparent;
          position: relative;
          margin: 0;
          margin-bottom: 0 !important;
        }
        .hero-banner-content {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }
        .hero-banner-logo {
          width: 100%;
          max-width: 1200px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .hero-logo {
          transition: opacity 0.3s ease;
        }
        /* Day theme (light background) - show black logo */
        .hero-logo-night {
          display: none !important;
        }
        .hero-logo-day {
          display: block !important;
        }
        /* Night theme (dark background) - show white logo */
        :global(.dark-theme) .hero-logo-night {
          display: block !important;
        }
        :global(.dark-theme) .hero-logo-day {
          display: none !important;
        }
        @media (max-width: 991.98px) {
          .hero-banner-area {
            padding: 60px 0;
          }
          .hero-banner-logo {
            max-width: 800px;
          }
        }
        @media (max-width: 767.98px) {
          .hero-banner-area {
            padding: 40px 0;
          }
          .hero-banner-logo {
            max-width: 100%;
            padding: 0 20px;
          }
        }
      `}</style>
    </>
  );
}
