import useCompanies from "@/hooks/useCompanies";
import useCategory from "@/hooks/useCategory";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import dynamic from "next/dynamic";
import "react-multi-carousel/lib/styles.css";

const ThemeSwitch = dynamic(() => import("@/components/elements/ThemeSwitch"), {
  ssr: false,
});

export default function Sidebar({ handleSidebarClose }) {
  let { data: companies } = useCompanies();
  const sliderRef = useRef(null);
  const { data: categories, refetch: fetchCategories } = useCategory({ enabled: false });
  const [isUserLogin, setIsUserLogin] = useState(false);

  useEffect(() => {
    fetchCategories();
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      setIsUserLogin(!!token);
    }
  }, []);

  if (!companies) return null;

  const groupCompaniesInPairs = (companies) => {
    const pairs = [];
    for (let i = 0; i < companies.length; i += 2) {
      pairs.push(companies.slice(i, i + 2));
    }
    return pairs;
  };

  const companyPairs = groupCompaniesInPairs(companies);

  const carouselConfig = {
    arrows: false,
    infinite: false,
    draggable: true,
    swipeable: true,
    responsive: {
      all: { breakpoint: { max: 4000, min: 0 }, items: 3, slidesToSlide: 2 },
    },
  };

  const categoryConfig = {
    'Technology': { icon: 'fas fa-microchip', desc: 'Innovations' },
    'Automobile': { icon: 'fas fa-car', desc: 'Automotive' },
    'Sustainability': { icon: 'fas fa-leaf', desc: 'Environmental' },

    'Retail': { icon: 'fas fa-shopping-bag', desc: 'Commerce' },
    'FMCG': { icon: 'fas fa-box', desc: 'Consumer Goods' },
    'Finance': { icon: 'fas fa-chart-line', desc: 'Markets' },
    'Politics': { icon: 'fas fa-landmark', desc: 'Governance' },
    'Science': { icon: 'fas fa-flask', desc: 'Discoveries' },
    'Telecom': { icon: 'fas fa-broadcast-tower', desc: 'Connectivity' },
    'Events': { icon: 'fas fa-calendar-alt', desc: 'Meetups' },
  };

  const getCategoryLink = (categoryName) => {
    if (categoryName === 'Events') return '/events';
    if (categories && Array.isArray(categories)) {
      const found = categories.find(cat => cat.name?.toLowerCase() === categoryName.toLowerCase());
      if (found) return `/category/${found.id || found._id}`;
    }
    return `/category/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
  };

  const categoryOrder = Object.keys(categoryConfig);

  return (
    <>
      <div className="offCanvas__wrap">
        <div className="offCanvas__body" style={{ padding: '25px' }}>
          {/* Header */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="logo" style={{ maxWidth: '150px' }}>
              <Link href="/" className="logo-dark">
                <img src="/assets/img/logo/logo.png" alt="Logo" />
              </Link>
              <Link href="/" className="logo-light">
                <img src="/assets/img/logo/w_logo.png" alt="Logo" />
              </Link>
            </div>
            <div onClick={handleSidebarClose} style={{ cursor: 'pointer', color: '#2551e7', fontSize: '24px' }}>
              <i className="flaticon-addition" style={{ transform: 'rotate(45deg)', display: 'block' }} />
            </div>
          </div>

          {/* User & Theme Actions */}
          <div className="d-flex align-items-center justify-content-between mb-4 pb-3" style={{ borderBottom: '1px solid #eee' }}>
            <ThemeSwitch />
            <div className="d-flex align-items-center gap-2">
              <Link
                href={isUserLogin ? "/profile" : "/signin"}
                onClick={handleSidebarClose}
                style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: '#f8f9fa', border: '1px solid #eee', color: '#2551e7'
                }}
              >
                <i className="fas fa-user" />
              </Link>
              {isUserLogin && (
                <button
                  onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("adminToken");
                    window.location.href = "/signin";
                  }}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: '#fff0f0', border: '1px solid #ffcccc', color: '#dc3545',
                    cursor: 'pointer'
                  }}
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-4">
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#333' }}>Explore Categories</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {categoryOrder.map((catName) => {
                const config = categoryConfig[catName];
                return (
                  <Link
                    key={catName}
                    href={getCategoryLink(catName)}
                    onClick={handleSidebarClose}
                    className="category-item-clean"
                    style={{
                      display: 'flex', gap: '12px', alignItems: 'center',
                      padding: '12px', borderRadius: '8px',
                      backgroundColor: '#fcfcfc', border: '1px solid #f0f0f0',
                      textDecoration: 'none', transition: 'all 0.2s ease'
                    }}
                  >
                    <i className={config.icon} style={{ color: '#2551e7', fontSize: '16px' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#444' }}>{catName}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Companies Section */}
          {companies?.length > 0 && (
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#333', margin: 0 }}>Featured Companies</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => sliderRef.current.previous()} style={{ background: 'none', border: 'none', color: '#2551e7' }}>
                    <i className="fas fa-chevron-left" />
                  </button>
                  <button onClick={() => sliderRef.current.next()} style={{ background: 'none', border: 'none', color: '#2551e7' }}>
                    <i className="fas fa-chevron-right" />
                  </button>
                </div>
              </div>
              <Carousel {...carouselConfig} ref={sliderRef}>
                {companyPairs.map((pair, index) => (
                  <div key={index} className="d-flex flex-column gap-2 px-1">
                    {pair.map(({ id, name, logoUrl }) => (
                      <Link key={id} href={`/company/${id}`} onClick={handleSidebarClose}>
                        <div style={{
                          padding: '10px', borderRadius: '8px', border: '1px solid #eee',
                          display: 'flex', justifyContent: 'center', backgroundColor: '#fff'
                        }}>
                          <img alt={name} src={logoUrl} style={{ height: '25px', width: 'auto', objectFit: 'contain' }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </Carousel>
            </div>
          )}

          {/* Contact Section */}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '15px' }}>Contact</h4>
            <ul className="list-wrap" style={{ fontSize: '13px', color: '#666', padding: 0 }}>
              <li className="mb-2"><i className="fas fa-envelope me-2" style={{ color: '#2551e7' }} /> scoop@corpcrunch.io</li>
              <li className="mb-2"><i className="fas fa-phone me-2" style={{ color: '#2551e7' }} /> +91 7769892323</li>
              <li className="mb-2"><i className="fas fa-map-marker-alt me-2" style={{ color: '#2551e7' }} /> Dubai, UAE</li>
            </ul>

          </div>
        </div>
      </div>
      <div className="offCanvas__overlay" onClick={handleSidebarClose} />

      <style jsx>{`
        .category-item-clean:hover {
          background-color: #f0f4ff !important;
          border-color: #2551e7 !important;
          transform: translateY(-1px);
        }
      `}</style>
    </>
  );
}