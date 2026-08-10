import React, { useState } from "react";
import "./ImgWithFallback.css";

interface ImgWithFallbackProps {
  src?: string | null;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  /** 'sm' uses a compact layout (no copyright text, smaller logo) */
  size?: "sm" | "md" | "lg";
  /** Show the share button in the top-right corner (optional) */
  showShareBtn?: boolean;
  onShare?: () => void;
}

/**
 * Renders an <img> and, if the src is missing / errors (404),
 * falls back to a branded Draa placeholder that matches the
 * "stamp" style shown in the design reference.
 */
const ImgWithFallback: React.FC<ImgWithFallbackProps> = ({
  src,
  alt,
  className,
  style,
  size,
  showShareBtn = false,
  onShare,
}) => {
  const [failed, setFailed] = useState(false);

  const hasValidSrc = src && src.trim() !== "" && !failed;

  if (hasValidSrc) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  const shellClass = [
    "img-fallback-shell",
    size === "sm" ? "img-fb-sm" : "",
  ].filter(Boolean).join(" ");

  /* ── Branded Placeholder ── */
  return (
    <div className={shellClass} style={style}>
      {/* Share button overlay */}
      {showShareBtn && onShare && (
        <button className="img-fallback-share-btn" onClick={onShare} title="Share">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
        </button>
      )}

      {/* Watermark logo */}
      <div className="img-fallback-inner">
        <img
          src="/brand/draa-mark.png"
          alt="Draa"
          className="img-fallback-logo"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <span className="img-fallback-copy">© Draa</span>
      </div>
    </div>
  );
};

export default ImgWithFallback;
