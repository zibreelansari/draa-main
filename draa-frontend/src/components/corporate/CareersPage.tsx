import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  Laptop2,
  Layers,
  Lightbulb,
  MapPin,
  MessageSquare,
  PenTool,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import LightLineMotionBackground from './LightLineMotionBackground';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import SEO from './SEO';
import './DraaCorporateHome.css';
import './CareersPage.css';

interface JobVacancy {
  id: string;
  title: string;
  department: string;
  deptKey: string;
  location: string;
  type: string;
  experience: string;
  openings: string;
  desc: string;
  responsibilities: string[];
  qualifications: string[];
}

const vacancies: JobVacancy[] = [
  {
    id: 'sme-author-lead',
    title: 'Senior Subject Specialist & Academic Author',
    department: 'Content & Editorial',
    deptKey: 'content',
    location: 'New Delhi HQ / Hybrid',
    type: 'Full-Time',
    experience: '4 - 8 Years',
    openings: '2 Positions',
    desc: 'Lead authoring and peer review of university textbooks, OBE courseware, and modular learning packs across STEM, Commerce, and Social Sciences.',
    responsibilities: [
      'Author and structure rigorous, syllabus-aligned textbook manuscripts and chapter rubrics.',
      'Coordinate double-blind peer reviews and ensure 100% academic factual integrity.',
      'Collaborate with LaTeX and InDesign typesetting specialists for flawless pre-press delivery.',
      'Develop cognitively indexed question banks indexed to Bloom’s Taxonomy levels (L1–L6).',
    ],
    qualifications: [
      'Master’s or Ph.D. in STEM, Management, Economics, or related academic discipline.',
      'Demonstrated publishing track record with academic publishers or premier institutions.',
      'Exemplary written English, pedagogical structuring, and editorial discipline.',
    ],
  },
  {
    id: 'instructional-designer',
    title: 'Instructional Designer & OBE Specialist',
    department: 'Pedagogy & Curriculum',
    deptKey: 'training',
    location: 'New Delhi HQ / Hybrid',
    type: 'Full-Time',
    experience: '3 - 6 Years',
    openings: '2 Positions',
    desc: 'Design outcome-based curriculum frameworks, interactive digital course packs, and educator enablement workshops for schools and universities.',
    responsibilities: [
      'Translate syllabus outlines into structured Outcome-Based Education (OBE) course blueprints.',
      'Design engaging formative assessments, case vignettes, and experiential workbooks.',
      'Develop storyboards and scripts for digital micro-learning videos and LMS interactive assets.',
      'Facilitate pedagogy modernization masterclasses for school and college educators.',
    ],
    qualifications: [
      'Degree in Education (M.Ed / B.Ed), Instructional Design, or Cognitive Sciences.',
      'Hands-on expertise in NEP 2020 pedagogical integration and Bloom’s outcome mapping.',
      'Proficiency in authoring tools (Articulate 360, H5P, LMS course pack standards).',
    ],
  },
  {
    id: 'curriculum-consultant',
    title: 'Institutional Consultant & Accreditation Auditor',
    department: 'Advisory & Consultancy',
    deptKey: 'advisory',
    location: 'New Delhi HQ / Client Onsite',
    type: 'Full-Time / Consulting',
    experience: '5 - 10 Years',
    openings: '1 Position',
    desc: 'Guide universities and autonomous colleges through NAAC, NBA, and NIRF accreditation audits, academic restructuring, and institutional strategic roadmaps.',
    responsibilities: [
      'Conduct diagnostic institutional audits across academic governance, pedagogy, and research.',
      'Structure Self-Study Reports (SSR), criteria documentation, and mock peer review audits.',
      'Advise institutional leadership on multi-disciplinary curriculum modernization under NEP 2020.',
      'Develop actionable implementation matrices with quantifiable KPI dashboards.',
    ],
    qualifications: [
      'Extensive experience with higher education quality frameworks (NAAC, NBA, NIRF, QS).',
      'Strong advisory presence with university deans, chancellors, and management boards.',
      'Data-driven analytical aptitude with clear strategic documentation abilities.',
    ],
  },
  {
    id: 'faculty-enablement-lead',
    title: 'Faculty Training & Workshop Lead',
    department: 'Training & Development',
    deptKey: 'training',
    location: 'New Delhi HQ / Pan-Bharat Travel',
    type: 'Full-Time',
    experience: '4 - 7 Years',
    openings: '2 Positions',
    desc: 'Deliver high-impact Continuous Professional Development (CPD) bootcamps, teacher training workshops, and corporate leadership seminars.',
    responsibilities: [
      'Deliver interactive workshops on modern teaching methodologies, assessment design, and EdTech tools.',
      'Author comprehensive participant workbooks, toolkits, and practical simulation briefs.',
      'Measure workshop impact through pre/post capability benchmarks and evaluation analytics.',
      'Train student cohorts in career readiness, critical thinking, and technical communication.',
    ],
    qualifications: [
      'Dynamic facilitation background with proven university or corporate training experience.',
      'Deep understanding of adult learning principles and interactive workshop mechanics.',
      'Fluency in English and Hindi with superior presentation and interpersonal skills.',
    ],
  },
  {
    id: 'fullstack-edtech-engineer',
    title: 'Full-Stack EdTech Software Engineer',
    department: 'Technology & Digital',
    deptKey: 'tech',
    location: 'Remote / Hybrid (New Delhi)',
    type: 'Full-Time',
    experience: '3 - 6 Years',
    openings: '2 Positions',
    desc: 'Architect and develop scalable digital learning platforms, accessible LMS portals, interactive assessment engines, and analytics dashboards.',
    responsibilities: [
      'Build performant web applications using React, TypeScript, Node.js, and modern cloud architectures.',
      'Integrate LTI, SCORM, and xAPI standards for seamless LMS interoperability.',
      'Implement secure authentication, role-based access control, and automated evaluation pipelines.',
      'Collaborate with instructional designers to bring interactive learning experiences to life.',
    ],
    qualifications: [
      'Strong proficiency in modern JavaScript/TypeScript, React, Node.js, and REST/GraphQL APIs.',
      'Experience with LMS platforms (Moodle, Canvas, custom portals) and database architectures.',
      'Passion for building accessible, clean, and responsive user interfaces.',
    ],
  },
  {
    id: 'academic-events-producer',
    title: 'Academic Events & Summit Operations Lead',
    department: 'Operations & Events',
    deptKey: 'operations',
    location: 'New Delhi HQ',
    type: 'Full-Time',
    experience: '2 - 5 Years',
    openings: '1 Position',
    desc: 'Coordinate turnkey academic conferences, research summits, speaker management, registration portals, and proceedings publication.',
    responsibilities: [
      'Manage end-to-end event operations for national and international academic conferences.',
      'Coordinate keynote speaker onboarding, VIP logistics, and peer-reviewed paper submissions.',
      'Oversee virtual broadcast streaming, hybrid event technologies, and venue production.',
      'Ensure post-event publication of ISBN conference proceedings and delegate certifications.',
    ],
    qualifications: [
      'Experience managing conferences, academic summits, or large-scale corporate symposiums.',
      'Exceptional project coordination, vendor management, and multi-tasking abilities.',
      'Comfortable interfacing with senior researchers, chancellors, and corporate sponsors.',
    ],
  },
];

