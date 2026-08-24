import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck,
  FileCode2,
  FileText,
  GraduationCap,
  Layers,
  Layout,
  Lightbulb,
  Palette,
  Presentation,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import SEO from './SEO';
import './DraaCorporateHome.css';
import './ContentPublishingPage.css';

// Deliverables portfolio dataset
const deliverablesData = [
  {
    category: 'books',
    title: 'Textbooks, Monograms & Reference Books',
    tag: 'Long-Form Publishing',
    format: 'Print + Interactive ePub',
    description: 'Comprehensive, chapter-structured academic textbooks and reference volumes written by vetted faculty and subject specialists.',
    features: ['Chapter learning objectives & summaries', 'Worked examples and case studies', 'End-of-chapter discussion prompts & problem sets', 'Standardized indexing and bibliographies'],
    icon: BookOpen,
  },
  {
    category: 'courseware',
    title: 'Curriculum Courseware & Study Guides',
    tag: 'Semester-Ready Modules',
    format: 'Modular Workbooks & PDF',
    description: 'Syllabus-aligned study guides, lecture companion workbooks, and self-paced modular course packs designed for seamless classroom adoption.',
    features: ['Aligned with institutional credit frameworks', 'Micro-learning concept breakdowns', 'Visual infographics and concept maps', 'Formative check-ins after every sub-topic'],
    icon: GraduationCap,
  },
  {
    category: 'assessments',
    title: 'Question Banks & Assessment Engines',
    tag: 'Outcome Measurement',
    format: 'QTI / LMS / DOCX Ready',
    description: 'High-rigor question repositories with verified answer keys, step-by-step solutions, scoring rubrics, and Bloom’s taxonomy taggings.',
    features: ['Categorized by Cognitive Levels (L1 to L6)', 'Multiple Question Formats (MCQs, Case Analysis, Numerical)', 'Detailed rationale for correct & distractor options', 'Accreditation-ready difficulty indexing'],
    icon: ClipboardCheck,
  },
  {
    category: 'digital',
    title: 'Multimedia & Interactive Learning Assets',
    tag: 'Interactive Media',
    format: 'HTML5 / SCORM / MP4',
    description: 'Engaging digital learning assets including animated concept explainers, interactive diagrams, scenario walkthroughs, and audio lecture summaries.',
    features: ['Interactive H5P widgets & micro-simulations', 'Instructional slide decks with presenter notes', 'Visual summaries and infographic cheat sheets', 'Fully accessible (WCAG 2.1 AA compliant)'],
    icon: Presentation,
  },
  {
    category: 'institutional',
    title: 'Institutional Curriculum Systems',
    tag: 'Custom Frameworks',
    format: 'Standardized Course Blueprints',
    description: 'End-to-end curriculum architecture for new degree programs, departmental course modernization, and corporate training curricula.',
    features: ['Graduate attribute & competency mapping', 'Continuous assessment guidelines', 'Faculty teaching guides & lesson plans', 'NEP 2020 & Outcome-Based Education (OBE) compliance'],
    icon: Layers,
  },
  {
    category: 'white-label',
    title: 'White-Label Educational Publishing',
    tag: 'Custom Branded',
    format: '100% Client-Owned IP',
    description: 'Custom academic books, test-prep resources, and learning kits published under your university or EdTech brand with complete copyright transfer.',
    features: ['Exclusive copyright & intellectual property transfer', 'Custom cover and interior layout design', 'Print-ready CMYK pre-press outputs', 'Continuous edition updates & revision support'],
    icon: ShieldCheck,
  },
];

