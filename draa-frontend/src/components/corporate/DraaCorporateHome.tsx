import React, { Fragment } from 'react';
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
  Landmark,
  Laptop2,
  Lightbulb,
  MessageCircle,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateHeader from './DraaCorporateHeader';
import DraaCorporateFooter from './DraaCorporateFooter';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import SEO from './SEO';
import GlobalMinimalMotionBackground from './GlobalMinimalMotionBackground';
import './DraaCorporateHome.css';

const studyIndiaPortalUrl =
  import.meta.env.VITE_STUDY_INDIA_URL || 'http://localhost:5175';

const challenges = [
  {
    icon: BookOpen,
    title: 'Quality content is hard to find',
    text: 'Learners and institutions need reliable, current, syllabus-aligned and well-structured educational resources.',
    image: '/brand/corporate/stock/home_content_publishing.jpg',
  },
  {
    icon: Presentation,
    title: 'Learning needs practical exposure',
    text: 'Training must move beyond theory through workshops, dialogue, and applied capability development.',
    image: '/brand/corporate/stock/home_faculty_training.jpg',
  },
  {
    icon: Handshake,
    title: 'Institutions need expert direction',
    text: 'Academic planning, NEP 2020 alignment, and accreditation readiness require specialized advisory support.',
    image: '/brand/corporate/stock/academic_consultancy_clean.jpg',
  },
  {
    icon: Laptop2,
    title: 'Knowledge remains fragmented',
    text: 'Digital tools should bring content, delivery, assessment, and learner progress into one connected system.',
    image: '/brand/corporate/stock/web_dev_mockup.jpg',
  },
];

const solutions = [
  {
    icon: BookOpen,
    title: 'Educational Content Development',
    text: 'Research-led textbooks, digital publications, courseware, assessments, and custom learning resources.',
    tags: ['Books & e-books', 'Study resources', 'OBE Courseware'],
    path: '/services/content-publishing',
    image: '/brand/corporate/stock/home_content_publishing.jpg',
    themeColor: '#D97706',
  },
  {
    icon: GraduationCap,
    title: 'Academic & Professional Training',
    text: 'Faculty development, student skill programmes, leadership training, and career-readiness workshops.',
    tags: ['Faculty Workshops', 'Certifications', 'Skill Development'],
    path: '/services/professional-learning',
    image: '/brand/corporate/stock/home_faculty_training.jpg',
    themeColor: '#2563EB',
  },
  {
    icon: CalendarDays,
    title: 'Educational Events & Conferences',
    text: 'Conferences, seminars, webinars, competitions, and knowledge-sharing summits with turnkey production.',
    tags: ['Conferences', 'Webinars', 'Academic Summits'],
    path: '/services/education-events',
    image: '/brand/corporate/stock/home_conference_summit.jpg',
    themeColor: '#EA580C',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Educational Consultancy',
    text: 'Practical consultancy for curriculum design, institutional development, NEP 2020 audits, and quality frameworks.',
    tags: ['Academic Planning', 'Accreditation', 'Strategy Audits'],
    path: '/services/academic-advisory',
    image: '/brand/corporate/stock/academic_consultancy_clean.jpg',
    themeColor: '#7C3AED',
  },
  {
    icon: Laptop2,
    title: 'Digital Learning Solutions',
    text: 'Modern websites, cross-platform mobile apps, portfolio designs, and accessible digital platforms.',
    tags: ['Web & Mobile Apps', 'Portfolios', 'SME Tech Support'],
    path: '/services/digital-learning',
    image: '/brand/corporate/stock/web_dev_mockup.jpg',
    themeColor: '#0D9488',
  },
  {
    icon: Landmark,
    title: 'Study in India Strategic Guidance',
    text: 'International student admissions advisory, campus matching, scholarship assistance, and visa roadmap preparation for Indian higher education.',
    tags: ['Admissions Advisory', 'Scholarships', 'Campus Matching'],
    path: studyIndiaPortalUrl,
    image: '/brand/corporate/stock/delhi_university_heritage_hd.jpg',
    themeColor: '#059669',
    isExternal: true,
  },
];