const culturePerks = [
  {
    icon: Sparkles,
    title: 'Academic Freedom & Real Impact',
    desc: 'Work on foundational educational initiatives that directly empower learners, educators, and premier institutions across the nation.',
  },
  {
    icon: Briefcase,
    title: 'Competitive Compensation & Growth',
    desc: 'Transparent, merit-based compensation structures with performance bonuses and fast-track institutional career progression.',
  },
  {
    icon: Layers,
    title: 'Multidisciplinary Collaboration',
    desc: 'Work alongside subject matter PhDs, software engineers, textbook authors, and quality consultants under one connected team.',
  },
  {
    icon: Clock,
    title: 'Flexibility & Work-Life Harmony',
    desc: 'Hybrid work options, respectful project schedules, and an outcome-driven culture focused on results rather than rigid micromanagement.',
  },
  {
    icon: GraduationCap,
    title: 'Continuous Learning Subsidies',
    desc: 'Annual learning allowances for books, research journals, professional certifications, and conference attendances.',
  },
  {
    icon: Building2,
    title: 'New Delhi HQ & Modern Tools',
    desc: 'Prime corporate workspace equipped with ergonomic workstations, advanced editorial software, and cloud infrastructure.',
  },
];

const candidateSteps = [
  {
    icon: Search,
    title: 'Profile & Portfolio Review',
    desc: 'Our academic and talent team reviews your work samples, credentials, and alignment with open requirements.',
  },
  {
    icon: MessageSquare,
    title: 'Domain & Technical Dialogue',
    desc: 'A focused discussion with your discipline lead exploring your strengths, problem-solving methods, and career aspirations.',
  },
  {
    icon: FileCheck2,
    title: 'Practical Capability Exercise',
    desc: 'A short, realistic sample brief (manuscript sample, lesson map, or code exercise) simulating daily collaboration.',
  },
  {
    icon: HeartHandshake,
    title: 'Offer & Seamless Onboarding',
    desc: 'Transparent offer rollout, role expectations alignment, and comprehensive institutional joining support.',
  },
];

