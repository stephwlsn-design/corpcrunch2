import React from 'react';

export default function SocialShareRibbon() {
  return (
    <>
      <style jsx global>{`
        .home-social-ribbon {
          position: fixed !important;
          left: 20px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 999 !important;
          pointer-events: auto;
        }
        .home-social-ribbon ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .home-social-ribbon ul li {
          margin-bottom: 14px;
        }
        .home-social-ribbon ul li:last-child {
          margin-bottom: 0;
        }
        .home-social-ribbon .social-share-btn {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 50px !important;
          height: 50px !important;
          box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.06) !important;
          background: #ffffff !important;
          border-radius: 50% !important;
          color: #333 !important;
          text-decoration: none !important;
          border: none !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
        }
        :global(.dark-theme) .home-social-ribbon .social-share-btn {
          background: #222 !important;
          color: #fff !important;
          box-shadow: 0px 16px 32px 0px rgba(0, 0, 0, 0.3) !important;
        }
        .home-social-ribbon .social-share-btn:hover {
          background: var(--tg-theme-primary) !important;
          color: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn:hover i {
          color: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn:hover span {
          color: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn i {
          font-size: 20px !important;
          color: #000000 !important;
          transition: all 0.3s ease !important;
        }
        :global(.dark-theme) .home-social-ribbon .social-share-btn i {
          color: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn span {
          font-size: 20px !important;
          font-weight: bold !important;
          line-height: 1;
          color: #000000 !important;
          transition: all 0.3s ease !important;
        }
        :global(.dark-theme) .home-social-ribbon .social-share-btn span {
          color: #ffffff !important;
        }
        .home-social-ribbon .social-share-btn img {
          transition: all 0.3s ease !important;
        }
        @media (max-width: 768px) {
          .home-social-ribbon {
            display: none;
          }
        }
      `}</style>
      <div className="home-social-ribbon">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>
            <a 
              href="https://www.facebook.com/corpcrunch"
              target="_blank"
              rel="noopener noreferrer"
              className="social-share-btn"
              title="Follow us on Facebook"
            >
              <i className="fab fa-facebook-f"></i>
            </a>
          </li>
          <li>
            <a 
              href="https://twitter.com/corpcrunch"
              target="_blank"
              rel="noopener noreferrer"
              className="social-share-btn"
              title="Follow us on X (Twitter)"
            >
              <img
                src="/assets/img/others/X logo.png"
                alt="X"
                width="50"
                height="50"
                style={{ display: "block", width: "50px", height: "50px", objectFit: "contain" }}
              />
            </a>
          </li>
          <li>
            <a 
              href="https://www.linkedin.com/company/corpcrunch"
              target="_blank"
              rel="noopener noreferrer"
              className="social-share-btn"
              title="Follow us on LinkedIn"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
          </li>
          <li>
            <a 
              href="https://www.instagram.com/corpcrunch"
              target="_blank"
              rel="noopener noreferrer"
              className="social-share-btn"
              title="Follow us on Instagram"
            >
              <i className="fab fa-instagram"></i>
            </a>
          </li>
          <li>
            <a 
              href="https://www.youtube.com/@corpcrunch"
              target="_blank"
              rel="noopener noreferrer"
              className="social-share-btn"
              title="Subscribe to our YouTube channel"
            >
              <i className="fab fa-youtube"></i>
            </a>
          </li>
          <li>
            <a 
              href="https://www.behance.net/corpcrunch"
              target="_blank"
              rel="noopener noreferrer"
              className="social-share-btn"
              title="View our work on Behance"
            >
              <span>Bē</span>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}