const deliverySteps = [
  {
    icon: Search,
    title: 'Discover & Diagnose',
    desc: 'Deep institutional assessment of syllabus frameworks, learner profiles, and capability gaps.',
  },
  {
    icon: Lightbulb,
    title: 'Architect & Blueprint',
    desc: 'Designing outcome-aligned pedagogical structures, curriculum maps, and technology blueprints.',
  },
  {
    icon: Presentation,
    title: 'Deliver & Author',
    desc: 'Specialist faculty authoring, turnkey production, enablement workshops, and quality audits.',
  },
  {
    icon: CheckCircle2,
    title: 'Measure & Evolve',
    desc: 'Continuous feedback loops, learning analytics, accreditation readiness, and ongoing support.',
  },
];

const audiences = [
  {
    icon: Building2,
    title: 'Schools & K–12 Networks',
    text: 'Syllabus-aligned curriculum, educator empowerment workshops, and learner-engagement toolkits.',
    image: '/brand/corporate/stock/edtech_smart_classroom.jpg',
  },
  {
    icon: Landmark,
    title: 'Universities & Higher Education',
    text: 'OBE programme design, international-student guidance, academic conferences, and faculty development.',
    image: '/brand/corporate/stock/edtech_campus_lab.jpg',
  },
  {
    icon: GraduationCap,
    title: 'Learners & Educators',
    text: 'Structured self-study textbooks, interactive online courses, career bootcamps, and certifications.',
    image: '/brand/corporate/stock/home_content_publishing.jpg',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Organisations & Partners',
    text: 'Custom corporate learning, capacity-building, and CSR education initiatives developed for defined outcomes.',
    image: '/brand/corporate/stock/corporate_training_room.jpg',
  },
];

