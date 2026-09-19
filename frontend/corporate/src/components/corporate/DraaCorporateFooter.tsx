import { Link } from 'react-router-dom';
import { STUDY_INDIA_PORTAL_URL } from '../../config';

export default function DraaCorporateFooter() {
  const studyIndiaPortalUrl = STUDY_INDIA_PORTAL_URL;
  return (
    <footer className="draa-corp-footer">
      <div className="draa-corp-shell draa-corp-footer-main">
        <div className="draa-corp-footer-brand">
          <div><img src="/brand/draa-mark.png" alt="DRAA logo" /><strong>DRAA</strong></div>
          <p>Education Services &amp; Knowledge Management</p>
        </div>
        <div><strong>Explore</strong><Link to="/about-draa">About DRAA</Link><Link to="/capabilities">Services</Link><Link to="/who-we-support">Who We Support</Link><Link to="/careers">Careers</Link></div>
        <div><strong>Opportunities</strong><a href={studyIndiaPortalUrl} target="_blank" rel="noreferrer">Study in India</a><Link to="/learning-programs">Learning Programs</Link><Link to="/events">Events</Link><Link to="/contact">Partner with DRAA</Link></div>
        <div><strong>Company</strong><span>DRAA (OPC) Private Limited</span><span>New Delhi, India</span><span>CIN: U85491DL2023OPC416284</span></div>
      </div>
      <div className="draa-corp-shell draa-corp-footer-bottom"><span>© {new Date().getFullYear()} DRAA (OPC) Private Limited</span><span>Purpose-led education. Responsible growth.</span></div>
    </footer>
  );
}
