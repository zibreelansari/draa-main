import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  FileCheck2,
  Filter,
  GraduationCap,
  HeartHandshake,
  Laptop2,
  Layers,
  Lightbulb,
  MapPin,
  MessageSquare,
  PenTool,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  X,
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
  locationKey: string;
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
    locationKey: 'delhi',
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
    locationKey: 'delhi',
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
    locationKey: 'delhi',
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
    location: 'Pan-Bharat / New Delhi',
    locationKey: 'remote',
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
    locationKey: 'remote',
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
    locationKey: 'delhi',
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
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Application Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appliedRole, setAppliedRole] = useState('Senior Subject Specialist & Academic Author');
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

  const formSectionRef = useRef<HTMLDivElement | null>(null);

  // Filter Vacancies
  const filteredVacancies = vacancies.filter((job) => {
    const matchesSearch =
      searchQuery === '' ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.desc.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'all' || job.deptKey === selectedDept;
    const matchesLocation =
      selectedLocation === 'all' || job.locationKey === selectedLocation;

    return matchesSearch && matchesDept && matchesLocation;
  });

  const handleOpenModal = (roleTitle: string) => {
    setAppliedRole(roleTitle);
    setIsSubmitted(false);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedLocation('all');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 900);
  };

  return (
    <div className="draa-corp careers-page-root">
      <SEO
        title="Careers at DRAA | Job Openings & Application Portal"
        siteName="DRAA"
        description="Search active job vacancies at DRAA in educational content authoring, academic advisory, faculty training, and EdTech software engineering. Apply online directly."
        keywords="DRAA careers, job vacancies, textbook author jobs, instructional designer vacancy, NAAC consultant, EdTech software engineer, apply online"
        ogImage="/brand/corporate/stock/academic_publishing_hero.jpg"
      />
      <DraaCorporateHeader />

      <main>
        {/* =========================================================================
            1. HERO SECTION WITH MODERN JOB SEARCH & FILTER HUB
            ========================================================================= */}
        <section className="cp-hero-hub">
          <LightLineMotionBackground />
          <div className="draa-corp-shell">
            <div className="cp-hero-content">
              <span className="cp-kicker">
                <BriefcaseBusiness size={14} /> CAREERS &amp; OPPORTUNITIES
              </span>
              <h1>
                Build work that helps <span>learning move forward</span>
              </h1>
              <p>
                Find your next meaningful career opportunity at DRAA. Search open roles across academic publishing, institutional advisory, educator training, and learning technology.
              </p>

              {/* Integrated Search & Filter Bar */}
              <div className="cp-search-bar-wrap">
                {/* Text Keyword Search */}
                <div className="cp-search-input-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by role title, discipline, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Department Dropdown */}
                <div className="cp-search-select-box">
                  <Layers size={16} />
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    aria-label="Filter by department"
                  >
                    <option value="all">All Departments</option>
                    <option value="content">Content &amp; Editorial</option>
                    <option value="training">Training &amp; Pedagogy</option>
                    <option value="advisory">Advisory &amp; Consultancy</option>
                    <option value="tech">Technology &amp; Digital</option>
                    <option value="operations">Operations &amp; Events</option>
                  </select>
                </div>

                {/* Location / Work Mode Dropdown */}
                <div className="cp-search-select-box">
                  <MapPin size={16} />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    aria-label="Filter by location"
                  >
                    <option value="all">All Locations</option>
                    <option value="delhi">New Delhi HQ / Hybrid</option>
                    <option value="remote">Remote / Pan-Bharat</option>
                  </select>
                </div>

                {/* Reset Filters Button */}
                {(searchQuery || selectedDept !== 'all' || selectedLocation !== 'all') && (
                  <button
                    type="button"
                    className="cp-search-reset-btn"
                    onClick={handleResetFilters}
                    title="Reset all filters"
                  >
                    <RotateCcw size={14} /> Clear
                  </button>
                )}
              </div>

              {/* Quick Filter Tag Pills */}
              <div className="cp-quick-tags">
                <span className="cp-quick-tags-label">Popular Searches:</span>
                {[
                  { label: 'Academic Author', query: 'Author' },
                  { label: 'Instructional Design', query: 'Instructional' },
                  { label: 'Accreditation Auditor', query: 'Accreditation' },
                  { label: 'Software Engineer', query: 'Engineer' },
                  { label: 'Faculty Trainer', query: 'Workshop' },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    className={`cp-quick-tag-pill ${searchQuery === item.query ? 'active' : ''}`}
                    onClick={() => setSearchQuery(item.query)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. OPEN VACANCIES DIRECTORY
            ========================================================================= */}
        <section id="vacancies" className="cp-section">
          <div className="draa-corp-shell">
            <div className="cp-vacancies-results-bar">
              <div className="cp-vacancies-count">
                Showing {filteredVacancies.length} of {vacancies.length} Open Positions
              </div>
              <button
                type="button"
                className="cp-apply-btn"
                onClick={() => handleOpenModal('General Expression of Interest')}
              >
                Submit General Profile <ArrowRight size={14} />
              </button>
            </div>

            {filteredVacancies.length > 0 ? (
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
                      <span className="cp-openings-count">Immediate Review</span>
                      <button
                        type="button"
                        className="cp-apply-btn"
                        onClick={() => handleOpenModal(job.title)}
                      >
                        Apply for this Role <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="cp-empty-state">
                <Search size={40} />
                <h3>No Vacancies Match Your Criteria</h3>
                <p>Try clearing your keyword filters or submit a general expression of interest.</p>
                <button
                  type="button"
                  className="cp-search-reset-btn"
                  onClick={handleResetFilters}
                  style={{ margin: '0 auto' }}
                >
                  <RotateCcw size={14} /> Reset Search Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =========================================================================
            3. IN-PAGE DIRECT APPLICATION FORM SECTION
            ========================================================================= */}
        <section id="application-form" className="cp-section cp-section-tint" ref={formSectionRef}>
          <div className="draa-corp-shell">
            <div className="cp-section-header">
              <span className="cp-section-pill">
                <Send size={14} /> APPLICATION FORM
              </span>
              <h2>Direct Candidate Submission Portal</h2>
              <p>
                Apply directly using the form below or through any specific opening above. Our hiring committee reviews every submission.
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
                  <div className="cp-form-grid">
                    {/* Position Applied For */}
                    <div className="cp-form-field-full">
                      <label className="cp-form-label" htmlFor="role-select-inpage">Position Applied For *</label>
                      <select
                        id="role-select-inpage"
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
                      <label className="cp-form-label" htmlFor="full-name-inpage">Full Name *</label>
                      <input
                        id="full-name-inpage"
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
                      <label className="cp-form-label" htmlFor="email-inpage">Email Address *</label>
                      <input
                        id="email-inpage"
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
                      <label className="cp-form-label" htmlFor="phone-inpage">Phone / WhatsApp Number *</label>
                      <input
                        id="phone-inpage"
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
                      <label className="cp-form-label" htmlFor="location-inpage">Current City / Location *</label>
                      <input
                        id="location-inpage"
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
                      <label className="cp-form-label" htmlFor="exp-inpage">Relevant Work Experience *</label>
                      <select
                        id="exp-inpage"
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
                      <label className="cp-form-label" htmlFor="qual-inpage">Highest Academic Qualification *</label>
                      <select
                        id="qual-inpage"
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
                      <label className="cp-form-label" htmlFor="portfolio-inpage">LinkedIn Profile or Online Portfolio URL</label>
                      <input
                        id="portfolio-inpage"
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
                      <label className="cp-form-label" htmlFor="note-inpage">Brief Candidate Note / Key Strengths</label>
                      <textarea
                        id="note-inpage"
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

      {/* =========================================================================
          6. POPUP APPLICATION MODAL
          ========================================================================= */}
      {isModalOpen && (
        <div className="cp-modal-backdrop" onClick={handleCloseModal}>
          <div className="cp-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="cp-modal-close-btn"
              onClick={handleCloseModal}
              aria-label="Close application modal"
            >
              <X size={18} />
            </button>

            <div className="cp-modal-header">
              <span className="cp-modal-badge">Direct Job Application</span>
              <h3>{appliedRole}</h3>
              <p>Fill out the application below. We will review your profile within 48 hours.</p>
            </div>

            {isSubmitted ? (
              <div className="cp-success-banner">
                <CheckCircle2 size={36} />
                <h4>Application Received Successfully!</h4>
                <p>
                  Thank you for applying for <strong>{appliedRole}</strong>. Reference Code: <strong>DRAA-APP-{Math.floor(100000 + Math.random() * 900000)}</strong>.
                </p>
                <button
                  type="button"
                  className="cp-apply-btn"
                  style={{ margin: '16px auto 0' }}
                  onClick={handleCloseModal}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="cp-form-grid">
                  {/* Full Name */}
                  <div>
                    <label className="cp-form-label" htmlFor="modal-name">Full Name *</label>
                    <input
                      id="modal-name"
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
                    <label className="cp-form-label" htmlFor="modal-email">Email Address *</label>
                    <input
                      id="modal-email"
                      type="email"
                      className="cp-form-input"
                      placeholder="e.g. rajesh@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="cp-form-label" htmlFor="modal-phone">Phone / WhatsApp *</label>
                    <input
                      id="modal-phone"
                      type="tel"
                      className="cp-form-input"
                      placeholder="e.g. +91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="cp-form-label" htmlFor="modal-location">City / Location *</label>
                    <input
                      id="modal-location"
                      type="text"
                      className="cp-form-input"
                      placeholder="e.g. New Delhi, Bengaluru"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="cp-form-label" htmlFor="modal-exp">Experience *</label>
                    <select
                      id="modal-exp"
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
                    <label className="cp-form-label" htmlFor="modal-qual">Highest Qualification *</label>
                    <select
                      id="modal-qual"
                      className="cp-form-select"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    >
                      <option value="Ph.D. / Doctorate">Ph.D. / Doctorate</option>
                      <option value="Master's Degree (M.Sc / M.Tech / MA / MBA)">Master&apos;s Degree</option>
                      <option value="Bachelor's Degree (B.Tech / B.Sc / BA)">Bachelor&apos;s Degree</option>
                      <option value="B.Ed / M.Ed Education Certification">B.Ed / M.Ed</option>
                      <option value="Other Professional Diploma">Other Diploma</option>
                    </select>
                  </div>

                  {/* LinkedIn / Portfolio */}
                  <div className="cp-form-field-full">
                    <label className="cp-form-label" htmlFor="modal-portfolio">LinkedIn or Portfolio URL</label>
                    <input
                      id="modal-portfolio"
                      type="url"
                      className="cp-form-input"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={formData.portfolioUrl}
                      onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                    />
                  </div>

                  {/* Resume Upload */}
                  <div className="cp-form-field-full">
                    <label className="cp-form-label">Attach Resume / CV *</label>
                    <div className="cp-file-upload-box">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                      <div className="cp-file-upload-icon">
                        <UploadCloud size={20} />
                      </div>
                      <strong>Upload Resume (PDF, DOC, DOCX)</strong>
                      <small>Max file size: 10MB</small>
                      {selectedFile && (
                        <div className="cp-file-selected-pill">
                          <FileCheck2 size={13} /> {selectedFile.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Note */}
                  <div className="cp-form-field-full">
                    <label className="cp-form-label" htmlFor="modal-note">Short Introduction / Key Strengths</label>
                    <textarea
                      id="modal-note"
                      className="cp-form-textarea"
                      placeholder="Briefly describe your relevant strengths..."
                      value={formData.coverNote}
                      onChange={(e) => setFormData({ ...formData, coverNote: e.target.value })}
                    />
                  </div>

                  {/* Submit */}
                  <div className="cp-form-field-full">
                    <button
                      type="submit"
                      className="cp-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting Application...' : 'Send Application'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <DraaCorporateFooter />
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
