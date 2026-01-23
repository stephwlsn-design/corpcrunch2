import React, { useState } from "react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";

const DownloadCard = ({ imageUrl, pdfUrl, title }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Create slug from title
  const slug = title.toLowerCase().replace(/\s+/g, '-');
  const viewerUrl = `/magazine/${slug}`;

  return (
    <div
      className="trending__post downloadCard"
    >
      <Link href={viewerUrl} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="trending__post  tgImage__hover" style={{ cursor: 'pointer' }}>
        {!imageLoaded && <Skeleton height={200} />}
        <img
          src={imageUrl}
          alt={title}
          style={{
            width: "100%",
            display: imageLoaded ? "block" : "none",
            objectFit: "contain !important",
          }}
          onLoad={handleImageLoad}
          className=" transition-transform duration-300 transform hover:scale-105"
        />
      </div>
      </Link>
      <div className="trending__post-content p-2 ">
        <h6 className=" tgcommon__hover  font-semibold  ">{title}</h6>
        <div className="cta-actions" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <Link href={viewerUrl} style={{ textDecoration: 'none' }}>
            <div className="cta-read" style={{ 
              fontSize: "12px", 
              color: "#ff0292",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <i className="fas fa-book-open"></i>
              <span>Read Magazine</span>
            </div>
          </Link>
          <div 
            className="cta-download" 
            onClick={handleDownload}
            style={{ 
              fontSize: "12px", 
              color: "#666",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <i className="fas fa-download"></i>
            <span>Download PDF</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadCard;
