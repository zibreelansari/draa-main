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
  | 'users';

export interface ServiceDetail {
  slug: string;
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
  deliverables: { title: string; description: string; icon: ServiceIcon }[];
  process: { title: string; description: string }[];
  outcomes: string[];
  audiences: string[];
}

export const services: ServiceDetail[] = [
  {
    slug: 'content-publishing',
    title: 'Rigorous content — Real impact',
    shortTitle: 'Educational Content Development',
    eyebrow: 'Educational content development',
    summary: 'Clear, credible and audience-ready educational content—from the first content map to the final print or digital resource.',
    intro: 'DRAA brings subject expertise, instructional structure, editorial quality and production discipline into one workflow. We create resources that are accurate, easy to use and aligned with the learner, curriculum and delivery context.',
    image: '/brand/corporate/content-studio.png',
    imageAlt: 'Education content specialists reviewing learning resources in a publishing studio',
    icon: 'book',
    proof: [
      { value: 'Print + digital', label: 'Multi-format delivery' },
      { value: 'End-to-end', label: 'Research to production' },
      { value: 'Custom', label: 'Built for your audience' },
    ],
    challenges: [
      { title: 'Scattered source material', description: 'We turn fragmented references and expert inputs into a coherent learning journey.', icon: 'search' },
      { title: 'Inconsistent quality', description: 'Editorial standards, academic review and structured QA protect clarity and credibility.', icon: 'shield' },
      { title: 'Low learner engagement', description: 'Purposeful examples, activities, visuals and assessments make content easier to apply.', icon: 'lightbulb' },
      { title: 'Production complexity', description: 'One coordinated plan covers writing, editing, design and format-ready delivery.', icon: 'check' },
    ],
    deliverables: [
      { title: 'Books, e-books & manuals', description: 'Structured long-form resources for learners, facilitators and institutions.', icon: 'book' },
      { title: 'Courseware & study guides', description: 'Curriculum-aligned modules, notes, workbooks and revision resources.', icon: 'graduation' },
      { title: 'Question banks & assessments', description: 'Blueprint-led questions, solutions, rubrics and practice experiences.', icon: 'clipboard' },
      { title: 'Multimedia learning assets', description: 'Scripts, presentations, explainers, infographics and interactive content.', icon: 'presentation' },
      { title: 'Institutional content systems', description: 'Templates, standards and repeatable workflows for content teams.', icon: 'users' },
      { title: 'White-label content', description: 'Adaptable learning products prepared for your brand and distribution model.', icon: 'handshake' },
    ],
    process: [
      { title: 'Define', description: 'Audience, curriculum, outcomes and format.' },
      { title: 'Architect', description: 'Content map, pedagogy and assessment plan.' },
      { title: 'Create', description: 'Writing, editing, design and expert review.' },
      { title: 'Publish', description: 'QA, final production and delivery support.' },
    ],
    outcomes: ['More consistent academic quality', 'Faster content production cycles', 'Clearer learner progression', 'Reusable resources across formats'],
    audiences: ['Schools and colleges', 'Universities', 'Training institutions', 'Publishers and education brands'],
  },
  {
    slug: 'professional-learning',
    title: 'Academic & Professional Training',
    shortTitle: 'Academic & Professional Training',
    eyebrow: 'Capability that transfers to practice',
    summary: 'Practical workshops and development programmes that help educators, students and teams build skills they can use.',
    intro: 'Every programme begins with a real capability need. DRAA combines expert facilitation, applied activities, supporting resources and follow-through so participation leads to confident action—not just attendance.',
    image: '/brand/corporate/education-workshop.png',
    imageAlt: 'Professional educator facilitating a collaborative learning workshop',
    icon: 'graduation',
    proof: [
      { value: 'Live + hybrid', label: 'Flexible delivery' },
      { value: 'Applied', label: 'Practice-led design' },
      { value: 'Measured', label: 'Feedback and evidence' },
    ],
    challenges: [
      { title: 'Theory without transfer', description: 'Activities connect concepts to the decisions and tasks participants face.', icon: 'lightbulb' },
      { title: 'Generic training', description: 'Examples, cases and resources are adapted to the audience and institution.', icon: 'users' },
      { title: 'Low participation', description: 'Facilitated dialogue, reflection and practice keep learners actively involved.', icon: 'presentation' },
      { title: 'No follow-through', description: 'Action plans, resources and checkpoints extend learning beyond the session.', icon: 'check' },
    ],
    deliverables: [
      { title: 'Faculty development', description: 'Pedagogy, assessment, mentoring, digital teaching and academic leadership.', icon: 'presentation' },
      { title: 'Student skill programmes', description: 'Communication, research, collaboration and future-ready capabilities.', icon: 'graduation' },
      { title: 'Leadership development', description: 'Role-aware programmes for academic and organisational leaders.', icon: 'users' },
      { title: 'Career readiness', description: 'Interview preparation, workplace skills and transition-to-work support.', icon: 'handshake' },
      { title: 'Technical capability', description: 'Context-specific programmes in digital tools, data and emerging technology.', icon: 'laptop' },
      { title: 'Certification programmes', description: 'Sequenced learning pathways with participation and assessment evidence.', icon: 'shield' },
    ],
    process: [
      { title: 'Diagnose', description: 'Identify the audience and capability gap.' },
      { title: 'Design', description: 'Build the learning pathway and materials.' },
      { title: 'Facilitate', description: 'Deliver active, expert-led sessions.' },
      { title: 'Reinforce', description: 'Review evidence and support application.' },
    ],
    outcomes: ['Stronger role-specific capability', 'Higher confidence in application', 'Shared institutional practices', 'Visible evidence of participation'],
    audiences: ['Faculty and educators', 'Students and graduates', 'Academic leaders', 'Corporate and institutional teams'],
  },
  {
    slug: 'education-events',
    title: 'Educational Events & Conferences',
    shortTitle: 'Educational Events & Conferences',
    eyebrow: 'Knowledge shared with purpose',
    summary: 'Well-curated conferences, seminars, webinars and learning events—planned from concept through participant experience.',
    intro: 'DRAA combines academic curation with dependable event coordination. We shape the theme, programme, speaker journey, participant communication and learning assets so every event has a clear purpose and a professional experience.',
    image: '/brand/corporate/learning-event.png',
    imageAlt: 'Participants listening to a speaker at a professional education conference',
    icon: 'calendar',
    proof: [
      { value: '360°', label: 'Concept to close-out' },
      { value: '3 formats', label: 'On-site, online, hybrid' },
      { value: 'Curated', label: 'Content-led programmes' },
    ],
    challenges: [
      { title: 'Unclear event purpose', description: 'A defined audience promise keeps themes, sessions and speakers connected.', icon: 'lightbulb' },
      { title: 'Fragmented coordination', description: 'One event plan connects programme, speakers, partners and participant operations.', icon: 'clipboard' },
      { title: 'Passive audiences', description: 'Interactive formats turn attendees into contributors and active learners.', icon: 'users' },
      { title: 'Value ends at closing', description: 'Post-event resources and insights extend the life of the programme.', icon: 'book' },
    ],
    deliverables: [
      { title: 'Conferences & summits', description: 'Multi-session programmes with thematic curation and end-to-end coordination.', icon: 'presentation' },
      { title: 'Seminars & webinars', description: 'Focused expert conversations for in-person or distributed audiences.', icon: 'laptop' },
      { title: 'Workshops & training camps', description: 'High-participation learning experiences centred on practical application.', icon: 'graduation' },
      { title: 'Competitions & exhibitions', description: 'Student showcases, challenges, fairs and educational engagement formats.', icon: 'users' },
      { title: 'Speaker & partner management', description: 'Briefing, scheduling, communications and experience coordination.', icon: 'handshake' },
      { title: 'Event content & promotion', description: 'Programme copy, registration journeys, learning assets and digital promotion.', icon: 'calendar' },
    ],
    process: [
      { title: 'Frame', description: 'Define purpose, audience and success measures.' },
      { title: 'Curate', description: 'Shape themes, formats, speakers and content.' },
      { title: 'Produce', description: 'Coordinate promotion, registration and delivery.' },
      { title: 'Extend', description: 'Share resources, insights and event evidence.' },
    ],
    outcomes: ['Stronger knowledge exchange', 'Professional participant experience', 'More meaningful engagement', 'Reusable post-event content'],
    audiences: ['Universities and institutions', 'Professional associations', 'Education brands', 'Government and knowledge partners'],
  },
  {
    slug: 'academic-advisory',
    title: 'Educational Consultancy',
    shortTitle: 'Educational Consultancy',
    eyebrow: 'Expert direction, practical implementation',
    summary: 'Evidence-informed support for curriculum, programmes, quality systems and institutional development.',
    intro: 'DRAA helps institutions move from a complex academic challenge to a workable plan. Our advisory approach combines stakeholder insight, structured analysis, co-design and implementation support rather than stopping at a report.',
    image: '/brand/corporate/education-workshop.png',
    imageAlt: 'Academic leaders collaborating on an institutional development plan',
    icon: 'handshake',
    proof: [
      { value: 'Evidence-led', label: 'Grounded recommendations' },
      { value: 'Co-designed', label: 'Built with stakeholders' },
      { value: 'Actionable', label: 'Plan to implementation' },
    ],
    challenges: [
      { title: 'Complex priorities', description: 'We clarify the problem, dependencies and the decisions that matter most.', icon: 'search' },
      { title: 'Disconnected initiatives', description: 'A shared framework connects curriculum, people, process and technology.', icon: 'users' },
      { title: 'Reports without action', description: 'Recommendations include owners, milestones and practical implementation steps.', icon: 'clipboard' },
      { title: 'Change without evidence', description: 'Success measures make progress visible and support continuous improvement.', icon: 'check' },
    ],
    deliverables: [
      { title: 'Curriculum planning', description: 'Outcome mapping, course structures, learning design and assessment alignment.', icon: 'book' },
      { title: 'Programme development', description: 'New academic and capability programmes designed for a defined need.', icon: 'lightbulb' },
      { title: 'Institutional improvement', description: 'Diagnostic review and prioritised roadmaps across academic operations.', icon: 'search' },
      { title: 'Quality frameworks', description: 'Standards, review tools, evidence plans and improvement cycles.', icon: 'shield' },
      { title: 'Admissions & learner guidance', description: 'Clear journeys, information systems and support frameworks for learners.', icon: 'graduation' },
      { title: 'Training strategy', description: 'Capability analysis and development architecture for institutional teams.', icon: 'presentation' },
    ],
    process: [
      { title: 'Listen', description: 'Understand context and stakeholder priorities.' },
      { title: 'Assess', description: 'Review evidence, systems and capability.' },
      { title: 'Co-design', description: 'Build the model, roadmap and measures.' },
      { title: 'Enable', description: 'Support implementation and improvement.' },
    ],
    outcomes: ['Clearer strategic priorities', 'Stronger programme coherence', 'Practical quality systems', 'More confident implementation'],
    audiences: ['Schools and colleges', 'Universities', 'Training institutions', 'Education-sector organisations'],
  },
  {
    slug: 'digital-learning',
    title: 'Digital Learning Solutions',
    shortTitle: 'Digital Learning Solutions',
    eyebrow: 'Technology shaped around learning',
    summary: 'Accessible digital learning journeys that connect content, delivery, assessment and learner progress.',
    intro: 'DRAA translates learning requirements into digital experiences that are clear, engaging and scalable. We can support the instructional layer, the content layer and the implementation plan—from an online course to a complete learning platform.',
    image: '/brand/page-heroes/e-learning.webp',
    imageAlt: 'Graphic showing a connected digital learning platform and learner tools',
    icon: 'laptop',
    proof: [
      { value: 'Accessible', label: 'Designed for real learners' },
      { value: 'Scalable', label: 'Built to grow' },
      { value: 'Connected', label: 'Content, data and delivery' },
    ],
    challenges: [
      { title: 'Technology before learning', description: 'Learning outcomes and user needs guide every platform and content decision.', icon: 'graduation' },
      { title: 'Fragmented journeys', description: 'Navigation, content, assessment and support become one coherent experience.', icon: 'laptop' },
      { title: 'Low digital engagement', description: 'Interaction, practice and meaningful feedback keep learners progressing.', icon: 'lightbulb' },
      { title: 'Limited visibility', description: 'Thoughtful assessment and reporting provide evidence for improvement.', icon: 'check' },
    ],
    deliverables: [
      { title: 'Online course design', description: 'Structured modules, activities, assessment and facilitator resources.', icon: 'book' },
      { title: 'Learning platforms', description: 'LMS, portals and custom learner experiences planned around real workflows.', icon: 'laptop' },
      { title: 'Virtual classrooms', description: 'Live learning journeys with interaction, resources and cohort support.', icon: 'presentation' },
      { title: 'Digital assessment', description: 'Question experiences, proctoring workflows, feedback and reporting.', icon: 'clipboard' },
      { title: 'Mobile learning', description: 'Responsive and app-based experiences for learning on the move.', icon: 'users' },
      { title: 'Implementation support', description: 'Content migration, platform onboarding, governance and team enablement.', icon: 'handshake' },
    ],
    process: [
      { title: 'Discover', description: 'Map learners, goals, content and constraints.' },
      { title: 'Blueprint', description: 'Design journeys, features and information flow.' },
      { title: 'Build', description: 'Create, configure, integrate and test.' },
      { title: 'Launch', description: 'Enable users, review data and improve.' },
    ],
    outcomes: ['Easier access to learning', 'More coherent learner journeys', 'Scalable programme delivery', 'Better progress visibility'],
    audiences: ['Educational institutions', 'Academies and tutors', 'Education businesses', 'Professional learning teams'],
  },
];

export const servicesBySlug = Object.fromEntries(services.map((service) => [service.slug, service]));
