import { useState } from 'react';
import { LogIn, Menu, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import './DraaCorporateHome.css';

const navigation = [
  { label: 'Home', href: '/' },
  { label: 'About DRAA', href: '/about-draa' },
  { label: 'Capabilities', href: '/capabilities' },
  { label: 'Study in India', href: '/study-in-india' },
  { label: 'Learning & Events', href: '/learning-events' },
  { label: 'Who We Support', href: '/who-we-support' },
  { label: 'Contact', href: '/contact' },
];

export default function DraaCorporateHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="draa-corp-header">
      <div className="draa-corp-shell draa-corp-header-inner">
        <Link to="/" className="draa-corp-brand" aria-label="DRAA home">
          <span className="draa-corp-brand-mark">
            <img src="/brand/draa-mark.png" alt="" />
          </span>
          <span className="draa-corp-brand-copy">
            <strong>DRAA</strong>
            <small>Education Services &amp; Knowledge Management</small>
          </span>
        </Link>

        <nav className="draa-corp-nav" aria-label="Main navigation">
          {navigation.map((item) => (
            <NavLink key={item.label} to={item.href} className={({ isActive }) => isActive ? 'active' : undefined}>{item.label}</NavLink>
          ))}
        </nav>

        <Link className="draa-corp-header-cta" to="/login">
          Student Login <LogIn size={16} />
        </Link>

        <button
          type="button"
          className="draa-corp-menu-button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <nav className="draa-corp-mobile-nav" aria-label="Mobile navigation">
          {navigation.map((item) => (
            <NavLink key={item.label} to={item.href} className={({ isActive }) => isActive ? 'active' : undefined} onClick={() => setMenuOpen(false)}>{item.label}</NavLink>
          ))}
          <Link className="draa-corp-mobile-cta" to="/login" onClick={() => setMenuOpen(false)}>
            Student Login <LogIn size={16} />
          </Link>
        </nav>
      )}
    </header>
  );
}
