import React, { useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Check,
  CheckCircle2,
  Code2,
  Cpu,
  Globe,
  GraduationCap,
  Layers,
  Layout,
  LayoutDashboard,
  Lock,
  MonitorSmartphone,
  Paintbrush,
  Palette,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserCheck,
  Wrench,
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
  image: string;
  imageAlt: string;
  points: string[];
  link: string;
}

const digitalServices: ServiceCardItem[] = [
  {
    icon: Globe,
    tagline: 'Custom Web Solutions',
    title: 'Website & Web Application Development',
    desc: 'Modern, ultra-fast, and responsive websites engineered for small-to-medium businesses, schools, startups, and corporate brands.',
    image: '/brand/corporate/stock/web_dev_mockup.jpg',
    imageAlt: 'Photorealistic modern responsive website mockup on MacBook Pro',
    points: [
      'Corporate, institutional & e-commerce websites',
      'High-converting landing pages & lead generation forms',
      'SEO-friendly, mobile-first design with instant page loads',
      'React, Next.js, WordPress & modern headless CMS setups',
    ],
    link: '/contact?subject=Website%20Development%20Inquiry',
  },
  {
    icon: Smartphone,
    tagline: 'iOS & Android Apps',
    title: 'Mobile App Development',
    desc: 'Intuitive, high-performance mobile applications built for small and mid-sized businesses, service providers, and educational platforms.',
    image: '/brand/corporate/stock/app_dev_mockup.jpg',
    imageAlt: 'Two modern smartphones displaying sleek mobile application UI screens',
    points: [
      'Cross-platform iOS & Android mobile applications (React Native / Flutter)',
      'Push notifications, user login & seamless payment gateways',
      'Offline data caching & smooth user navigation',
      'Full deployment to Apple App Store & Google Play Store',
    ],
    link: '/contact?subject=Mobile%20App%20Development%20Inquiry',
  },
  {
    icon: Palette,
    tagline: 'Personal & Professional Brands',
    title: 'Portfolio & Showcase Website Design',
    desc: 'Sleek, bespoke portfolio websites for doctors, professors, consultants, researchers, freelancers, and creative professionals to showcase their work.',
    image: '/brand/corporate/stock/portfolio_mockup.jpg',
    imageAlt: 'Executive personal portfolio website mockup on a tablet screen',
    points: [
      'Interactive project galleries & dynamic case studies',
      'One-click CV/resume downloads & social links integration',
      'Direct inquiry & appointment booking forms',
      'Custom domain setup & personalized corporate email',
    ],
    link: '/contact?subject=Portfolio%20Website%20Design',
  },
  {
    icon: Wrench,
    tagline: 'SME Tech Maintenance',
    title: 'Small & Medium-Sized Tech Solutions',
    desc: 'Reliable technical support for routine fixes, speed optimization, plugin upgrades, payment gateway integration, and workflow automation.',
    image: '/brand/corporate/stock/tech_support_mockup.jpg',
    imageAlt: 'Developer workstation with clean code debugging and API integration',
    points: [
      'Website bug fixes, malware removal & performance tuning',
      'Payment gateways (Razorpay, Stripe, UPI) & form integrations',
      'Database updates, API connectors & third-party tools setup',
      'Monthly technical maintenance & security backup packages',
    ],
    link: '/contact?subject=Tech%20Support%20%26%20Maintenance',
  },
  {
    icon: LayoutDashboard,
    tagline: 'Portals & LMS',
    title: 'Client Portals & Learning Platforms',
    desc: 'Lightweight, custom management portals and learning dashboards designed around your specific team workflows and customer needs.',
    image: '/brand/corporate/stock/client_portal_mockup.jpg',
    imageAlt: 'Modern SaaS client portal dashboard with project cards and analytics',
    points: [
      'Client login areas, invoice tracking & document sharing',
      'Course video players, quiz modules & certificate issuance',
      'Role-based admin dashboards with actionable analytics',
      'Single Sign-On (SSO) & passwordless authentication',
    ],
    link: '/contact?subject=Client%20Portal%20Development',
  },
  {
    icon: Paintbrush,
    tagline: 'UI/UX & Prototyping',
    title: 'UI/UX Design & Brand Prototyping',
    desc: 'Clean, user-friendly interface designs and clickable Figma prototypes that give your product a modern, trustworthy look before development.',
    image: '/brand/corporate/stock/uiux_design_mockup.jpg',
    imageAlt: 'Designer desktop monitor displaying Figma UI wireframes and design system',
    points: [
      'User journey mapping, wireframing & design systems',
      'Clickable interactive prototypes for investor & client demos',
      'Modern aesthetics with dark/light themes & micro-animations',
      'Turnkey asset handover with complete design tokens',
    ],
    link: '/contact?subject=UI%20UX%20Design%20Inquiry',
  },
];

