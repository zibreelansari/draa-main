import React from 'react';
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Compass,
  GraduationCap,
  Handshake,
  Landmark,
  Laptop2,
  Layers,
  Lightbulb,
  Presentation,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import LightLineMotionBackground from './LightLineMotionBackground';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import SEO from './SEO';
import './DraaCorporateHome.css';
import './WhoWeSupportPage.css';

interface AudienceItem {
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  tagline: string;
  desc: string;
  image: string;
  imageAlt: string;
  points: string[];
  link: string;
}

const audienceList: AudienceItem[] = [
  {
    icon: School,
    title: 'K–12 Schools & School Networks',
    tagline: 'Foundational & Secondary Learning Excellence',
    desc: 'Empowering progressive schools and large chain networks with syllabus-aligned curriculum frameworks, teacher empowerment academies, and learner assessment toolkits.',
    image: '/brand/corporate/stock/classroom.jpg',
    imageAlt: 'Modern high school classroom environment',
    points: [
      'CBSE, ICSE & International board curriculum mapping',
      'Continuous Professional Development (CPD) for educators',
      'Experiential STEM workbooks & digital resource packs',
      'NEP 2020 pedagogical integration & audit readiness',
    ],
    link: '/contact?subject=K-12%20School%20Solutions',
  },
  {
    icon: Landmark,
    title: 'Colleges & Higher Education Universities',
    tagline: 'OBE, Accreditation & Global Footprint',
    desc: 'Partnering with universities, autonomous institutes, and colleges to modernize degree courseware, conduct NAAC/NIRF advisory, and organize international summits.',
    image: '/brand/corporate/stock/university-building.jpg',
    imageAlt: 'Heritage university campus architecture',
    points: [
      'Outcome-Based Education (OBE) courseware authoring',
      'NAAC, NBA & NIRF accreditation documentation support',
      'Turnkey academic conferences & proceedings publication',
      'Study in India global learner onboarding guidance',
    ],
    link: '/contact?subject=University%20Advisory%20Solutions',
  },
  {
    icon: GraduationCap,
    title: 'Professional Training Institutes & Academies',
    tagline: 'Applied Skill Bootcamps & Employability',
    desc: 'Delivering turnkey training modules, practical lab exercises, and certification curriculum that prepare students for competitive examinations and modern careers.',
    image: '/brand/corporate/stock/student_skill_workshop.jpg',
    imageAlt: 'Professional skills training seminar',
    points: [
      'Industry-ready certification curriculum & rubrics',
      'Interactive question banks with detailed solutions',
      'Technical bootcamps in AI, analytics & digital tools',
      'Faculty train-the-trainer masterclasses',
    ],
    link: '/contact?subject=Training%20Institute%20Solutions',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Corporates & Enterprise L&D Teams',
    tagline: 'Custom Workforce Upskilling & Leadership',
    desc: 'Designing outcome-driven employee learning academies, leadership development seminars, and custom corporate courseware aligned with business performance.',
    image: '/brand/corporate/stock/corporate_training_room.jpg',
    imageAlt: 'Executive corporate training conference room',
    points: [
      'Custom employee capability development frameworks',
      'Executive communication & academic leadership workshops',
      'Modular micro-learning courses for busy professionals',
      'Turnkey handover with 100% enterprise copyright',
    ],
    link: '/contact?subject=Corporate%20Learning%20Solutions',
  },
  {
    icon: BookOpen,
    title: 'Academic & Trade Publishers',
    tagline: 'Pre-Press Rigor, SME Authoring & Typesetting',
    desc: 'Acting as an institutional publishing engine for publishers requiring high-volume manuscript authoring, double-blind peer review, and LaTeX/InDesign pre-press.',
    image: '/brand/corporate/stock/academic_publishing_hero.jpg',
    imageAlt: 'Academic editorial desk with textbook proofs and tablet',
    points: [
      'Multi-discipline subject specialist authoring (50+ domains)',
      'Double-blind peer review & plagiarism-certified QA',
      'Complex mathematical & STEM LaTeX composition',
      'High-res CMYK print-ready & ePub3 digital delivery',
    ],
    link: '/contact?subject=Publishing%20Content%20Production',
  },
  {
    icon: Laptop2,
    title: 'EdTech Brands & Digital Platforms',
    tagline: 'Scalable Content Layers & LMS Architecture',
    desc: 'Fueling fast-growing EdTech platforms with high-retention video scripts, SCORM learning packs, automated quiz engines, and custom portal solutions.',
    image: '/brand/corporate/stock/digital-learning.jpg',
    imageAlt: 'Modern digital learning workstation with laptop and tablet',
    points: [
      'Micro-learning video scripts & storyboard development',
      'Cognitive assessment banks tagged to Bloom’s Taxonomy',
      'Accessible LMS portal design & virtual classroom setups',
      'Interactive H5P simulation assets & modular packs',
    ],
    link: '/contact?subject=EdTech%20Content%20%26%20Platforms',
  },
  {
    icon: Building2,
    title: 'Government Bodies, Think Tanks & NGOs',
    tagline: 'Education Policy Advisory & Social Impact',
    desc: 'Collaborating with public-sector education boards, CSR foundations, and social impact enterprises to craft scalable educational resources and conduct research.',
    image: '/brand/corporate/stock/academic_consultancy_clean.jpg',
    imageAlt: 'Sunlit modern academic planning library overlooking campus',
    points: [
      'Regional language textbook localization & adaptation',
      'Institutional diagnostic audits & baseline assessments',
      'Community education & vocational skill modules',
      'Policy whitepapers & educational conference management',
    ],
    link: '/contact?subject=Government%20%26%20Social%20Impact%20Projects',
  },
];