// 4 Pillars of Pedagogical Engine
const pedagogicalPillars = [
  {
    number: '01',
    title: 'Outcome-Based Curriculum Architecture',
    subtitle: 'Pedagogical Structuring',
    description: 'We begin by decomposing target graduate competencies into measurable Learning Outcomes (LOs) mapped against Bloom’s Taxonomy and NEP 2020 benchmarks.',
    icon: Lightbulb,
    points: ['Rigorous Program Outcome (PO) mapping', 'Constructive alignment between content & evaluation', 'Cognitive progression from foundational to advanced concepts'],
  },
  {
    number: '02',
    title: 'SME Authoring & Academic Peer Review',
    subtitle: 'Vetted Scholarship',
    description: 'Our authoring network spans senior university professors, doctorates, research scholars, and industry practitioners with deep domain authority.',
    icon: Users,
    points: ['Strict domain specialization per chapter', 'Double-blind academic peer review', 'Plagiarism & originality certification (Turnitin verified)'],
  },
  {
    number: '03',
    title: 'Instructional Design & Visual Pedagogy',
    subtitle: 'High-Retention Delivery',
    description: 'Transform complex theoretical abstractions into digestible, engaging pedagogical formats using diagrams, callout boxes, real-world case vignettes, and summary mind maps.',
    icon: Layout,
    points: ['High-contrast technical illustrations & schematics', 'Real-world Indian & global case studies', 'Concept checkpoints and formative reflection prompts'],
  },
  {
    number: '04',
    title: 'Pre-Press Production & Multiformat QA',
    subtitle: 'Precision Engineering',
    description: 'Complete production discipline including mathematical typesetting (LaTeX/MathType), InDesign master layout, CMYK color pre-flight, and digital ePub/SCORM conversion.',
    icon: Printer,
    points: ['Flawless mathematical & chemical typography', 'Print-ready prepress files with zero font/bleed errors', 'Responsive ePub3 & accessible screen-reader compliance'],
  },
];

// Production Roadmap Steps
const roadmapSteps = [
  {
    step: '01',
    title: 'Discovery & Syllabus Blueprinting',
    duration: 'Week 1 - 2',
    description: 'We define the scope, target learner cohort, curriculum guidelines, chapter breakdown, and pedagogical guidelines with your academic leadership.',
  },
  {
    step: '02',
    title: 'Subject Specialist Authoring',
    duration: 'Week 3 - 6',
    description: 'Vetted SMEs draft core manuscript chapters, integrate worked examples, formulate problem sets, and author contextual case studies.',
  },
  {
    step: '03',
    title: 'Peer Review & Fact Checking',
    duration: 'Week 7 - 8',
    description: 'Independent reviewers, senior faculty, and copy editors rigorously verify factual accuracy, pedagogical flow, and originality.',
  },
  {
    step: '04',
    title: 'Typesetting & Art Direction',
    duration: 'Week 9 - 10',
    description: 'Professional book designers create bespoke interior layouts, custom technical diagrams, mathematical formulas, and striking cover artwork.',
  },
  {
    step: '05',
    title: 'Final Pre-Press & Multi-Format Delivery',
    duration: 'Week 11 - 12',
    description: 'Deliverables are packaged in print-ready high-res CMYK PDFs, interactive ePub3, and modular LMS-ready digital formats with full IP handover.',
  },
];

// Discipline Coverage Categories
const disciplines = [
  {
    name: 'Engineering & Technology',
    icon: FileCode2,
    topics: ['Data Structures & Algorithms', 'Artificial Intelligence & Machine Learning', 'Cloud Computing & DevOps', 'Electrical & Electronic Systems', 'Mechanical & Thermal Engineering'],
  },
  {
    name: 'Management & Commerce',
    icon: Layers,
    topics: ['Corporate Finance & Accounting', 'Strategic Marketing & Brand Management', 'Supply Chain & Operations', 'Organizational Behavior & HR', 'Business Analytics & Data-Driven Decision Making'],
  },
  {
    name: 'Applied Sciences & Mathematics',
    icon: BookOpen,
    topics: ['Calculus & Linear Algebra', 'Applied Physics & Optics', 'Organic & Analytical Chemistry', 'Biotechnology & Bioinformatics', 'Environmental Science & Sustainability'],
  },
  {
    name: 'Humanities & Social Sciences',
    icon: GraduationCap,
    topics: ['Economics & Public Policy', 'Cognitive & Applied Psychology', 'Sociology & Cultural Studies', 'Contemporary Indian & World History', 'Academic Writing & Research Methodology'],
  },
];