const audienceTabs = [
  {
    id: 'sme-business',
    label: 'Small & Medium Businesses',
    kicker: 'Growing Companies & Service Providers',
    title: 'Professional Web & Mobile Solutions for Businesses',
    desc: 'We build high-converting websites, booking apps, and client portals that establish credibility, automate routine tasks, and generate consistent customer inquiries.',
    image: '/brand/corporate/stock/web_dev_mockup.jpg',
    features: [
      'Responsive, branded websites with Google Local SEO setup',
      'Integrated contact forms, WhatsApp chat & appointment booking',
      'Automated invoice generation & secure UPI/Card checkout',
      'Fast turnaround (1–3 weeks) with full source code ownership',
    ],
  },
  {
    id: 'portfolios',
    label: 'Portfolios & Professionals',
    kicker: 'Consultants, Academics & Creators',
    title: 'Standout Portfolio Websites That Build Authority',
    desc: 'Elevate your personal brand with an executive showcase site highlighting your publications, client testimonials, media appearances, and key career achievements.',
    image: '/brand/corporate/stock/portfolio_mockup.jpg',
    features: [
      'Custom layout reflecting your personal discipline & tone',
      'Interactive project showcases & verified case studies',
      'Direct contact buttons & calendar booking links (Calendly)',
      '100% mobile-optimized with instant page loading',
    ],
  },
  {
    id: 'schools',
    label: 'Schools & Institutes',
    kicker: 'Institutions & Coaching Centers',
    title: 'Intuitive Websites & Portals for Education',
    desc: 'Modernize your institution’s digital presence with admission inquiry portals, student noticeboards, faculty directories, and downloadable prospectus pages.',
    image: '/brand/corporate/stock/edtech_smart_classroom.jpg',
    features: [
      'Online admission forms with fee payment integration',
      'Faculty profiles, course prospectus & event photo galleries',
      'Mobile-friendly student noticeboards & downloadable resources',
      'Simple admin panel for non-technical staff to update notices',
    ],
  },
  {
    id: 'startups',
    label: 'Startups & MVPs',
    kicker: 'Founders & Product Creators',
    title: 'Rapid MVP & Prototype Development',
    desc: 'Launch your digital product fast with clean React/Next.js web apps and cross-platform mobile prototypes ready for real user testing and investor pitches.',
    image: '/brand/corporate/stock/app_dev_mockup.jpg',
    features: [
      'Full-stack Next.js & React architectures with Node.js backend',
      'Authentication, database setup & third-party API hooks',
      'Rapid sprint delivery with weekly milestone demos',
      '100% clean code handover with no vendor lock-in',
    ],
  },
];

