import React from "react";
import { Link } from "react-router-dom";

export default function Footer({
  onOpenRegister,
}: {
  onOpenRegister: () => void;
}) {
  return (
    <footer className="FooterLayout">
      {/* 1. Pre-Footer Call to Action Strip */}
      <section className="footer-section-new">
        <div className="cs-container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="footer-title-new">Ready to Start Your Journey?</h1>
              <p className="footer-subtitle">
                Begin your application process today and take the first step towards studying in India
              </p>
              <div className="footer-buttons">
                <button
                  type="button"
                  className="btn btn-apply"
                  id="btnApplyNow"
                  onClick={onOpenRegister}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main 4-Column Footer */}
      <div className="footer-section cs-container">
        <div className="row">
          {/* Study in India Column */}
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="footer-logo">
              <i className="bi bi-mortarboard fs-3 text-warning"></i>
              <h5 className="mb-0 text-white fw-bold">Study in India</h5>
            </div>
            <p className="footer-description">
              Your comprehensive guide to higher education opportunities, accredited universities, and degree programmes in India.
            </p>
            <div className="social-icons">
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-lg-3 col-md-6 mb-4">
            <p className="footer-menu-title">Quick Links</p>
            <ul className="footer-cnt-box">
              <li className="footer-cnt-text"><Link to="/">Home</Link></li>
              <li className="footer-cnt-text"><Link to="/About-Us">About Us</Link></li>
              <li className="footer-cnt-text"><Link to="/Eligibility-Criteria">Eligibility Criteria</Link></li>
              <li className="footer-cnt-text"><Link to="/scholarships">Scholarships &amp; Fee Waivers</Link></li>
              <li className="footer-cnt-text"><Link to="/courses/exploreallcoruses">Universities &amp; Courses</Link></li>
              <li className="footer-cnt-text"><Link to="/10-reasons-to-study-in-india">10 Reasons to Study in India</Link></li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="col-lg-3 col-md-6 mb-4">
            <p className="footer-menu-title">Resources</p>
            <ul className="footer-cnt-box">
              <li className="footer-cnt-text"><Link to="/Local-Support">Local Support</Link></li>
              <li className="footer-cnt-text"><Link to="/Onboarding-&-FRRO">Onboarding &amp; e-FRRO</Link></li>
              <li className="footer-cnt-text"><Link to="/contactus">Contact Us</Link></li>
              <li className="footer-cnt-text"><Link to="/Circulars">Circulars &amp; Guidelines</Link></li>
              <li className="footer-cnt-text"><Link to="/FAQ">FAQ</Link></li>
              <li className="footer-cnt-text"><Link to="/Privacy-Policy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Us Column */}
          <div className="col-lg-3 col-md-6 mb-4">
            <p className="footer-menu-title">Contact Us</p>
            <div className="contact-item">
              <i className="bi bi-envelope"></i>
              <span className="contact-text">
                <a href="mailto:help.studyinindia@gov.in" className="tel">help.studyinindia@gov.in</a>
              </span>
            </div>
            <div className="contact-item">
              <i className="bi bi-telephone"></i>
              <span className="contact-text">
                <a href="tel:+911206565065" className="tel">+91 120-6565065</a>
              </span>
            </div>
            <div className="contact-item">
              <i className="bi bi-geo-alt"></i>
              <span className="contact-text">
                DRAA International Education Gateway, New Delhi, India
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-4 mt-4 border-top border-secondary border-opacity-25 text-center text-secondary small">
          <p className="mb-1">
            © 2026 Study in India • DRAA International Student Platform. All Rights Reserved.
          </p>
          <p className="text-white-50" style={{ fontSize: "11px" }}>
            Disclaimer: This education portal is operated for international student admissions and guidance.
          </p>
        </div>
      </div>
    </footer>
  );
}
