import { useState } from 'react';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './DraaCorporateHome.css';

interface NavMenuLink {
  label: string;
  description: string;
  href: string;
  featured?: boolean;
}

const companyLinks: NavMenuLink[] = [
  { label: 'About DRAA', description: 'Purpose, approach and company story', href: '/about-draa' },
  { label: 'Who We Support', description: 'Schools, universities, brands and partners', href: '/who-we-support' },
  { label: 'Careers', description: 'Build purposeful work with DRAA', href: '/careers' },
];

const serviceLinks: NavMenuLink[] = [
  { label: 'All Services', description: 'Overview of all 6 core business activities', href: '/capabilities', featured: true },
  { label: 'Educational Content Development', description: 'Study materials, textbooks, question banks & curriculum content', href: '/services/educational-content-development' },
  { label: 'Academic & Professional Training', description: 'Faculty development, student workshops & corporate training', href: '/services/academic-professional-training' },
  { label: 'Educational Events & Conferences', description: 'Conferences, seminars, webinars, competitions & summits', href: '/services/educational-events-conferences' },
  { label: 'Educational Consultancy', description: 'Curriculum planning, accreditation support & academic guidance', href: '/services/educational-consultancy' },
  { label: 'Digital Learning Solutions', description: 'LMS platforms, web & mobile apps, portfolios & AI tracking', href: '/services/digital-learning-solutions' },
  { label: 'Study in India Guidance', description: 'International admissions, university matching & scholarship advisory', href: studyIndiaPortalUrl },
];

const insightLinks: NavMenuLink[] = [
  { label: 'Resources', description: 'Guides, perspectives and case studies', href: '/resources' },
  { label: 'Learning Programs', description: 'Programmes for every ambition', href: '/learning-programs' },
];

const studyIndiaPortalUrl = import.meta.env.VITE_STUDY_INDIA_URL || 'http://localhost:5175';

function DesktopMenu({ label, links, wide = false, active = false }: { label: string; links: NavMenuLink[]; wide?: boolean; active?: boolean }) {
  return (
    <div className="draa-nav-group">
      <button type="button" className={`draa-nav-trigger ${active ? 'active' : ''}`}>{label} <ChevronDown size={14} /></button>
      <div className={`draa-nav-dropdown ${wide ? 'draa-nav-dropdown--wide' : ''}`}>
        <span className="draa-nav-dropdown-label">Explore {label}</span>
        <div>
          {links.map((item) => (
            <Link key={item.href + item.label} to={item.href} className={item.featured ? 'draa-nav-dropdown-featured' : undefined}>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
              <ArrowRight size={14} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DraaCorporateHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const groupIsActive = (links: NavMenuLink[]) => links.some((item) => pathname === item.href || (item.href.startsWith('/services/') && pathname === item.href));

  return (
    <header className="draa-corp-header">
      <div className="draa-corp-shell draa-corp-header-inner">
        <Link to="/" className="draa-corp-brand" aria-label="DRAA home">
          <span className="draa-corp-brand-mark"><img src="/brand/draa-mark.png" alt="" /></span>
          <span className="draa-corp-brand-copy">
            <strong>DRAA</strong>
            <small>Education Services &amp; Knowledge Management</small>
          </span>
        </Link>

        <nav className="draa-corp-nav" aria-label="Main navigation">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : undefined}>Home</NavLink>
          <DesktopMenu label="Company" links={companyLinks} active={groupIsActive(companyLinks)} />
          <DesktopMenu label="Services" links={serviceLinks} wide active={groupIsActive(serviceLinks)} />
          <a href={studyIndiaPortalUrl} target="_blank" rel="noreferrer" className="draa-nav-study">Study in India</a>
          <DesktopMenu label="Insights" links={insightLinks} active={groupIsActive(insightLinks)} />
          <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : undefined}>Contact</NavLink>
        </nav>

        <Link className="draa-corp-header-cta" to="/contact">
          Let&apos;s collaborate <ArrowRight size={16} />
        </Link>

        <button type="button" className="draa-corp-menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="draa-corp-mobile-nav" aria-label="Mobile navigation">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink>
          <span>Company</span>
          {companyLinks.map((item) => <NavLink key={item.href} to={item.href} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
          <span>Services</span>
          {serviceLinks.map((item) => <NavLink key={item.href + item.label} className={item.featured ? 'draa-mobile-all-services' : undefined} to={item.href} onClick={() => setMenuOpen(false)}>{item.label}{item.featured && <ArrowRight size={15} />}</NavLink>)}
          <a className="draa-mobile-study" href={studyIndiaPortalUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Study in India <ArrowRight size={15} /></a>
          <span>Insights</span>
          {insightLinks.slice(0, 2).map((item) => <NavLink key={item.href} to={item.href} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
          <Link className="draa-corp-mobile-cta" to="/contact" onClick={() => setMenuOpen(false)}>Let&apos;s collaborate <ArrowRight size={16} /></Link>
        </nav>
      )}
    </header>
  );
}
