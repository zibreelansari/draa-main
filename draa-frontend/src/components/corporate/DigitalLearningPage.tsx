import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Cloud,
  Code2,
  Cpu,
  Database,
  GraduationCap,
  Laptop,
  Laptop2,
  Layers,
  LayoutDashboard,
  Lock,
  MonitorPlay,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DigitalTechLatticeBackground from './DigitalTechLatticeBackground';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import SEO from './SEO';
import './DraaCorporateHome.css';
import './DigitalLearningPage.css';

interface ServiceCardItem {
  icon: React.ComponentType<{ size?: number }>;
  tagline: string;
  title: string;
  desc: string;
  points: string[];
  link: string;
}

const digitalServices: ServiceCardItem[] = [
  {
    icon: LayoutDashboard,
    tagline: 'Custom LMS & Portals',
    title: 'Institutional LMS & Learning Portals',
    desc: 'Bespoke learning management environments tailored for university faculties, student cohorts, and corporate training programs with full branding control.',
    points: [
      'Role-based dashboards for Learners, Instructors & Admins',
      'Automated grading, gradebook sync & attendance tracking',
      'Interactive discussion forums & live webinar integrations',
      'LTI 1.3 Advantage & SCORM 2004 compliance',
    ],
    link: '/contact?subject=Custom%20LMS%20%26%20Portal%20Development',
  },
  {
    icon: MonitorPlay,
    tagline: 'Interactive Courseware',
    title: 'SCORM & Digital Courseware Packaging',
    desc: 'High-engagement digital course assets, micro-learning video modules, and H5P interactive simulations architected for maximum learner retention.',
    points: [
      'Bite-sized micro-modules indexed to Bloom’s Taxonomy',
      'H5P interactive quizzes, branch scenarios & drag-and-drop',
      'High-definition video production & animated motion graphics',
      'Responsive delivery across desktop, tablet, and mobile',
    ],
    link: '/contact?subject=Interactive%20Courseware%20Packaging',
  },
  {
    icon: CheckCircle2,
    tagline: 'Assessment Engines',
    title: 'Digital Assessment & Evaluation Systems',
    desc: 'Secure, high-concurrency examination platforms, adaptive question banks, and automated grading systems for reliable evaluation.',
    points: [
      'Multi-format questions (MCQs, coding sandboxes, descriptive)',
      'Automated anti-cheating, proctoring & tab-lockout protocols',
      'Instant outcome analytics & verifiable digital transcripts',
      'CBSE, University & Corporate certification readiness',
    ],
    link: '/contact?subject=Digital%20Assessment%20Engines',
  },
  {
    icon: Smartphone,
    tagline: 'Mobile Learning Apps',
    title: 'Cross-Platform Mobile Learning Applications',
    desc: 'Native and Progressive Web Apps (PWAs) that allow learners to access lectures, download offline study materials, and track progress on iOS and Android.',
    points: [
      'Offline caching & background synchronization',
      'Personalized push notifications & streak gamification',
      'Low-bandwidth video streaming optimizations',
      'App Store & Google Play Store release management',
    ],
    link: '/contact?subject=Mobile%20Learning%20App%20Development',
  },
  {
    icon: Server,
    tagline: 'Institutional ERP & Portals',
    title: 'Student ERP & Campus Workflow Systems',
    desc: 'Integrated web applications simplifying student admissions, fee payments, document verification, and academic transcripts.',
    points: [
      'Single Sign-On (SSO) with OAuth, Google & SAML',
      'Payment gateway integrations (Razorpay, UPI, Stripe)',
      'Verifiable QR-coded digital diplomas & certificates',
      'NAAC / NIRF audit-ready data export pipelines',
    ],
    link: '/contact?subject=Institutional%20ERP%20%26%20Portal%20Development',
  },
  {
    icon: Cloud,
    tagline: 'Cloud & 24/7 DevOps',
    title: 'Cloud Architecture, Security & Support',
    desc: 'High-availability AWS/GCP cloud deployments, data encryption, and dedicated DevOps support to guarantee 99.9% uptime for digital learning.',
    points: [
      'Auto-scaling server clusters handling 50,000+ concurrent users',
      'End-to-end SSL encryption & GDPR/DPDP compliant storage',
      'Daily automated database snapshots & disaster recovery',
      '24/7 technical monitoring & uptime guarantees',
    ],
    link: '/contact?subject=Cloud%20Architecture%20%26%20Maintenance',
  },
];

