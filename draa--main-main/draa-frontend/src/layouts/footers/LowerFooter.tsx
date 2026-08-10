import React from'react';
import { Link } from'react-router-dom';
import {
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Mail,
  Send
} from'lucide-react';
import'./LowerFooter.css';
import { FacebookOutlined, InstagramOutlined, LinkedinOutlined, WhatsAppOutlined, YoutubeOutlined } from'@ant-design/icons';

interface LowerFooterProps {
  brand?: 'default' | 'draa';
}

const LowerFooter: React.FC<LowerFooterProps> = ({ brand = 'draa' }) => {
  const isDraa = brand === 'draa';

  return (
    <section className="lower-footer-tier">
      <div className="container">
        <div className="footer-main-grid">

          {/* Column 1: Brand & Mission */}
          <div className="footer-brand-col">
            <Link to="/" className={isDraa ? 'footer-draa-lockup' : undefined}>
              {isDraa ? (
                <>
                  <img src="/brand/draa-mark.png" alt="" className="footer-draa-mark" />
                  <span>DRAA</span>
                </>
              ) : (
                <img
                  src="/brand/draa-mark.png"
                  alt="Myedudocs"
                  className="footer-logo-img"
                />
              )}
            </Link>
            <p className="footer-mission-text">
              Our mission is to democratize education by providing students with
              the most comprehensive, up-to-date, and accessible learning
              resources for competitive excellence.
            </p>

            {/* Social Icons */}
            <div className="footer-social-row">
              <a
                href="https://www.instagram.com/draa/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn insta"
                aria-label="Instagram"
              >
                <InstagramOutlined size={18} />
              </a>

              <a
                href="https://www.facebook.com/profile.php?id=61579936281019"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn fb"
                aria-label="Facebook"
              >
                <FacebookOutlined size={18} fill="currentColor" />
              </a>

              <a
                href="https://www.youtube.com/results?search_query=draa"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn yt"
                aria-label="YouTube"
              >
                <YoutubeOutlined size={18} fill="currentColor" />
              </a>
              <a
                href="https://www.linkedin.com/company/draa-academics-llp/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn linkedin"
                aria-label="LinkedIn"
              >
                <LinkedinOutlined size={18} fill="currentColor" />
              </a>
              <a
                href="https://whatsapp.com/channel/0029Vb68EnMGufJ5M3KRM72A"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn wa"
                aria-label="WhatsApp"
              >
                <WhatsAppOutlined size={18} fill="currentColor" />
              </a>
              <a
                href="https://t.me/draatelegram"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn telegram"
                aria-label="Telegram"
              >
                <i className="fab fa-telegram" style={{ fontSize:'20px' }}></i>
              </a>
            </div>
          </div>

          {/* Column 2: Useful Links */}
          <div className="footer-links-col">
            <h5 className="footer-col-title">USEFUL LINKS</h5>
            <div className="footer-link-list">
              <Link to="/">Home</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/grid-blog">Latest Blogs</Link>
              <Link to="/jobs-notifications">Notifications</Link>
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/tnc">Terms & Conditions</Link>
            </div>
          </div>

          {/* Column 3: Resources */}
          <div className="footer-links-col">
            <h5 className="footer-col-title">RESOURCES</h5>
            <div className="footer-link-list">
              <Link to="/courses">Courses</Link>
              <Link to="/all-books">Books</Link>
              <Link to="/online-test-series">Test Series</Link>
              <Link to="/previous-year-questions">PYQs</Link>
              <Link to="/syllabus">Syllabus</Link>
              <Link to="/current-affairs">Current Affairs</Link>
            </div>
          </div>

          {/* Column 4: Contact Us */}
          <div className="footer-contact-col">
            <h5 className="footer-col-title">CONTACT US</h5>
            <div className="contact-info-list">
              <div className="contact-item">
                <MapPin size={20} className="contact-icon" />
                <span>
                  Building no 1, 3rd floor, opp. Sapna cinema, above Bikanervala Community centre, D Block, East of Kailash, New Delhi, Delhi 110065
                </span>
              </div>

              <div className="contact-item">
                <Phone size={20} className="contact-icon" />
                <a
                  href="https://wa.me/918076003728"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  080760 03728
                </a>
              </div>

              <div className="contact-item">
                <Mail size={20} className="contact-icon" />
                <a href="mailto:contact@draa.in">
                  {isDraa ? 'Email our team' : 'contact@draa.in'}
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LowerFooter;