export default function DraaCorporateHome() {
  return (
    <div className="draa-corp draa-corp-home">
      <GlobalMinimalMotionBackground />
      <SEO
        title="Education Services & Knowledge Management"
        siteName="DRAA"
        description="DRAA creates educational content, professional learning programmes, education events, institutional advisory and digital learning solutions."
        keywords="DRAA, education services, knowledge management, educational content, training, academic consultancy, study in India"
        ogImage="/brand/draa-mark.png"
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION (Banner Section Preserved Intact as Requested)
            ========================================================================= */}
        <section className="draa-corp-hero" aria-labelledby="draa-corp-title">
          <div className="draa-corp-hero-grid" aria-hidden="true" />
          <div className="draa-corp-hero-aurora" aria-hidden="true" />
          <div className="draa-corp-shell draa-corp-hero-inner">
            <div className="draa-corp-hero-copy">
              <span className="draa-corp-pill">
                <Sparkles size={15} /> Education with purpose. Knowledge with impact.
              </span>
              <p className="draa-corp-overline">DRAA (OPC) PRIVATE LIMITED</p>
              <h1 id="draa-corp-title">
                Empowering education
                <span>Enriching futures</span>
              </h1>
              <p className="draa-corp-hero-lead">
                We design content, learning programmes, education events, institutional solutions and digital experiences that turn knowledge into measurable outcomes.
              </p>
              <div className="draa-corp-actions">
                <a href="#solutions" className="draa-corp-button draa-corp-button-dark">
                  Explore our services <ArrowRight size={18} />
                </a>
                <a
                  href={studyIndiaPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="draa-corp-button draa-corp-button-light"
                >
                  <Landmark size={18} /> Study in India portal
                </a>
              </div>
              <div className="draa-corp-trust-row">
                <div>
                  <strong>Since 2023</strong>
                  <span>Established in New Delhi</span>
                </div>
                <i />
                <div>
                  <strong>Outcome-led</strong>
                  <span>Teaching, tutoring &amp; training</span>
                </div>
                <i />
                <div>
                  <strong>End-to-end</strong>
                  <span>Ideas, delivery &amp; impact</span>
                </div>
              </div>
            </div>

            <div className="draa-corp-hero-visual" aria-label="DRAA's five education services">
              <div className="draa-corp-visual-meta" aria-hidden="true">
                <span>Integrated education ecosystem</span>
                <strong>Connected services</strong>
              </div>
              <div className="draa-corp-visual-orbit" aria-hidden="true">
                <i className="draa-orbit-node draa-orbit-node-one" />
                <i className="draa-orbit-node draa-orbit-node-two" />
                <i className="draa-orbit-node draa-orbit-node-three" />
                <i className="draa-orbit-node draa-orbit-node-four" />
                <i className="draa-orbit-node draa-orbit-node-five" />
              </div>
              <div className="draa-corp-visual-scan" aria-hidden="true" />
              <div className="draa-corp-visual-brand">
                <img src="/brand/draa-mark.png" alt="DRAA logo" />
                <strong>DRAA</strong>
                <span>
                  Education Services<br />&amp; Knowledge Management
                </span>
              </div>
              <Link to="/services/content-publishing" className="draa-corp-capability capability-one">
                <BookOpen size={17} /> Content
              </Link>
              <Link to="/services/professional-learning" className="draa-corp-capability capability-two">
                <GraduationCap size={17} /> Training
              </Link>
              <Link to="/services/education-events" className="draa-corp-capability capability-three">
                <CalendarDays size={17} /> Events
              </Link>
              <Link to="/services/academic-advisory" className="draa-corp-capability capability-four">
                <Handshake size={17} /> Advisory
              </Link>
              <Link to="/services/digital-learning" className="draa-corp-capability capability-five">
                <Laptop2 size={17} /> Digital
              </Link>
            </div>
          </div>
          <div className="draa-corp-hero-scroll" aria-hidden="true">
            <span>Scroll to explore</span>
            <i />
          </div>
        </section>

        {/* =========================================================================
            2. PROOF & ECOSYSTEM TRUST TICKER BAND
            ========================================================================= */}
        <section className="draa-corp-proof-band">
          <div className="draa-corp-shell">
            <p>Built for meaningful educational growth</p>
            <div className="draa-corp-proof-track">
              <span><Users size={17} /> Learners &amp; Educators</span>
              <span><Building2 size={17} /> Schools &amp; Colleges</span>
              <span><Landmark size={17} /> Universities</span>
              <span><Handshake size={17} /> Enterprises &amp; NGOs</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. WHO WE ARE & 4-STAGE DELIVERY BLUEPRINT (Blended Visual Media)
            ========================================================================= */}
        <section id="about" className="draa-corp-section draa-corp-about">
          <div className="draa-corp-shell draa-corp-two-column">
            <div>
              <span className="draa-corp-section-label">Who we are</span>
              <h2>An education partner built around outcomes</h2>
              <div className="draa-corp-about-points">
                <span><CheckCircle2 size={17} /> Research-led &amp; Peer-Reviewed</span>
                <span><CheckCircle2 size={17} /> 100% Client Ownership of IP</span>
                <span><CheckCircle2 size={17} /> NEP 2020 &amp; OBE Aligned</span>
              </div>

              {/* Naturally Blended Visual Card */}
              <div className="draa-about-card-visual">
                <img
                  src="/brand/corporate/stock/home_content_publishing.jpg"
                  alt="Academic curriculum authoring and research editorial workspace"
                  className="draa-about-card-img"
                  loading="lazy"
                />
                <div className="draa-about-card-badge">
                  <Sparkles size={16} /> Outcome-Based Education Frameworks
                </div>
              </div>
            </div>

            <div className="draa-corp-about-copy">
              <p>
                DRAA is a New Delhi-based education services and knowledge management enterprise established in June 2023 (CIN: U85491DL2023OPC416284). We bring together academic insight, content expertise, programme delivery, and technology to support the future of learning in Bharat and beyond.
              </p>
              <p>
                Our role is simple: understand the educational challenge, design the right intervention, and remain accountable for the quality and sustainability of the outcome.
              </p>

              {/* Enhanced 4-Stage Delivery Blueprint Visual */}
              <div className="draa-corp-delivery-visual" aria-label="DRAA delivery approach">
                {deliverySteps.map((step, idx) => {
                  const StepIcon = step.icon;
                  return (
                    <React.Fragment key={step.title}>
                      <div className="draa-delivery-step-card">
                        <span><StepIcon size={18} /></span>
                        <strong>{step.title}</strong>
                        <p>{step.desc}</p>
                      </div>
                      {idx < deliverySteps.length - 1 && <i aria-hidden="true" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. THE NEED WE ADDRESS (Naturally Blended Problem Cards)
            ========================================================================= */}
        <section className="draa-corp-section draa-corp-challenges">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading">
              <span className="draa-corp-section-label">The need we address</span>
              <h2>Better learning begins with the right structure</h2>
              <p>We connect the parts of education that are too often treated separately.</p>
            </div>
            <div className="draa-corp-challenge-grid">
              {challenges.map(({ icon: Icon, title, text, image }) => (
                <article key={title} className="draa-corp-challenge-card">
                  <div className="draa-challenge-media">
                    <img src={image} alt={title} className="draa-challenge-img" loading="lazy" />
                    <div className="draa-challenge-scrim" />
                    <span className="draa-corp-icon-box"><Icon size={20} /></span>
                  </div>
                  <div className="draa-challenge-body">
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. SIX CORE SERVICES SHOWCASE (Naturally Blended Bento Capabilities)
            ========================================================================= */}
        <section id="solutions" className="draa-corp-section draa-corp-solutions">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading draa-corp-section-heading-light">
              <span className="draa-corp-section-label">What we do</span>
              <h2>Six core services — One connected partner</h2>
              <p>Each engagement can stand alone or combine into a complete institutional solution.</p>
            </div>

            <div className="draa-corp-solution-grid">
              {solutions.map(({ icon: Icon, title, text, tags, path, image, themeColor, isExternal }) => {
                const cardInner = (
                  <>
                    <div className="draa-corp-solution-media">
                      <img className="draa-corp-solution-image" src={image} alt={title} loading="lazy" />
                      <div className="draa-solution-scrim" />
                      <div className="draa-corp-sol-icon-floating" style={{ color: themeColor }}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <div className="draa-corp-solution-content">
                      <h3>{title}</h3>
                      <p>{text}</p>
                      <ul className="draa-corp-tags-list">
                        {tags.map((tag) => (
                          <li key={tag}>
                            <Check size={13} style={{ color: themeColor }} /> {tag}
                          </li>
                        ))}
                      </ul>
                      <span className="draa-corp-solution-link">
                        {isExternal ? 'Open guidance portal' : 'Explore service'} <ArrowRight size={14} />
                      </span>
                    </div>
                  </>
                );

                return isExternal ? (
                  <a
                    key={title}
                    href={path}
                    target="_blank"
                    rel="noreferrer"
                    className="draa-corp-solution-card"
                  >
                    {cardInner}
                  </a>
                ) : (
                  <Link key={title} to={path} className="draa-corp-solution-card">
                    {cardInner}
                  </Link>
                );
              })}
            </div>

            <div className="draa-corp-solutions-cta">
              <Link to="/capabilities" className="draa-corp-button draa-corp-button-gold">
                View All Capabilities &amp; Specifications <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. STUDY IN INDIA STRATEGIC GUIDANCE PORTAL
            ========================================================================= */}
        <section id="study-in-india" className="draa-corp-section draa-corp-study">
          <div className="draa-corp-shell draa-corp-study-card">
            <div className="draa-corp-study-copy">
              <span className="draa-corp-section-label">Study in India guidance</span>
              <h2>Make the journey to Indian higher education easier to understand</h2>
              <p>
                DRAA’s guidance hub helps international learners discover premier programmes, understand eligibility criteria, explore scholarships, and prepare for each admission milestone—with official government channels clearly identified.
              </p>
              <div className="draa-corp-study-actions">
                <a
                  href={studyIndiaPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="draa-corp-button draa-corp-button-gold"
                >
                  Open the DRAA portal <ArrowRight size={18} />
                </a>
                <a
                  href="https://studyinindia.gov.in/"
                  target="_blank"
                  rel="noreferrer"
                  className="draa-corp-text-link"
                >
                  Visit official government portal <ArrowRight size={16} />
                </a>
              </div>
              <small className="draa-corp-study-disclaimer">
                *DRAA is an independent education-services enterprise providing academic guidance and is not the official Government of India portal.
              </small>
            </div>
            <div id="study-tools" className="draa-corp-study-tools">
              <div className="draa-study-tool-item">
                <Search size={22} className="text-gold" />
                <div>
                  <strong>Discover</strong>
                  <span>Courses, Rankings &amp; Campus Portals</span>
                </div>
              </div>
              <div className="draa-study-tool-item">
                <ClipboardCheck size={22} className="text-gold" />
                <div>
                  <strong>Prepare</strong>
                  <span>Eligibility, Equivalence &amp; Documents</span>
                </div>
              </div>
              <div className="draa-study-tool-item">
                <Lightbulb size={22} className="text-gold" />
                <div>
                  <strong>Explore</strong>
                  <span>Scholarship &amp; Financial Aid Guidance</span>
                </div>
              </div>
              <div className="draa-study-tool-item">
                <ShieldCheck size={22} className="text-gold" />
                <div>
                  <strong>Navigate</strong>
                  <span>Visa, FRRO &amp; Campus Arrival Steps</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. LEARNING & EVENTS PATHWAYS (Naturally Blended Thumbnails)
            ========================================================================= */}
        <section id="learning-events" className="draa-corp-section draa-corp-learning-events">
          <div className="draa-corp-shell draa-corp-two-column">
            <div>
              <span className="draa-corp-section-label">Learning &amp; events</span>
              <h2>Programmes that move people from insight to action</h2>
              <p className="mt-4 text-muted">
                Whether you need dedicated faculty enablement bootcamps, international academic conferences, or customized corporate leadership seminars—we deliver with measurable impact.
              </p>
            </div>
            <div className="draa-corp-learning-list">
              <Link to="/services/professional-learning" className="draa-learning-card">
                <div className="draa-learning-thumb">
                  <img src="/brand/corporate/stock/home_faculty_training.jpg" alt="Faculty training workshop" />
                </div>
                <div className="draa-learning-info">
                  <strong>Professional Learning &amp; Faculty Enablement</strong>
                  <p>Outcome-Based Education workshops, AI/data literacy, and accredited certification tracks.</p>
                </div>
                <ArrowRight size={18} className="draa-learning-arrow" />
              </Link>

              <Link to="/services/education-events" className="draa-learning-card">
                <div className="draa-learning-thumb">
                  <img src="/brand/corporate/stock/home_conference_summit.jpg" alt="Academic summit stage" />
                </div>
                <div className="draa-learning-info">
                  <strong>Knowledge-Sharing Events &amp; Summits</strong>
                  <p>Large-scale education conclaves, leadership forums, webinars, and academic expos.</p>
                </div>
                <ArrowRight size={18} className="draa-learning-arrow" />
              </Link>

              <Link to="/contact?subject=Custom%20Institutional%20Programme" className="draa-learning-card">
                <div className="draa-learning-thumb">
                  <img src="/brand/corporate/stock/corporate_training_room.jpg" alt="Corporate training suite" />
                </div>
                <div className="draa-learning-info">
                  <strong>Custom Institutional Programs</strong>
                  <p>Tailored capacity-building designed around your institution’s strategic roadmap.</p>
                </div>
                <ArrowRight size={18} className="draa-learning-arrow" />
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. WHO WE SUPPORT (Naturally Blended Photographic Cards)
            ========================================================================= */}
        <section id="institutions" className="draa-corp-section draa-corp-institutions">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading">
              <span className="draa-corp-section-label">Who we support</span>
              <h2>Services shaped around the people and institutions we serve</h2>
              <p>We begin with the audience, the academic context, and the desired outcome—not with a one-size-fits-all product.</p>
            </div>
            <div className="draa-corp-audience-grid">
              {audiences.map(({ icon: Icon, title, text, image }) => (
                <article key={title} className="draa-corp-audience-card">
                  <div className="draa-aud-media">
                    <img src={image} alt={title} className="draa-aud-img" loading="lazy" />
                    <div className="draa-aud-scrim" />
                    <div className="draa-aud-icon-wrap">
                      <Icon size={20} />
                    </div>
                  </div>
                  <div className="draa-aud-body">
                    <h3>{title}</h3>
                    <p>{text}</p>
                    <Link to="/who-we-support" className="draa-aud-link">
                      Explore solutions <ChevronRight size={15} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. WHY INSTITUTIONS RELY ON DRAA (The DRAA Difference)
            ========================================================================= */}
        <section className="draa-corp-section draa-corp-advantage">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading text-center mx-auto">
              <span className="draa-corp-section-label">The DRAA Advantage</span>
              <h2>Why Leading Institutions Partner With Us</h2>
              <p>We combine academic rigor, creative excellence, and reliable turnkey execution under one accountable roof.</p>
            </div>

            <div className="draa-corp-advantage-grid">
              <div className="draa-adv-card">
                <div className="draa-adv-icon"><ShieldCheck size={24} /></div>
                <h3>100% Client Ownership</h3>
                <p>You retain full copyright, master editable source files, and distribution rights with zero recurring licensing royalties.</p>
              </div>

              <div className="draa-adv-card">
                <div className="draa-adv-icon"><BookOpen size={24} /></div>
                <h3>Syllabus &amp; OBE Precision</h3>
                <p>Every textbook, digital module, and training curriculum is rigorously mapped against Bloom’s Taxonomy and institutional credit frameworks.</p>
              </div>

              <div className="draa-adv-card">
                <div className="draa-adv-icon"><Laptop2 size={24} /></div>
                <h3>Multi-Format Handover</h3>
                <p>From print-ready pre-press PDFs to accessible ePub3, SCORM packages, and cloud LMS portals—we deliver across every modality.</p>
              </div>

              <div className="draa-adv-card">
                <div className="draa-adv-icon"><Handshake size={24} /></div>
                <h3>One Accountable Partner</h3>
                <p>Eliminate fragmented vendor management. Work with a unified partner capable of driving content, training, events, and tech simultaneously.</p>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            10. FINAL CONVERSION BANNER
            ========================================================================= */}
        <section id="partner" className="draa-corp-partner">
          <div className="draa-corp-shell draa-corp-partner-inner">
            <div>
              <span className="draa-corp-section-label draa-corp-section-label--gold">Build with DRAA</span>
              <h2>Have an education challenge worth solving?</h2>
              <p>Let’s shape the content, programme, event, advisory blueprint or digital solution that moves your learners and institution forward.</p>
            </div>
            <div className="draa-partner-actions">
              <Link to="/contact" className="draa-corp-button draa-corp-button-gold">
                Start a conversation <ArrowRight size={18} />
              </Link>
              <Link to="/about-draa" className="draa-corp-button draa-corp-button-light">
                About Our Enterprise
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
