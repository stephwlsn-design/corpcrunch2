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

  if (!companies) {
    return null;
  }

  const groupCompaniesInPairs = (companies) => {
    const pairs = [];
    for (let i = 0; i < companies.length; i += 2) {
      pairs.push(companies.slice(i, i + 2));
    }
    return pairs;
  };

  const companyPairs = groupCompaniesInPairs(companies);

  const carouselConfig = {
    additionalTransfrom: 0,
    arrows: false,
    autoPlaySpeed: 3000,
    centerMode: false,
    className: "",
    containerClass: "container-padding-bottom",
    dotListClass: "",
    draggable: true,
    focusOnSelect: false,
    infinite: false,
    itemClass: "",
    keyBoardControl: true,
    minimumTouchDrag: 80,
    renderButtonGroupOutside: false,
    renderDotsOutside: false,
    responsive: {
      all: {
        breakpoint: { max: 4000, min: 0 },
        items: 3,
        slidesToSlide: 2,
      },
    },
    showDots: false,
    sliderClass: "",
    swipeable: true,
  };

  return (
    <>
      <div className="offCanvas__wrap">
        <div className="offCanvas__body">
          <div className="offCanvas__toggle" onClick={handleSidebarClose}>
            <i
              className="flaticon-addition"
              style={{
                margin: "auto",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                color: "#2551e7",
                fontSize: "20px",
                cursor: "pointer"
              }}
            />
          </div>
          <div className="offCanvas__content" style={{ padding: '5px 0' }}>
            <div
              className="offCanvas__logo logo"
              style={{ position: "relative", marginBottom: '8px' }}
            >
              <Link href="/" scroll={true} className=" logo-dark">
                <img
                  style={{ width: "100%" }}
                  src="/assets/img/logo/logo.png"
                  alt="Logo"
                />
              </Link>
              <Link href="/" scroll={true} className="logo-light">
                <img
                  style={{ width: "100%" }}
                  src="/assets/img/logo/w_logo.png"
                  alt="Logo"
                />
              </Link>
            </div>
          </div>
          
          {/* Theme Switcher and User Profile - Top Section */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid rgba(37, 81, 231, 0.3)',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ThemeSwitch />
            </div>
            {isUserLogin ? (
              <Link 
                href="/profile" 
                scroll={true}
                onClick={handleSidebarClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(37, 81, 231, 0.3)',
                  color: '#2551e7',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '2px solid #2551e7'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2551e7';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 81, 231, 0.3)';
                  e.currentTarget.style.color = '#2551e7';
                }}
              >
                <i className="fas fa-user" style={{ fontSize: '16px' }} />
              </Link>
            ) : (
              <Link 
                href="/signin" 
                scroll={true}
                onClick={handleSidebarClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(37, 81, 231, 0.3)',
                  color: '#2551e7',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  border: '2px solid #2551e7'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2551e7';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(37, 81, 231, 0.3)';
                  e.currentTarget.style.color = '#2551e7';
                }}
              >
                <i className="fas fa-user" style={{ fontSize: '16px' }} />
              </Link>
            )}
          </div>
          
          {/* Categories Section */}
          <div className="sidebar-categories-section" style={{ marginTop: '15px', marginBottom: '15px' }}>
            <h4 className="title" style={{ marginBottom: '12px', fontSize: '18px', fontWeight: 'bold', color: '#2551e7' }}>Categories</h4>
            <div className="categories-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '8px',
              marginBottom: '12px'
            }}>
              {(() => {
                // Define all categories with icons and descriptions
                const categoryConfig = {
                  'Technology': { icon: 'fas fa-microchip', desc: 'Innovations and trends' },
                  'Automobile': { icon: 'fas fa-car', desc: 'Automotive industry news' },
                  'Sustainability': { icon: 'fas fa-leaf', desc: 'Environmental initiatives' },
                  'SportsTech': { icon: 'fas fa-running', desc: 'Sports technology' },
                  'Retail': { icon: 'fas fa-shopping-bag', desc: 'Retail industry updates' },
                  'FMCG': { icon: 'fas fa-box', desc: 'Fast-moving consumer goods' },
                  'Finance': { icon: 'fas fa-chart-line', desc: 'Financial news and insights' },
                  'Politics': { icon: 'fas fa-landmark', desc: 'Latest political news' },
                  'Science': { icon: 'fas fa-flask', desc: 'Scientific discoveries' },
                  'Telecom': { icon: 'fas fa-broadcast-tower', desc: 'Telecommunications' },
                  'Events': { icon: 'fas fa-calendar-alt', desc: 'Corp Crunch IPs' },
                };

                // Get category slugs/IDs from API response
                const getCategoryLink = (categoryName) => {
                  if (categoryName === 'Events') {
                    return '/events';
                  }
                  if (categories && Array.isArray(categories)) {
                    const found = categories.find(cat => 
                      cat.name?.toLowerCase() === categoryName.toLowerCase()
                    );
                    if (found) {
                      return `/category/${found.id || found._id}`;
                    }
                  }
                  // Fallback to slug-based URL
                  const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
                  return `/category/${slug}`;
                };

                const categoryOrder = [
                  'Technology', 'Automobile', 'Sustainability', 'SportsTech', 
                  'Retail', 'FMCG', 'Finance', 'Politics', 'Science', 
                  'Telecom', 'Events'
                ];

                return categoryOrder.map((catName) => {
                  const config = categoryConfig[catName] || { icon: 'fas fa-folder', desc: 'Category' };
                  return (
                    <Link 
                      key={catName}
                      href={getCategoryLink(catName)}
                      scroll={true}
                      onClick={handleSidebarClose}
                      className="category-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '12px 10px',
                        backgroundColor: 'rgba(37, 81, 231, 0.1)',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        color: '#2551e7',
                        transition: 'all 0.3s ease',
                        border: '1px solid rgba(37, 81, 231, 0.3)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(37, 81, 231, 0.3)';
                        e.currentTarget.style.borderColor = '#2551e7';
                        e.currentTarget.style.backgroundColor = 'rgba(37, 81, 231, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                        e.currentTarget.style.borderColor = 'rgba(37, 81, 231, 0.3)';
                        e.currentTarget.style.backgroundColor = 'rgba(37, 81, 231, 0.1)';
                      }}
                    >
                      <div style={{ 
                        position: 'relative',
                        width: '50px', 
                        height: '50px', 
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{ 
                          position: 'absolute',
                          top: '0',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '20px', 
                          height: '20px', 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(37, 81, 231, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '1px solid rgba(37, 81, 231, 0.4)',
                          zIndex: 2
                        }}>
                          <i className="fas fa-check" style={{ fontSize: '10px', color: '#2551e7' }} />
                        </div>
                        <div style={{ 
                          width: '42px', 
                          height: '42px', 
                          borderRadius: '50%', 
                          backgroundColor: 'rgba(37, 81, 231, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '8px',
                          border: '1px solid rgba(37, 81, 231, 0.3)'
                        }}>
                          <i className={config.icon} style={{ fontSize: '20px', color: '#2551e7' }} />
                        </div>
                      </div>
                      <h5 style={{ 
                        margin: '0 0 4px 0', 
                        fontSize: '14px', 
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#2551e7'
                      }}>
                        {catName}
                      </h5>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '11px', 
                        color: '#2551e7',
                        opacity: 0.8,
                        textAlign: 'center',
                        lineHeight: '1.3'
                      }}>
                        {config.desc}
                      </p>
                    </Link>
                  );
                });
              })()}
            </div>
            
            {/* AIX and C3 as subcategories under Events */}
            <div style={{ marginTop: '15px', paddingLeft: '10px' }}>
              <h5 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#2551e7' }}>Events</h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link 
                  href="/events/aix"
                  scroll={true}
                  onClick={handleSidebarClose}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(37, 81, 231, 0.1)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#2551e7',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(37, 81, 231, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2551e7';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(37, 81, 231, 0.1)';
                  e.currentTarget.style.color = '#2551e7';
                  }}
                >
                  AIX
                </Link>
                <Link 
                  href="/events/c3-corp-crunch-connect"
                  scroll={true}
                  onClick={handleSidebarClose}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(37, 81, 231, 0.1)',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#2551e7',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(37, 81, 231, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2551e7';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(37, 81, 231, 0.1)';
                  e.currentTarget.style.color = '#2551e7';
                  }}
                >
                  C3 Corp Crunch Connect
                </Link>
              </div>
            </div>
          </div>

          {companies && companies.length > 0 && (
            <div style={{ marginTop: '15px' }}>
              <div className="d-flex align-items-center" style={{ marginBottom: '10px' }}>
                <h4 className="me-auto" style={{ color: '#2551e7' }}>Companies</h4>
                <div className="company-pairs-arrows">
                  <i
                    className="fas fa-arrow-left pointer"
                    onClick={() => sliderRef.current.previous()}
                    style={{ color: '#2551e7', cursor: 'pointer', fontSize: '16px', marginRight: '10px' }}
                  ></i>
                  <i
                    className="fas fa-arrow-right pointer"
                    onClick={() => sliderRef.current.next()}
                    style={{ color: '#2551e7', cursor: 'pointer', fontSize: '16px' }}
                  ></i>
                </div>
              </div>
              <Carousel
                {...carouselConfig}
                ref={sliderRef}
                className={"company-pairs"}
              >
                {companyPairs.map((pair, index) => (
                  <div key={index} className="company-pair">
                    {pair.map(({ id, name, logoUrl }) => (
                      <Link key={id} href={`/company/${id}`} scroll={true}>
                        <div
                          className="company-logo"
                          onClick={handleSidebarClose}
                        >
                          <img alt={name} src={logoUrl} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ))}
              </Carousel>
            </div>
          )}
          <div className="offCanvas__contact" style={{ marginTop: '15px', paddingTop: '15px' }}>
            <h4 className="title" style={{ marginBottom: '12px', fontSize: '16px', color: '#2551e7' }}>Get In Touch</h4>
            <ul className="offCanvas__contact-list list-wrap">
              <li>
                <i className="fas fa-envelope-open" style={{ color: '#2551e7' }} />
                <a href="mailto:scoop@corpcrunch.io" style={{ color: '#2551e7' }}>scoop@corpcrunch.io</a>
              </li>
              <li>
                <i className="fas fa-phone" style={{ color: '#2551e7' }} />
                <span style={{ color: '#2551e7' }}>+91 7769892323</span>
              </li>
              <li>
                <i className="fas fa-location" style={{ color: '#2551e7' }} />
                <span style={{ color: '#2551e7' }}>Pune, India 411015</span>
              </li>
            </ul>
            <ul className="offCanvas__social list-wrap">
              <li>
                <Link
                  target="_blank"
                  href="https://whatsapp.com/channel/0029Vac97ss7YSd6L5d8HO0V"
                  style={{ color: '#2551e7' }}
                >
                  <i className="fab fa-whatsapp" style={{ color: '#2551e7' }} />
                </Link>
              </li>
              <li>
                <Link
                  target="_blank"
                  href="https://www.facebook.com/people/Corp-Crunch/61558752871099/"
                  style={{ color: '#2551e7' }}
                >
                  <i className="fab fa-facebook-f" style={{ color: '#2551e7' }} />
                </Link>
              </li>
              <li>
                <Link
                  target="_blank"
                  href="https://www.linkedin.com/company/corpcrunch/"
                  style={{ color: '#2551e7' }}
                >
                  <i className="fab fa-linkedin-in" style={{ color: '#2551e7' }} />
                </Link>
              </li>
              <li>
                <Link
                  target="_blank"
                  href="https://www.youtube.com/@Corp.Crunch"
                  style={{ color: '#2551e7' }}
                >
                  <i className="fab fa-youtube" style={{ color: '#2551e7' }} />
                </Link>
              </li>
              <li>
                <Link
                  target="_blank"
                  href="https://www.instagram.com/corp.crunch/"
                  style={{ color: '#2551e7' }}
                >
                  <i className="fab fa-instagram" style={{ color: '#2551e7' }} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="offCanvas__overlay" onClick={handleSidebarClose} />
    </>
  );
}