// Comparison Matrix Data
const comparisonRows = [
  {
    criterion: 'Curriculum & Outcome Alignment',
    traditional: 'Generic textbook content with no custom alignment to specific university syllabus.',
    freelancers: 'Ad-hoc quality, inconsistent learning objectives, lacks pedagogical framework.',
    draa: '100% customized to your institution’s syllabus, OBE outcomes, and Bloom’s Taxonomy mapping.',
  },
  {
    criterion: 'Academic Rigor & Peer Review',
    traditional: 'Lengthy review cycles often taking 12-18 months with slow revisions.',
    freelancers: 'Rarely peer-reviewed; prone to errors, unverified formulas, and citation gaps.',
    draa: 'Structured double-blind review by university faculty and PhD researchers in accelerated sprints.',
  },
  {
    criterion: 'Mathematical & Technical Typesetting',
    traditional: 'Standardized rigid templates; limited support for custom interactive assets.',
    freelancers: 'Often uses basic Word documents with distorted equations and blurry images.',
    draa: 'Professional LaTeX, MathType, and InDesign pre-press with vector schematics and high-res art.',
  },
  {
    criterion: 'Copyright & Intellectual Property',
    traditional: 'Publisher retains all IP rights; institutions pay recurring licensing royalties.',
    freelancers: 'Ambiguous copyright terms and potential third-party licensing liability.',
    draa: '100% Exclusive Copyright and IP Transfer to your institution or brand upon final sign-off.',
  },
];

// FAQs Data
const faqs = [
  {
    q: 'What types of educational content does DRAA develop?',
    a: 'DRAA creates full-length academic textbooks, semester-wise courseware, lab manuals, question banks (with detailed step-by-step solutions), interactive digital course packs, instructional slide decks, and accreditation-ready curriculum blueprints across higher education and school education.',
  },
  {
    q: 'Who owns the intellectual property and copyright of the content created?',
    a: 'Your institution or company retains 100% exclusive copyright and intellectual property rights. Once the project is completed and handed over, you own the master files, print rights, digital distribution rights, and all derivative works with zero ongoing royalties.',
  },
  {
    q: 'How do you ensure academic accuracy and avoid plagiarism?',
    a: 'Every manuscript undergoes a mandatory three-tier quality assurance protocol: (1) Subject-Matter Expert authoring, (2) Double-blind peer review by university professors, and (3) Stringent editorial copyediting with certified Turnitin similarity checks and citation verification.',
  },
  {
    q: 'Can DRAA align content with NEP 2020 and international accreditation bodies?',
    a: 'Yes. All our content is architected in accordance with the National Education Policy (NEP 2020), UGC/AICTE outcome-based education (OBE) frameworks, NAAC criteria, and international standards such as Bloom’s Taxonomy and accreditation board guidelines.',
  },
  {
    q: 'What formats are delivered at project conclusion?',
    a: 'We deliver print-ready high-resolution PDFs (with CMYK color profiles, crop marks, and bleed margins), editable source files (InDesign, LaTeX, DOCX), interactive ePub3, and LMS-compatible SCORM/HTML5 packages for web portals.',
  },
];

