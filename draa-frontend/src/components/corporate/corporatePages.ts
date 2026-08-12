import type { CorporatePageData } from './types';

export const corporatePages: Record<string, CorporatePageData> = {
  'about-draa': {
    slug: 'about-draa', navigationLabel: 'About DRAA', eyebrow: 'About DRAA',
    title: 'An education partner built around meaningful outcomes.',
    summary: 'DRAA combines academic insight, content expertise, programme delivery and technology to strengthen learning for individuals, institutions and organisations.',
    seo: { title: 'About DRAA', description: 'Learn about DRAA, a New Delhi education services and knowledge management company.' },
    sections: [
      { key: 'purpose', eyebrow: 'Our purpose', title: 'Education becomes valuable when knowledge leads to progress.', description: 'We translate educational needs into structured content, practical learning experiences and institution-ready solutions.', layout: 'feature-grid', items: [
        { title: 'Research-led', description: 'Decisions and resources grounded in evidence and academic insight.', icon: 'search' },
        { title: 'Learner-centred', description: 'Experiences designed around access, clarity and measurable growth.', icon: 'users' },
        { title: 'Institution-ready', description: 'Solutions shaped for real academic and organisational settings.', icon: 'building' },
      ] },
      { key: 'approach', eyebrow: 'How we work', title: 'From a defined need to an education solution that can be used.', description: 'DRAA brings research, design, delivery and review into one practical engagement model.', layout: 'journey', items: [
        { title: 'Understand', description: 'Clarify the audience, context, constraints and desired outcome.', icon: 'search' },
        { title: 'Design', description: 'Shape the content, programme, event or digital experience.', icon: 'lightbulb' },
        { title: 'Deliver', description: 'Coordinate experts, production, facilitation and learner support.', icon: 'presentation' },
        { title: 'Improve', description: 'Review participation, feedback and evidence of progress.', icon: 'check' },
      ] },
      { key: 'company', eyebrow: 'Company profile', title: 'Established in New Delhi in June 2023.', description: 'DRAA (OPC) Private Limited works across teaching, tutoring, training, educational content, events, advisory and digital learning.', layout: 'statement', items: [] },
      { key: 'commitment', eyebrow: 'Our commitment', title: 'Clear thinking, responsible delivery and respect for the learner.', description: 'We aim to be a dependable education partner by communicating honestly, designing for real contexts and avoiding claims that cannot be supported.', layout: 'statement', items: [], callToAction: { label: 'Discuss a partnership', href: '/contact?subject=Partnership%20Opportunity' } },
    ],
  },
  capabilities: {
    slug: 'capabilities', navigationLabel: 'Capabilities', eyebrow: 'Our capabilities',
    title: 'Connected education services, designed around the outcome.',
    summary: 'Engage DRAA for one specialist requirement or combine capabilities into a complete educational programme.',
    seo: { title: 'DRAA Capabilities', description: 'Explore DRAA services in content, training, events, advisory and digital learning.' },
    sections: [
      { key: 'services', eyebrow: 'What we do', title: 'Five capabilities. One accountable partner.', description: 'Each capability is planned for the audience, delivery context and desired learning outcome.', layout: 'feature-grid', items: [
        { title: 'Content & Publishing', description: 'Research-led books, digital publications, courseware, assessments and custom learning resources.', icon: 'book', link: '/services/content-publishing' },
        { title: 'Professional Learning', description: 'Faculty development, student skills, leadership and career-readiness programmes.', icon: 'graduation', link: '/services/professional-learning' },
        { title: 'Education Events', description: 'Conferences, seminars, webinars and knowledge-sharing programmes from concept to delivery.', icon: 'calendar', link: '/services/education-events' },
        { title: 'Academic Advisory', description: 'Curriculum planning, programme development, institutional improvement and training strategy.', icon: 'briefcase', link: '/services/academic-advisory' },
        { title: 'Digital Learning', description: 'Online course design, learner journeys, assessments and learning-platform support.', icon: 'laptop', link: '/services/digital-learning' },
      ] },
      { key: 'engagement-models', eyebrow: 'Ways to engage', title: 'Choose the level of support that fits the requirement.', description: 'Start with a focused assignment or combine services into a complete programme managed by DRAA.', layout: 'journey', items: [
        { title: 'Specialist assignment', description: 'A defined content, training, advisory or event requirement.', icon: 'clipboard' },
        { title: 'Custom programme', description: 'A multi-session or multi-format solution for a specific audience.', icon: 'users' },
        { title: 'End-to-end delivery', description: 'Strategy, design, production, coordination and review under one plan.', icon: 'check' },
        { title: 'Ongoing partnership', description: 'A structured relationship across multiple education priorities.', icon: 'handshake' },
      ], callToAction: { label: 'Submit a project brief', href: '/contact?subject=General%20Enquiry' } },
    ],
  },
  'learning-events': {
    slug: 'learning-events', navigationLabel: 'Learning & Events', eyebrow: 'Learning & Events',
    title: 'Programmes that move people from insight to action.',
    summary: 'DRAA creates practical professional learning and knowledge-sharing experiences for educators, learners, institutions and organisations.',
    seo: { title: 'DRAA Learning and Events', description: 'Professional learning, workshops, conferences, webinars and custom education programmes from DRAA.' },
    sections: [
      { key: 'programmes', eyebrow: 'Formats', title: 'Designed for participation, application and growth.', description: 'Programmes can be delivered independently or as part of a wider institutional initiative.', layout: 'feature-grid', items: [
        { title: 'Faculty & Educator Development', description: 'Practical programmes in pedagogy, assessment, digital teaching, mentoring and academic leadership.', icon: 'presentation', link: '/services/professional-learning' },
        { title: 'Student & Career Skills', description: 'Communication, career readiness, research skills, workplace capability and transition support.', icon: 'graduation', link: '/services/professional-learning' },
        { title: 'Conferences & Knowledge Forums', description: 'Curated conferences, seminars, webinars, panels and collaborative learning events.', icon: 'calendar', link: '/services/education-events' },
        { title: 'Custom Institutional Programmes', description: 'Learning experiences designed around a defined performance or organisational need.', icon: 'users', link: '/contact?subject=Custom%20Institutional%20Programme' },
      ] },
      { key: 'delivery', eyebrow: 'Delivery options', title: 'Flexible formats without losing learning quality.', description: 'Programmes are shaped around the audience, available time, facilitator needs and evidence of participation.', layout: 'journey', items: [
        { title: 'In-person', description: 'High-participation workshops, conferences and facilitated sessions.', icon: 'building' },
        { title: 'Live online', description: 'Interactive virtual cohorts, webinars and expert-led masterclasses.', icon: 'laptop' },
        { title: 'Hybrid', description: 'Connected on-site and remote experiences with shared resources.', icon: 'users' },
        { title: 'Programme series', description: 'Sequenced learning with assignments, reflection and follow-through.', icon: 'clipboard' },
      ], callToAction: { label: 'Register your interest', href: '/contact?subject=Educational%20Events' } },
    ],
  },
  'who-we-support': {
    slug: 'who-we-support', navigationLabel: 'Who We Support', eyebrow: 'Who we support',
    title: 'Solutions shaped around the people and institutions we serve.',
    summary: 'We begin with the audience, context and desired learning outcome—not with a one-size-fits-all product.',
    seo: { title: 'Who DRAA Supports', description: 'DRAA works with institutions, universities, learners, educators and organisations.' },
    sections: [
      { key: 'audiences', eyebrow: 'Our audiences', title: 'Different contexts. One commitment to educational quality.', description: 'Each engagement is adapted to the organisation, learner profile and delivery environment.', layout: 'feature-grid', items: [
        { title: 'Schools & Colleges', description: 'Curriculum-aligned content, educator development, student-skills programmes and academic events.', icon: 'building', link: '/contact?subject=Schools%20and%20Colleges' },
        { title: 'Universities & Higher Education', description: 'Programme design, faculty development, conferences and digital learning.', icon: 'landmark', link: '/contact?subject=Higher%20Education' },
        { title: 'Learners & Educators', description: 'Structured resources, practical training, career-readiness support and guided pathways.', icon: 'graduation', link: '/contact?subject=Learners%20and%20Educators' },
        { title: 'Organisations & Knowledge Partners', description: 'Custom learning, workforce capability, content programmes and collaboration.', icon: 'briefcase', link: '/contact?subject=Partnership%20Opportunity' },
      ] },
      { key: 'starting-point', eyebrow: 'Find the right starting point', title: 'Bring us the challenge, audience and desired result.', description: 'You do not need a finished brief. DRAA can help clarify the requirement and define a practical first step.', layout: 'statement', items: [], callToAction: { label: 'Describe your requirement', href: '/contact?subject=General%20Enquiry' } },
    ],
  },
};
