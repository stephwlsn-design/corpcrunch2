import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const RegionSelector = ({ intelligentPage = false }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Asia');
  const dropdownRef = useRef(null);

  const regions = [
    'Asia',
    'Middle East',
    'Europe',
    'Africa',
    'North America',
    'South America',
    'Australia'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setIsOpen(false);
    // You can add logic here to handle region change
    // For example, store in localStorage or context
    localStorage.setItem('selectedRegion', region);
  };

  useEffect(() => {
    // Load saved region from localStorage
    const savedRegion = localStorage.getItem('selectedRegion');
    if (savedRegion && regions.includes(savedRegion)) {
      setSelectedRegion(savedRegion);
    }
  }, []);

  return (
    <div className="region-selector" ref={dropdownRef}>
      <button
        type="button"
        className={`region-selector__toggle${intelligentPage ? " region-selector__toggle--neutral" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select region"
        aria-expanded={isOpen}
      >
        <i className="fas fa-globe" style={{ fontSize: '20px' }}></i>
      </button>

      {isOpen && (
        <div
          className="region-selector__dropdown"
          style={intelligentPage ? { zIndex: 5000 } : undefined}
        >
          <ul className="region-selector__list">
            {regions.map((region) => (
              <li
                key={region}
                className={`region-selector__item ${selectedRegion === region ? 'active' : ''}`}
                onClick={() => handleRegionChange(region)}
              >
                {region}
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .region-selector {
          position: relative;
          display: inline-block;
        }

        .region-selector__toggle {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          padding: 0;
          background: #2551e7;
          border: 1px solid #2551e7;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
          transition: all 0.3s ease;
        }

        .region-selector__toggle:hover {
          background: #1a3eb8;
          border-color: #1a3eb8;
        }

        .region-selector__toggle i {
          color: #ffffff;
        }

        .region-selector__toggle--neutral {
          background: #f3f4f6 !important;
          border: 1px solid rgba(0, 0, 0, 0.12) !important;
          color: #111 !important;
        }

        .region-selector__toggle--neutral:hover {
          background: #e8eaed !important;
          border-color: rgba(0, 0, 0, 0.18) !important;
        }

        .region-selector__toggle--neutral i {
          color: #111 !important;
        }

        .region-selector__current {
          min-width: 80px;
          text-align: left;
        }

        .region-selector__dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--dropdown-bg, #ffffff);
          border: 1px solid var(--border-color, #e0e0e0);
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          z-index: 1000;
          min-width: 180px;
          overflow: hidden;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .region-selector__list {
          list-style: none;
          margin: 0;
          padding: 8px 0;
        }

        .region-selector__item {
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #333 !important;
          background: transparent !important;
        }

        .region-selector__item:hover {
          background: rgba(37, 81, 231, 0.05) !important;
          color: #2551e7 !important;
        }

        .region-selector__item.active {
          background: rgba(37, 81, 231, 0.1) !important;
          color: #2551e7 !important;
          font-weight: 600;
        }

        /* Dark mode support */
        :global(.dark-mode) .region-selector__toggle {
          background: #6b8af0;
          border-color: #6b8af0;
          color: #ffffff;
        }

        :global(.dark-mode) .region-selector__toggle:hover {
          background: #5a7ad9;
          border-color: #5a7ad9;
        }

        :global(.dark-mode) .region-selector__toggle i {
          color: #ffffff;
        }

        :global(.dark-mode) .region-selector__dropdown {
          background: #1a1a1a;
          border-color: #444;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        :global(.dark-mode) .region-selector__item {
          color: #fff;
        }

        :global(.dark-mode) .region-selector__item:hover {
          background: rgba(107, 138, 240, 0.1);
          color: #6b8af0;
        }

        :global(.dark-mode) .region-selector__item.active {
          background: rgba(107, 138, 240, 0.15);
          color: #6b8af0;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .region-selector__toggle {
            width: 38px;
            height: 38px;
          }

          .region-selector__current {
            min-width: 60px;
          }

          .region-selector__dropdown {
            position: fixed !important;
            bottom: 120px !important;
            left: 50% !important;
            right: auto !important;
            top: auto !important;
            transform: translateX(-50%) !important;
            min-width: 220px !important;
            z-index: 99999 !important;
            background: #ffffff !important;
            border-radius: 12px !important;
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2) !important;
          }

          .region-selector__item {
            padding: 14px 20px !important;
            font-size: 15px !important;
            color: #111 !important;
            background: transparent !important;
          }

          .region-selector__item:hover {
            background: #f0f4ff !important;
            color: #2551e7 !important;
          }

          .region-selector__item.active {
            background: #e8eeff !important;
            color: #2551e7 !important;
            font-weight: 700 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RegionSelector;