export default function ContentPublishingPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const filteredDeliverables =
    activeTab === 'all' ? deliverablesData : deliverablesData.filter((item) => item.category === activeTab);

  return (
    <div className="draa-corp content-publishing-page">
      <SEO
        title="Educational Content Development | DRAA Academic Publishing"
        siteName="DRAA"
        description="DRAA develops research-led academic textbooks, courseware, assessment banks, and digital curriculum solutions for universities, schools, and educational publishers."
        keywords="academic content development, curriculum design, textbook publishing, educational courseware, question banks, instructional design, NEP 2020 curriculum, DRAA publishing"
        ogImage="/brand/corporate/stock/academic_publishing_hero.jpg"
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION (High Visual Impact & Editorial Rigor)
            ========================================================================= */}
        <section className="cp-hero" aria-labelledby="cp-hero-title">
          <img
            className="cp-hero-background"
            src="https://images.unsplash.com/photo-1599634875158-597d3f647df6?auto=format&fit=crop&w=2200&q=90"
            alt=""
          />
          <div className="cp-hero-wash" aria-hidden="true" />
          <div className="cp-hero-mesh" aria-hidden="true" />
          <div className="draa-corp-shell cp-hero-inner">
            <div className="cp-hero-copy">
              <nav className="cp-breadcrumb" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <span>/</span>
                <Link to="/capabilities">Capabilities</Link>
                <span>/</span>
                <span className="cp-breadcrumb-current">Academic Content &amp; Publishing</span>
              </nav>

              <span className="cp-pill">
                <Sparkles size={14} /> Research-Led Pedagogy &middot; End-to-End Publishing
              </span>

              <h1 id="cp-hero-title">
                From syllabus blueprint <span>to published impact.</span>
              </h1>

              <p className="cp-hero-lead">
                We partner with higher education institutions, schools, EdTech platforms, and academic publishers to research, write, design, and produce high-impact textbooks, semester courseware, assessment banks, and digital learning assets that turn complex knowledge into measurable mastery.
              </p>

              <div className="cp-hero-actions">
                <Link
                  className="draa-corp-button draa-corp-button-gold"
                  to="/contact?subject=Content%20%26%20Curriculum%20Development"
                >
                  Discuss Your Publishing Need <ArrowRight size={17} />
                </Link>
                <a className="draa-corp-button draa-corp-button-light" href="#portfolio">
                  <BookOpen size={17} /> Explore Deliverables
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="cp-hero-trust">
                <div>
                  <strong>50+ Disciplines</strong>
                  <span>STEM, Commerce &amp; Humanities</span>
                </div>
                <i />
                <div>
                  <strong>NEP 2020 &amp; OBE</strong>
                  <span>Bloom’s Taxonomy Mapped</span>
                </div>
                <i />
                <div>
                  <strong>100% Custom IP</strong>
                  <span>Exclusive Client Ownership</span>
                </div>
              </div>
            </div>

            {/* Visual Editorial Canvas */}
            <div className="cp-hero-visual">
              <div className="cp-hero-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1695722099520-564bb36a3a6b?auto=format&fit=crop&w=1200&q=88"
                  alt="Historic Indian college building representing academic excellence"
                  className="cp-hero-main-img"
                />
                <div className="cp-floating-badge badge-top">
                  <div className="badge-icon">
                    <FileCheck size={16} />
                  </div>
                  <div>
                    <strong>Peer-Reviewed Rigor</strong>
                    <small>Faculty &amp; PhD Review</small>
                  </div>
                </div>

                <div className="cp-floating-badge badge-bottom">
                  <div className="badge-icon">
                    <Printer size={16} />
                  </div>
                  <div>
                    <strong>Print &amp; Digital Ready</strong>
                    <small>CMYK PDF + ePub3 + SCORM</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. KEY CAPABILITIES & PORTFOLIO (Interactive Filter Tabs)
            ========================================================================= */}
        <section id="portfolio" className="draa-corp-section cp-portfolio-section">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading text-center mx-auto">
              <span className="draa-corp-section-label">PUBLISHING DELIVERABLES</span>
              <h2>Comprehensive Formats for Modern Academic Delivery</h2>
              <p>
                From single modular study guides to multi-volume university textbook series and accreditation blueprints, we produce turnkey educational materials tailored to your curriculum.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="cp-tabs-container">
              <button
                type="button"
                className={`cp-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Formats
              </button>
              <button
                type="button"
                className={`cp-tab-btn ${activeTab === 'books' ? 'active' : ''}`}
                onClick={() => setActiveTab('books')}
              >
                Textbooks &amp; E-Books
              </button>
              <button
                type="button"
                className={`cp-tab-btn ${activeTab === 'courseware' ? 'active' : ''}`}
                onClick={() => setActiveTab('courseware')}
              >
                Courseware &amp; Workbooks
              </button>
              <button
                type="button"
                className={`cp-tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
                onClick={() => setActiveTab('assessments')}
              >
                Question Banks
              </button>
              <button
                type="button"
                className={`cp-tab-btn ${activeTab === 'digital' ? 'active' : ''}`}
                onClick={() => setActiveTab('digital')}
              >
                Interactive Media
              </button>
              <button
                type="button"
                className={`cp-tab-btn ${activeTab === 'institutional' ? 'active' : ''}`}
                onClick={() => setActiveTab('institutional')}
              >
                Curriculum Systems
              </button>
            </div>

            {/* Deliverables Grid */}
            <div className="cp-deliverables-grid">
              {filteredDeliverables.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="cp-deliverable-card draa-card-3d">
                    <div className="cp-card-top">
                      <span className="cp-card-tag">{item.tag}</span>
                      <span className="cp-card-format">{item.format}</span>
                    </div>

                    <div className="cp-card-icon-title">
                      <div className="cp-icon-box">
                        <Icon size={22} />
                      </div>
                      <h3>{item.title}</h3>
                    </div>

                    <p className="cp-card-desc">{item.description}</p>

                    <div className="cp-card-features">
                      <strong>Included Specifications:</strong>
                      <ul>
                        {item.features.map((feat) => (
                          <li key={feat}>
                            <CheckCircle2 size={13} className="cp-check-icon" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="cp-card-footer">
                      <Link
                        to={`/contact?subject=${encodeURIComponent(`Inquiry on ${item.title}`)}`}
                        className="cp-card-link"
                      >
                        Request Sample Blueprint <ArrowRight size={14} />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. PEDAGOGICAL ENGINE (The 4 Pillars of DRAA Quality)
            ========================================================================= */}
        <section className="draa-corp-section cp-pedagogy-section">
          <div className="draa-corp-shell">
            <div className="cp-pedagogy-header">
              <div className="cp-pedagogy-header-copy">
                <span className="draa-corp-section-label">OUR PEDAGOGICAL ENGINE</span>
                <h2>How We Ensure Academic Excellence &amp; High Retention</h2>
                <p>
                  Educational content succeeds only when curriculum architecture, instructional clarity, and production precision work in unison. Our multi-stage development methodology guarantees academic integrity and learner engagement.
                </p>
              </div>
              <div className="cp-pedagogy-header-badge">
                <strong>100%</strong>
                <span>Peer-Reviewed &amp; Plagiarism-Verified</span>
              </div>
            </div>

            <div className="cp-pillars-grid">
              {pedagogicalPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.number} className="cp-pillar-card draa-card-3d">
                    <div className="cp-pillar-top">
                      <span className="cp-pillar-num">{pillar.number}</span>
                      <div className="cp-pillar-icon">
                        <Icon size={20} />
                      </div>
                    </div>
                    <span className="cp-pillar-sub">{pillar.subtitle}</span>
                    <h3>{pillar.title}</h3>
                    <p>{pillar.description}</p>
                    <ul className="cp-pillar-points">
                      {pillar.points.map((pt) => (
                        <li key={pt}>
                          <Check size={13} /> {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Center Visual Feature */}
            <div className="cp-pedagogy-banner">
              <img
                src="/brand/corporate/stock/curriculum_design_team.jpg"
                alt="Professors and curriculum specialists collaborating on academic courseware"
                className="cp-banner-img"
              />
              <div className="cp-banner-overlay">
                <div>
                  <span className="cp-banner-tag">COLLABORATIVE AUTHORING</span>
                  <h3>Faculty-Led, Practitioner-Tested, Student-Centric</h3>
                  <p>
                    We actively engage seasoned university educators, textbook authors, and research scholars across India and global academic hubs to write, review, and validate every publication.
                  </p>
                </div>
                <Link to="/contact" className="draa-corp-button draa-corp-button-gold">
                  Collaborate as an Author <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. PRODUCTION ROADMAP (Step-by-Step Delivery Lifecycle)
            ========================================================================= */}
        <section className="draa-corp-section cp-roadmap-section">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading text-center mx-auto">
              <span className="draa-corp-section-label">PUBLISHING LIFECYCLE</span>
              <h2>A Transparent, Milestone-Driven Route to Publication</h2>
              <p>
                Every project follows a disciplined schedule with clear review gates, ensuring your publishing timelines are met with zero compromise on academic standards.
              </p>
            </div>

            <div className="cp-roadmap-timeline">
              {roadmapSteps.map((step, idx) => (
                <div key={step.step} className="cp-roadmap-node">
                  <div className="cp-node-badge">
                    <span>{step.step}</span>
                  </div>
                  <div className="cp-node-content draa-card-3d">
                    <div className="cp-node-header">
                      <h3>{step.title}</h3>
                      <span className="cp-node-duration">{step.duration}</span>
                    </div>
                    <p>{step.description}</p>
                  </div>
                  {idx < roadmapSteps.length - 1 && <div className="cp-node-line" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. DISCIPLINE COVERAGE MATRIX (Breadth of Subject Expertise)
            ========================================================================= */}
        <section className="draa-corp-section cp-disciplines-section">
          <div className="draa-corp-shell">
            <div className="cp-two-col-header">
              <div>
                <span className="draa-corp-section-label">DOMAIN SPECIALIZATIONS</span>
                <h2>Multidisciplinary Breadth &amp; Depth</h2>
              </div>
              <p>
                Our specialized authoring and editing teams cover all major university faculties and secondary education boards, delivering content ready for immediate institutional rollout.
              </p>
            </div>

            <div className="cp-disciplines-grid">
              {disciplines.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.name} className="cp-discipline-card draa-card-3d">
                    <div className="cp-discipline-title-row">
                      <div className="cp-discipline-icon">
                        <Icon size={20} />
                      </div>
                      <h3>{item.name}</h3>
                    </div>
                    <ul className="cp-topic-list">
                      {item.topics.map((topic) => (
                        <li key={topic}>
                          <CheckCircle2 size={13} className="cp-topic-check" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            6. COMPARISON MATRIX (Why DRAA Content?)
            ========================================================================= */}
        <section className="draa-corp-section cp-comparison-section">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading text-center mx-auto">
              <span className="draa-corp-section-label">THE DRAA ADVANTAGE</span>
              <h2>Why Leading Institutions Choose DRAA Publishing</h2>
              <p>
                How our integrated curriculum development engine compares against traditional publishing hurdles and fragmented freelance sourcing.
              </p>
            </div>

            <div className="cp-comparison-table-wrapper draa-card-3d">
              <table className="cp-comparison-table">
                <thead>
                  <tr>
                    <th>Publishing Factor</th>
                    <th>Traditional Publishers</th>
                    <th>Freelancer Sourcing</th>
                    <th className="cp-highlight-col">DRAA Integrated Solution</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.criterion}>
                      <td className="cp-criterion-cell">
                        <strong>{row.criterion}</strong>
                      </td>
                      <td className="cp-muted-cell">{row.traditional}</td>
                      <td className="cp-muted-cell">{row.freelancers}</td>
                      <td className="cp-highlight-cell">
                        <CheckCircle2 size={16} className="cp-win-icon" />
                        <span>{row.draa}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. FAQS (Interactive Accordion)
            ========================================================================= */}
        <section className="draa-corp-section cp-faq-section">
          <div className="draa-corp-shell">
            <div className="draa-corp-section-heading text-center mx-auto">
              <span className="draa-corp-section-label">FREQUENTLY ASKED QUESTIONS</span>
              <h2>Everything You Need to Know About Our Publishing Model</h2>
            </div>

            <div className="cp-faq-list">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={faq.q} className={`cp-faq-card draa-card-3d ${isOpen ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="cp-faq-trigger"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <ChevronDown size={18} className="cp-faq-chevron" />
                    </button>
                    {isOpen && (
                      <div className="cp-faq-answer">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            8. FINAL CONVERSION BANNER (Consultation Trigger)
            ========================================================================= */}
        <section className="cp-final-cta-section">
          <div className="draa-corp-shell cp-final-cta-inner">
            <div className="cp-cta-copy">
              <span className="cp-pill cp-pill-light">
                <Sparkles size={14} /> Ready to Upgrade Your Educational Content?
              </span>
              <h2>Let&apos;s Build Custom Courseware &amp; Textbooks for Your Institution</h2>
              <p>
                Share your syllabus, desired learning outcomes, or publishing vision. Our editorial team will prepare a sample content blueprint and production estimate.
              </p>
            </div>
            <div className="cp-cta-actions">
              <Link
                to="/contact?subject=Content%20%26%20Curriculum%20Development"
                className="draa-corp-button draa-corp-button-dark"
              >
                Request a Sample Chapter <ArrowRight size={17} />
              </Link>
              <Link to="/capabilities" className="draa-corp-button draa-corp-button-light">
                Explore All 5 Capabilities
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
