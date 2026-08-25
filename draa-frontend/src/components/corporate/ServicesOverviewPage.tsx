import React from 'react';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Compass,
  GraduationCap,
  Handshake,
  HeartHandshake,
  Laptop2,
  Layers,
  MessageCircle,
  Presentation,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import SEO from './SEO';
import { services, type ServiceIcon } from './serviceData';
import './DraaCorporateHome.css';
import './ServicesOverviewPage.css';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  book: BookOpen,
  calendar: CalendarDays,
  check: CheckCircle2,
  clipboard: ClipboardList,
  graduation: GraduationCap,
  handshake: Handshake,
  laptop: Laptop2,
  presentation: Presentation,
  shield: ShieldCheck,
  users: Users,
  sparkles: Sparkles,
  compass: Compass,
  briefcase: BriefcaseBusiness,
  building: Building2,
};

const engagementModels = [
  {
    icon: ClipboardList,
    title: 'Specialist assignment',
    tag: 'FOCUSED REQUIREMENT',
    description: 'A defined content, training, advisory or event requirement with fixed milestone delivery.',
  },
  {
    icon: Users,
    title: 'Custom programme',
    tag: 'MULTI-SESSION COHORT',
    description: 'A multi-session or multi-format educational capability solution architected for a specific audience.',
  },
  {
    icon: Workflow,
    title: 'End-to-end delivery',
    tag: 'TURNKEY EXECUTION',
    description: 'Complete strategy, instructional design, production, event coordination and review under one unified plan.',
  },
  {
    icon: HeartHandshake,
    title: 'Ongoing partnership',
    tag: 'STRATEGIC ALLIANCE',
    description: 'A structured, long-term institutional relationship spanning multiple academic and capability priorities.',
  },
];

import AnimatedHeroBackground from './AnimatedHeroBackground';

