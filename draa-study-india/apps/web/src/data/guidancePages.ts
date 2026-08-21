export type GuidanceSection = {
  title: string;
  body: string;
  items?: string[];
};

export type GuidancePage = {
  eyebrow: string;
  title: string;
  intro: string;
  summary: string;
  highlights?: Array<{ value: string; label: string }>;
  sections: GuidanceSection[];
  steps?: Array<{ number: string; title: string; body: string }>;
  programmes?: Array<{ tag: string; title: string; body: string }>;
  note?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export const guidancePages: Record<string, GuidancePage> = {
  "/about": {
    eyebrow: "ABOUT DRAA STUDY IN INDIA",
    title: "Independent guidance for a better-informed study decision.",
    intro: "DRAA Study in India brings programme discovery, application preparation and student guidance into one clear digital journey.",
    summary: "The portal is developed by DRAA (OPC) Private Limited, a New Delhi education-services and knowledge-management company incorporated on 28 June 2023.",
    highlights: [
      { value: "2023", label: "DRAA established" },
      { value: "3", label: "Dedicated portal roles" },
      { value: "1", label: "Connected learner journey" },
    ],
    sections: [
      { title: "Our purpose", body: "Help international learners understand Indian higher education and prepare stronger, more complete applications.", items: ["Clear programme information", "Structured application preparation", "Responsible student guidance"] },
      { title: "What DRAA provides", body: "DRAA works across educational content, professional learning, events, advisory and technology-enabled learning solutions.", items: ["Research-based educational content", "Training and mentorship", "Institutional and digital solutions"] },
      { title: "Independent by design", body: "DRAA provides education guidance and facilitation. Admissions are decided by institutions, while visas and statutory formalities remain with authorised authorities.", items: ["No government affiliation", "No guaranteed admission", "No guaranteed visa outcome"] },
    ],
    programmes: [
      { tag: "LEARN", title: "Understand your options", body: "Compare levels, disciplines, formats and locations before creating a shortlist." },
      { tag: "PREPARE", title: "Build a complete application", body: "Organise academic records, identity documents and programme-specific evidence." },
      { tag: "CONNECT", title: "Move forward confidently", body: "Use DRAA guidance and communicate directly with institutions and authorised services." },
    ],
  },
  "/why-india": {
    eyebrow: "WHY STUDY IN INDIA",
    title: "A broad academic landscape with a living cultural education.",
    intro: "India combines multidisciplinary higher education, diverse study destinations and distinctive knowledge traditions.",
    summary: "A strong decision considers academic fit, institutional recognition, location, affordability and the experience you want beyond the classroom.",
    sections: [
      { title: "Education quality", body: "Explore recognised universities and specialist institutes offering undergraduate, postgraduate, doctoral and certificate pathways.", items: ["Theory and practical learning", "Research and innovation ecosystems", "Industry-linked disciplines"] },
      { title: "Cultural experience", body: "Study across communities shaped by many languages, cuisines, festivals, landscapes and creative traditions.", items: ["Campus communities", "Heritage and contemporary culture", "Regional diversity"] },
      { title: "Cost-aware choices", body: "Compare tuition and living expenses by institution and city instead of relying on one national estimate.", items: ["Tuition comparison", "Accommodation planning", "Everyday cost budgeting"] },
    ],
    programmes: [
      { tag: "DELHI NCR", title: "Policy, research and multidisciplinary learning", body: "A major academic region with extensive cultural and professional networks." },
      { tag: "BENGALURU", title: "Technology and innovation", body: "A global technology centre with engineering, science and entrepreneurship exposure." },
      { tag: "PUNE", title: "A student-centred education city", body: "Known for a large academic community across management, technology, arts and sciences." },
      { tag: "CHENNAI", title: "Engineering, healthcare and culture", body: "A leading southern education hub with strong technical and research institutions." },
      { tag: "MUMBAI", title: "Business, media and creative industries", body: "A high-energy city connecting education with finance, enterprise and the arts." },
      { tag: "HYDERABAD", title: "Technology, life sciences and management", body: "A growing study destination with research and industry-linked opportunities." },
    ],
  },
  "/reasons": {
    eyebrow: "TEN REASONS",
    title: "Ten practical reasons students explore India.",
    intro: "Look beyond a headline and assess the academic, cultural and personal value of each opportunity.",
    summary: "These are decision factors—not guarantees. DRAA recommends verifying every programme, fee and recognition detail with the institution.",
    sections: [
      { title: "Academic breadth", body: "Choose from technology, sciences, law, management, humanities, health, agriculture and specialist fields.", items: ["1. Diverse disciplines", "2. Multiple programme levels", "3. Specialist and niche learning"] },
      { title: "Learning environment", body: "Many programmes combine classroom learning with laboratories, projects, fieldwork, studios or industry exposure.", items: ["4. Practical learning", "5. Research exposure", "6. English-medium options"] },
      { title: "Life and opportunity", body: "India offers varied city experiences, professional ecosystems and communities for personal growth.", items: ["7. Cultural immersion", "8. Cost-conscious options", "9. Professional networks", "10. Global perspective"] },
    ],
  },
  "/things-to-do": {
    eyebrow: "LIFE BEYOND CAMPUS",
    title: "Study, discover and participate responsibly.",
    intro: "Your time in India can include heritage, arts, nature, food and community experiences alongside academic life.",
    summary: "Plan activities around your academic calendar, personal safety, local guidance and applicable travel rules.",
    sections: [
      { title: "Explore heritage", body: "Visit museums, monuments, historic districts and cultural institutions with informed local guidance.", items: ["Architecture and history", "Craft and design", "Performing arts"] },
      { title: "Experience everyday India", body: "Learn through local markets, regional food, festivals, languages and campus communities.", items: ["Regional cuisines", "Student clubs", "Community events"] },
      { title: "Travel thoughtfully", body: "Use verified transport, share plans with trusted contacts and check weather and local advisories.", items: ["City travel planning", "Nature and landscapes", "Responsible tourism"] },
    ],
    note: "DRAA does not operate travel services. Students should use reputable providers and follow institution and local safety guidance.",
  },
  "/higher-education": {
    eyebrow: "INDIAN HIGHER EDUCATION",
    title: "Understand levels, institutions and recognition before applying.",
    intro: "Programme titles can look similar while entry requirements, awarding authority, duration and professional recognition differ.",
    summary: "Always assess the institution and the individual programme—not only the course title.",
    sections: [
      { title: "Institution types", body: "India’s landscape includes central, state, private and deemed universities, institutes of national importance, and affiliated colleges.", items: ["Degree-awarding authority", "Institutional recognition", "Campus and delivery location"] },
      { title: "Quality indicators", body: "NIRF, NAAC, NBA and relevant statutory councils provide different kinds of information; no single indicator replaces full due diligence.", items: ["Institutional accreditation", "Programme accreditation", "Discipline-specific approvals"] },
      { title: "Study formats", body: "Confirm whether a programme is regular, full-time, blended, online or short-term and whether that format suits your objective.", items: ["Offline and campus-based", "Blended or online", "Short-term and certificate"] },
    ],
    programmes: [
      { tag: "UG", title: "Undergraduate programmes", body: "Bachelor’s study following eligible secondary education, commonly three to five years depending on discipline." },
      { tag: "PG", title: "Postgraduate programmes", body: "Advanced master’s study following a relevant bachelor’s degree, commonly one to two years." },
      { tag: "PHD", title: "Doctoral research", body: "Research-led study requiring strong academic preparation and institution-specific supervision alignment." },
      { tag: "CERTIFICATE", title: "Short-term and skill programmes", body: "Focused learning for professional, technical, language or cultural development." },
    ],
  },
  "/institute-ranking": {
    eyebrow: "INSTITUTION RESEARCH",
    title: "Use rankings and accreditation as evidence—not shortcuts.",
    intro: "DRAA does not publish an institutional ranking. We help learners understand commonly used quality indicators.",
    summary: "Check the latest information directly with the relevant ranking, accreditation or regulatory body before applying.",
    sections: [
      { title: "NIRF", body: "The National Institutional Ranking Framework compares participating Indian institutions using defined teaching, research, graduation, outreach and perception measures.", items: ["Check year and category", "Review methodology", "Do not compare unrelated categories"] },
      { title: "NAAC and NBA", body: "NAAC assesses higher-education institutions, while NBA focuses on eligible academic programmes. Scope and validity dates matter.", items: ["Verify current validity", "Confirm programme coverage", "Review grade or accreditation status"] },
      { title: "Regulatory recognition", body: "Professional fields may involve discipline-specific councils or statutory requirements in addition to institutional recognition.", items: ["Confirm awarding authority", "Check professional requirements", "Verify delivery campus"] },
    ],
  },
  "/eligibility": {
    eyebrow: "ELIGIBILITY CRITERIA",
    title: "Check requirements before building your shortlist.",
    intro: "Eligibility varies by institution, discipline, programme level and intake. The course detail is the controlling source.",
    summary: "DRAA can organise the checklist, but the institution decides whether an applicant meets its admission requirements.",
    steps: [
      { number: "01", title: "Confirm academic level", body: "Match your completed qualification with the entry requirement for undergraduate, postgraduate or doctoral study." },
      { number: "02", title: "Check subject prerequisites", body: "Some programmes require specific school subjects, prior degrees, grades or portfolios." },
      { number: "03", title: "Review language conditions", body: "Confirm accepted evidence of English or another teaching-language proficiency." },
      { number: "04", title: "Prepare verified records", body: "Organise transcripts, certificates, passport details and institution-specific evidence." },
    ],
    sections: [
      { title: "Undergraduate", body: "Normally requires recognised secondary education with programme-specific subjects and minimum results.", items: ["Secondary certificates", "Subject prerequisites", "Age or entrance conditions where applicable"] },
      { title: "Postgraduate", body: "Normally requires an eligible bachelor’s degree and may require discipline alignment, tests or professional experience.", items: ["Degree and transcripts", "Statement or references", "Portfolio, test or experience if required"] },
      { title: "Doctoral", body: "Usually requires relevant postgraduate preparation, a research proposal and alignment with institutional research capacity.", items: ["Research proposal", "Academic references", "Interview or entrance assessment"] },
    ],
  },
  "/scholarships": {
    eyebrow: "SCHOLARSHIPS & FEE SUPPORT",
    title: "Build a funding plan that works beyond tuition.",
    intro: "Financial support may come from institutions or external providers, each with separate conditions and deadlines.",
    summary: "DRAA does not currently award scholarships and never guarantees a fee waiver.",
    sections: [
      { title: "Institutional support", body: "Some institutions offer merit-based tuition waivers, need-aware support or discipline-specific awards.", items: ["Coverage percentage", "Renewal conditions", "Academic performance requirements"] },
      { title: "External opportunities", body: "Foundations, governments and other authorised providers may publish separate scholarship programmes.", items: ["Apply through the named provider", "Verify eligibility and deadline", "Beware of payment-for-award scams"] },
      { title: "Complete budget", body: "Plan for costs that a tuition waiver may not cover.", items: ["Accommodation and food", "Insurance and healthcare", "Travel, visa and learning materials"] },
    ],
  },
  "/how-to-apply": {
    eyebrow: "HOW TO APPLY",
    title: "One structured journey from discovery to arrival.",
    intro: "Use your DRAA account to organise decisions and applications while completing official requirements through the correct institutions and authorities.",
    summary: "Accuracy matters. Keep names, dates, qualifications and passport information consistent across every system.",
    steps: [
      { number: "01", title: "Create your DRAA profile", body: "Register as a student and add accurate personal and academic details." },
      { number: "02", title: "Explore and shortlist", body: "Compare discipline, level, eligibility, duration, location, fees and format." },
      { number: "03", title: "Prepare your evidence", body: "Gather verified academic records, passport information and course-specific documents." },
      { number: "04", title: "Submit applications", body: "Review each application carefully and submit it to your chosen institution or supported DRAA workflow." },
      { number: "05", title: "Evaluate decisions", body: "Check conditions, deadlines and total costs before accepting an offer." },
      { number: "06", title: "Complete official formalities", body: "Use authorised visa and immigration channels, then follow institutional arrival guidance." },
    ],
    sections: [
      { title: "Before submission", body: "Confirm that the course is current and that you meet every published condition.", items: ["Check intake and deadline", "Verify fees", "Read refund conditions"] },
      { title: "After submission", body: "Monitor requests and respond only through verified institutional or portal channels.", items: ["Track status", "Answer document queries", "Retain receipts and correspondence"] },
      { title: "Before acceptance", body: "Understand the complete offer before making a payment or commitment.", items: ["Offer conditions", "Payment schedule", "Accommodation and arrival support"] },
    ],
  },
  "/visa-frro": {
    eyebrow: "VISA & ARRIVAL GUIDANCE",
    title: "Prepare with DRAA. Complete statutory steps through authorised channels.",
    intro: "A student visa and any applicable post-arrival registration are legal processes outside DRAA’s authority.",
    summary: "Requirements can change. Always use current instructions from the relevant Indian Mission and authorised government services.",
    steps: [
      { number: "01", title: "Secure an eligible offer", body: "Confirm that your admission and programme support the visa category you intend to use." },
      { number: "02", title: "Review official requirements", body: "Check current document, fee, biometric and appointment instructions for your jurisdiction." },
      { number: "03", title: "Plan travel after approval", body: "Do not rely on anticipated approval when making non-refundable travel commitments." },
      { number: "04", title: "Follow arrival formalities", body: "Ask your institution whether FRRO registration or another post-arrival step applies to you." },
    ],
    sections: [
      { title: "What DRAA can do", body: "Explain common preparation stages and help organise a document checklist.", items: ["Preparation guidance", "Document organisation", "Institution coordination"] },
      { title: "What DRAA cannot do", body: "Issue a visa, alter a decision, guarantee an appointment or complete statutory registration on your behalf.", items: ["No visa guarantees", "No government representation", "No decision influence"] },
      { title: "Stay secure", body: "Use official portals, protect account credentials and question requests for unusual payments or personal data.", items: ["Verify the destination", "Keep payment evidence", "Report suspicious requests"] },
    ],
  },
  "/local-support": {
    eyebrow: "STUDENT SUPPORT",
    title: "Prepare for arrival, study and everyday wellbeing.",
    intro: "DRAA’s support model helps students ask the right questions before travel and connect with appropriate institutional services.",
    summary: "Your institution’s international office should remain the first point of contact for campus-specific support.",
    sections: [
      { title: "Before departure", body: "Confirm accommodation, airport transfer options, insurance, documents and first-week responsibilities.", items: ["Arrival checklist", "Emergency contacts", "Budget and payment access"] },
      { title: "On campus", body: "Attend orientation and identify academic, wellbeing, accommodation and international-student contacts.", items: ["International office", "Academic adviser", "Health and counselling support"] },
      { title: "Everyday life", body: "Use verified services, respect local laws and seek timely help if a situation affects your safety or studies.", items: ["Transport awareness", "Digital and financial safety", "Trusted local contacts"] },
    ],
  },
  "/faq": {
    eyebrow: "FREQUENTLY ASKED QUESTIONS",
    title: "Direct answers for planning your DRAA journey.",
    intro: "Start here, then confirm course-specific information with the institution before applying.",
    summary: "DRAA guidance is informational and does not replace institutional admission conditions or official statutory advice.",
    sections: [
      { title: "Can DRAA guarantee admission?", body: "No. Admissions are decided by the institution after reviewing eligibility, documents and available places." },
      { title: "Can I apply to more than one programme?", body: "The DRAA demonstration workflow is designed to support multiple applications, subject to each institution’s rules." },
      { title: "Does DRAA provide scholarships?", body: "DRAA does not currently award scholarships. We can help you review verified institutional or external opportunities." },
      { title: "Does DRAA issue student visas?", body: "No. Visa decisions and statutory formalities are completed only by authorised authorities." },
      { title: "What should I compare between courses?", body: "Compare recognition, eligibility, curriculum, duration, teaching mode, fees, location and student support." },
      { title: "Who can use the portal?", body: "The platform provides dedicated access for students, participating institutions and DRAA administrators." },
    ],
  },
  "/contact": {
    eyebrow: "CONTACT DRAA",
    title: "Talk to an education guidance specialist.",
    intro: "Tell us your current qualification, preferred subject, intended level and the questions you need answered.",
    summary: "DRAA (OPC) Private Limited is based in New Delhi and supports education, training, content, events, advisory and digital learning requirements.",
    sections: [
      { title: "Email", body: "admin@draa.in", items: ["Course and application guidance", "Institution enquiries", "Partnership discussions"] },
      { title: "Telephone", body: "+91 11 4100 8450", items: ["Monday–Saturday", "9:30 AM–6:30 PM IST", "Appointments recommended"] },
      { title: "Office", body: "B-62, First Floor, Defence Colony, New Delhi – 110024, India", items: ["DRAA (OPC) Private Limited", "Education Services", "Knowledge Management"] },
    ],
    ctaLabel: "Send an email",
    ctaHref: "mailto:admin@draa.in",
  },
  "/privacy": {
    eyebrow: "PRIVACY & RESPONSIBILITY",
    title: "Student information should be collected with purpose and care.",
    intro: "DRAA’s production platform will limit collection to the information required for accounts, applications, support and institutional review.",
    summary: "Do not upload real passports or sensitive documents to this demonstration environment.",
    sections: [
      { title: "Purpose limitation", body: "Information should be used only for the service described when it is collected.", items: ["Clear notices", "Proportionate fields", "No unrelated reuse"] },
      { title: "Access control", body: "Student, institution and administrator roles receive different permissions enforced by the backend.", items: ["Role checks", "Secure sessions", "Audit-ready actions"] },
      { title: "Retention and rights", body: "Production policies must define retention, deletion, correction and support procedures.", items: ["Retention schedule", "Correction process", "Incident response"] },
    ],
  },
};
