import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  Flag,
  Globe2,
  GraduationCap,
  Handshake,
  Heart,
  Laptop2,
  Layers,
  Lightbulb,
  MessageCircle,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import SEO from './SEO';
import { services } from './serviceData';
import './DraaCorporateHome.css';
import './AboutDraaPage.css';

const studyIndiaPortalUrl =
  import.meta.env.VITE_STUDY_INDIA_URL || 'http://localhost:5175';

const pillarsOfIdentity = [
  {
    icon: Target,
    title: 'Our Purpose',
    subtitle: 'Why We Exist',
    text: 'To empower education, strengthen institutions, and transform learner communities through rigorous, accessible, and future-ready academic solutions.',
    theme: '#1D4ED8',
    image: '/brand/corporate/stock/purpose.webp',
  },
  {
    icon: Flag,
    title: 'Our Mission',
    subtitle: 'What We Deliver',
    text: 'To design and execute end-to-end educational programs, publications, and digital ecosystems that generate measurable outcomes for learners and institutions.',
    theme: '#16A34A',
    image: '/brand/corporate/stock/student_skill_workshop.jpg',
  },
  {
    icon: Eye,
    title: 'Our Vision',
    subtitle: 'Where We Are Headed',
    text: 'A world where quality education seamlessly bridges knowledge, industry readiness, and global opportunity across Bharat and worldwide.',
    theme: '#EA580C',
    image: '/brand/corporate/stock/leadership_seminar.jpg',
  },
  {
    icon: Heart,
    title: 'Core Values',
    subtitle: 'How We Operate',
    text: 'Academic integrity, pedagogical innovation, institutional accountability, and unyielding commitment to learner-centric excellence.',
    theme: '#7C3AED',
    image: '/brand/corporate/stock/corporate_training_room.jpg',
  },
];

const institutionalStats = [
  {
    icon: BriefcaseBusiness,
    value: 'Since 2023',
    label: 'Established in New Delhi',
    sub: 'ROC Delhi · CIN U85491DL2023OPC416284',
  },
  {
    icon: Layers,
    value: '5 Core Pillars',
    label: 'End-to-End Activities',
    sub: 'Publishing, Training, Events, Advisory, Tech',
  },
  {
    icon: BookOpen,
    value: '50+ Disciplines',
    label: 'Academic Scope',
    sub: 'STEM, Commerce, Humanities & Tech',
  },
  {
    icon: Globe2,
    value: 'Bharat & Beyond',
    label: 'Institutional Reach',
    sub: 'Pan-India & International Collaborations',
  },
  {
    icon: ShieldCheck,
    value: 'Quality First',
    label: 'Accreditation Aligned',
    sub: 'NEP 2020, NAAC & Global Benchmarks',
  },
];

const methodologySteps = [
  {
    number: '01',
    title: 'Discover & Diagnose',
    desc: 'Deep institutional assessment of syllabus frameworks, learner profiles, accreditation requirements, and capability gaps.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Architect & Blueprint',
    desc: 'Designing outcome-aligned pedagogical structures, curriculum maps, assessment rubrics, and technology architectures.',
    icon: Lightbulb,
  },
  {
    number: '03',
    title: 'Develop & Author',
    desc: 'Specialist faculty authoring, multimedia production, interactive courseware packaging, and rigorous peer-review QA.',
    icon: BookOpen,
  },
  {
    number: '04',
    title: 'Deploy & Enable',
    desc: 'Turnkey rollout including faculty enablement workshops, LMS onboarding, conference production, and institutional handover.',
    icon: Users,
  },
  {
    number: '05',
    title: 'Measure & Evolve',
    desc: 'Continuous feedback loops, learning analytics, accreditation readiness audits, and ongoing institutional support.',
    icon: CheckCircle2,
  },
];

const whyDraaPoints = [
  {
    icon: BookOpen,
    title: 'Curriculum & Content Fragmentation',
    challenge: 'Institutions often struggle with outdated syllabus materials, dispersed reference texts, and non-standardized courseware.',
    solution: 'DRAA delivers standardized, peer-reviewed, syllabus-aligned textbooks, question banks, e-books, and digital modules tailored to your board or university.',
  },
  {
    icon: GraduationCap,
    title: 'Faculty & Student Capability Gaps',
    challenge: 'Rapidly evolving technology and Outcome-Based Education (OBE) norms require continuous upskilling beyond traditional teaching.',
    solution: 'Hands-on faculty development, AI/data literacy bootcamps, student career readiness workshops, and leadership management seminars.',
  },
  {
    icon: Compass,
    title: 'Complex Accreditation & Strategy Hurdles',
    challenge: 'Navigating NEP 2020 multi-disciplinary guidelines, NAAC/NIRF accreditation criteria, and institutional quality audits requires specialized advisory.',
    solution: 'Diagnostic audits, mock reviews, syllabus modernization, and strategic institutional governance frameworks backed by senior educational experts.',
  },
  {
    icon: Laptop2,
    title: 'Disconnected Digital Ecosystems',
    challenge: 'Disjointed LMS platforms, passive video archives, and low online engagement weaken digital transformation initiatives.',
    solution: 'Scalable LMS architectures, interactive virtual classrooms, mobile learning apps, and AI-driven personalized student progress analytics.',
  },
];

