import React from "react";
import { FileText, Mail, MapPin, Phone, Send } from "lucide-react";
import { Link } from "react-router-dom";

export default function PortalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="portal-footer">
      <div className="portal-shell footer-grid footer-grid-draa">
        {/* 1. Brand & Disclaimer Column */}
        <div className="footer-col-brand">
          <div className="footer-brand-title-wrap">
            <img src="/media/draa-mark.png" alt="DRAA Logo" className="footer-logo-img" />
            <div className="footer-brand-text">
              <strong className="footer-brand-name">DRAA Study in India</strong>
              <small className="footer-brand-sub">EDUCATION SERVICES &amp; KNOWLEDGE MANAGEMENT</small>
            </div>
          </div>
          <p className="footer-desc-lead">
            An independent international education guidance platform by DRAA (OPC) Private Limited.
          </p>
          <p className="footer-desc-legal">
            DRAA provides education information and facilitation. Institutions decide admissions, and statutory decisions remain with the relevant authorities.
          </p>
        </div>

        {/* 2. Explore Column */}
        <div className="footer-col-links">
          <strong className="footer-col-title">EXPLORE</strong>
          <Link to="/why-india">Why study in India</Link>
          <Link to="/courses">Courses &amp; institutes</Link>
          <Link to="/higher-education">Higher education</Link>
          <Link to="/scholarships">Scholarships &amp; fees</Link>
          <Link to="/how-to-apply">How to apply</Link>
        </div>

        {/* 3. Student Support Column */}
        <div className="footer-col-links">
          <strong className="footer-col-title">STUDENT SUPPORT</strong>
          <Link to="/eligibility">Eligibility criteria</Link>
          <Link to="/visa-frro">Local support</Link>
          <Link to="/visa-frro">Visa &amp; arrival guidance</Link>
          <Link to="/about">Frequently asked questions</Link>
          <Link to="/privacy">Privacy policy</Link>
        </div>

        {/* 4. DRAA Company Column */}
        <div className="footer-col-links">
          <strong className="footer-col-title">DRAA COMPANY</strong>
          <Link to="/about">About DRAA</Link>
          <Link to="/contact">Contact DRAA</Link>
        </div>

        {/* 5. Contact DRAA Column */}
        <div className="footer-col-links footer-col-contact">
          <strong className="footer-col-title">CONTACT DRAA</strong>
          <a href="mailto:admin@draa.in">
            <Mail size={14} className="footer-icon-inline" /> admin@draa.in
          </a>
          <a href="tel:+911141008450">
            <Phone size={14} className="footer-icon-inline" /> +91 11 4100 8450
          </a>
          <span className="footer-address">
            <MapPin size={14} className="footer-icon-inline footer-icon-top" />
            <span>B-62, First Floor, Defence Colony, New Delhi – 110024, India</span>
          </span>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="portal-shell footer-bottom">
        <span>© {currentYear} DRAA (OPC) Private Limited. All rights reserved.</span>
        <span>Purpose-led education &middot; Responsible guidance</span>
      </div>

      {/* Floating Apply Now Button */}
      <Link to="/register/student" className="floating-apply" aria-label="Apply Now">
        <Send size={15} /> Apply Now
      </Link>
    </footer>
  );
}