const interactiveDemos = [
  {
    id: 'web-showcase',
    name: 'Modern Web Portal',
    icon: Globe,
    image: '/brand/corporate/stock/web_dev_mockup.jpg',
    title: 'Responsive Business & Service Website',
    desc: 'Clean, modern typography and intuitive navigation that clearly showcases services, customer reviews, and direct call-to-action touchpoints.',
    features: [
      'Instant page loading with optimized assets & clean HTML/CSS',
      'Interactive contact forms with instant email/WhatsApp alerts',
      'Fully responsive across mobile phones, tablets, and desktops',
    ],
  },
  {
    id: 'app-showcase',
    name: 'Mobile App Engine',
    icon: Smartphone,
    image: '/brand/corporate/stock/app_dev_mockup.jpg',
    title: 'Cross-Platform Mobile Application',
    desc: 'Fluid user interface with smooth swipe transitions, push notification channels, and offline access for iOS and Android devices.',
    features: [
      'Fast cross-platform code for Android & iOS simultaneously',
      'Secure user authentication & cloud database synchronization',
      'Native device feature access (Camera, Geolocation, Storage)',
    ],
  },
  {
    id: 'portfolio-showcase',
    name: 'Portfolio Showcase',
    icon: Palette,
    image: '/brand/corporate/stock/portfolio_mockup.jpg',
    title: 'Executive Portfolio & CV Hub',
    desc: 'Distinguished personal branding platform featuring interactive publication lists, client case studies, and appointment scheduling.',
    features: [
      'Showcase your career highlights, credentials, and achievements',
      'Interactive PDF resume preview & one-click download',
      'Custom domain with personalized business email configuration',
    ],
  },
  {
    id: 'devops-showcase',
    name: 'Code & Tech Support',
    icon: Code2,
    image: '/brand/corporate/stock/tech_support_mockup.jpg',
    title: 'Full-Stack Development & Maintenance',
    desc: 'Agile coding sprints, API integrations, database optimization, and ongoing technical maintenance for growing small and medium businesses.',
    features: [
      'Clean, maintainable TypeScript & React codebase',
      'Seamless payment gateway & CRM tool integrations',
      'Dependable monthly maintenance and bug fix support',
    ],
  },
];

const lifecycleSteps = [
  {
    icon: Search,
    title: 'Understand & Scope',
    desc: 'We discuss your goals, target audience, preferred design style, and exact technical requirements.',
  },
  {
    icon: Layout,
    title: 'Design & Prototype',
    desc: 'We create clean wireframes and visual mockups so you can review the look and feel before coding begins.',
  },
  {
    icon: Code2,
    title: 'Develop & Test',
    desc: 'We build your web or mobile app using clean, fast code and test across all phone and desktop screen sizes.',
  },
  {
    icon: Rocket,
    title: 'Launch & Handover',
    desc: 'We deploy your site or app live, connect your custom domain, and hand over 100% of all source code files.',
  },
];