export default function CareersPage() {
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [appliedRole, setAppliedRole] = useState<string>('Senior Subject Specialist & Academic Author');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    experience: '3-5 years',
    qualification: "Master's Degree",
    portfolioUrl: '',
    coverNote: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);

  const filteredVacancies =
    selectedDept === 'all'
      ? vacancies
      : vacancies.filter((v) => v.deptKey === selectedDept);

  const handleApplyClick = (roleTitle: string) => {
    setAppliedRole(roleTitle);
    setIsSubmitted(false);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate reliable application submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div className="draa-corp careers-page-root">
      <SEO
        title="Careers at DRAA | Join Our Education & Knowledge Team"
        siteName="DRAA"
        description="Explore open vacancies at DRAA across educational content development, academic advisory, faculty training, EdTech engineering, and conference management."
        keywords="DRAA careers, education jobs, textbook author jobs, instructional designer vacancy, NAAC consultant, EdTech software engineer, New Delhi education jobs"
        ogImage="/brand/corporate/stock/university-building.jpg"
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION (Signature Warm Ivory & Gold Palette)
            ========================================================================= */}
        <section className="cp-hero">
          <LightLineMotionBackground />
          <div className="draa-corp-shell cp-hero-grid">
            <div>
              <span className="cp-kicker">
                <BriefcaseBusiness size={14} /> CAREERS AT DRAA
              </span>
              <h1>
                Build work that helps <span>learning move forward</span>
              </h1>
              <p className="cp-hero-summary">
                Join a purpose-driven education enterprise in New Delhi where academic rigor, publishing discipline, faculty empowerment, and digital technology come together to transform learning outcomes.
              </p>
              <div className="cp-hero-actions">
                <a href="#vacancies" className="draa-corp-button draa-corp-button-gold">
                  View Open Vacancies ({vacancies.length}) <ArrowRight size={17} />
                </a>
                <a href="#application-form" className="draa-corp-button draa-corp-button-light">
                  Submit Direct Application
                </a>
              </div>

              <div className="cp-hero-proof">
                <div className="cp-proof-item">
                  <strong>6+ Active Roles</strong>
                  <span>Immediate Openings</span>
                </div>
                <div className="cp-proof-item">
                  <strong>Hybrid &amp; Flexible</strong>
                  <span>Workplace Modalities</span>
                </div>
                <div className="cp-proof-item">
                  <strong>100% Merit-Based</strong>
                  <span>Transparent Hiring</span>
                </div>
              </div>
            </div>

            {/* Clean Hero Visual Card */}
            <div className="cp-hero-visual">
              <div className="cp-hero-card">
                <img
                  src="/brand/corporate/stock/academic_publishing_hero.jpg"
                  alt="DRAA academic editorial workspace with books, research and digital devices"
                  className="cp-hero-card-img"
                  loading="eager"
                />
                <div className="cp-hero-floating-badge">
                  <div className="cp-floating-icon-wrap">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <strong>Equal Opportunity Employer</strong>
                    <small>Valuing Intellectual Rigor &amp; Creativity</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. OPEN VACANCIES DIRECTORY WITH DEPARTMENT FILTERS
            ========================================================================= */}
        <section id="vacancies" className="cp-section">
          <div className="draa-corp-shell">
            <div className="cp-section-header">
              <span className="cp-section-pill">
                <Zap size={14} /> CURRENT OPENINGS
              </span>
              <h2>Explore Open Vacancies &amp; Career Pathways</h2>
              <p>
                Find your next role across academic authoring, curriculum advisory, educator training, software engineering, and operations.
              </p>
            </div>

            {/* Department Filter Tabs */}
            <div className="cp-filters-row" role="tablist">
              {[
                { label: 'All Openings', key: 'all' },
                { label: 'Content & Editorial', key: 'content' },
                { label: 'Training & Pedagogy', key: 'training' },
                { label: 'Advisory & Consultancy', key: 'advisory' },
                { label: 'Technology & Digital', key: 'tech' },
                { label: 'Operations & Events', key: 'operations' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={selectedDept === tab.key}
                  className={`cp-filter-tab ${selectedDept === tab.key ? 'active' : ''}`}
                  onClick={() => setSelectedDept(tab.key)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Vacancies Grid */}
            <div className="cp-vacancies-grid">
              {filteredVacancies.map((job) => (
                <article key={job.id} className="cp-vacancy-card">
                  <div className="cp-vacancy-top">
                    <span className="cp-dept-badge">
                      <Layers size={13} /> {job.department}
                    </span>
                    <span className="cp-job-type-tag">{job.type}</span>
                  </div>

                  <h3>{job.title}</h3>

                  <div className="cp-vacancy-meta">
                    <span className="cp-meta-item">
                      <MapPin size={14} /> {job.location}
                    </span>
                    <span className="cp-meta-item">
                      <Clock size={14} /> {job.experience}
                    </span>
                    <span className="cp-meta-item">
                      <Users size={14} /> {job.openings}
                    </span>
                  </div>

                  <p className="cp-vacancy-desc">{job.desc}</p>

                  <div className="cp-vacancy-points-title">Key Responsibilities:</div>
                  <ul className="cp-vacancy-points">
                    {job.responsibilities.slice(0, 3).map((item) => (
                      <li key={item}>
                        <Check size={14} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="cp-vacancy-action-row">
                    <span className="cp-openings-count">Applications Reviewed Promptly</span>
                    <button
                      type="button"
                      className="cp-apply-btn"
                      onClick={() => handleApplyClick(job.title)}
                    >
                      Apply for this Role <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            3. INTERACTIVE DIRECT JOB APPLICATION FORM
            ========================================================================= */}
        <section id="application-form" className="cp-section cp-section-tint" ref={formRef}>
          <div className="draa-corp-shell">
            <div className="cp-section-header">
              <span className="cp-section-pill">
                <Send size={14} /> SUBMIT APPLICATION
              </span>
              <h2>Apply Directly for a Role or Share Your Profile</h2>
              <p>
                Fill out the application form below. Our talent acquisition committee reviews every submission and will contact you for relevant opportunities.
              </p>
            </div>

            <div className="cp-app-form-wrap">
              {isSubmitted ? (
                <div className="cp-success-banner">
                  <CheckCircle2 size={36} />
                  <h4>Application Received Successfully!</h4>
                  <p>
                    Thank you for applying for <strong>{appliedRole}</strong>. Your profile has been logged in our talent database with reference ID <strong>DRAA-APP-{Math.floor(100000 + Math.random() * 900000)}</strong>. Our hiring team will review your credentials and get back to you.
                  </p>
                  <button
                    type="button"
                    className="cp-apply-btn"
                    style={{ margin: '18px auto 0' }}
                    onClick={() => setIsSubmitted(false)}
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="cp-app-form-header">
                    <h3>Candidate Application Form</h3>
                    <p>Applying for: <strong>{appliedRole}</strong></p>
                  </div>

                  <div className="cp-form-grid">
                    {/* Position Applied For */}
                    <div className="cp-form-field-full">
                      <label className="cp-form-label" htmlFor="role-select">Position Applied For *</label>
                      <select
                        id="role-select"
                        className="cp-form-select"
                        value={appliedRole}
                        onChange={(e) => setAppliedRole(e.target.value)}
                        required
                      >
                        {vacancies.map((v) => (
                          <option key={v.id} value={v.title}>
                            {v.title} ({v.department})
                          </option>
                        ))}
                        <option value="General Expression of Interest">
                          General Expression of Interest (Other Disciplines)
                        </option>
                      </select>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="cp-form-label" htmlFor="full-name">Full Name *</label>
                      <input
                        id="full-name"
                        type="text"
                        className="cp-form-input"
                        placeholder="e.g. Dr. Rajesh Sharma"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="cp-form-label" htmlFor="email-addr">Email Address *</label>
                      <input
                        id="email-addr"
                        type="email"
                        className="cp-form-input"
                        placeholder="e.g. rajesh@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="cp-form-label" htmlFor="phone-num">Phone / WhatsApp Number *</label>
                      <input
                        id="phone-num"
                        type="tel"
                        className="cp-form-input"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>

                    {/* Current Location */}
                    <div>
                      <label className="cp-form-label" htmlFor="location">Current City / Location *</label>
                      <input
                        id="location"
                        type="text"
                        className="cp-form-input"
                        placeholder="e.g. New Delhi, Bengaluru, Mumbai"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        required
                      />
                    </div>

                    {/* Years of Experience */}
                    <div>
                      <label className="cp-form-label" htmlFor="experience-select">Relevant Work Experience *</label>
                      <select
                        id="experience-select"
                        className="cp-form-select"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      >
                        <option value="0-2 years">0 - 2 Years (Early Career)</option>
                        <option value="3-5 years">3 - 5 Years (Mid-Level)</option>
                        <option value="6-9 years">6 - 9 Years (Senior Specialist)</option>
                        <option value="10+ years">10+ Years (Leadership / Expert)</option>
                      </select>
                    </div>

                    {/* Highest Qualification */}
                    <div>
                      <label className="cp-form-label" htmlFor="qualification-select">Highest Academic Qualification *</label>
                      <select
                        id="qualification-select"
                        className="cp-form-select"
                        value={formData.qualification}
                        onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      >
                        <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                        <option value="Master's Degree (M.Sc / M.Tech / MA / MBA)">Master&apos;s Degree (M.Sc / M.Tech / MA / MBA)</option>
                        <option value="Bachelor's Degree (B.Tech / B.Sc / BA)">Bachelor&apos;s Degree (B.Tech / B.Sc / BA)</option>
                        <option value="B.Ed / M.Ed Education Certification">B.Ed / M.Ed Education Certification</option>
                        <option value="Other Professional Diploma">Other Professional Diploma</option>
                      </select>
                    </div>

                    {/* LinkedIn / Portfolio URL */}
                    <div className="cp-form-field-full">
                      <label className="cp-form-label" htmlFor="portfolio-url">LinkedIn Profile or Online Portfolio URL</label>
                      <input
                        id="portfolio-url"
                        type="url"
                        className="cp-form-input"
                        placeholder="https://linkedin.com/in/yourprofile or https://yourportfolio.com"
                        value={formData.portfolioUrl}
                        onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                      />
                    </div>

                    {/* Resume / CV Upload */}
                    <div className="cp-form-field-full">
                      <label className="cp-form-label">Attach Resume / CV (PDF or DOCX) *</label>
                      <div className="cp-file-upload-box">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                        />
                        <div className="cp-file-upload-icon">
                          <UploadCloud size={22} />
                        </div>
                        <strong>Click to Browse or Drag &amp; Drop Resume File</strong>
                        <small>Supported formats: PDF, DOC, DOCX (Max 10MB)</small>
                        {selectedFile && (
                          <div className="cp-file-selected-pill">
                            <FileCheck2 size={14} /> Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Note */}
                    <div className="cp-form-field-full">
                      <label className="cp-form-label" htmlFor="cover-note">Brief Candidate Note / Key Strengths</label>
                      <textarea
                        id="cover-note"
                        className="cp-form-textarea"
                        placeholder="Share a brief overview of your expertise, recent achievements, or why you are interested in joining DRAA..."
                        value={formData.coverNote}
                        onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="cp-form-field-full">
                      <button
                        type="submit"
                        className="cp-submit-btn"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>Submitting Application...</>
                        ) : (
                          <>
                            Submit Application for {appliedRole} <Send size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. CULTURE, PERKS & BENEFITS
            ========================================================================= */}
        <section className="cp-section">
          <div className="draa-corp-shell">
            <div className="cp-section-header">
              <span className="cp-section-pill">
                <ShieldCheck size={14} /> WHY JOIN DRAA
              </span>
              <h2>A Culture Grounded in Purpose, Rigor &amp; Well-Being</h2>
              <p>
                We believe that the highest quality educational solutions are created when specialists are empowered with intellectual autonomy, dependable support, and collaborative respect.
              </p>
            </div>

            <div className="cp-culture-grid">
              {culturePerks.map((perk) => {
                const Icon = perk.icon;
                return (
                  <div key={perk.title} className="cp-culture-card">
                    <div className="cp-culture-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{perk.title}</h3>
                    <p>{perk.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            5. CLEAR 4-STAGE CANDIDATE JOURNEY
            ========================================================================= */}
        <section className="cp-section cp-section-tint">
          <div className="draa-corp-shell">
            <div className="cp-section-header">
              <span className="cp-section-pill">
                <Compass size={14} /> CANDIDATE JOURNEY
              </span>
              <h2>What to Expect After Applying</h2>
              <p>
                A structured, respectful recruitment process designed to evaluate capability while providing you full clarity on our mission and expectations.
              </p>
            </div>

            <div className="cp-journey-flow">
              {candidateSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="cp-journey-card">
                    <div className="cp-journey-icon">
                      <Icon size={22} />
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                );
              })}
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
