import { useTheme } from "@/contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    // Return a placeholder to prevent hydration mismatch
    return (
      <button
        type="button"
        className="theme-toggle-btn"
        aria-label="Toggle theme"
        style={{ width: '40px', height: '40px' }}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={theme === "light-theme" ? "Switch to dark mode" : "Switch to light mode"}
        title={theme === "light-theme" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light-theme" ? (
          <i className="flaticon-moon" />
        ) : (
          <i className="flaticon-sun" />
        )}
      </button>

      <style jsx>{`
        .theme-toggle-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid #e0e0e0;
          background: #ffffff;
          color: #333;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 18px;
          padding: 0;
          flex-shrink: 0;
        }

        .theme-toggle-btn:hover {
          background: #f5f5f5;
          border-color: #ff2092;
          color: #ff2092;
          transform: scale(1.05);
        }

        .theme-toggle-btn i {
          display: block;
        }

        :global(.dark-theme) .theme-toggle-btn {
          background: #222;
          border-color: #333;
          color: #fff;
        }

        :global(.dark-theme) .theme-toggle-btn:hover {
          background: #333;
          border-color: #2551e7;
          color: #2551e7;
        }

        @media (max-width: 767.98px) {
          .theme-toggle-btn {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}