const solutionDomains = [
  {
    icon: BookOpen,
    title: 'Educational Content Development',
    desc: 'Research-led textbooks, digital courseware, assessments, and custom learning guides.',
    path: '/services/content-publishing',
  },
  {
    icon: GraduationCap,
    title: 'Academic & Professional Training',
    desc: 'Faculty development, student bootcamps, and technical leadership workshops.',
    path: '/services/professional-learning',
  },
  {
    icon: Presentation,
    title: 'Educational Events & Summits',
    desc: 'Turnkey academic conferences, research symposiums, webinars, and proceedings.',
    path: '/services/education-events',
  },
  {
    icon: Compass,
    title: 'Educational Consultancy',
    desc: 'Curriculum architecture, NEP 2020 alignment, and NAAC/NIRF accreditation support.',
    path: '/services/academic-advisory',
  },
  {
    icon: Laptop2,
    title: 'Digital Learning Solutions',
    desc: 'Scalable LMS architectures, interactive digital portals, and virtual classroom setups.',
    path: '/services/digital-learning',
  },
  {
    icon: Landmark,
    title: 'Study in India Advisory Hub',
    desc: 'Strategic international student guidance, course discovery, and milestone readiness.',
    path: '/#study-in-india',
  },
];

const partnerPillars = [
  {
    icon: ShieldCheck,
    title: '100% Client Ownership',
    desc: 'All manuscripts, digital source files, and courseware are transferred with full exclusive intellectual property rights upon sign-off.',
  },
  {
    icon: Layers,
    title: 'NEP 2020 & OBE Rigor',
    desc: 'Every resource is designed from the ground up to satisfy modern multi-disciplinary criteria, outcome rubrics, and accreditation benchmarks.',
  },
  {
    icon: Handshake,
    title: 'One Accountable Partner',
    desc: 'Eliminate fragmented vendor coordination. We own diagnostic discovery, pedagogical drafting, peer review, and final delivery under one roof.',
  },
  {
    icon: Target,
    title: 'Measurable Outcomes',
    desc: 'We define clear participation, retention, and progress milestones upfront to guarantee verifiable institutional ROI.',
  },
  {
    icon: Building2,
    title: 'Institutional Stability',
    desc: 'Registered corporate enterprise in New Delhi (CIN: U85491DL2023OPC416284) with rigorous compliance and dependable timelines.',
  },
];

