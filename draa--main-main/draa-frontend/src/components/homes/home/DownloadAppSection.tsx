import"./downloadAppSection.css";
import mobile_app_img from'./mobile_app.png';

const STORE_PLAY ="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    title:"Live & Recorded Classes",
    desc:"Learn from top educators anytime, anywhere"
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title:"Mock Tests & PYQs",
    desc:"Practice with exam-level test series"
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title:"Track Progress",
    desc:"Monitor your learning journey daily"
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
    title:"Study Materials",
    desc:"Notes, books & resources all in one place"
  },
];

const DownloadAppSection = () => {
  return (
    <section className="da-section">
      {/* Background SVG blobs */}
      <div className="da-blob da-blob-1" />
      <div className="da-blob da-blob-2" />
      <div className="da-blob da-blob-3" />

      <div className="container">
        <div className="da-grid">

          {/* LEFT: Content */}
          <div className="da-content">
            <div className="da-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
              Free Mobile App
            </div>

            <h2 className="da-title">
              Learn On The Go.<br />
              <span className="da-title-accent">Anytime, Anywhere.</span>
            </h2>

            <p className="da-desc">
              Get instant access to live classes, recorded lectures,
              mock tests, and study materials  all optimized for
              your phone. Study smarter, not harder.
            </p>

            {/* Feature list */}
            <div className="da-features">
              {FEATURES.map((f, i) => (
                <div key={i} className="da-feature-item">
                  <div className="da-feature-icon">{f.icon}</div>
                  <div className="da-feature-text">
                    <span className="da-feature-title">{f.title}</span>
                    <span className="da-feature-desc">{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Store Buttons */}
            <div className="da-store-area">
              <p className="da-store-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Now
              </p>
              <div className="da-store-btns">
                {/* Google Play  official badge */}
                <a
                  href="https://play.google.com/store/apps/details?id=your.draa.app"
                  target="_blank"
                  rel="noreferrer"
                  className="da-store-btn"
                >
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Get it on Google Play"
                    style={{ height:"40px" }}
                  />
                </a>

                {/* App Store */}
                <a
                  href="#"
                  className="da-store-btn"
                >
                  <img
                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                    alt="Download on the App Store"
                    style={{ height:"40px" }}
                  />
                </a>

                {/* Open in Browser */}
                <a
                  href="/"
                  className="da-store-btn da-web-btn"
                  aria-label="Open Draa in your browser"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <div className="da-store-text">
                    <span className="da-store-text-top">Prefer Browser?</span>
                    <span className="da-store-text-main">Open Website</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: Phone Mockup */}
          <div className="da-mockup-area">
            {/* Floating glow card */}
            <div className="da-mockup-glow" />
            {/* Phone frame */}
            <div className="da-phone-wrapper">
              <div className="da-phone">
                <div className="da-phone-notch" />
                <img
                  src={mobile_app_img}
                  alt="Draa mobile learning experience"
                  className="da-phone-screen"
                />
              </div>
            </div>

            {/* Floating stat badges */}
            <div className="da-stat da-stat-1">
              <div className="da-stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#bd7b20" strokeWidth="2.5" strokeLinecap="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
              <div className="da-stat-text">
                <span className="da-stat-num">10K+</span>
                <span className="da-stat-label">Video Lectures</span>
              </div>
            </div>

            <div className="da-stat da-stat-2">
              <div className="da-stat-icon da-stat-icon-green">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <div className="da-stat-text">
                <span className="da-stat-num">500+</span>
                <span className="da-stat-label">Mock Tests</span>
              </div>
            </div>

            <div className="da-stat da-stat-3">
              <div className="da-stat-icon da-stat-icon-orange">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fa8c16" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="da-stat-text">
                <span className="da-stat-num">50K+</span>
                <span className="da-stat-label">Students</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DownloadAppSection;
