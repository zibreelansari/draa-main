import React, { useEffect } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Globe2,
  GraduationCap,
  Handshake,
  Laptop2,
  Layers,
  Lightbulb,
  MessageCircle,
  Presentation,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import SEO from './SEO';
import { services, servicesBySlug, type ServiceIcon } from './serviceData';
import './DraaCorporateHome.css';
import './ServiceDetailPage.css';

const iconMap: Record<ServiceIcon, React.ComponentType<{ size?: number; className?: string }>> = {
  book: BookOpen,
  calendar: CalendarDays,
  check: CheckCircle2,
  clipboard: ClipboardCheck,
  graduation: GraduationCap,
  handshake: Handshake,
  laptop: Laptop2,
  lightbulb: Lightbulb,
  presentation: Presentation,
  search: Search,
  shield: ShieldCheck,
  users: Users,
  sparkles: Sparkles,
  settings: Settings,
  'trending-up': TrendingUp,
  award: Award,
  briefcase: BriefcaseBusiness,
  building: Building2,
  compass: Compass,
  globe: Globe2,
};

export default function ServiceDetailPage() {
  const { serviceSlug = '' } = useParams();
  const service = servicesBySlug[serviceSlug];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [serviceSlug]);

  if (!service) return <Navigate to="/capabilities" replace />;

  const HeroIcon = iconMap[service.icon] || BookOpen;
  const otherServices = services.filter((item) => item.slug !== service.slug);

  const contactSubject = `${service.shortTitle} Solutions`;

  return (
    <div
      className={`draa-corp service-detail-hub service-detail-pillar--${service.number}`}
      style={{ '--pillar-color': service.themeColor, '--pillar-gradient': service.themeGradient } as React.CSSProperties}
    >
      <SEO
        title={`${service.title} | DRAA Core Services`}
        siteName="DRAA"
        description={service.summary}
        keywords={`${service.shortTitle}, DRAA education services, ${service.bulletPoints.slice(0, 3).join(', ')}`}
        ogImage={service.image}
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION
            ========================================================================= */}
        <section className="sd-hero">
          <div className="sd-hero-mesh" aria-hidden="true" />
          <div className="draa-corp-shell sd-hero-inner">
            <div className="sd-hero-copy">
              <nav className="sd-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/capabilities">Core Services</Link>
                <span>/</span>
                <span className="sd-breadcrumb-current">{service.shortTitle}</span>
              </nav>

              <div className="sd-pillar-pill" style={{ borderColor: `${service.themeColor}40`, color: service.themeColor }}>
                <Sparkles size={14} />
                <strong>CORE BUSINESS ACTIVITY</strong>
              </div>

              <h1>{service.title}</h1>
              <p className="sd-hero-summary">{service.summary}</p>

              <div className="sd-hero-actions">
                <Link
                  className="draa-corp-button draa-corp-button-gold"
                  style={{ background: service.themeColor, borderColor: service.themeColor }}
                  to={`/contact?subject=${encodeURIComponent(contactSubject)}`}
                >
                  Discuss Your Requirement <ArrowRight size={17} />
                </Link>
                <a className="draa-corp-button draa-corp-button-light" href="#scope-and-deliverables">
                  Explore Deliverables
                </a>
              </div>

              {/* Proof Indicators */}
              <div className="sd-hero-proof">
                {service.proof.map((item) => (
                  <div key={item.label}>
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Visual */}
            <div className="sd-hero-visual">
              <div className="sd-hero-image-box">
                <img src={service.image} alt={service.imageAlt} className="sd-hero-img" />
                <div className="sd-floating-card">
                  <div className="sd-floating-icon" style={{ background: `${service.themeColor}18`, color: service.themeColor }}>
                    <HeroIcon size={20} />
                  </div>
                  <div>
                    <strong>{service.shortTitle}</strong>
                    <small>Turnkey Institutional Delivery</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. TARGET AUDIENCES BADGE STRIP
            ========================================================================= */}
        <div className="sd-audience-strip">
          <div className="draa-corp-shell sd-audience-inner">
            <span className="sd-audience-label">Who We Serve:</span>
            <div className="sd-audience-badges">
              {service.audiences.map((audience) => (
                <span key={audience} className="sd-audience-badge">
                  <Users size={14} style={{ color: service.themeColor }} />
                  {audience}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. ALL 5 CORE SERVICES QUICK SWITCHER BAR
            ========================================================================= */}
        <nav className="sd-switcher-nav" aria-label="Core Business Activities Navigator">
          <div className="draa-corp-shell sd-switcher-inner">
            <span className="sd-switcher-title">Core Activities:</span>
            <div className="sd-switcher-links">
              {services.map((item) => {
                const Icon = iconMap[item.icon] || BookOpen;
                const isActive = item.slug === service.slug;
                return (
                  <Link
                    key={item.slug}
                    to={`/services/${item.slug}`}
                    className={`sd-switcher-item ${isActive ? 'active' : ''}`}
                    style={isActive ? { borderColor: item.themeColor, color: item.themeColor } : undefined}
                  >
                    <Icon size={15} />
                    <span>{item.shortTitle}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* =========================================================================
            4. CORE SCOPE CHECKLIST (Relatable Contextual Icons)
            ========================================================================= */}
        <section id="scope-and-deliverables" className="draa-corp-section sd-scope-section">
          <div className="draa-corp-shell">
            <div className="sd-section-header">
              <span className="sd-section-pill" style={{ color: service.themeColor, background: `${service.themeColor}12`, borderColor: `${service.themeColor}30` }}>
                <Target size={14} /> CORE SCOPE &amp; CAPABILITIES
              </span>
              <h2>Comprehensive Activity Spectrum</h2>
              <p>{service.intro}</p>
            </div>

            <div className="sd-scope-grid">
              {(service.capabilities || []).map((cap) => {
                const CapIcon = iconMap[cap.icon] || CheckCircle2;
                return (
                  <div key={cap.text} className="sd-scope-card">
                    <div className="sd-scope-icon-box" style={{ color: service.themeColor, background: `${service.themeColor}12`, borderColor: `${service.themeColor}25` }}>
                      <CapIcon size={20} />
                    </div>
                    <div className="sd-scope-content">
                      <p>{cap.text}</p>
                    </div>
                    <CheckCircle2 size={18} className="sd-scope-check" style={{ color: service.themeColor }} />
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. DETAILED DELIVERABLES (6 Structured Cards)
            ========================================================================= */}
        <section className="draa-corp-section sd-deliverables-section">
          <div className="draa-corp-shell">
            <div className="sd-section-header text-center mx-auto">
              <span className="sd-section-pill" style={{ color: service.themeColor, background: `${service.themeColor}12`, borderColor: `${service.themeColor}30` }}>
                <Zap size={14} /> STRUCTURED DELIVERABLES
              </span>
              <h2>Turnkey Packages Built Around Your Outcomes</h2>
              <p>
                Engage DRAA for a single focused project deliverable or partner on an ongoing, multi-phase institutional program.
                Each deliverable is designed with institutional rigor and outcome accountability.
              </p>
            </div>

            <div className="sd-deliverables-grid">
              {service.deliverables.map((item) => {
                const Icon = iconMap[item.icon] || CheckCircle2;
                return (
                  <article key={item.title} className="sd-deliverable-card">
                    {item.image ? (
                      <div className="sd-deliverable-media-wrap">
                        <img src={item.image} alt={item.title} className="sd-deliverable-media-img" loading="lazy" />
                        <div className="sd-deliverable-media-overlay" />
                        <div
                          className="sd-deliverable-icon sd-deliverable-icon--floating"
                          style={{ color: service.themeColor, borderColor: `${service.themeColor}35` }}
                        >
                          <Icon size={22} />
                        </div>
                      </div>
                    ) : (
                      <div className="sd-deliverable-icon" style={{ background: `${service.themeColor}12`, color: service.themeColor, borderColor: `${service.themeColor}25` }}>
                        <Icon size={24} />
                      </div>
                    )}
                    <div className="sd-deliverable-body">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                      <Link
                        to={`/contact?subject=${encodeURIComponent(`Inquiry regarding ${item.title}`)}`}
                        className="sd-deliverable-link"
                        style={{ color: service.themeColor }}
                      >
                        Request Details <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. MEASURABLE OUTCOMES STRIP
            ========================================================================= */}
        <section className="draa-corp-section sd-outcomes-strip">
          <div className="draa-corp-shell sd-outcomes-inner">
            <h3>
              <Sparkles size={16} style={{ color: service.themeColor, marginRight: 8, verticalAlign: -2 }} />
              Expected Outcomes:
            </h3>
            <div className="sd-outcomes-list">
              {service.outcomes.map((outcome) => (
                <span key={outcome} className="sd-outcome-item">
                  <Check size={16} style={{ color: service.themeColor }} />
                  {outcome}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. WHERE WE ADD VALUE (Problem - Solution Matrix)
            ========================================================================= */}
        <section className="draa-corp-section sd-value-section">
          <div className="draa-corp-shell">
            <div className="sd-two-col-header">
              <div>
                <span className="sd-section-pill" style={{ color: service.themeColor, background: `${service.themeColor}12`, borderColor: `${service.themeColor}30` }}>
                  <ShieldCheck size={14} /> WHY DRAA
                </span>
                <h2>Transforming Challenges into High-Impact Solutions</h2>
              </div>
              <p>
                Every engagement is structured to eliminate operational friction, elevate academic quality, and produce verifiable results for stakeholders across your entire institution.
              </p>
            </div>

            <div className="sd-challenges-grid">
              {service.challenges.map((item) => {
                const Icon = iconMap[item.icon] || ShieldCheck;
                return (
                  <div key={item.title} className="sd-challenge-card">
                    <div className="sd-challenge-header">
                      <div className="sd-challenge-icon" style={{ color: service.themeColor, background: `${service.themeColor}10`, borderColor: `${service.themeColor}25` }}>
                        <Icon size={22} />
                      </div>
                      <h3>{item.title}</h3>
                    </div>
                    <p>{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. 4-STAGE DELIVERY LIFECYCLE
            ========================================================================= */}
        <section className="draa-corp-section sd-process-section">
          <div className="draa-corp-shell">
            <div className="sd-section-header text-center mx-auto">
              <span className="sd-section-pill" style={{ color: service.themeColor, background: `${service.themeColor}12`, borderColor: `${service.themeColor}30` }}>
                <Layers size={14} /> DELIVERY ROADMAP
              </span>
              <h2>How We Work With Your Institution</h2>
              <p>
                A disciplined, milestone-driven process ensuring total alignment, transparent governance, and on-schedule handover at every phase.
              </p>
            </div>

            <div className="sd-process-timeline">
              {service.process.map((step, idx) => (
                <div key={step.title} className="sd-process-card">
                  <div className="sd-process-step-num" style={{ background: service.themeColor, color: '#fff' }}>
                    0{idx + 1}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. EXPLORE OTHER 4 CORE ACTIVITIES
            ========================================================================= */}
        <section className="draa-corp-section sd-other-services-section">
          <div className="draa-corp-shell">
            <div className="sd-section-header">
              <span className="sd-section-pill" style={{ borderColor: `rgba(15,23,42,0.15)` }}>
                CONNECTED CORE SERVICES
              </span>
              <h2>Explore Our Other Core Business Activities</h2>
              <p>
                Combine multiple services into a holistic educational transformation roadmap for your institution.
              </p>
            </div>

            <div className="sd-other-services-grid">
              {otherServices.map((item) => {
                const Icon = iconMap[item.icon] || BookOpen;
                return (
                  <Link key={item.slug} to={`/services/${item.slug}`} className="sd-other-card">
                    <div className="sd-other-top">
                      <div className="sd-other-icon-wrap" style={{ background: `${item.themeColor}15`, color: item.themeColor }}>
                        <Icon size={22} />
                      </div>
                    </div>
                    <h3>{item.shortTitle}</h3>
                    <p>{item.summary}</p>
                    <span className="sd-other-link" style={{ color: item.themeColor }}>
                      Explore Service <ChevronRight size={15} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. FINAL CONVERSION BANNER
            ========================================================================= */}
        <section className="sd-final-cta-section" style={{ background: service.themeGradient }}>
          <div className="draa-corp-shell sd-final-cta-inner">
            <div className="sd-cta-copy">
              <span className="sd-cta-pill">
                <Sparkles size={14} /> Ready to Get Started?
              </span>
              <h2>Let&apos;s Design the Right {service.shortTitle} Solution</h2>
              <p>
                Share your requirements, cohort details, or institutional vision with our team to receive a tailored proposal and implementation blueprint.
              </p>
            </div>
            <div className="sd-cta-actions">
              <Link
                to={`/contact?subject=${encodeURIComponent(contactSubject)}`}
                className="draa-corp-button draa-corp-button-dark"
              >
                Initiate Conversation <ArrowRight size={17} />
              </Link>
              <Link to="/capabilities" className="draa-corp-button draa-corp-button-light">
                View All Core Services
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