export default function DigitalLearningPage() {
  const [activeTabId, setActiveTabId] = useState('sme-business');
  const [activeDemoId, setActiveDemoId] = useState('web-showcase');

  const activeTab = audienceTabs.find((t) => t.id === activeTabId) || audienceTabs[0];
  const activeDemo = interactiveDemos.find((d) => d.id === activeDemoId) || interactiveDemos[0];

  return (
    <div className="draa-corp dl-page-root">
      <SEO
        title="Web Development, App Development & Tech Services | DRAA"
        siteName="DRAA"
        description="DRAA builds custom websites, mobile applications, portfolio websites, and reliable digital solutions for small and medium businesses, professionals, and institutes."
        keywords="web development, mobile app development, portfolio website design, small business tech services, React website development, iOS Android app, New Delhi web agency"
        ogImage="/brand/corporate/stock/web_dev_mockup.jpg"
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION WITH MODERN TECH CANVAS
            ========================================================================= */}
        <section className="dl-hero">
          <DigitalTechLatticeBackground />
          <div className="draa-corp-shell dl-hero-grid">
            {/* Hero Left Content */}
            <div>
              <span className="dl-kicker">
                <Cpu size={14} /> WEB, APP &amp; DIGITAL DEVELOPMENT
              </span>
              <h1>
                Web, App &amp; Tech Solutions <span>built for your growth</span>
              </h1>
              <p className="dl-hero-summary">
                From fast business websites and custom mobile apps to standout personal portfolios and day-to-day tech support—we deliver practical, high-performance digital solutions tailored for small and medium-sized projects.
              </p>
              <div className="dl-hero-actions">
                <Link to="/contact?subject=Tech%20Project%20Inquiry" className="draa-corp-button draa-corp-button-gold">
                  Discuss Your Project <ArrowRight size={17} />
                </Link>
                <a href="#services" className="draa-corp-button draa-corp-button-light">
                  Explore Services
                </a>
              </div>

              <div className="dl-hero-proof">
                <div className="dl-proof-item">
                  <strong>Web &amp; Mobile Apps</strong>
                  <span>Cross-Platform Ready</span>
                </div>
                <div className="dl-proof-item">
                  <strong>Fast Delivery</strong>
                  <span>Agile 1–3 Week Sprints</span>
                </div>
                <div className="dl-proof-item">
                  <strong>100% Code Handover</strong>
                  <span>You Own Everything</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Interactive Tech Console Visual */}
            <div className="dl-hero-console">
              <div className="dl-console-header">
                <div className="dl-console-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <span className="dl-console-badge">
                  <Sparkles size={12} /> Custom Digital Solutions
                </span>
              </div>

              <div className="dl-console-media-box">
                <img
                  src="/brand/corporate/stock/web_dev_mockup.jpg"
                  alt="Modern web and mobile software development studio workspace"
                  className="dl-console-img"
                  loading="eager"
                />
                <div className="dl-console-overlay-tag">
                  <MonitorSmartphone size={15} /> Web · Mobile · Portfolios
                </div>
              </div>

              <div className="dl-console-metrics-grid">
                <div className="dl-console-metric-item">
                  <strong>Responsive</strong>
                  <small>Mobile &amp; Desktop</small>
                </div>
                <div className="dl-console-metric-item">
                  <strong>Fast &amp; SEO</strong>
                  <small>Optimized Speed</small>
                </div>
                <div className="dl-console-metric-item">
                  <strong>Full Support</strong>
                  <small>Maintenance Ready</small>
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
            <span className="dl-tech-strip-label">Technologies We Use:</span>
            <div className="dl-tech-pills-row">
              {[
                { icon: Code2, label: 'React & Next.js' },
                { icon: Smartphone, label: 'React Native & Flutter' },
                { icon: Layout, label: 'HTML5, CSS3 & JS' },
                { icon: Globe, label: 'WordPress & Headless CMS' },
                { icon: Zap, label: 'Payment Gateways & APIs' },
                { icon: ShieldCheck, label: 'SSL & Secure Cloud Hosting' },
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
            3. INTERACTIVE LIVE PLATFORM DEMO SIMULATOR
            ========================================================================= */}
        <section id="interactive-preview" className="dl-section">
          <div className="draa-corp-shell">
            <div className="dl-section-header">
              <span className="dl-section-pill">
                <MonitorSmartphone size={14} /> WHAT WE BUILD
              </span>
              <h2>Interactive Showcase of Our Digital Solutions</h2>
              <p>
                Switch between solutions below to explore how we design websites, mobile apps, portfolios, and custom tools for our clients.
              </p>
            </div>

            {/* Interactive Demo Player Card */}
            <div className="dl-interactive-demo-card">
              <div className="dl-demo-topbar">
                <div className="dl-demo-topbar-left">
                  <div className="dl-console-dots">
                    <i />
                    <i />
                    <i />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#FFFFFF' }}>
                    DRAA Digital Studio · Solution Preview
                  </span>
                </div>

                <div className="dl-demo-tabs" role="tablist">
                  {interactiveDemos.map((demo) => {
                    const Icon = demo.icon;
                    return (
                      <button
                        key={demo.id}
                        type="button"
                        role="tab"
                        aria-selected={activeDemoId === demo.id}
                        className={`dl-demo-tab-btn ${activeDemoId === demo.id ? 'active' : ''}`}
                        onClick={() => setActiveDemoId(demo.id)}
                      >
                        <Icon size={14} />
                        <span>{demo.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="dl-demo-stage">
                <div className="dl-demo-stage-screen">
                  <img
                    src={activeDemo.image}
                    alt={activeDemo.title}
                    loading="lazy"
                  />
                </div>

                <div className="dl-demo-stage-info">
                  <span style={{ fontSize: 11, fontWeight: 850, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                    Featured Capability
                  </span>
                  <h3>{activeDemo.title}</h3>
                  <p>{activeDemo.desc}</p>
                  <ul className="dl-demo-features-list">
                    {activeDemo.features.map((f) => (
                      <li key={f}>
                        <CheckCircle2 size={15} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact?subject=Digital%20Project%20Consultation"
                    className="draa-corp-button draa-corp-button-gold"
                    style={{ display: 'inline-flex' }}
                  >
                    Start Your Project With Us <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. 6 CORE DIGITAL & TECH SERVICES WITH ACCURATE IMAGERY
            ========================================================================= */}
        <section id="services" className="dl-section dl-section-tint">
          <div className="draa-corp-shell">
            <div className="dl-section-header">
              <span className="dl-section-pill">
                <Layers size={14} /> OUR CORE SERVICES
              </span>
              <h2>Digital &amp; Tech Services Tailored for Your Needs</h2>
              <p>
                Whether you need a brand-new website, a custom mobile app, a stunning portfolio, or regular tech maintenance—we have you covered.
              </p>
            </div>

            <div className="dl-services-grid">
              {digitalServices.map((svc) => {
                const Icon = svc.icon;
                return (
                  <article key={svc.title} className="dl-service-card">
                    <div className="dl-service-media">
                      <img
                        src={svc.image}
                        alt={svc.imageAlt}
                        className="dl-service-img"
                        loading="lazy"
                      />
                      <div className="dl-service-icon-badge">
                        <Icon size={22} />
                      </div>
                    </div>
                    <div className="dl-service-body">
                      <span className="dl-service-tagline">{svc.tagline}</span>
                      <h3>{svc.title}</h3>
                      <p className="dl-service-desc">{svc.desc}</p>
                      <ul className="dl-service-checklist">
                        {svc.points.map((pt) => (
                          <li key={pt}>
                            <Check size={13} />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                      <Link to={svc.link} className="dl-service-action">
                        Get a quote for this service <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. TABBED SOLUTIONS BY CLIENT SECTOR
            ========================================================================= */}
        <section className="dl-section">
          <div className="draa-corp-shell">
            <div className="dl-section-header">
              <span className="dl-section-pill">
                <Briefcase size={14} /> WHO WE HELP
              </span>
              <h2>Digital Solutions Tailored for Every Client</h2>
              <p>
                Discover how we customize our development, design, and tech support for businesses, professionals, schools, and founders.
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
                  Consult on {activeTab.label} Project <ArrowRight size={16} />
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
            6. 4-STAGE AGILE WORKFLOW
            ========================================================================= */}
        <section className="dl-section dl-section-tint">
          <div className="draa-corp-shell">
            <div className="dl-section-header">
              <span className="dl-section-pill">
                <Zap size={14} /> HOW WE WORK
              </span>
              <h2>A Simple, Transparent Route from Idea to Launch</h2>
              <p>
                Clear milestones, regular progress updates, and dependable delivery so you are always in full control of your project.
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
                <h2>Have a website, mobile app, or tech project in mind?</h2>
                <p>
                  Reach out today for a friendly, no-obligation conversation. We will review your requirements, recommend the best tech approach, and share a clear estimate and timeline.
                </p>
              </div>
              <Link to="/contact?subject=Digital%20Development%20Project" className="dl-cta-btn">
                Get a Free Estimate <ArrowRight size={17} />
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