const audienceTabs = [
  {
    id: 'higher-ed',
    label: 'Higher Education',
    kicker: 'Universities & Autonomous Colleges',
    title: 'Connected Digital Campuses for Modern Higher Ed',
    desc: 'We engineer enterprise-grade LMS architectures and student information systems that unite degree courseware, OBE assessment rubrics, and NAAC reporting under one roof.',
    image: '/brand/corporate/stock/university-building.jpg',
    features: [
      'OBE Courseware mapping directly linked to Bloom’s taxonomy',
      'Turnkey NAAC/NIRF criteria data collection dashboards',
      'High-concurrency semester exam & viva scheduling portals',
      'Full institutional branding with custom domain & SSO',
    ],
  },
  {
    id: 'schools',
    label: 'K–12 School Networks',
    kicker: 'Progressive Schools & Chain Networks',
    title: 'Blended Learning Platforms for Schools',
    desc: 'Give teachers, students, and parents a unified digital portal with interactive curriculum workbooks, automated homework trackers, and NEP 2020 skill report cards.',
    image: '/brand/corporate/stock/classroom.jpg',
    features: [
      'Syllabus-aligned digital worksheets & video lessons',
      'Parent-teacher communication & real-time attendance',
      'Gamified quiz arenas with badges & leaderboards',
      'Accessible on entry-level tablets and smartphones',
    ],
  },
  {
    id: 'corporate',
    label: 'Corporate Enterprise L&D',
    kicker: 'Workforce Upskilling & Academies',
    title: 'Custom Corporate Learning & Onboarding Hubs',
    desc: 'Deliver measurable employee upskilling with modular micro-learning courses, executive leadership simulation briefs, and detailed team capability matrices.',
    image: '/brand/corporate/stock/corporate_training_room.jpg',
    features: [
      'Role-based learning tracks with executive certification',
      'SCORM integration with existing enterprise HRMS platforms',
      'Manager dashboards tracking completion & skill mastery',
      '100% enterprise copyright and proprietary IP transfer',
    ],
  },
  {
    id: 'edtech',
    label: 'EdTech Brands',
    kicker: 'Fast-Growing EdTech Startups',
    title: 'Scalable Platform Foundations for EdTech Innovators',
    desc: 'Accelerate your time-to-market with modern React/Next.js frontend architectures, scalable video streaming pipelines, and secure payment workflows.',
    image: '/brand/corporate/stock/ai_tech_lab.jpg',
    features: [
      'Next.js 14 & React architectures with instant page loads',
      'Adaptive testing algorithms & personalized recommendation engines',
      'Live streaming virtual classroom with whiteboard tools',
      'Scalable multi-tenant SaaS architecture for rapid growth',
    ],
  },
];

const lifecycleSteps = [
  {
    icon: Search,
    title: 'Discover & Blueprint',
    desc: 'Comprehensive analysis of learner journeys, technical constraints, LTI/SIS integrations, and UI/UX wireframing.',
  },
  {
    icon: Code2,
    title: 'Agile Engineering',
    desc: 'Sprint-based full-stack software development with clean TypeScript, modular components, and database schemas.',
  },
  {
    icon: ShieldCheck,
    title: 'QA & Compliance Audit',
    desc: 'Rigorous cross-device testing, WCAG 2.1 AA accessibility checks, SCORM validation, and load testing.',
  },
  {
    icon: Rocket,
    title: 'Deployment & Training',
    desc: 'Seamless cloud production launch, administrator masterclasses, educator onboarding, and 24/7 maintenance.',
  },
];

