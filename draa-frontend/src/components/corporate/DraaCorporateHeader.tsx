import { useState } from 'react';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './DraaCorporateHome.css';

const companyLinks = [
  { label: 'About DRAA', description: 'Purpose, approach and company story', href: '/about-draa' },
  { label: 'Who We Support', description: 'Schools, universities, brands and partners', href: '/who-we-support' },
  { label: 'Careers', description: 'Build purposeful work with DRAA', href: '/careers' },
];

const solutionLinks = [
  { label: 'Services Overview', description: 'Explore all connected capabilities', href: '/capabilities' },
  { label: 'Academic Content', description: 'Research-led learning resources', href: '/services/content-publishing' },
  { label: 'Professional Learning', description: 'Training that transfers to practice', href: '/services/professional-learning' },
  { label: 'Education Events', description: 'Conferences, workshops and forums', href: '/events' },
  { label: 'Academic Advisory', description: 'Institutional strategy and quality', href: '/services/academic-advisory' },
  { label: 'Digital Learning', description: 'Platforms, courses and assessments', href: '/services/digital-learning' },
];

const insightLinks = [
  { label: 'Resources', description: 'Guides, perspectives and case studies', href: '/resources' },
  { label: 'Learning Programs', description: 'Programmes for every ambition', href: '/learning-programs' },
];

const studyIndiaPortalUrl = import.meta.env.VITE_STUDY_INDIA_URL || 'http://localhost:5175';

function DesktopMenu({ label, links, wide = false, active = false }: { label: string; links: typeof companyLinks; wide?: boolean; active?: boolean }) {
  return (
    <div className="draa-nav-group">
      <button type="button" className={`draa-nav-trigger ${active ? 'active' : ''}`}>{label} <ChevronDown size={14} /></button>
      <div className={`draa-nav-dropdown ${wide ? 'draa-nav-dropdown--wide' : ''}`}>
        <span className="draa-nav-dropdown-label">Explore {label}</span>
        <div>
          {links.map((item) => (
            <Link key={item.href + item.label} to={item.href}>
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
  const groupIsActive = (links: typeof companyLinks) => links.some((item) => pathname === item.href || (item.href.startsWith('/services/') && pathname === item.href));

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
          <DesktopMenu label="Solutions" links={solutionLinks} wide active={groupIsActive(solutionLinks)} />
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
          <span>Solutions</span>
          {solutionLinks.map((item) => <NavLink key={item.href + item.label} to={item.href} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
          <a className="draa-mobile-study" href={studyIndiaPortalUrl} target="_blank" rel="noreferrer" onClick={() => setMenuOpen(false)}>Study in India <ArrowRight size={15} /></a>
          <span>Insights</span>
          {insightLinks.slice(0, 2).map((item) => <NavLink key={item.href} to={item.href} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>)}
          <Link className="draa-corp-mobile-cta" to="/contact" onClick={() => setMenuOpen(false)}>Let&apos;s collaborate <ArrowRight size={16} /></Link>
        </nav>
      )}
    </header>
  );
}
