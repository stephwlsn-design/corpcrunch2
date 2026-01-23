import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// English is the primary language (listed first)
const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ar', name: 'العربية' },
];

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Close dropdown when clicking outside - only on client side
    if (typeof window === 'undefined') return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
    // No reload needed - translations are loaded dynamically via context
  };

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="language-selector" ref={dropdownRef}>
      <button
        className="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label="Select language"
      >
        <span className="language-name">{currentLanguage.name}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '12px', marginLeft: '8px' }} />
      </button>

      {isOpen && (
        <div className="language-dropdown">
          <ul className="language-list">
            {languages.map((lang) => (
              <li key={lang.code}>
                <button
                  className={`language-option ${language === lang.code ? 'active' : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                  type="button"
                >
                  <span className="language-name">{lang.name}</span>
                  {language === lang.code && (
                    <i className="fas fa-check" style={{ marginLeft: 'auto', color: '#ff0292' }} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .language-selector {
          position: relative;
          display: inline-block;
        }

        .language-selector-btn {
          display: flex;
          align-items: center;
          padding: 8px 16px;
          background: #ff0292;
          border: 1px solid #ff0292;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          color: #ffffff;
          white-space: nowrap;
        }

        .language-selector-btn:hover {
          background: #e60282;
          border-color: #e60282;
        }

        .language-name {
          font-weight: 500;
        }

        .language-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          min-width: 180px;
          overflow: hidden;
        }

        .language-list {
          list-style: none;
          padding: 4px 0;
          margin: 0;
        }

        .language-option {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 12px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
          text-align: left;
          font-size: 14px;
          color: #333;
        }
        
        .language-option:hover {
          background: #f5f5f5;
        }

        .language-option.active {
          background: #f0f7ff;
          color: #ff0292;
        }

        .language-option .language-name {
          flex: 1;
        }

        @media (max-width: 767.98px) {
          .language-selector-btn {
            padding: 6px 12px;
            font-size: 12px;
          }

          .language-name {
            display: none;
          }

          .language-dropdown {
            right: 0;
            min-width: 150px;
          }
        }
      `}</style>
    </div>
  );
}

