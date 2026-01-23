import { useState, useEffect, useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { useRouter } from 'next/router';

export default function MagazineViewer({ pdfUrl, title, imageUrl }) {
  const [numPages, setNumPages] = useState(10); // Default, will be updated
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const flipBook = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const getPageUrl = (pageNum) => {
    if (pageNum === 0) {
      return imageUrl; // Cover page
    }
    // For PDF pages, use PDF.js viewer or iframe
    return `${pdfUrl}#page=${pageNum}`;
  };

  const handleClose = () => {
    router.back();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFlip = (e) => {
    setCurrentPage(e.data);
  };

  if (loading) {
    return (
      <div className="magazine-viewer-loading">
        <div className="loading-spinner">
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#ff0292' }}></i>
          <p>Loading magazine...</p>
        </div>
        <style jsx>{`
          .magazine-viewer-loading {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            z-index: 10000;
            color: #fff;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="magazine-viewer-error">
        <div className="error-content">
          <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#ff0292', marginBottom: '20px' }}></i>
          <p>{error}</p>
          <button onClick={handleClose} className="btn-close">
            Go Back
          </button>
        </div>
        <style jsx>{`
          .magazine-viewer-error {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: #fff;
          }
          .error-content {
            text-align: center;
          }
          .btn-close {
            margin-top: 20px;
            padding: 12px 24px;
            background: #ff0292;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <div className="magazine-viewer-container">
        <div className="magazine-viewer-header">
          <button onClick={handleClose} className="btn-close-viewer">
            <i className="fas fa-times"></i> Close
          </button>
          <h2 className="magazine-title">{title}</h2>
          <button onClick={handleDownload} className="btn-download">
            <i className="fas fa-download"></i> Download PDF
          </button>
        </div>
        
        <div className="magazine-viewer-content">
          <div className="flipbook-wrapper">
            {!loading && (
              <HTMLFlipBook
                ref={flipBook}
                width={600}
                height={800}
                minWidth={300}
                maxWidth={900}
                minHeight={400}
                maxHeight={1200}
                maxShadowOpacity={0.5}
                showCover={true}
                mobileScrollSupport={true}
                onFlip={handleFlip}
                className="magazine-flipbook"
              >
                {/* Cover Page */}
                <div className="magazine-page cover-page">
                  <img 
                    src={imageUrl} 
                    alt={`${title} - Cover`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                
                {/* PDF Pages - Using iframe for each page */}
                {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
                  <div key={pageNum} className="magazine-page pdf-page">
                    <iframe
                      src={`${pdfUrl}#page=${pageNum}&toolbar=0&navpanes=0&scrollbar=0`}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        background: '#fff'
                      }}
                      title={`Page ${pageNum}`}
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </div>
        </div>

        <div className="magazine-viewer-controls">
          <button 
            onClick={() => flipBook.current?.pageFlip().flipPrev()} 
            className="btn-nav"
            disabled={currentPage === 0}
          >
            <i className="fas fa-chevron-left"></i> Previous
          </button>
          <span className="page-indicator">
            Page <span id="current-page">{currentPage + 1}</span> of <span id="total-pages">{numPages + 1}</span>
          </span>
          <button 
            onClick={() => flipBook.current?.pageFlip().flipNext()} 
            className="btn-nav"
            disabled={currentPage >= numPages}
          >
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .magazine-viewer-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #1a1a1a;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .magazine-viewer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          background: #000;
          border-bottom: 1px solid #333;
          color: #fff;
        }

        .magazine-title {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .btn-close-viewer,
        .btn-download {
          padding: 10px 20px;
          background: #ff0292;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s ease;
        }

        .btn-close-viewer:hover,
        .btn-download:hover {
          background: #e60282;
        }

        .magazine-viewer-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          overflow: auto;
        }

        .flipbook-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .magazine-page {
          width: 100%;
          height: 100%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .magazine-page img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .magazine-viewer-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 30px;
          padding: 20px 40px;
          background: #000;
          border-top: 1px solid #333;
        }

        .btn-nav {
          padding: 12px 24px;
          background: #ff0292;
          color: #fff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s ease;
        }

        .btn-nav:hover {
          background: #e60282;
        }

        .btn-nav:disabled {
          background: #666;
          cursor: not-allowed;
        }

        .page-indicator {
          color: #fff;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .magazine-viewer-header {
            padding: 15px 20px;
            flex-wrap: wrap;
            gap: 10px;
          }

          .magazine-title {
            font-size: 18px;
            width: 100%;
            text-align: center;
          }

          .magazine-viewer-content {
            padding: 20px 10px;
          }

          .magazine-viewer-controls {
            padding: 15px 20px;
            flex-wrap: wrap;
            gap: 15px;
          }

          .btn-nav {
            padding: 10px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