import AboutLineMotionBackground from './AboutLineMotionBackground';

export default function AboutDraaPage() {
  return (
    <div className="draa-corp about-premium-page">
      <SEO
        title="About DRAA | Empowering Education. Enriching Futures."
        siteName="DRAA"
        description="Learn about DRAA—an education services and knowledge transformation enterprise in New Delhi providing educational content development, academic training, events, consultancy, and digital learning solutions."
        keywords="About DRAA, DRAA education company, educational services New Delhi, academic consultancy India, faculty training, curriculum publishing"
        ogImage="/brand/corporate/stock/academic_publishing_hero.jpg"
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION (Flowing Line Motion Background & Corporate Identity Hub)
            ========================================================================= */}
        <section className="about-hero">
          <AboutLineMotionBackground accentColor="#F59E0B" secondaryColor="#3B82F6" />
          <div className="draa-corp-shell about-hero-inner">
            <div className="about-hero-copy">
              <span className="about-pill">
                <Sparkles size={14} /> ABOUT DRAA · CORE BUSINESS ACTIVITIES
              </span>

              <h1>
                We Shape Knowledge Into <span>Lasting Impact.</span>
              </h1>

              <p className="about-hero-lead">
                DRAA is a premier educational services and knowledge transformation company headquartered in New Delhi. We empower institutions, educators, learners, and organizations by converting complex educational needs into clear, practical, and outcome-oriented solutions.
              </p>

              <div className="about-hero-actions">
                <a href="#about-story" className="draa-corp-button draa-corp-button-gold">
                  Explore Our Story <ArrowRight size={16} />
                </a>
                <Link to="/contact" className="draa-corp-button draa-corp-button-light">
                  Talk to Our Leadership <MessageCircle size={16} />
                </Link>
              </div>

              {/* Clarity Delivery Flow */}
              <div className="about-clarity-strip">
                <div className="about-clarity-step">
                  <div className="about-clarity-num">01</div>
                  <div>
                    <strong>Understand</strong>
                    <small>The Real Need</small>
                  </div>
                </div>
                <div className="about-clarity-divider" />
                <div className="about-clarity-step">
                  <div className="about-clarity-num">02</div>
                  <div>
                    <strong>Architect</strong>
                    <small>The Right Strategy</small>
                  </div>
                </div>
                <div className="about-clarity-divider" />
                <div className="about-clarity-step">
                  <div className="about-clarity-num">03</div>
                  <div>
                    <strong>Deliver</strong>
                    <small>Measurable Value</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Non-Human Corporate Brand & Knowledge Emblem Hub */}
            <div className="about-hero-visual">
              <div className="about-corp-emblem-card">
                {/* Ambient glow & edge lights */}
                <div className="about-corp-card-glow" />
                <div className="about-corp-card-rim-light" />
                
                {/* Central Brand Insignia with Multi-Layer Celestial Rings */}
                <div className="about-corp-insignia-stage">
                  <div className="about-corp-orbit-ring about-corp-orbit-ring--1" />
                  <div className="about-corp-orbit-ring about-corp-orbit-ring--2" />
                  <div className="about-corp-orbit-ring about-corp-orbit-ring--3" />
                  <div className="about-corp-orbit-spark about-corp-orbit-spark--1" />
                  <div className="about-corp-orbit-spark about-corp-orbit-spark--2" />
                  
                  <div className="about-corp-mark-wrap">
                    <div className="about-corp-mark-inner">
                      <img
                        src="/brand/draa-mark.png"
                        alt="DRAA Official Brand Insignia"
                        className="about-corp-mark-img"
                      />
                    </div>
                    <div className="about-corp-mark-shine" />
                  </div>
                </div>

                {/* Company Title & Legal Registration Pill */}
                <div className="about-corp-credentials">
                  <div className="about-corp-reg-tag">
                    <Building2 size={12} />
                    <span>ROC DELHI · CIN U85491DL2023OPC416284</span>
                  </div>
                  <h2>DRAA (OPC) PRIVATE LIMITED</h2>
                  <p>Education Services &amp; Knowledge Management</p>
                </div>

                {/* 5 Synchronized Knowledge Pillars Grid */}
                <div className="about-corp-pillars-grid">
                  <div className="about-corp-pillar-chip about-corp-pillar-chip--amber">
                    <span className="about-chip-dot" />
                    <BookOpen size={14} className="text-amber" />
                    <span>Publishing &amp; Content</span>
                  </div>
                  <div className="about-corp-pillar-chip about-corp-pillar-chip--blue">
                    <span className="about-chip-dot" />
                    <GraduationCap size={14} className="text-blue" />
                    <span>Training &amp; Capacity</span>
                  </div>
                  <div className="about-corp-pillar-chip about-corp-pillar-chip--orange">
                    <span className="about-chip-dot" />
                    <Presentation size={14} className="text-orange" />
                    <span>Events &amp; Summits</span>
                  </div>
                  <div className="about-corp-pillar-chip about-corp-pillar-chip--purple">
                    <span className="about-chip-dot" />
                    <ShieldCheck size={14} className="text-purple" />
                    <span>Academic Advisory</span>
                  </div>
                  <div className="about-corp-pillar-chip about-corp-pillar-chip--wide about-corp-pillar-chip--teal">
                    <span className="about-chip-dot" />
                    <Laptop2 size={14} className="text-teal" />
                    <span>Digital Learning &amp; LMS Platforms</span>
                  </div>
                </div>

                {/* Refined Floating Badges */}
                <div className="about-floating-badge about-floating-badge--top">
                  <div className="about-badge-icon-wrap">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <strong>Headquartered in New Delhi</strong>
                    <small>Serving Education in Bharat &amp; Beyond</small>
                  </div>
                </div>

                <div className="about-floating-badge about-floating-badge--bottom">
                  <div className="about-badge-icon-wrap about-badge-icon-wrap--gold">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <strong>5 Core Business Pillars</strong>
                    <small>Comprehensive Turnkey Solutions</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. INSTITUTIONAL CREDIBILITY & STATS BAND
            ========================================================================= */}
        <section className="about-stats-band">
          <div className="draa-corp-shell about-stats-grid">
            {institutionalStats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.value} className="about-stat-card">
                  <div className="about-stat-icon-wrap">
                    <Icon size={20} />
                  </div>
                  <div className="about-stat-info">
                    <strong>{item.value}</strong>
                    <span className="about-stat-label">{item.label}</span>
                    <small className="about-stat-sub">{item.sub}</small>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            3. WHO WE ARE & COMPANY NARRATIVE
            ========================================================================= */}
        <section id="about-story" className="draa-corp-section about-story-section">
          <div className="draa-corp-shell">
            <div className="about-story-header">
              <div className="about-story-header-left">
                <span className="about-section-pill">
                  <Building2 size={14} /> WHO WE ARE
                </span>
                <h2>Purpose-Driven. Impact-Focused. Dedicated to Excellence.</h2>
              </div>
              <div className="about-story-header-right">
                <p>
                  Incorporated on <strong>28 June 2023 in New Delhi</strong> (ROC Delhi · CIN U85491DL2023OPC416284), DRAA (OPC) Private Limited operates with an overarching commitment to elevate educational rigor, empower educators, and expand learner potential across schools, universities, and corporate institutions.
                </p>
              </div>
            </div>

            {/* 4 Pillars of Identity Grid */}
            <div className="about-identity-grid">
              {pillarsOfIdentity.map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    className="about-identity-card"
                    style={{ '--identity-accent': item.theme } as React.CSSProperties}
                  >
                    <div className="about-identity-media">
                      <img src={item.image} alt={item.title} loading="lazy" />
                      <div className="about-identity-media-overlay" />
                      <div className="about-identity-icon-wrap" style={{ background: item.theme }}>
                        <Icon size={22} color="#ffffff" />
                      </div>
                    </div>
                    <div className="about-identity-body">
                      <span className="about-identity-sub" style={{ color: item.theme }}>{item.subtitle}</span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. THE 5 CORE BUSINESS PILLARS (Integrated Directly)
            ========================================================================= */}
        <section className="draa-corp-section about-services-section">
          <div className="draa-corp-shell">
            <div className="about-section-header text-center mx-auto">
              <span className="about-section-pill">
                <Layers size={14} /> CORE BUSINESS ACTIVITIES
              </span>
              <h2>Comprehensive Educational Services Under One Roof</h2>
              <p>
                From syllabus-aligned content publishing and faculty development to academic consultancy and modern digital learning platforms—DRAA provides an integrated suite of capabilities.
              </p>
            </div>

            <div className="about-services-grid">
              {services.map((item) => (
                <Link
                  key={item.slug}
                  to={`/services/${item.slug}`}
                  className="about-service-card"
                  style={{ '--service-accent': item.themeColor } as React.CSSProperties}
                >
                  <div className="about-service-img-wrap">
                    <img src={item.image} alt={item.title} loading="lazy" />
                    <div className="about-service-num-badge" style={{ background: item.themeColor }}>
                      {item.number}
                    </div>
                  </div>
                  <div className="about-service-content">
                    <h3>{item.title}</h3>
                    <p>{item.summary}</p>
                    <ul className="about-service-bullets">
                      {item.bulletPoints.slice(0, 3).map((bullet) => (
                        <li key={bullet}>
                          <CheckCircle2 size={13} style={{ color: item.themeColor }} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="about-service-link" style={{ color: item.themeColor }}>
                      Explore Service Details <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="about-all-services-cta text-center">
              <Link to="/capabilities" className="draa-corp-button draa-corp-button-gold">
                View All Core Services Overview <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. WHY DRAA (Problem - Solution Impact Matrix)
            ========================================================================= */}
        <section className="draa-corp-section about-why-section">
          <div className="draa-corp-shell">
            <div className="about-section-header">
              <span className="about-section-pill">
                <ShieldCheck size={14} /> WHY INSTITUTIONS CHOOSE DRAA
              </span>
              <h2>Solving Real Education Challenges With Accountable Delivery</h2>
              <p>
                Every engagement is structured to address core institutional pain points, bridge capability gaps, and deliver sustainable academic outcomes.
              </p>
            </div>

            <div className="about-why-grid">
              {whyDraaPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="about-why-card">
                    <div className="about-why-header">
                      <div className="about-why-icon">
                        <Icon size={22} />
                      </div>
                      <h3>{item.title}</h3>
                    </div>
                    <div className="about-why-body">
                      <div className="about-why-challenge">
                        <strong>The Challenge:</strong>
                        <p>{item.challenge}</p>
                      </div>
                      <div className="about-why-solution">
                        <strong>The DRAA Solution:</strong>
                        <p>{item.solution}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. METHODOLOGY (5-Stage Delivery Process)
            ========================================================================= */}
        <section className="draa-corp-section about-process-section">
          <div className="draa-corp-shell">
            <div className="about-section-header text-center mx-auto">
              <span className="about-section-pill">
                <Zap size={14} /> OUR DELIVERY FRAMEWORK
              </span>
              <h2>A Disciplined, 5-Stage Execution Methodology</h2>
              <p>
                How we partner with schools, universities, and enterprise organizations from initial discovery to measurable institutional impact.
              </p>
            </div>

            <div className="about-process-timeline">
              {methodologySteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="about-process-step">
                    <div className="about-process-step-top">
                      <div className="about-process-badge">{step.number}</div>
                      <div className="about-process-icon">
                        <Icon size={20} />
                      </div>
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. STUDY IN INDIA & GLOBAL INITIATIVE
            ========================================================================= */}
        <section className="draa-corp-section about-global-section">
          <div className="draa-corp-shell about-global-card">
            <div className="about-global-copy">
              <span className="about-pill about-pill--light">
                <Globe2 size={14} /> GLOBAL EDUCATION OUTREACH
              </span>
              <h2>Connecting International Learners with Top Indian Institutions</h2>
              <p>
                Through our specialized <strong>Study in India</strong> initiative, DRAA provides end-to-end guidance, verified admissions support, and academic counseling for international students aspiring to study in India&apos;s premier universities.
              </p>
              <div className="about-global-actions">
                <a
                  href={studyIndiaPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="draa-corp-button draa-corp-button-gold"
                >
                  Visit Study in India Portal <ArrowRight size={16} />
                </a>
                <Link to="/contact" className="draa-corp-button draa-corp-button-light">
                  Partner with Us
                </Link>
              </div>
            </div>
            <div className="about-global-media">
              <img
                src="/brand/corporate/stock/indian_graduation_students_1786967278538.jpg"
                alt="International and Indian students celebrating academic graduation"
                className="about-global-img"
              />
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. FINAL CONVERSION CALL TO ACTION
            ========================================================================= */}
        <section className="about-final-cta-section">
          <div className="draa-corp-shell about-final-cta-inner">
            <div className="about-final-cta-copy">
              <span className="about-pill about-pill--light">
                <Sparkles size={14} /> PARTNER WITH DRAA
              </span>
              <h2>Let’s Build Meaningful Educational Change Together</h2>
              <p>
                Whether you represent a school foundation, university leadership, or enterprise organization, our team is ready to design a tailored solution for your academic vision.
              </p>
            </div>
            <div className="about-final-cta-actions">
              <Link to="/contact" className="draa-corp-button draa-corp-button-dark">
                Initiate a Conversation <ArrowRight size={17} />
              </Link>
              <Link to="/capabilities" className="draa-corp-button draa-corp-button-light">
                Explore All Capabilities
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
