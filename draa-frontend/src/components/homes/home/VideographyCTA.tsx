import { Link } from "react-router-dom";
import { Play, ArrowRight, Video, Sparkles } from "lucide-react";
import "./VideographyCTA.css";

export default function VideographyCTA() {
  return (
    <section className="videography-cta-section">
      <div className="v-cta-container">
        <div className="v-cta-card">
          {/* Decorative background blurs */}
          <div className="v-cta-blur v-cta-blur-1"></div>
          <div className="v-cta-blur v-cta-blur-2"></div>

          <div className="v-cta-content-layout">
            <div className="v-cta-text-content">
              <div className="v-cta-badge">
                <Sparkles size={14} className="sparkle-icon" />
                <span>New Release</span>
              </div>
              <h2 className="v-cta-title">
                Learn Visually with <span className="gradient-text">Recorded Videos</span>
              </h2>
              <p className="v-cta-description">
                Boost your preparation with expert conceptual video lectures and detailed topic explanations directly in one interactive space.
              </p>
              
              <div className="v-cta-features-list">
                <div className="v-cta-feat-item">
                  <div className="feat-dot youtube-dot"></div>
                  <span>Detailed Video Classes</span>
                </div>
                <div className="v-cta-feat-item">
                  <div className="feat-dot expert-dot"></div>
                  <span>Curated Content from Top Educators</span>
                </div>
              </div>
            </div>

            <div className="v-cta-button-wrapper">
              <Link to="/recorded-videos" className="v-cta-btn-glowing">
                <span className="btn-inner">
                  <Video size={18} className="video-icon-anim" />
                  <span>Explore Recorded Videos</span>
                  <ArrowRight size={16} className="arrow-icon-anim" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
