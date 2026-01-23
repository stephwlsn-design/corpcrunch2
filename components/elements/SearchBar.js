import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axiosInstance from "@/util/axiosInstance";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { getBlogPostUrl } from "@/util/urlHelpers";

export default function SearchBar() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Fetch all posts for search
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const searchPosts = async () => {
        try {
          const language = typeof window !== 'undefined' 
            ? (document.cookie.match(/language=([^;]+)/)?.[1] || 'en')
            : 'en';
          const response = await axiosInstance.get("/posts", {
            params: { lang: language }
          });
          const allPosts = [
            ...(response?.frontPagePosts || []),
            ...(response?.trendingPosts || [])
          ];

          // Filter posts based on search query
          const query = searchQuery.toLowerCase();
          const filtered = allPosts.filter((post) => {
            const title = (post.title || "").toLowerCase();
            const content = (post.content || "").toLowerCase();
            const category = (post.Category?.name || "").toLowerCase();
            const excerpt = (post.excerpt || "").toLowerCase();
            
            return (
              title.includes(query) ||
              content.includes(query) ||
              category.includes(query) ||
              excerpt.includes(query)
            );
          });

          // Limit to 10 results
          setSearchResults(filtered.slice(0, 10));
          setShowResults(true);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      };

      // Debounce search
      const timeoutId = setTimeout(searchPosts, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(event.target)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <div className="header-search" style={{ position: "relative" }}>
      <div className="search-input-wrapper" ref={searchRef}>
        <input
          type="text"
          placeholder={t('header.searchPlaceholder', 'Search blogs & articles...')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true);
            }
          }}
          style={{
            padding: "10px 45px 10px 20px",
            border: "1px solid #e0e0e0",
            borderRadius: "50px",
            fontSize: "14px",
            width: "100%",
            maxWidth: "500px",
            outline: "none",
            transition: "all 0.3s ease",
            background: "#f8f9fa",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#ff0292";
            e.target.style.background = "#fff";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#e0e0e0";
            e.target.style.background = "#f8f9fa";
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#ff0292";
            e.target.style.background = "#fff";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "#e0e0e0";
            e.target.style.background = "#f8f9fa";
          }}
        />
        <i
          className="fas fa-search"
          style={{
            position: "absolute",
            right: "15px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#999",
            pointerEvents: "none",
          }}
        />
      </div>

      {showResults && (
        <div
          ref={resultsRef}
          className="search-results"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ddd",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            marginTop: "8px",
            maxHeight: "400px",
            overflowY: "auto",
            zIndex: 1000,
            minWidth: "300px",
          }}
        >
          {isSearching ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              <i className="fas fa-spinner fa-spin" /> {t('common.loading', 'Loading...')}
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div
                style={{
                  padding: "10px 15px",
                  borderBottom: "1px solid #eee",
                  fontSize: "12px",
                  color: "#666",
                  fontWeight: "600",
                }}
              >
                {searchResults.length} {t('common.result', 'result')}{searchResults.length !== 1 ? (t('common.results', 's')) : ''} {t('common.found', 'found')}
              </div>
              {searchResults.map((post) => (
                <Link
                  key={post.id || post.slug}
                  href={getBlogPostUrl(post)}
                  onClick={handleResultClick}
                  style={{
                    display: "block",
                    padding: "12px 15px",
                    borderBottom: "1px solid #f5f5f5",
                    textDecoration: "none",
                    color: "#333",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8f9fa";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fff";
                  }}
                >
                  <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    {post.bannerImageUrl && (
                      <div
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "4px",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={post.bannerImageUrl}
                          alt={post.title}
                          width={60}
                          height={60}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          unoptimized={post.bannerImageUrl?.startsWith('http://') || post.bannerImageUrl?.startsWith('https://')}
                        />
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h6
                        style={{
                          margin: 0,
                          marginBottom: "4px",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#333",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {post.title}
                      </h6>
                      {post.Category && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--tg-theme-primary)",
                            textTransform: "uppercase",
                          }}
                        >
                          {post.Category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </>
          ) : searchQuery.trim().length > 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
              {t('common.noArticlesFound', 'No articles found')}
            </div>
          ) : null}
        </div>
      )}

      <style jsx>{`
        .header-search {
          position: relative;
        }
        .search-input-wrapper {
          position: relative;
        }
        .search-results::-webkit-scrollbar {
          width: 6px;
        }
        .search-results::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .search-results::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .search-results::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        @media (max-width: 768px) {
          .header-search input {
            width: 200px !important;
          }
          .search-results {
            min-width: 200px !important;
          }
        }
      `}</style>
    </div>
  );
}

