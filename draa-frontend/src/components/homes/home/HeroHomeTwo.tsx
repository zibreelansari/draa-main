"use client";

import React, { useState } from'react';
import { motion } from'framer-motion';
import { ChevronRight, Zap, Play, Apple, ArrowRight } from'lucide-react';
import StartExploringModal from'./StartExploringModal';
import'./HeroHomeTwo.css';

const HeroHomeTwo: React.FC = () => {
  const [isExplaining, setIsExplaining] = useState(false);

  return (
    <section className="hero-two-section">
      <div className="hero-two-grid-bg" />

      <div className="container hero-two-inner">

        {/*  LEFT CONTENT  */}
        <div className="hero-two-content">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="hero-two-title">
              One Destination for<br />
              <span>Complete Prep</span>
            </h1>

            <div className="hero-two-breadcrumb">
              <span>Learn</span> <ChevronRightSmall />
              <span>Practice</span> <ChevronRightSmall />
              <span>Improve</span> <ChevronRightSmall />
              <span>Succeed</span>
            </div>

            <p className="hero-two-subtitle">
              India's most sophisticated learning platform. Start your journey
              toward selection today. For Free.
            </p>

            <div className="hero-two-actions">
              <button className="h2-btn-primary" onClick={() => setIsExplaining(true)}>
                Get Started Free
                <ArrowRight size={18} fill="currentColor" />
              </button>

              {/* <div className="h2-app-btns">
                <motion.a
                  whileHover={{ y: -4 }}
                  href="#"
                  className="h2-app-store-btn"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
                </motion.a>
                <motion.a
                  whileHover={{ y: -4 }}
                  href="#"
                  className="h2-app-store-btn"
                >
                  <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" />
                </motion.a>
              </div> */}
            </div>
          </motion.div>
        </div>

        {/*  RIGHT VISUAL  */}
        <div className="hero-two-visual">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease:"easeOut" }}
            className="h2-visual-container"
          >
            <div className="h2-visual-glow"></div>
            <img
              src="https://multivariate.tech/images/analytics-presentation.webp"
              alt="Analytics Intelligence"
              className="h2-main-illust"
            />
            {/* Decorative Elements */}
            <div className="h2-floating-badge badge-1">Smart Analytics</div>
            <div className="h2-floating-badge badge-2">99.9% Accuracy</div>
          </motion.div>
        </div>

      </div>

      {/*  BOTTOM TAGLINE (ENHANCED)  */}
      <div className="hero-two-tagline-wrap"> 
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="h2-crazy-tagline"
          >
            <span className="h2-tagline-label">Intelligence Focused</span>
            <div className="h2-tagline-main">
              <span className="h2-tagline-primary">Revolutionizing Success with Intelligence.</span>
              <span className="h2-tagline-secondary">Predicting Success. One Exam at a Time.</span>
            </div>
          </motion.div>
        </div>
      </div>
      <StartExploringModal 
        isOpen={isExplaining} 
        onClose={() => setIsExplaining(false)} 
      />
    </section>
  );
};

const ChevronRightSmall = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 8px', color:'#bd7b20' }}>
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default HeroHomeTwo;