const roadmapSteps = [
  {
    icon: Search,
    title: 'Discover & Diagnose',
    desc: 'Deep assessment of institutional goals, cohort profiles, syllabus guidelines, and capability gaps.',
  },
  {
    icon: Lightbulb,
    title: 'Architect & Blueprint',
    desc: 'Co-designing outcome-mapped pedagogical structures, modular milestones, and asset specifications.',
  },
  {
    icon: BookOpen,
    title: 'Author & Develop',
    desc: 'Subject specialist manuscript drafting, interactive asset creation, and double-blind peer review.',
  },
  {
    icon: Presentation,
    title: 'Deliver & Enable',
    desc: 'Pre-press packaging, turnkey platform deployment, and educator/stakeholder enablement workshops.',
  },
  {
    icon: CheckCircle2,
    title: 'Measure & Evolve',
    desc: 'Continuous feedback analytics, accreditation readiness validation, and long-term partnership support.',
  },
];

export default function WhoWeSupportPage() {
  return (
    <div className="draa-corp support-page-root">
      <SEO
        title="Who We Support | Schools, Universities, Corporates & Publishers"
        siteName="DRAA"
        description="DRAA partners with K-12 schools, universities, professional training institutes, corporates, publishers, EdTech companies, and public-sector organisations across Bharat and globally."
        keywords="who we support, DRAA partners, K-12 school curriculum, university accreditation, corporate training, educational publishing, EdTech content"
        ogImage="/brand/corporate/stock/university-building.jpg"
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION (Signature Light-Theme Warm Ivory Palette)
            ========================================================================= */}
        <section className="sp-hero">
          <LightLineMotionBackground />
          <div className="draa-corp-shell sp-hero-grid">
            <div>
              <span className="sp-kicker">
                <Users size={14} /> WHO WE SUPPORT
              </span>
              <h1>
                Solutions built for every <span>education ecosystem</span>
              </h1>
              <p className="sp-hero-summary">
                From K–12 classrooms to university boardrooms, academic publishing houses to corporate enterprise teams—DRAA provides research-backed content, faculty training, and institutional advisory designed for measurable impact.
              </p>
              <div className="sp-hero-actions">
                <Link to="/contact" className="draa-corp-button draa-corp-button-gold">
                  Discuss Your Institution&apos;s Need <ArrowRight size={17} />
                </Link>
                <a href="#audiences" className="draa-corp-button draa-corp-button-light">
                  Explore Audience Solutions
                </a>
              </div>

              <div className="sp-hero-proof">
                <div className="sp-proof-item">
                  <strong>7+ Domains</strong>
                  <span>Tailored Engagements</span>
                </div>
                <div className="sp-proof-item">
                  <strong>100% IP Transfer</strong>
                  <span>Client-Owned Copyright</span>
                </div>
                <div className="sp-proof-item">
                  <strong>OBE &amp; NEP 2020</strong>
                  <span>Accreditation Ready</span>
                </div>
              </div>
            </div>

            {/* Clean Hero Visual Card */}
            <div className="sp-hero-visual">
              <div className="sp-hero-card">
                <img
                  src="/brand/corporate/stock/university-building.jpg"
                  alt="Modern university campus architecture"
                  className="sp-hero-card-img"
                  loading="eager"
                />
                <div className="sp-hero-floating-badge">
                  <div className="sp-floating-icon-wrap">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <strong>Connected Education Partner</strong>
                    <small>Serving Bharat &amp; Global Institutions</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. 7 KEY AUDIENCE PILLARS BENTO SHOWCASE
            ========================================================================= */}
        <section id="audiences" className="sp-section">
          <div className="draa-corp-shell">
            <div className="sp-section-header">
              <span className="sp-section-pill">
                <Target size={14} /> INSTITUTIONAL AUDIENCES
              </span>
              <h2>Tailored Capabilities for Every Partner in the Learning Value Chain</h2>
              <p>
                We recognize that each organization faces distinct academic, operational, and regulatory imperatives. Our solutions are architected to solve your specific challenges.
              </p>
            </div>

            <div className="sp-audiences-grid">
              {audienceList.map((aud) => {
                const Icon = aud.icon;
                return (
                  <article key={aud.title} className="sp-audience-card">
                    <div className="sp-audience-media">
                      <img src={aud.image} alt={aud.imageAlt} className="sp-audience-img" loading="lazy" />
                      <div className="sp-audience-icon-badge">
                        <Icon size={22} />
                      </div>
                    </div>
                    <div className="sp-audience-body">
                      <h3>{aud.title}</h3>
                      <span className="sp-audience-tagline">{aud.tagline}</span>
                      <p className="sp-audience-desc">{aud.desc}</p>
                      <ul className="sp-audience-checklist">
                        {aud.points.map((pt) => (
                          <li key={pt}>
                            <Check size={14} />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                      <Link to={aud.link} className="sp-audience-link">
                        Explore partnership options <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. CORE SOLUTION DOMAINS
            ========================================================================= */}
        <section className="sp-section sp-section-tint">
          <div className="draa-corp-shell">
            <div className="sp-section-header">
              <span className="sp-section-pill">
                <Layers size={14} /> CORE CAPABILITIES
              </span>
              <h2>Integrated Services to Elevate Your Institution</h2>
              <p>
                Whether you require a single focused intervention or a multi-year turnkey academic transformation roadmap.
              </p>
            </div>

            <div className="sp-solutions-grid">
              {solutionDomains.map((sol) => {
                const Icon = sol.icon;
                return (
                  <div key={sol.title} className="sp-solution-item">
                    <div className="sp-solution-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{sol.title}</h3>
                    <p>{sol.desc}</p>
                    <Link to={sol.path} className="sp-solution-action">
                      Learn more <ArrowRight size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. WHY PARTNER WITH DRAA (5 CORE PILLARS)
            ========================================================================= */}
        <section className="sp-section">
          <div className="draa-corp-shell">
            <div className="sp-section-header">
              <span className="sp-section-pill">
                <ShieldCheck size={14} /> THE DRAA ADVANTAGE
              </span>
              <h2>Why Leading Institutions Choose to Partner With Us</h2>
              <p>
                Accountable execution, research-backed methodology, and clear governance built through long-term academic trust.
              </p>
            </div>

            <div className="sp-why-grid">
              {partnerPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="sp-why-card">
                    <div className="sp-why-icon">
                      <Icon size={20} />
                    </div>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. COLLABORATION ROADMAP
            ========================================================================= */}
        <section className="sp-section sp-section-tint">
          <div className="draa-corp-shell">
            <div className="sp-section-header">
              <span className="sp-section-pill">
                <Compass size={14} /> EXECUTION BLUEPRINT
              </span>
              <h2>How We Collaborate with Your Team</h2>
              <p>
                A disciplined, milestone-governed workflow ensuring total transparency and on-time institutional delivery.
              </p>
            </div>

            <div className="sp-roadmap-flow">
              {roadmapSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="sp-roadmap-step">
                    <div className="sp-roadmap-step-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Conversion CTA Banner */}
            <div className="sp-cta-banner">
              <div className="sp-cta-copy">
                <h2>Ready to elevate your institution&apos;s educational outcomes?</h2>
                <p>
                  Schedule an exploratory discussion with our senior academic consultants. We will diagnose your needs and blueprint a customized delivery plan.
                </p>
              </div>
              <Link to="/contact" className="sp-cta-btn">
                Partner with DRAA <ArrowRight size={17} />
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