export default function DigitalLearningPage() {
  const [activeTabId, setActiveTabId] = useState('higher-ed');
  const activeTab = audienceTabs.find((t) => t.id === activeTabId) || audienceTabs[0];

  return (
    <div className="draa-corp dl-page-root">
      <SEO
        title="Digital Learning Solutions & EdTech Architecture | DRAA"
        siteName="DRAA"
        description="DRAA engineers customized LMS portals, SCORM courseware, digital assessment engines, mobile learning apps, and institutional ERP platforms for schools and universities."
        keywords="digital learning solutions, custom LMS development, EdTech software engineering, SCORM packaging, online examination system, higher ed student portal, New Delhi EdTech"
        ogImage="/brand/corporate/stock/digital-learning.jpg"
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION WITH DEDICATED TECH LATTICE CANVAS
            ========================================================================= */}
        <section className="dl-hero">
          <DigitalTechLatticeBackground />
          <div className="draa-corp-shell dl-hero-grid">
            {/* Hero Left Content */}
            <div>
              <span className="dl-kicker">
                <Cpu size={14} /> EDTECH &amp; DIGITAL LEARNING ARCHITECTURE
              </span>
              <h1>
                Scalable digital platforms <span>built for learning impact</span>
              </h1>
              <p className="dl-hero-summary">
                From custom institutional LMS portals and SCORM courseware to adaptive testing engines and campus ERPs—we engineer secure, accessible, high-retention digital education solutions.
              </p>
              <div className="dl-hero-actions">
                <Link to="/contact?subject=Digital%20Learning%20Solutions" className="draa-corp-button draa-corp-button-gold">
                  Request a Tech Consultation <ArrowRight size={17} />
                </Link>
                <a href="#services" className="draa-corp-button draa-corp-button-light">
                  Explore Capabilities
                </a>
              </div>

              <div className="dl-hero-proof">
                <div className="dl-proof-item">
                  <strong>SCORM &amp; LTI 1.3</strong>
                  <span>Global Standard Compliant</span>
                </div>
                <div className="dl-proof-item">
                  <strong>99.9% Cloud Uptime</strong>
                  <span>AWS &amp; Microservices</span>
                </div>
                <div className="dl-proof-item">
                  <strong>100% IP Ownership</strong>
                  <span>Client-Owned Source Code</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Interactive LMS & Tech Console Visual */}
            <div className="dl-hero-console">
              <div className="dl-console-header">
                <div className="dl-console-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="dl-console-badge">
                  <Sparkles size={12} style={{ display: 'inline', marginRight: 4 }} /> Enterprise EdTech Stack
                </span>
              </div>

              <div className="dl-console-media-box">
                <img
                  src="/brand/corporate/stock/digital-learning.jpg"
                  alt="Modern digital learning and LMS workstation"
                  className="dl-console-img"
                  loading="eager"
                />
                <div className="dl-console-overlay-tag">
                  <Laptop2 size={15} /> Turnkey LMS &amp; Portal Hub
                </div>
              </div>

              <div className="dl-console-metrics-grid">
                <div className="dl-console-metric-item">
                  <strong>WCAG 2.1</strong>
                  <small>Accessible UI</small>
                </div>
                <div className="dl-console-metric-item">
                  <strong>SSO &amp; SAML</strong>
                  <small>Secure Auth</small>
                </div>
                <div className="dl-console-metric-item">
                  <strong>REST &amp; GraphQL</strong>
                  <small>API Integration</small>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. TECH COMPATIBILITY & STANDARDS STRIP
            ========================================================================= */}
        <section className="dl-tech-strip">
          <div className="draa-corp-shell dl-tech-strip-inner">
            <span className="dl-tech-strip-label">Supported Technologies:</span>
            <div className="dl-tech-pills-row">
              {[
                { icon: Code2, label: 'React & Next.js' },
                { icon: Database, label: 'TypeScript & Node' },
                { icon: Layers, label: 'SCORM & LTI 1.3' },
                { icon: Cloud, label: 'AWS & Cloud Hosting' },
                { icon: Lock, label: 'Role-Based RBAC' },
                { icon: Smartphone, label: 'iOS & Android PWAs' },
              ].map((tech) => {
                const Icon = tech.icon;
                return (
                  <div key={tech.label} className="dl-tech-pill">
                    <Icon size={14} />
                    <span>{tech.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. 6 CORE DIGITAL LEARNING SERVICES
            ========================================================================= */}
        <section id="services" className="dl-section">
          <div className="draa-corp-shell">
            <div className="dl-section-header">
              <span className="dl-section-pill">
                <Layers size={14} /> CORE CAPABILITIES
              </span>
              <h2>End-to-End Digital Learning &amp; EdTech Services</h2>
              <p>
                From single interactive modules to campus-wide learning architectures, our team delivers high-performing educational software.
              </p>
            </div>

            <div className="dl-services-grid">
              {digitalServices.map((svc) => {
                const Icon = svc.icon;
                return (
                  <article key={svc.title} className="dl-service-card">
                    <div className="dl-service-icon-box">
                      <Icon size={24} />
                    </div>
                    <span className="dl-service-tagline">{svc.tagline}</span>
                    <h3>{svc.title}</h3>
                    <p className="dl-service-desc">{svc.desc}</p>
                    <ul className="dl-service-checklist">
                      {svc.points.map((pt) => (
                        <li key={pt}>
                          <Check size={14} />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to={svc.link} className="dl-service-action">
                      Discuss this solution <ArrowRight size={14} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. TABBED SOLUTION ARCHITECTURE EXPLORER
            ========================================================================= */}
        <section className="dl-section dl-section-tint">
          <div className="draa-corp-shell">
            <div className="dl-section-header">
              <span className="dl-section-pill">
                <Laptop size={14} /> TAILORED ARCHITECTURES
              </span>
              <h2>Digital Solutions Engineered for Your Sector</h2>
              <p>
                Explore how we architect learning platforms across higher education, K–12 schools, enterprise teams, and EdTech innovators.
              </p>
            </div>

            {/* Tab Selector Buttons */}
            <div className="dl-tab-buttons-row" role="tablist">
              {audienceTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTabId === tab.id}
                  className={`dl-tab-btn ${activeTabId === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Active Tab Showcase Box */}
            <div className="dl-tab-showcase-box">
              <div className="dl-tab-showcase-content">
                <span className="kicker">{activeTab.kicker}</span>
                <h3>{activeTab.title}</h3>
                <p>{activeTab.desc}</p>
                <ul className="dl-tab-showcase-features">
                  {activeTab.features.map((feat) => (
                    <li key={feat}>
                      <CheckCircle2 size={16} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/contact?subject=${encodeURIComponent(activeTab.title)}`}
                  className="draa-corp-button draa-corp-button-gold"
                  style={{ alignSelf: 'flex-start' }}
                >
                  Consult on {activeTab.label} Architecture <ArrowRight size={16} />
                </Link>
              </div>

              <div className="dl-tab-showcase-media">
                <img
                  src={activeTab.image}
                  alt={activeTab.title}
                  className="dl-tab-showcase-img"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. 4-STAGE AGILE ENGINEERING LIFECYCLE
            ========================================================================= */}
        <section className="dl-section">
          <div className="draa-corp-shell">
            <div className="dl-section-header">
              <span className="dl-section-pill">
                <Zap size={14} /> ENGINEERING WORKFLOW
              </span>
              <h2>How We Deliver Your Digital Learning Platform</h2>
              <p>
                A transparent, agile development lifecycle ensuring on-time milestone releases, comprehensive testing, and effortless faculty adoption.
              </p>
            </div>

            <div className="dl-lifecycle-grid">
              {lifecycleSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="dl-lifecycle-card">
                    <div className="dl-lifecycle-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Conversion CTA Banner */}
            <div className="dl-cta-banner">
              <div className="dl-cta-copy">
                <h2>Ready to build your custom digital learning environment?</h2>
                <p>
                  Schedule a technical discovery session with our senior learning software architects. We will evaluate your scope, outline a component architecture, and provide a clear timeline.
                </p>
              </div>
              <Link to="/contact?subject=Digital%20Learning%20Architecture" className="dl-cta-btn">
                Start Architecture Dialogue <ArrowRight size={17} />
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
