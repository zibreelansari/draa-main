import'./download-app.css';
import mobile_app_img from'../homes/home/mobile_app.png';
import { Smartphone, Download, ShieldCheck, Zap, BarChart3, Globe } from'lucide-react';

const DownloadAppArea = () => {
  return (
    <div className="download-app-wrapper">
      {/* HERO SECTION */}
      <section className="app-hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <div className="hero-text-content">
                <div className="badge-wrapper">
                  <span className="premium-badge">New Version 2.0</span>
                </div>
                <h1 className="hero-main-title">
                  Your Classroom, <br />
                  <span>Anywhere, Anytime.</span>
                </h1>
                <p className="hero-p-desc">
                  Experience the future of learning. Attend live classes,
                  take mock tests, and get instant performance reports 
                  all on the Draa mobile app.
                </p>

                <div className="store-buttons">
                  <a
                    href="https://play.google.com/store/apps/details?id=your.draa.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="store-btn google-play"
                  >
                    <div className="btn-icon">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
                    </div>
                  </a>
                  <a
                    href="#"
                    className="store-btn app-store disabled"
                    onClick={(e) => e.preventDefault()}
                  >
                    <div className="btn-icon">
                      <img src="https://pixelbag.net/wp-content/uploads/2022/06/download-on-the-app-store-badge-svg-pdf-ai-eps-768x432.jpg" alt="App Store" />
                    </div>
                    <span className="coming-soon">Coming Soon</span>
                  </a>
                </div>

                <div className="trust-badges">
                  <div className="trust-item">
                    <ShieldCheck size={20} className="trust-icon" />
                    <span>Secure & Private</span>
                  </div>
                  <div className="trust-item">
                    <Zap size={20} className="trust-icon" />
                    <span>Fast Performance</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="hero-mockup-container">
                <div className="main-mockup-wrapper">
                  <img src={mobile_app_img} alt="App Mockup" className="hero-phone-img" />
                  <div className="floating-stat-card card-1">
                    <div className="stat-icon"><BarChart3 size={20} /></div>
                    <div className="stat-info">
                      <h6>98% Success Rate</h6>
                      <p>Join our top performers</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="app-features-grid">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Powerful Features at Your Fingertips</h2>
            <p className="section-subtitle">Everything you need to succeed, packed into one beautiful app.</p>
          </div>

          <div className="row mt-50">
            <div className="col-md-4">
              <div className="feature-modern-card card-blue">
                <div className="f-icon-box"><Globe size={28} /></div>
                <h3>Offline Learning</h3>
                <p>Download your favorite classes and study even without an internet connection.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-modern-card card-purple">
                <div className="f-icon-box"><Smartphone size={28} /></div>
                <h3>Interactive Tests</h3>
                <p>Take timed mock tests that replicate real exam environments with instant results.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-modern-card card-indigo">
                <div className="f-icon-box"><Zap size={28} /></div>
                <h3>Live doubt Solving</h3>
                <p>Get your queries resolved in real-time through in-app live chat and video sessions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      {/* <section className="app-final-cta">
        <div className="container">
          <div className="cta-glass-box">
            <div className="cta-content">
              <h2 style={{ color:"whitesmoke" }}>Ready to transform your learning?</h2>
              <p style={{ color:"whitesmoke" }}>Download the Draa app now and start your journey to success.</p>
              <div className="cta-actions">
                <button className="main-dl-btn">
                  <Download size={20} />
                  <span>Download APK Directly</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default DownloadAppArea;
