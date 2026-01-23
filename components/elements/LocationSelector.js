import { useState, useEffect, useRef } from 'react';
import { useLocation } from '@/contexts/LocationContext';

const locations = [
  { code: 'all', name: 'All Locations' },
  { code: 'us', name: 'United States' },
  { code: 'uk', name: 'United Kingdom' },
  { code: 'ca', name: 'Canada' },
  { code: 'au', name: 'Australia' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'in', name: 'India' },
  { code: 'sg', name: 'Singapore' },
  { code: 'ae', name: 'UAE' },
  { code: 'za', name: 'South Africa' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'cn', name: 'China' },
];

export default function LocationSelector() {
  const { location, changeLocation } = useLocation();
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

  const handleLocationChange = (locCode) => {
    changeLocation(locCode);
    setIsOpen(false);
    // Reload page to apply location filter
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const currentLocation = locations.find(loc => loc.code === location) || locations[0];

  return (
    <div className="location-selector" ref={dropdownRef}>
      <button
        className="location-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-label="Select location"
      >
        <span className="location-name">{currentLocation.name}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`} style={{ fontSize: '12px', marginLeft: '8px' }} />
      </button>

      {isOpen && (
        <div className="location-dropdown">
          <ul className="location-list">
            {locations.map((loc) => (
              <li key={loc.code}>
                <button
                  className={`location-option ${location === loc.code ? 'active' : ''}`}
                  onClick={() => handleLocationChange(loc.code)}
                  type="button"
                >
                  <span className="location-name">{loc.name}</span>
                  {location === loc.code && (
                    <i className="fas fa-check" style={{ marginLeft: 'auto', color: '#ff0292' }} />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .location-selector {
          position: relative;
          display: inline-block;
          margin-left: 12px;
        }

        .location-selector-btn {
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

        .location-selector-btn:hover {
          background: #e60282;
          border-color: #e60282;
        }

        .location-name {
          font-weight: 500;
        }

        .location-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #ffffff;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          min-width: 220px;
          max-height: 400px;
          overflow-y: auto;
        }

        :global(.dark-theme) .location-dropdown {
          background: #1a1a1a;
          border-color: #444;
        }

        .location-list {
          list-style: none;
          padding: 4px 0;
          margin: 0;
        }

        .location-option {
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

        :global(.dark-theme) .location-option {
          color: #fff;
        }

        .location-option:hover {
          background: #f5f5f5;
        }

        :global(.dark-theme) .location-option:hover {
          background: #333;
        }

        .location-option.active {
          background: #f0f7ff;
          color: #ff0292;
        }

        :global(.dark-theme) .location-option.active {
          background: #2a2a3a;
        }

        .location-option .location-name {
          flex: 1;
        }

        @media (max-width: 767.98px) {
          .location-selector-btn {
            padding: 6px 12px;
            font-size: 12px;
          }

          .location-name {
            display: none;
          }

          .location-dropdown {
            right: 0;
            min-width: 180px;
          }
        }
      `}</style>
    </div>
  );
}
