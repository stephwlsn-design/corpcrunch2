import useCompanies from "@/hooks/useCompanies";
import useCategory from "@/hooks/useCategory";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import dynamic from "next/dynamic";
import "react-multi-carousel/lib/styles.css";
import { getCategoryUrl } from "@/util/urlHelpers";
import { useAuth } from "@/contexts/AuthContext";

const ThemeSwitch = dynamic(() => import("@/components/elements/ThemeSwitch"), {
  ssr: false,
});

export default function Sidebar({ handleSidebarClose }) {
  let { data: companies } = useCompanies();
  const sliderRef = useRef(null);
  const { data: categories, refetch: fetchCategories } = useCategory({ enabled: false });
  const [isUserLogin, setIsUserLogin] = useState(false);
  const { requireAuth } = useAuth();

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

  // Icon map for known categories — add more as needed
  const categoryIconMap = {
    'technology': 'fas fa-microchip',
    'automobile': 'fas fa-car',
    'sustainability': 'fas fa-leaf',
    'retail': 'fas fa-shopping-bag',
    'fmcg': 'fas fa-box',
    'finance': 'fas fa-chart-line',
    'politics': 'fas fa-landmark',
    'science': 'fas fa-flask',
    'telecom': 'fas fa-broadcast-tower',
    'events': 'fas fa-calendar-alt',
    'health': 'fas fa-heartbeat',
    'healthcare': 'fas fa-heartbeat',
    'education': 'fas fa-graduation-cap',
    'real estate': 'fas fa-building',
    'real-estate': 'fas fa-building',
    'energy': 'fas fa-bolt',
    'agriculture': 'fas fa-seedling',
    'media': 'fas fa-newspaper',
    'entertainment': 'fas fa-film',
    'logistics': 'fas fa-truck',
    'travel': 'fas fa-plane',
    'lifestyle': 'fas fa-star',
    'sports': 'fas fa-futbol',
    'legal': 'fas fa-balance-scale',
    'manufacturing': 'fas fa-industry',
    'aerospace': 'fas fa-rocket',
    'cybersecurity': 'fas fa-shield-alt',
    'cyber security': 'fas fa-shield-alt',
    'ai': 'fas fa-robot',
    'blockchain': 'fas fa-cubes',
    'startup': 'fas fa-rocket',
    'startups': 'fas fa-rocket',
    'hr': 'fas fa-users',
    'human resources': 'fas fa-users',
    'marketing': 'fas fa-bullhorn',
    'food': 'fas fa-utensils',
    'pharma': 'fas fa-pills',
    'pharmaceuticals': 'fas fa-pills',
    'insurance': 'fas fa-umbrella',
    'banking': 'fas fa-university',
    'e-commerce': 'fas fa-shopping-cart',
    'ecommerce': 'fas fa-shopping-cart',
    'environment': 'fas fa-globe-americas',
    'defence': 'fas fa-shield-alt',
    'defense': 'fas fa-shield-alt',
    'mining': 'fas fa-hard-hat',
    'chemicals': 'fas fa-vial',
    'aviation': 'fas fa-plane-departure',
    'infrastructure': 'fas fa-road',
    'default': 'fas fa-tag',
  };

  const getCategoryIcon = (name = '') => {
    const key = name.toLowerCase().trim();
    return categoryIconMap[key] || categoryIconMap['default'];
  };

  const getCategoryHref = (category) => {
    if (category.name?.toLowerCase() === 'events') return '/events';
    return getCategoryUrl(category);
  };

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

          {/* Categories Section — fully dynamic from API */}
          <div className="mb-4">
            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#333' }}>Explore Categories</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              {(!categories || categories.length === 0) ? (
                <p style={{ fontSize: '13px', color: '#999', gridColumn: '1 / -1' }}>Loading categories...</p>
              ) : (
                categories.map((category) => (
                  <Link
                    key={category.id || category._id || category.name}
                    href={getCategoryHref(category)}
                    onClick={(e) => {
                      if (!requireAuth(getCategoryHref(category))) {
                        e.preventDefault();
                        return;
                      }
                      handleSidebarClose();
                    }}
                    className="category-item-clean"
                    style={{
                      display: 'flex', gap: '10px', alignItems: 'center',
                      padding: '9px 12px', borderRadius: '8px',
                      backgroundColor: '#fcfcfc', border: '1px solid #f0f0f0',
                      textDecoration: 'none', transition: 'all 0.2s ease'
                    }}
                  >
                    <i className={getCategoryIcon(category.name)} style={{ color: '#2551e7', fontSize: '13px', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#444' }}>{category.name}</span>
                  </Link>
                ))
              )}
              {/* Always show Events — it's a standalone page not in the API categories */}
              {(!categories || !categories.some(c => c.name?.toLowerCase() === 'events')) && (
                <Link
                  href="/events"
                  onClick={(e) => {
                    if (!requireAuth('/events')) {
                      e.preventDefault();
                      return;
                    }
                    handleSidebarClose();
                  }}
                  className="category-item-clean"
                  style={{
                    display: 'flex', gap: '10px', alignItems: 'center',
                    padding: '9px 12px', borderRadius: '8px',
                    backgroundColor: '#fcfcfc', border: '1px solid #f0f0f0',
                    textDecoration: 'none', transition: 'all 0.2s ease'
                  }}
                >
                  <i className="fas fa-calendar-alt" style={{ color: '#2551e7', fontSize: '13px', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#444' }}>Events</span>
                </Link>
              )}
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