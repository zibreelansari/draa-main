export type ServiceIcon =
  | 'book'
  | 'calendar'
  | 'check'
  | 'clipboard'
  | 'graduation'
  | 'handshake'
  | 'laptop'
  | 'lightbulb'
  | 'presentation'
  | 'search'
  | 'shield'
  | 'users'
  | 'sparkles'
  | 'settings'
  | 'trending-up'
  | 'award'
  | 'briefcase'
  | 'building'
  | 'compass';

export interface CapabilityItem {
  text: string;
  icon: ServiceIcon;
}

export interface ServiceDetail {
  number: string;
  slug: string;
  aliases?: string[];
  themeColor: string;
  themeGradient: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  summary: string;
  intro: string;
  image: string;
  imageAlt: string;
  icon: ServiceIcon;
  proof: { value: string; label: string }[];
  challenges: { title: string; description: string; icon: ServiceIcon }[];
  deliverables: { title: string; description: string; icon: ServiceIcon; image?: string }[];
  process: { title: string; description: string }[];
  outcomes: string[];
  audiences: string[];
  bulletPoints: string[];
  capabilities: CapabilityItem[];
}

export const services: ServiceDetail[] = [
  {
    number: '01',
    slug: 'educational-content-development',
    aliases: ['content-publishing'],
    themeColor: '#1D4ED8',
    themeGradient: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
    title: 'Educational Content Development',
    shortTitle: 'Educational Content Development',
    eyebrow: 'CORE BUSINESS ACTIVITY',
    summary: 'Curriculum-aligned study materials, textbooks, e-books, question banks, video scripts, and multi-format learning guides crafted for modern education.',
    intro: 'DRAA brings deep subject expertise, instructional design, editorial precision, and production discipline into one workflow. We create rigorous, accessible, and outcome-oriented educational materials aligned with institutional curricula and national accreditation frameworks.',
    image: '/brand/corporate/stock/academic_publishing_hero.jpg',
    imageAlt: 'Academic editorial workspace with textbook proofs, curriculum maps, and digital tablets',
    icon: 'book',
    proof: [
      { value: '50+ Disciplines', label: 'STEM, Commerce, Humanities' },
      { value: 'Print + ePub', label: 'Multi-Format Delivery' },
      { value: '100% Custom IP', label: 'Client-Owned Copyright' },
    ],
    bulletPoints: [
      'Curriculum-aligned study materials and course content',
      'Textbooks, e-books, manuals, and learning guides',
      'Question banks, quizzes, assignments, and assessments',
      'Video scripts, presentations, infographics, and interactive content',
      'Content editing, proofreading, formatting, and quality review',
      'Customized content for schools, colleges, training institutions, and online platforms',
    ],
    capabilities: [
      { text: 'Curriculum-aligned study materials and course content', icon: 'book' },
      { text: 'Textbooks, e-books, manuals, and learning guides', icon: 'clipboard' },
      { text: 'Question banks, quizzes, assignments, and assessments', icon: 'check' },
      { text: 'Video scripts, presentations, infographics, and interactive content', icon: 'presentation' },
      { text: 'Content editing, proofreading, formatting, and quality review', icon: 'shield' },
      { text: 'Customized content for schools, colleges, training institutions, and online platforms', icon: 'building' },
    ],
    challenges: [
      { title: 'Scattered source material', description: 'We turn fragmented references and syllabus guidelines into a coherent, structured learning journey.', icon: 'search' },
      { title: 'Inconsistent academic quality', description: 'Multi-tier editorial standards, SME authorship, and double-blind peer review protect clarity and credibility.', icon: 'shield' },
      { title: 'Low student engagement', description: 'Purposeful infographics, worked examples, formative checkpoints, and case vignettes make content easy to master.', icon: 'lightbulb' },
      { title: 'Pre-press & digital complexity', description: 'One coordinated plan covers LaTeX mathematical typesetting, InDesign layout, CMYK pre-flight, and ePub3/SCORM output.', icon: 'check' },
    ],
    deliverables: [
      { title: 'Textbooks, E-Books & Manuals', description: 'Structured long-form resources with chapter learning objectives, summaries, and problem sets.', icon: 'book', image: '/brand/corporate/stock/textbook_editorial.jpg' },
      { title: 'Courseware & Study Guides', description: 'Semester-aligned modular workbooks, revision companion packs, and lecture notes.', icon: 'graduation', image: '/brand/corporate/stock/academic_publishing_hero.jpg' },
      { title: 'Question Banks & Assessments', description: 'Cognitively indexed questions (Bloom’s L1–L6) with step-by-step solutions and scoring rubrics.', icon: 'clipboard', image: '/brand/corporate/stock/student_skill_workshop.jpg' },
      { title: 'Video Scripts & Interactive Assets', description: 'Storyboards, multimedia explainers, infographics, presentation slide decks, and H5P modules.', icon: 'presentation', image: '/brand/corporate/stock/elearning_platform.jpg' },
      { title: 'Content Review & Editorial QA', description: 'Comprehensive developmental editing, academic fact-checking, and Turnitin-verified originality certification.', icon: 'shield', image: '/brand/corporate/stock/textbook_editorial.jpg' },
      { title: 'Custom Institutional Content', description: 'White-label learning products, foundation kits, and bespoke courseware with 100% client copyright handover.', icon: 'handshake', image: '/brand/corporate/stock/corporate_training_room.jpg' },
    ],
    process: [
      { title: 'Define', description: 'Map target syllabus, learning outcomes, audience profile, and delivery formats.' },
      { title: 'Architect', description: 'Structure chapter blueprints, pedagogical milestones, and assessment grids.' },
      { title: 'Author & Review', description: 'Specialist faculty authoring followed by peer review and editorial copyediting.' },
      { title: 'Typeset & Publish', description: 'Pre-press InDesign/LaTeX layout, QA preflight, and multi-format delivery.' },
    ],
    outcomes: ['Consistent academic excellence', 'Faster publishing turnaround', 'Clear learner progression', 'Turnkey multi-format assets'],
    audiences: ['Schools and K-12 Boards', 'Universities & Higher Education Institutes', 'EdTech Companies', 'Academic Publishers & Training Centers'],
  },
  {
    number: '02',
    slug: 'academic-professional-training',
    aliases: ['professional-learning'],
    themeColor: '#16A34A',
    themeGradient: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
    title: 'Academic & Professional Training',
    shortTitle: 'Academic & Professional Training',
    eyebrow: 'CORE BUSINESS ACTIVITY',
    summary: 'High-impact faculty development, teacher training, student skill workshops, leadership seminars, and technical corporate training programs.',
    intro: 'Every training program begins with a real capability need. DRAA combines expert facilitation, applied case studies, interactive toolkits, and structured follow-through so participation translates directly into confident classroom practice and workplace performance.',
    image: '/brand/corporate/stock/training_workshop_hero.jpg',
    imageAlt: 'University professors and school educators engaged in collaborative faculty development training',
    icon: 'graduation',
    proof: [
      { value: 'Live + Hybrid', label: 'Flexible Modalities' },
      { value: 'Practice-Led', label: 'Applied Case Simulations' },
      { value: 'Verified', label: 'Evidence & Certification' },
    ],
    bulletPoints: [
      'Faculty development and teacher training programs',
      'Student skill-development workshops',
      'Corporate and employee training programs',
      'Leadership, communication, and management training',
      'Technical training in data science, artificial intelligence, cybersecurity, and digital tools',
      'Career readiness, interview preparation, and workplace skills training',
    ],
    capabilities: [
      { text: 'Faculty development and teacher training programs', icon: 'presentation' },
      { text: 'Student skill-development workshops', icon: 'lightbulb' },
      { text: 'Corporate and employee training programs', icon: 'briefcase' },
      { text: 'Leadership, communication, and management training', icon: 'users' },
      { text: 'Technical training in data science, artificial intelligence, cybersecurity, and digital tools', icon: 'laptop' },
      { text: 'Career readiness, interview preparation, and workplace skills training', icon: 'award' },
    ],
    challenges: [
      { title: 'Theoretical training gaps', description: 'We replace passive lectures with hands-on practice, role simulations, and immediate feedback.', icon: 'lightbulb' },
      { title: 'Generic curricula', description: 'Every workshop curriculum is customized to the specific institutional context, department, and cohort goals.', icon: 'users' },
      { title: 'Low participant retention', description: 'Facilitated interactive dialogue, micro-tasks, and collaborative breakouts keep attendees actively invested.', icon: 'presentation' },
      { title: 'Lack of post-session impact', description: 'Action roadmaps, digital toolkits, and structured evaluation checkpoints ensure sustained behavioral change.', icon: 'check' },
    ],
    deliverables: [
      { title: 'Faculty & Teacher Development', description: 'Pedagogy modernization, Outcome-Based Education (OBE), formative assessment design, and digital teaching methodologies.', icon: 'presentation', image: '/brand/corporate/stock/faculty_training_session.jpg' },
      { title: 'Student Skill Workshops', description: 'Critical thinking, communication, research techniques, and future-ready problem solving.', icon: 'graduation', image: '/brand/corporate/stock/student_skill_workshop.jpg' },
      { title: 'Corporate & Employee Upskilling', description: 'Tailored workplace capability programs aligning team performance with organizational strategic goals.', icon: 'users', image: '/brand/corporate/stock/corporate_training_room.jpg' },
      { title: 'Leadership & Management Training', description: 'Institutional governance, academic leadership, conflict management, and strategic team building.', icon: 'handshake', image: '/brand/corporate/stock/leadership_seminar.jpg' },
      { title: 'Emerging Tech & AI Literacy', description: 'Practical workshops in generative AI in education, data analytics, cybersecurity essentials, and modern EdTech tools.', icon: 'laptop', image: '/brand/corporate/stock/ai_tech_lab.jpg' },
      { title: 'Career Readiness & Employability', description: 'Resume clinics, technical interview simulations, corporate etiquette, and industry transition bootcamps.', icon: 'shield', image: '/brand/corporate/stock/career_counseling_session.jpg' },
    ],
    process: [
      { title: 'Diagnose', description: 'Assess participant baseline, institutional objectives, and capability gaps.' },
      { title: 'Design', description: 'Build customized session pathways, interactive exercises, and participant toolkits.' },
      { title: 'Facilitate', description: 'Deliver immersive, expert-led training sessions with live application.' },
      { title: 'Reinforce', description: 'Assess learning outcomes, provide certification, and offer post-training support.' },
    ],
    outcomes: ['Measurable competency uplift', 'Higher educator confidence', 'Standardized institutional practices', 'Visible participation evidence'],
    audiences: ['University Faculty & Deans', 'School Teachers & Educators', 'Graduating Students', 'Corporate & Institutional Teams'],
  },
  {
    number: '03',
    slug: 'educational-events-conferences',
    aliases: ['education-events'],
    themeColor: '#EA580C',
    themeGradient: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
    title: 'Educational Events & Conferences',
    shortTitle: 'Educational Events & Conferences',
    eyebrow: 'CORE BUSINESS ACTIVITY',
    summary: 'Curated academic conferences, international seminars, webinars, workshops, competitions, exhibitions, and knowledge-sharing forums.',
    intro: 'DRAA merges academic prestige with seamless event operations. We curate the thematic agenda, manage keynote speaker relations, orchestrate delegate registrations, and execute end-to-end logistics for in-person, virtual, and hybrid formats.',
    image: '/brand/corporate/stock/academic_events_hero.jpg',
    imageAlt: 'Academic education conference with keynote speaker at podium and delegates in auditorium',
    icon: 'calendar',
    proof: [
      { value: '360° Management', label: 'Concept to Execution' },
      { value: 'Hybrid Formats', label: 'On-Site + Virtual Live' },
      { value: 'Global Reach', label: 'Delegates & Keynotes' },
    ],
    bulletPoints: [
      'Academic conferences, seminars, webinars, and panel discussions',
      'Workshops, training camps, and certification programs',
      'Student competitions, exhibitions, and educational fairs',
      'Faculty networking and knowledge-sharing events',
      'Event planning, speaker coordination, registration, and promotion',
      'Hybrid and virtual event management',
    ],
    capabilities: [
      { text: 'Academic conferences, seminars, webinars, and panel discussions', icon: 'calendar' },
      { text: 'Workshops, training camps, and certification programs', icon: 'award' },
      { text: 'Student competitions, exhibitions, and educational fairs', icon: 'sparkles' },
      { text: 'Faculty networking and knowledge-sharing events', icon: 'users' },
      { text: 'Event planning, speaker coordination, registration, and promotion', icon: 'handshake' },
      { text: 'Hybrid and virtual event management', icon: 'laptop' },
    ],
    challenges: [
      { title: 'Fragmented coordination', description: 'One dedicated operations team handles theme curation, speaker coordination, registrations, and on-ground logistics.', icon: 'clipboard' },
      { title: 'Low delegate engagement', description: 'We design interactive panel sessions, lightning talks, breakout masterclasses, and networking lounges.', icon: 'users' },
      { title: 'Technical friction in hybrid', description: 'Enterprise-grade streaming, synchronized Q&A, and virtual delegate hubs bridge physical and digital audiences.', icon: 'laptop' },
      { title: 'Short-lived event impact', description: 'Proceedings publications, recorded highlights, policy whitepapers, and delegate kits extend value long after closing.', icon: 'book' },
    ],
    deliverables: [
      { title: 'Academic Conferences & Summits', description: 'Multi-track academic summits featuring peer-reviewed paper presentations, plenary sessions, and keynotes.', icon: 'presentation', image: '/brand/corporate/stock/leadership_seminar.jpg' },
      { title: 'Seminars, Webinars & Panels', description: 'Focused thought-leadership forums and digital panel discussions connecting global educational leaders.', icon: 'laptop', image: '/brand/corporate/stock/virtual_classroom.jpg' },
      { title: 'Student Competitions & Fairs', description: 'Innovation hackathons, inter-university debates, science exhibitions, and higher education fairs.', icon: 'graduation', image: '/brand/corporate/stock/student_skill_workshop.jpg' },
      { title: 'Faculty Networking Forums', description: 'Knowledge-exchange roundtables fostering cross-institutional research collaboration and partnerships.', icon: 'users', image: '/brand/corporate/stock/faculty_training_session.jpg' },
      { title: 'Speaker & Delegate Management', description: 'VIP speaker onboarding, travel coordination, abstract submissions, and automated ticketing systems.', icon: 'handshake', image: '/brand/corporate/stock/academic_events_hero.jpg' },
      { title: 'Event Branding & Media Assets', description: 'Conference identity design, website development, stage backdrops, delegate kits, and marketing campaigns.', icon: 'calendar', image: '/brand/corporate/stock/corporate_training_room.jpg' },
    ],
    process: [
      { title: 'Conceive', description: 'Define the conference theme, strategic objectives, target delegate profiles, and format.' },
      { title: 'Curate', description: 'Secure keynote speakers, issue call for papers, and build the detailed agenda.' },
      { title: 'Produce', description: 'Coordinate registrations, venue technology, live broadcasting, and delegate logistics.' },
      { title: 'Archive', description: 'Publish conference proceedings, distribute certificates, and release post-event media.' },
    ],
    outcomes: ['Elevated institutional reputation', 'High-impact delegate engagement', 'Flawless operational delivery', 'Lasting academic publications'],
    audiences: ['Universities & Colleges', 'Academic & Research Associations', 'Education Brands & NGOs', 'Government & Policy Think Tanks'],
  },
  {
    number: '04',
    slug: 'educational-consultancy',
    aliases: ['academic-advisory'],
    themeColor: '#7C3AED',
    themeGradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
    title: 'Educational Consultancy',
    shortTitle: 'Educational Consultancy',
    eyebrow: 'CORE BUSINESS ACTIVITY',
    summary: 'Strategic curriculum planning, institutional quality improvement, NAAC/NIRF accreditation support, student career guidance, and EdTech advisory.',
    intro: 'DRAA helps schools, universities, and educational organizations transform complex academic challenges into actionable institutional strategies. Our advisory model pairs diagnostic data with implementation roadmaps to deliver sustained educational excellence.',
    image: '/brand/corporate/stock/educational_consultancy_hero.jpg',
    imageAlt: 'Senior academic leaders and educational consultants reviewing institutional accreditation in a boardroom',
    icon: 'handshake',
    proof: [
      { value: 'Evidence-Led', label: 'Data & Benchmarking' },
      { value: 'Accreditation', label: 'NAAC, NBA, NIRF Support' },
      { value: 'Actionable', label: 'Strategy to Execution' },
    ],
    bulletPoints: [
      'Curriculum planning and academic program development',
      'Institutional quality improvement and accreditation support',
      'Student admissions, career, and academic guidance',
      'Learning needs assessment and training strategy development',
      'Education technology selection and implementation support',
      'Research, policy, and institutional development consultancy',
    ],
    capabilities: [
      { text: 'Curriculum planning and academic program development', icon: 'compass' },
      { text: 'Institutional quality improvement and accreditation support', icon: 'shield' },
      { text: 'Student admissions, career, and academic guidance', icon: 'graduation' },
      { text: 'Learning needs assessment and training strategy development', icon: 'search' },
      { text: 'Education technology selection and implementation support', icon: 'laptop' },
      { text: 'Research, policy, and institutional development consultancy', icon: 'building' },
    ],
    challenges: [
      { title: 'Complex accreditation hurdles', description: 'We provide structured gap analysis, documentation frameworks, and mock audits for national and international accreditation.', icon: 'shield' },
      { title: 'Outdated curriculum structures', description: 'We modernize legacy curricula to meet NEP 2020 multi-disciplinary guidelines and industry skill demands.', icon: 'book' },
      { title: 'Disconnected institutional silos', description: 'A unified strategic roadmap aligns academic governance, faculty performance, student services, and technology.', icon: 'users' },
      { title: 'Reports without implementation', description: 'We assign clear milestones, owner accountability matrices, and ongoing coaching rather than handing over shelf-bound reports.', icon: 'check' },
    ],
    deliverables: [
      { title: 'Curriculum & Program Architecture', description: 'Designing new degree programs, outcome mapping, credit frameworks, and syllabus modernization.', icon: 'book', image: '/brand/corporate/stock/textbook_editorial.jpg' },
      { title: 'Quality Improvement & Accreditation', description: 'Strategic advisory for NAAC, NBA, NIRF, and international rankings with evidence audit tools.', icon: 'shield', image: '/brand/corporate/stock/educational_consultancy_hero.jpg' },
      { title: 'Admissions & Academic Guidance', description: 'Optimized student enrollment funnels, international student pathways, and career counselling systems.', icon: 'graduation', image: '/brand/corporate/stock/career_counseling_session.jpg' },
      { title: 'Institutional Diagnostic Audits', description: 'Comprehensive academic audits evaluating pedagogy, governance, infrastructure, and learning outcomes.', icon: 'search', image: '/brand/corporate/stock/corporate_training_room.jpg' },
      { title: 'EdTech Strategy & Selection', description: 'Independent evaluation and implementation roadmaps for LMS, ERP, digital libraries, and smart classrooms.', icon: 'laptop', image: '/brand/corporate/stock/elearning_platform.jpg' },
      { title: 'Policy & Institutional Development', description: 'Strategic advisory for new institution setup, regulatory compliance, and university expansion plans.', icon: 'presentation', image: '/brand/corporate/stock/leadership_seminar.jpg' },
    ],
    process: [
      { title: 'Diagnose', description: 'Review institutional data, governance systems, academic performance, and accreditation benchmarks.' },
      { title: 'Analyze', description: 'Conduct stakeholder interviews, identify operational gaps, and benchmark best practices.' },
      { title: 'Co-Design', description: 'Architect customized roadmaps, policy frameworks, and measurable KPIs.' },
      { title: 'Implement', description: 'Provide ongoing guidance, audit readiness reviews, and team enablement.' },
    ],
    outcomes: ['Higher accreditation scores', 'Modern, market-aligned curricula', 'Streamlined admissions & guidance', 'Sustainable institutional growth'],
    audiences: ['University Chancellors & Deans', 'School Foundations & Trustees', 'Government Education Bodies', 'Private Education Investors'],
  },
  {
    number: '05',
    slug: 'digital-learning-solutions',
    aliases: ['digital-learning'],
    themeColor: '#0D9488',
    themeGradient: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
    title: 'Digital Learning Solutions',
    shortTitle: 'Digital Learning Solutions',
    eyebrow: 'CORE BUSINESS ACTIVITY',
    summary: 'Learning Management System (LMS) development, virtual classrooms, mobile learning apps, interactive simulations, AI analytics, and digital assessment engines.',
    intro: 'DRAA translates pedagogical requirements into scalable, intuitive digital learning ecosystems. We architect the platform technology, create the interactive content layer, and ensure seamless user experiences for learners, educators, and administrators.',
    image: '/brand/corporate/stock/digital-learning.jpg',
    imageAlt: 'Students and educators using a modern digital learning platform on tablets and laptops',
    icon: 'laptop',
    proof: [
      { value: 'Cloud-Scale', label: 'Secure LMS Architectures' },
      { value: 'AI-Enabled', label: 'Adaptive Progress Tracking' },
      { value: 'Any Device', label: 'Responsive Web & Mobile' },
    ],
    bulletPoints: [
      'Learning Management System (LMS) development and implementation',
      'Online courses, virtual classrooms, and digital learning portals',
      'Mobile learning applications and educational websites',
      'Interactive videos, simulations, quizzes, and gamified learning',
      'AI-based personalized learning and student progress tracking',
      'Digital assessment, certification, analytics, and reporting solutions',
    ],
    capabilities: [
      { text: 'Learning Management System (LMS) development and implementation', icon: 'laptop' },
      { text: 'Online courses, virtual classrooms, and digital learning portals', icon: 'globe' },
      { text: 'Mobile learning applications and educational websites', icon: 'laptop' },
      { text: 'Interactive videos, simulations, quizzes, and gamified learning', icon: 'sparkles' },
      { text: 'AI-based personalized learning and student progress tracking', icon: 'trending-up' },
      { text: 'Digital assessment, certification, analytics, and reporting solutions', icon: 'clipboard' },
    ],
    challenges: [
      { title: 'Clunky, non-intuitive platforms', description: 'We design modern, mobile-first interfaces that learners and faculty enjoy using every day.', icon: 'laptop' },
      { title: 'Low online course completion', description: 'Micro-learning modules, gamified milestones, interactive H5P widgets, and live cohorts drive high completion rates.', icon: 'lightbulb' },
      { title: 'Fragmented student data', description: 'Unified dashboards bring attendance, test scores, engagement metrics, and certification into one view.', icon: 'check' },
      { title: 'Assessment integrity issues', description: 'Secure digital assessment engines with question randomization, proctoring integration, and instant analytics.', icon: 'shield' },
    ],
    deliverables: [
      { title: 'Custom LMS & Portal Development', description: 'Scalable Moodle, Canvas, and custom React/Node learning portals tailored to institutional workflows.', icon: 'laptop', image: '/brand/corporate/stock/elearning_platform.jpg' },
      { title: 'Online Course & Studio Production', description: 'Interactive course authoring, video production, transcripts, and SCORM/xAPI compliant packages.', icon: 'presentation', image: '/brand/corporate/stock/ai_tech_lab.jpg' },
      { title: 'Virtual Classrooms & Collaboration', description: 'Live interactive video classrooms with breakout rooms, shared whiteboards, and recorded archives.', icon: 'users', image: '/brand/corporate/stock/virtual_classroom.jpg' },
      { title: 'Interactive Media & Simulations', description: 'Gamified quizzes, 3D science simulations, scenario-based problem solving, and branching stories.', icon: 'sparkles', image: '/brand/corporate/stock/student_skill_workshop.jpg' },
      { title: 'AI Personalized Learning & Analytics', description: 'Adaptive learning algorithms recommending practice materials based on individual student mastery.', icon: 'trending-up', image: '/brand/corporate/stock/ai_tech_lab.jpg' },
      { title: 'Digital Assessment & Certification', description: 'Automated grading, proctored testing, tamper-proof digital certificates, and institutional reports.', icon: 'clipboard', image: '/brand/corporate/stock/corporate_training_room.jpg' },
    ],
    process: [
      { title: 'Discover', description: 'Map student personas, technological infrastructure, pedagogical goals, and integration needs.' },
      { title: 'Blueprint', description: 'Design UI/UX wireframes, information architecture, and technical database schemas.' },
      { title: 'Develop', description: 'Build, configure, integrate content, and execute rigorous security and performance testing.' },
      { title: 'Deploy', description: 'Onboard administrators, train faculty, and launch with continuous analytics monitoring.' },
    ],
    outcomes: ['Higher course engagement & completion', 'Seamless remote & hybrid learning', 'Comprehensive learning analytics', 'Future-proof digital infrastructure'],
    audiences: ['Universities & Colleges', 'EdTech Startups & Enterprises', 'Skill Development Academies', 'Corporate Learning Departments'],
  },
];

// Helper to look up service by any slug or alias
export const servicesBySlug: Record<string, ServiceDetail> = {};
services.forEach((service) => {
  servicesBySlug[service.slug] = service;
  if (service.aliases) {
    service.aliases.forEach((alias) => {
      servicesBySlug[alias] = service;
    });
  }
});
