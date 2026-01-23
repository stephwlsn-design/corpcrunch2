import Link from "next/link";
import React from "react";
import LanguageSelector from "@/components/elements/LanguageSelector";

function HeaderTop() {
  return (
    <div className="header__top">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6 col-md-6 col-sm-12">
          <div className="header__top-logo logo text-lg-center d-flex justify-content-center align-items-center">
              <Link href="/" className="corp-crunch-logo">
                <img
                  src="/assets/img/logo/Corp Crunch Black Logo.png"
                  alt="Corp Crunch - Your daily scoop of corporate intel."
                  className="corp-crunch-logo-img logo-dark"
                  style={{ 
                    maxWidth: "100%", 
                    height: "auto",
                    maxHeight: "200px",
                    objectFit: "contain"
                  }}
                />
                <img
                  src="/assets/img/logo/Corp Crunch White Logo.png"
                  alt="Corp Crunch - Your daily scoop of corporate intel."
                  className="corp-crunch-logo-img logo-light"
                  style={{ 
                    maxWidth: "100%", 
                    height: "auto",
                    maxHeight: "200px",
                    objectFit: "contain",
                    display: "none"
                  }}
              />
            </Link>
              <style jsx>{`
                .corp-crunch-logo {
                  text-decoration: none;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                }
                .corp-crunch-logo-img {
                  transition: opacity 0.3s ease;
                }
                .logo-light {
                  display: none !important;
                }
                :global(.dark-theme) .logo-dark {
                  display: none !important;
                }
                :global(.dark-theme) .logo-light {
                  display: block !important;
                }
                @media (max-width: 767.98px) {
                  .corp-crunch-logo-img {
                    max-height: 150px;
                  }
                }
              `}</style>
            </div>
          </div>
          <div className="col-lg-6 col-md-6 col-sm-12">
            <div className="header__top-right d-flex justify-content-end align-items-center" style={{ padding: "10px 0" }}>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeaderTop;