export default function ServicesOverviewPage() {
  return (
    <div className="draa-corp capabilities-hub">
      <SEO
        title="Our Capabilities & Educational Services | DRAA"
        siteName="DRAA"
        description="Explore DRAA's six integrated core capabilities: Educational Content Development, Academic Training, Events & Conferences, Consultancy, Digital Learning, and Study in India Guidance."
        keywords="DRAA capabilities, educational services, academic publishing, faculty training, education events, educational consultancy, digital learning solutions, study in india"
        ogImage="/brand/corporate/stock/academic_publishing_hero.jpg"
      />
      <DraaCorporateHeader />

      <main>
        <section className="cap-hero">
          <div className="cap-hero-bg-wrap">
            <img
              src="/brand/corporate/stock/draa_leadership_executive.jpg"
              alt="DRAA Education Leadership & Strategy Consultants in Boardroom"
              className="cap-hero-bg-img"
            />
            <div className="cap-hero-overlay" />
          </div>

          <div className="draa-corp-shell cap-hero-inner">
            <div className="cap-hero-copy">
              <span className="cap-pill">
                <Sparkles size={13} /> OUR CAPABILITIES
              </span>

              <h1>
                Solutions that <span>educate.</span>
                <br />
                <em>Outcomes that matter.</em>
              </h1>

              <p className="cap-hero-lead">
                Engage DRAA for one specialist requirement or combine capabilities into a complete, outcome-driven educational programme tailored to your institution.
              </p>

              <div className="cap-hero-actions">
                <a href="#what-we-do" className="draa-corp-button draa-corp-button-gold">
                  Explore 6 Capabilities <ArrowRight size={16} />
                </a>
                <Link to="/contact" className="draa-corp-button draa-corp-button-light">
                  Discuss Your Needs <MessageCircle size={16} />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Page Jump Navigation Bar */}
          <div className="draa-corp-shell cap-quick-nav-shell">
            <div className="cap-quick-nav">
              <div className="cap-quick-label">
                <span>ON THIS PAGE</span>
              </div>
              <div className="cap-quick-links">
                <a href="#what-we-do" className="cap-quick-link">
                  <span>01</span> What we do
                </a>
                <a href="#ways-to-engage" className="cap-quick-link">
                  <span>02</span> Ways to engage
                </a>
                <a href="#why-draa" className="cap-quick-link">
                  <span>03</span> Why partner with DRAA
                </a>
              </div>
              <Link to="/contact" className="cap-quick-cta">
                <span>Not sure where to start?</span>
                <div className="cap-quick-cta-icon">
                  <ArrowRight size={14} />
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. WHAT WE DO (5 Core Capabilities Blended Bento Cards matching Sample 2)
            ========================================================================= */}
        <section id="what-we-do" className="draa-corp-section cap-what-section">
          <div className="draa-corp-shell">
            <div className="cap-what-layout">
              {/* Left Column Intro */}
              <div className="cap-what-intro">
                <span className="cap-section-pill">
                  <Layers size={14} /> WHAT WE DO
                </span>
                <h2>Five capabilities. One accountable partner.</h2>
                <p>
                  Each capability is meticulously planned for your target audience, delivery context, and desired learning outcome—from primary education and university degrees to enterprise upskilling.
                </p>
                <div className="cap-intro-badges">
                  <div className="cap-intro-badge">
                    <CheckCircle2 size={16} />
                    <span>NEP 2020 &amp; OBE Aligned</span>
                  </div>
                  <div className="cap-intro-badge">
                    <CheckCircle2 size={16} />
                    <span>100% Client-Owned IP</span>
                  </div>
                  <div className="cap-intro-badge">
                    <CheckCircle2 size={16} />
                    <span>Turnkey Multi-Modal Handover</span>
                  </div>
                </div>
              </div>

              {/* Right Column Bento Cards Grid */}
              <div className="cap-bento-grid">
                {services.map((service) => {
                  const Icon = iconMap[service.icon] || BookOpen;
                  return (
                    <Link
                      key={service.slug}
                      to={`/services/${service.slug}`}
                      className={`cap-bento-card cap-bento-card--${service.slug}`}
                      style={{ '--service-theme': service.themeColor } as React.CSSProperties}
                    >
                      <div className="cap-bento-media">
                        <img src={service.image} alt={service.title} loading="lazy" />
                        <div className="cap-bento-overlay" />
                        <div className="cap-bento-icon-badge" style={{ color: service.themeColor }}>
                          <Icon size={20} />
                        </div>
                      </div>

                      <div className="cap-bento-content">
                        <h3>{service.title}</h3>
                        <p>{service.summary}</p>
                        <div className="cap-bento-footer">
                          <span className="cap-bento-link" style={{ color: service.themeColor }}>
                            Explore Capability <ArrowRight size={14} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. WAYS TO ENGAGE (4 Clear Support Levels matching Sample 3)
            ========================================================================= */}
        <section id="ways-to-engage" className="draa-corp-section cap-engage-section">
          <div className="draa-corp-shell">
            <div className="cap-engage-layout">
              {/* Left Column Intro */}
              <div className="cap-engage-intro">
                <span className="cap-section-pill">
                  <Target size={14} /> WAYS TO ENGAGE
                </span>
                <h2>Choose the level of support that fits your requirement.</h2>
                <p>
                  Start with a focused single assignment or combine services into a comprehensive, multi-phase programme managed by DRAA with milestone accountability.
                </p>
                <div className="cap-engage-action">
                  <Link to="/contact" className="draa-corp-button draa-corp-button-dark">
                    Submit a Project Brief <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              {/* Right Column 4 Engagement Level Cards */}
              <div className="cap-engage-grid">
                {engagementModels.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="cap-engage-card">
                      <div className="cap-engage-card-top">
                        <span className="cap-engage-tag">{item.tag}</span>
                        <div className="cap-engage-icon-wrap">
                          <Icon size={22} />
                        </div>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. WHY DRAA (Connected Delivery Advantage)
            ========================================================================= */}
        <section id="why-draa" className="draa-corp-section cap-why-section">
          <div className="draa-corp-shell">
            <div className="cap-section-header text-center mx-auto">
              <span className="cap-section-pill">
                <ShieldCheck size={14} /> THE DRAA ADVANTAGE
              </span>
              <h2>Why Institutions Rely on Our Capabilities</h2>
              <p>
                We bridge the gap between academic vision and execution reality through our specialized authoring, training, event operations, advisory, and technology teams.
              </p>
            </div>

            <div className="cap-advantage-grid">
              <div className="cap-advantage-card">
                <div className="cap-adv-icon">
                  <BookOpen size={24} />
                </div>
                <h3>Syllabus &amp; OBE Precision</h3>
                <p>
                  Every piece of content, training syllabus, and digital module is rigorously mapped against Bloom’s Taxonomy and institutional credit frameworks.
                </p>
              </div>

              <div className="cap-advantage-card">
                <div className="cap-adv-icon">
                  <ShieldCheck size={24} />
                </div>
                <h3>100% Client Ownership</h3>
                <p>
                  Your institution retains full copyright, intellectual property, master source files, and distribution rights with zero recurring licensing royalties.
                </p>
              </div>

              <div className="cap-advantage-card">
                <div className="cap-adv-icon">
                  <Laptop2 size={24} />
                </div>
                <h3>Multi-Format Handover</h3>
                <p>
                  From print-ready CMYK pre-press PDFs to accessible ePub3, SCORM packages, and cloud LMS portals—we deliver across every learning modality.
                </p>
              </div>

              <div className="cap-advantage-card">
                <div className="cap-adv-icon">
                  <Handshake size={24} />
                </div>
                <h3>One Accountable Partner</h3>
                <p>
                  Eliminate fragmented vendor management. Work with a unified partner capable of driving content, training, events, consultancy, and EdTech simultaneously.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. FINAL CONVERSION BANNER (Executive Dark Canvas matching Sample 3 bottom)
            ========================================================================= */}
        <section className="cap-final-banner">
          <div className="draa-corp-shell cap-final-inner">
            <div className="cap-final-copy">
              <span className="cap-final-eyebrow">WORK WITH DRAA</span>
              <h2>Let’s shape the right educational solution.</h2>
              <p>
                Share your requirements, cohort details, or institutional roadmap with our team to receive a tailored capabilities blueprint.
              </p>
            </div>
            <div className="cap-final-actions">
              <Link to="/contact" className="cap-final-cta-btn">
                Start a conversation <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <DraaCorporateFooter />
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
