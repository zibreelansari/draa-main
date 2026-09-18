import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  Coins,
  Compass,
  ExternalLink,
  GraduationCap,
  HeartHandshake,
  Languages,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";
import GpaCalculatorModal from "../components/GpaCalculatorModal";

type ReasonCategory = "all" | "academics" | "affordability" | "innovation" | "culture" | "career";

interface ReasonItem {
  id: number;
  category: ReasonCategory;
  categoryLabel: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  stats: { value: string; label: string }[];
  highlights: string[];
  image: string;
  imageCaption: string;
  studentQuote?: {
    text: string;
    student: string;
    course: string;
    country: string;
  };
}

const REASONS_DATA: ReasonItem[] = [
  {
    id: 1,
    category: "academics",
    categoryLabel: "Academic Prestige",
    tag: "GLOBAL ACCREDITATION",
    title: "World-Class Higher Education & Prestigious Institutions",
    subtitle: "Home to IITs, IIMs, IISc, AIIMS, and century-old central universities ranked among the world's best.",
    description:
      "India boasts the world's 2nd largest higher education network, comprising over 1,100 accredited universities and 54,000 colleges. Institutions like the Indian Institutes of Technology (IITs), Indian Institute of Science (IISc Bangalore, ranked world top 100 in citations), and All India Institute of Medical Sciences (AIIMS) maintain rigorous global standards, world-renowned faculty, and Nobel laureate mentorship legacies.",
    stats: [
      { value: "1,100+", label: "Accredited Universities" },
      { value: "54,000+", label: "Colleges & Institutes" },
      { value: "Top 50", label: "Global Research Citations (IISc)" },
    ],
    highlights: [
      "Pioneering curriculum aligned with National Education Policy (NEP) and international degree frameworks.",
      "Recognized by statutory councils (UGC, AICTE, NMC, BCI) with global equivalence through Association of Indian Universities (AIU).",
      "Over 45,000 international students currently enrolled across undergraduate, postgraduate, and doctoral tracks.",
    ],
    image: "/media/reason-1-world-class.jpg",
    imageCaption: "Indian Institute of Technology (IIT Delhi) - Institute of Eminence campus with international scholars",
    studentQuote: {
      text: "The academic rigor at IIT is legendary. The faculty challenged me to think like a pioneer from week one, and the facilities rival any university in North America.",
      student: "Lucas Weber",
      course: "M.Tech in Data Engineering, IIT Delhi",
      country: "Germany",
    },
  },
  {
    id: 2,
    category: "affordability",
    categoryLabel: "Financial Value",
    tag: "EXCEPTIONAL VALUE",
    title: "Unbeatable Affordability & High Return on Investment (ROI)",
    subtitle: "Complete an internationally recognized degree at a fraction of the cost of Western universities.",
    description:
      "While a 4-year degree in the US, UK, or Australia can cost upwards of $150,000 to $220,000 in tuition and living expenses, India delivers premier university education for just $2,500 to $5,000 USD per year. Quality on-campus housing, healthy dining, and living expenses range from $150 to $300 USD monthly, granting international scholars the ultimate return on educational investment without crippling student loans.",
    stats: [
      { value: "~75%", label: "Average Tuition Savings vs West" },
      { value: "$3,000/yr", label: "Average Indicative UG Tuition" },
      { value: "$200/mo", label: "Average Cost of Living" },
    ],
    highlights: [
      "Transparent fee structure with no hidden out-of-state surcharges for Study in India candidates.",
      "Subsidized campus accommodations, high-speed Wi-Fi, modern meal plans, and student healthcare included in nominal fees.",
      "Dual currency invoicing with transparent USD and INR banking for simplified international remittances.",
    ],
    image: "/media/reason-2-affordability.jpg",
    imageCaption: "Vibrant, modern university student cafe and study commons with affordable healthy dining",
    studentQuote: {
      text: "I earned my complete Bachelor of Computer Science in India for less than what my peers spent on just one semester in London—with zero student debt.",
      student: "Amina Al-Hassan",
      course: "B.Tech Computer Science, Manipal Academy (MAHE)",
      country: "Nigeria",
    },
  },
  {
    id: 3,
    category: "academics",
    categoryLabel: "Language & Comfort",
    tag: "100% ENGLISH MEDIUM",
    title: "100% English-Medium Instruction & Universal Degree Mobility",
    subtitle: "India is the 2nd largest English-speaking nation globally, making lectures and campus life seamless.",
    description:
      "Every accredited undergraduate and postgraduate programme under the Study in India portal is conducted entirely in English. From professor lectures and laboratory coursework to student associations and research papers, language is never a barrier. Furthermore, Indian university degrees are universally recognized by WES (World Education Services), UNESCO, Association of Commonwealth Universities (ACU), and national education ministries across 160+ countries.",
    stats: [
      { value: "2nd", label: "Largest English-Speaking Nation" },
      { value: "100%", label: "English-Medium Curriculum" },
      { value: "160+", label: "Countries Recognizing Indian Degrees" },
    ],
    highlights: [
      "English Proficiency Exemptions available for students whose prior secondary education was in English medium.",
      "Dedicated English Language Support Labs on campus for conversational and technical fluency.",
      "Direct pathway for global higher education: alumni seamlessly enter Master's and Ph.D. programmes in the US, Europe, and Asia.",
    ],
    image: "/media/reason-3-english-medium.jpg",
    imageCaption: "Interactive English-medium seminar on Ethical AI in a high-tech university amphitheatre",
    studentQuote: {
      text: "Transitioning to India was completely effortless because all textbooks, coursework, lectures, and exams are in clear English. I never felt out of place.",
      student: "Tenzin Dorji",
      course: "BBA International Business, Symbiosis International",
      country: "Bhutan",
    },
  },
  {
    id: 4,
    category: "affordability",
    categoryLabel: "Funded Pathways",
    tag: "GENEROUS SCHOLARSHIPS",
    title: "Study in India (SII) Scholarships & Tuition Fee Waivers",
    subtitle: "Government-backed merit scholarships offering up to 100% tuition concessions for global talent.",
    description:
      "Through the Ministry of Education's flagship Study in India (SII) scheme and Indian Council for Cultural Relations (ICCR), thousands of meritorious international scholars receive substantial financial assistance. Eligible candidates can secure up to 100% tuition fee waivers (Tier G1), 50% waivers (Tier G2), or 25% waivers (Tier G3), making an elite Indian education accessible to deserving scholars from every continent.",
    stats: [
      { value: "Up to 100%", label: "Tuition Fee Waiver (Tier G1)" },
      { value: "3,000+", label: "Annual International Fellowships" },
      { value: "G1 / G2 / G3", label: "Multi-Tier Concession Framework" },
    ],
    highlights: [
      "Automated scholarship screening during application review with zero separate complex paperwork.",
      "Special diversity grants for ASEAN, SAARC, African Union, Middle East, and Latin American applicants.",
      "ICCR scholarships include full tuition, monthly living stipends, and medical insurance coverage.",
    ],
    image: "/media/reason-4-scholarships.jpg",
    imageCaption: "International scholar receiving Study in India merit scholarship honors certificate at convocation",
    studentQuote: {
      text: "Receiving the Study in India 100% tuition fee waiver allowed me to focus entirely on my robotics research without financial strain. It changed my life.",
      student: "Sarah Al-Mansoor",
      course: "B.Tech Artificial Intelligence, VIT Vellore",
      country: "United Arab Emirates",
    },
  },
  {
    id: 5,
    category: "innovation",
    categoryLabel: "Tech Ecosystem",
    tag: "SILICON VALLEY OF ASIA",
    title: "Global Tech, AI & Innovation Powerhouse",
    subtitle: "Study in cities like Bengaluru and Hyderabad, where 115+ unicorns and global tech titans engineer the future.",
    description:
      "India is the world's 3rd largest startup ecosystem and the digital engine of the 21st century. Cities like Bengaluru, Hyderabad, Pune, and Delhi-NCR host R&D headquarters for Google, Microsoft, Apple, Amazon, Intel, and Tesla. University students gain direct exposure through industry hackathons, corporate incubator attachments, and hands-on AI and cloud computing labs, transforming academic theory into high-impact digital solutions.",
    stats: [
      { value: "115+", label: "Tech Unicorns Built in India" },
      { value: "3rd", label: "Largest Global Startup Ecosystem" },
      { value: "1,500+", label: "Global MNC Capability Centers" },
    ],
    highlights: [
      "On-campus innovation hubs and incubation centers funded by the Department of Science and Technology.",
      "Direct recruitment drives and internships with Fortune 500 technology and consulting enterprises.",
      "India's Unified Payments Interface (UPI) and digital public infrastructure are leading the world in fintech innovation.",
    ],
    image: "/media/reason-5-tech-innovation.jpg",
    imageCaption: "International engineering students operating collaborative robotic arms and AI workstations at IIT",
    studentQuote: {
      text: "Being in Bangalore felt like living right inside Silicon Valley. We had guest lectures from chief scientists at Microsoft and visited startup incubators every month.",
      student: "Chinedu Okafor",
      course: "M.Sc Software Engineering, IISc Bangalore",
      country: "Kenya",
    },
  },
  {
    id: 6,
    category: "culture",
    categoryLabel: "Ancient Wisdom",
    tag: "5,000 YEARS OF HERITAGE",
    title: "Cradle of Ancient Wisdom, Yoga & Holistic Healthcare",
    subtitle: "Learn in the civilization that gave the world Nalanda, Takshashila, Ayurveda, and Mindful Living.",
    description:
      "Centuries before modern universities existed, India hosted Nalanda and Takshashila—the world's earliest residential universities welcoming scholars from Greece, China, Persia, and Southeast Asia. Today, this rich tradition continues through premier AYUSH institutes offering evidence-based Bachelor of Ayurvedic Medicine (BAMS), Naturopathy, and Yoga Sciences, offering international students profound perspectives on holistic health and longevity.",
    stats: [
      { value: "5,000+", label: "Years of Documented Civilisation" },
      { value: "June 21", label: "International Day of Yoga (UN)" },
      { value: "500+", label: "Accredited AYUSH & Wellness Centers" },
    ],
    highlights: [
      "World-class degree programmes in Ayurveda, Yoga, Unani, Siddha, and Homeopathy backed by modern clinical trials.",
      "Immersion in mindfulness, meditation, and healthy Ayurvedic lifestyle practices integrated into campus life.",
      "Deep cross-disciplinary studies blending philosophy, classical languages, architecture, and environmental sustainability.",
    ],
    image: "/media/reason-6-yoga-ayurveda.jpg",
    imageCaption: "Morning yoga, mindfulness, and Ayurvedic herbal garden workshop on an accredited campus",
    studentQuote: {
      text: "Studying Yoga and Integrative Medicine in India taught me how ancient preventive sciences perfectly complement modern healthcare. The experience was transformative.",
      student: "Elena Rostova",
      course: "B.Sc Yoga Sciences, S-VYASA Bangalore",
      country: "Kazakhstan",
    },
  },
  {
    id: 7,
    category: "culture",
    categoryLabel: "Hospitality & Safety",
    tag: "ATITHI DEVO BHAVA",
    title: "Warm Indian Hospitality, Safety & Inclusive Student Community",
    subtitle: "'The Guest is God' — experience authentic warmth, vibrant multicultural life, and supportive campuses.",
    description:
      "India's timeless ethos of 'Atithi Devo Bhava' (The Guest is God) guarantees that foreign students are welcomed with genuine warmth and care. Every partner university features a dedicated International Student Office (ISO) to assist with arrival reception, foreign registration (e-FRRO), comfortable on-campus residences, and peer mentorship. India is celebrated for its harmonious multi-faith society and unmatched celebration of regional festivals.",
    stats: [
      { value: "24/7", label: "Dedicated International Student Care" },
      { value: "28 States", label: "Celebrated Multi-Cultural Mosaic" },
      { value: "100%", label: "Campus Residency & Security Options" },
    ],
    highlights: [
      "Safe, gated university campuses with round-the-clock security, CCTV surveillance, and dedicated warden care.",
      "Festive celebrations on campus: Diwali, Eid, Christmas, Holi, and international food and culture festivals.",
      "Incredible culinary diversity: rich multi-cuisine cafeterias catering to vegetarian, halal, vegan, and global dietary needs.",
    ],
    image: "/media/reason-7-hospitality.jpg",
    imageCaption: "Warm traditional Indian orientation welcome ceremony with marigold garlands for foreign students",
    studentQuote: {
      text: "From day one, the faculty and local students treated me like family. When I was homesick during the holidays, a professor invited me to their home for Diwali dinner.",
      student: "Liam O'Connor",
      course: "BA International Relations, Jawaharlal Nehru University (JNU)",
      country: "Ireland",
    },
  },
  {
    id: 8,
    category: "culture",
    categoryLabel: "Travel & Discovery",
    tag: "INCOMPARABLE GEOGRAPHY",
    title: "Endless Travel, 42 UNESCO World Heritage Sites & Natural Wonders",
    subtitle: "Explore Himalayan peaks, golden desert dunes, tropical coastlines, and ancient architectural wonders.",
    description:
      "Studying in India is not confined to the four walls of a lecture hall; it is an epic geographic and cultural odyssey. On semester breaks, students can trek the majestic snow-clad Himalayas in Ladakh, explore 16th-century palaces in Rajasthan, cruise the tranquil backwaters of Kerala, or surf along Goa's golden coastlines. With efficient high-speed Vande Bharat trains and affordable domestic flights, weekend discovery is at your doorstep.",
    stats: [
      { value: "42", label: "UNESCO World Heritage Sites" },
      { value: "7,500+ km", label: "Sunlit Tropical Coastline" },
      { value: "8,000+ m", label: "Majestic Himalayan Peaks" },
    ],
    highlights: [
      "Access to iconic wonders including the Taj Mahal, Amber Fort, Ajanta Caves, and ancient temple cities.",
      "Extremely affordable student travel discounts on Indian Railways, intercity flights, and youth hostels.",
      "Rich biosphere reserves, national parks home to Bengal tigers, elephants, and breathtaking biodiversity.",
    ],
    image: "/media/reason-8-heritage-travel.jpg",
    imageCaption: "International exchange students exploring iconic sandstone palaces and UNESCO World Heritage wonders",
    studentQuote: {
      text: "During my 3 years in India, I visited 14 states—from skiing in Kashmir to scuba diving in the Andaman Islands. The memories I made outside of class will stay with me forever.",
      student: "Ananya Senanayake",
      course: "B.Sc Biotechnology, University of Delhi",
      country: "Sri Lanka",
    },
  },
  {
    id: 9,
    category: "innovation",
    categoryLabel: "Research & Discovery",
    tag: "PRACTICAL SCIENCE",
    title: "Cutting-Edge Research Facilities, Space Exploration & Supercomputing",
    subtitle: "Collaborate on lunar space probes, biotechnology breakthroughs, and national supercomputing projects.",
    description:
      "India's scientific prowess is celebrated worldwide—from the Indian Space Research Organisation (ISRO) successfully landing the Chandrayaan-3 spacecraft on the Moon's South Pole to India producing 60% of the world's vaccines. Premier universities maintain sophisticated clean rooms, PARAM supercomputing clusters, atomic research centers, and hospital affiliations where students engage in live, peer-reviewed international scientific research.",
    stats: [
      { value: "#1", label: "Moon South Pole Landing (ISRO)" },
      { value: "60%", label: "World's Vaccines Produced in India" },
      { value: "10,000+", label: "Patents Filed Annually by Universities" },
    ],
    highlights: [
      "Direct funded research grants from Government of India research councils for promising graduate and Ph.D. scholars.",
      "Access to national supercomputing grids, electron microscopes, wind tunnels, and genomic sequencing centers.",
      "Active interdisciplinary centers combining machine learning with environmental biology and medical diagnostics.",
    ],
    image: "/media/reason-9-space-research.jpg",
    imageCaption: "Aerospace engineering cleanroom and satellite CubeSat development at ISRO-partnered university cell",
    studentQuote: {
      text: "As an undergraduate, I had hands-on access to a satellite telemetry lab that my friends in Europe could only read about in textbooks. India empowers students to build real things.",
      student: "Marcus Davies",
      course: "B.Tech Aerospace Engineering, IIT Madras",
      country: "United Kingdom",
    },
  },
  {
    id: 10,
    category: "career",
    categoryLabel: "Global Careers",
    tag: "EXECUTIVE LAUNCHPAD",
    title: "Global Leadership Network & High-Impact Career Launchpad",
    subtitle: "Join the alumni network that produced the CEOs of Alphabet, Microsoft, Adobe, IBM, and World Bank.",
    description:
      "Graduating from an Indian university places you in the company of the world's most influential business and technology leaders. Global leaders like Sundar Pichai (CEO of Alphabet/Google - IIT Kharagpur alumnus), Satya Nadella (CEO of Microsoft - Manipal alumnus), Shantanu Narayen (CEO of Adobe - Osmania alumnus), and Ajay Banga (President of the World Bank - IIM Ahmedabad alumnus) all earned their foundational degrees in India. An Indian degree is your passport to corporate boardrooms and global multinational leadership.",
    stats: [
      { value: "50+", label: "Fortune 500 CEOs from Indian Universities" },
      { value: "100%", label: "Placement Assistance for Eligible Degrees" },
      { value: "5M+", label: "Global Active Alumni Network" },
    ],
    highlights: [
      "On-campus placement drives connecting international students with multinational firms across APAC, Europe, and GCC.",
      "Strong corporate mentorship networks and global alumni chapters in New York, London, Singapore, and Dubai.",
      "Comprehensive training in executive decision-making, frugal innovation, and agile global leadership.",
    ],
    image: "/media/reason-10-global-careers.jpg",
    imageCaption: "International university graduates stepping forward into multinational corporate careers",
    studentQuote: {
      text: "The global brand value of an Indian technology degree is extraordinary. Within 2 months of graduating, I received offers from two international enterprise software leaders.",
      student: "Kofi Mensah",
      course: "MBA Global Management, IIM Bangalore",
      country: "Ghana",
    },
  },
];

// Cost Comparison Data
const COST_COMPARISON = [
  {
    country: "India (Study in India)",
    flag: "🇮🇳",
    tuition: "$2,500 – $5,000",
    living: "$2,000 – $3,500",
    totalAnnual: "$4,500 – $8,500",
    roiBadge: "Highest ROI (75%+ Savings)",
    isHighlight: true,
  },
  {
    country: "United States",
    flag: "🇺🇸",
    tuition: "$28,000 – $48,000",
    living: "$14,000 – $20,000",
    totalAnnual: "$42,000 – $68,000",
    roiBadge: "High Student Debt",
    isHighlight: false,
  },
  {
    country: "United Kingdom",
    flag: "🇬🇧",
    tuition: "$22,000 – $38,000",
    living: "$14,000 – $18,000",
    totalAnnual: "$36,000 – $56,000",
    roiBadge: "Heavy Visa & Living Surcharges",
    isHighlight: false,
  },
  {
    country: "Australia",
    flag: "🇦🇺",
    tuition: "$25,000 – $42,000",
    living: "$16,000 – $22,000",
    totalAnnual: "$41,000 – $64,000",
    roiBadge: "Elevated Housing Costs",
    isHighlight: false,
  },
  {
    country: "Canada",
    flag: "🇨🇦",
    tuition: "$20,000 – $36,000",
    living: "$13,000 – $18,000",
    totalAnnual: "$33,000 – $54,000",
    roiBadge: "Stringent Visa Caps",
    isHighlight: false,
  },
];

export default function ReasonsPage() {
  const [selectedCategory, setSelectedCategory] = useState<ReasonCategory>("all");
  const [gpaModalOpen, setGpaModalOpen] = useState(false);

  const filteredReasons =
    selectedCategory === "all"
      ? REASONS_DATA
      : REASONS_DATA.filter((item) => item.category === selectedCategory);

  return (
    <div className="reasons-page-wrapper">
      {/* ══════════════════════════════════════════════════════════════════════
          HERO SECTION: INSPIRING, BOLD & DATA-DRIVEN
          ══════════════════════════════════════════════════════════════════════ */}
      <header className="reasons-hero-section">
        <div className="reasons-hero-glow glow-1" />
        <div className="reasons-hero-glow glow-2" />
        <div className="container-custom">
          <div className="reasons-hero-content">
            <div className="reasons-hero-badge">
              <Sparkles size={14} color="#ffb07b" />
              <span>OFFICIAL STUDY IN INDIA GUIDEBOOK</span>
            </div>
            <h1 className="reasons-hero-title">
              10 Compelling Reasons to Choose <span className="text-highlight">India</span> for Your Higher Education
            </h1>
            <p className="reasons-hero-lead">
              From globally acclaimed IITs and AIIMS to unbeatable affordability, 100% English instruction, and a thriving Silicon Valley tech ecosystem—discover why 45,000+ international students from 160+ countries choose India as their academic launchpad.
            </p>

            {/* Quick Hero Stat Highlights */}
            <div className="reasons-hero-stats-grid">
              <div className="hero-stat-card">
                <span className="stat-num">1,100+</span>
                <span className="stat-label">Accredited Universities</span>
              </div>
              <div className="hero-stat-card">
                <span className="stat-num">~75%</span>
                <span className="stat-label">Cost Savings vs West</span>
              </div>
              <div className="hero-stat-card">
                <span className="stat-num">100%</span>
                <span className="stat-label">English-Medium Instruction</span>
              </div>
              <div className="hero-stat-card">
                <span className="stat-num">160+</span>
                <span className="stat-label">Student Nationalities</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="reasons-hero-actions">
              <Link to="/courses" className="btn-reasons-primary">
                Explore 500+ Accredited Programmes <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="btn-reasons-secondary"
                onClick={() => setGpaModalOpen(true)}
              >
                <Award size={16} /> Check Your Grade Equivalency
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          CATEGORY FILTER NAVIGATION
          ══════════════════════════════════════════════════════════════════════ */}
      <nav className="reasons-nav-sticky" aria-label="Reasons Categories">
        <div className="container-custom">
          <div className="reasons-pills-bar">
            <span className="pills-label">Explore by Dimension:</span>
            <div className="pills-list">
              <button
                type="button"
                className={`category-pill ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All 10 Reasons ({REASONS_DATA.length})
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "academics" ? "active" : ""}`}
                onClick={() => setSelectedCategory("academics")}
              >
                <GraduationCap size={14} /> Academic Prestige
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "affordability" ? "active" : ""}`}
                onClick={() => setSelectedCategory("affordability")}
              >
                <Coins size={14} /> Affordability & Scholarships
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "innovation" ? "active" : ""}`}
                onClick={() => setSelectedCategory("innovation")}
              >
                <Zap size={14} /> Tech, AI & Startups
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "culture" ? "active" : ""}`}
                onClick={() => setSelectedCategory("culture")}
              >
                <HeartHandshake size={14} /> Culture & Hospitality
              </button>
              <button
                type="button"
                className={`category-pill ${selectedCategory === "career" ? "active" : ""}`}
                onClick={() => setSelectedCategory("career")}
              >
                <Briefcase size={14} /> Global Leadership
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN REASONS SHOWCASE: 10 CREATIVE SPLIT FEATURE BLOCKS
          ══════════════════════════════════════════════════════════════════════ */}
      <main className="reasons-list-container">
        <div className="container-custom">
          <div className="reasons-cards-stack">
            {filteredReasons.map((reason, index) => {
              const isEven = index % 2 === 1;
              return (
                <article
                  key={reason.id}
                  id={`reason-${reason.id}`}
                  className={`reason-card-block ${isEven ? "reverse-layout" : ""}`}
                >
                  {/* Left/Content Column */}
                  <div className="reason-content-col">
                    <div className="reason-number-badge">
                      <span className="num-prefix">REASON</span>
                      <span className="num-value">{reason.id < 10 ? `0${reason.id}` : reason.id}</span>
                    </div>

                    <div className="reason-tags-row">
                      <span className="tag-category">{reason.categoryLabel}</span>
                      <span className="tag-key">{reason.tag}</span>
                    </div>

                    <h2 className="reason-headline">{reason.title}</h2>
                    <p className="reason-sublead">{reason.subtitle}</p>
                    <p className="reason-body-text">{reason.description}</p>

                    {/* Stat Badges */}
                    <div className="reason-stat-strip">
                      {reason.stats.map((st) => (
                        <div key={st.label} className="reason-stat-box">
                          <strong className="stat-val">{st.value}</strong>
                          <span className="stat-lbl">{st.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Key Highlights Checklist */}
                    <div className="reason-bullet-box">
                      <h4 className="bullet-box-title">Why Foreign Students Benefit:</h4>
                      <ul className="reason-check-list">
                        {reason.highlights.map((point) => (
                          <li key={point}>
                            <CheckCircle2 size={16} className="check-icon" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Direct CTA */}
                    <div className="reason-cta-row">
                      <Link to="/courses" className="reason-inline-btn">
                        Find Programmes in this Field <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>

                  {/* Right/Image Showcase Column */}
                  <div className="reason-media-col">
                    <div className="media-frame-wrap">
                      <img
                        src={reason.image}
                        alt={reason.title}
                        className="reason-real-photo"
                        loading="lazy"
                      />
                      <div className="media-overlay-gradient" />
                      <div className="media-caption-tag">
                        <MapPin size={13} />
                        <span>{reason.imageCaption}</span>
                      </div>
                    </div>

                    {/* Student Testimonial Quote Box */}
                    {reason.studentQuote && (
                      <div className="reason-student-quote-card">
                        <div className="quote-header">
                          <div className="quote-avatar">
                            <Users size={16} />
                          </div>
                          <div>
                            <strong>{reason.studentQuote.student}</strong>
                            <small>
                              {reason.studentQuote.course} · <em>{reason.studentQuote.country}</em>
                            </small>
                          </div>
                        </div>
                        <p className="quote-text">“{reason.studentQuote.text}”</p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          COST OF STUDY COMPARISON MATRIX (PROVING AFFORDABILITY)
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="reasons-comparison-section">
        <div className="container-custom">
          <div className="section-header-centered">
            <span className="section-eyebrow">
              <Coins size={15} color="#0b655d" /> FINANCIAL REALITY CHECK
            </span>
            <h2 className="section-title">International Cost Comparison: India vs Western Destinations</h2>
            <p className="section-subtitle">
              Achieve world-class academic accreditation without incurring lifetime student loans. See how an Indian education stacks up against conventional study abroad destinations.
            </p>
          </div>

          <div className="comparison-table-wrapper">
            <table className="cost-comparison-table">
              <thead>
                <tr>
                  <th>Destination Country</th>
                  <th>Indicative Tuition / Year</th>
                  <th>Living Expenses / Year</th>
                  <th>Total Annual Budget</th>
                  <th>Economic Advantage</th>
                </tr>
              </thead>
              <tbody>
                {COST_COMPARISON.map((row) => (
                  <tr key={row.country} className={row.isHighlight ? "highlight-india-row" : ""}>
                    <td>
                      <div className="country-cell">
                        <span className="country-flag">{row.flag}</span>
                        <strong>{row.country}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="table-amount">{row.tuition}</span>
                    </td>
                    <td>
                      <span className="table-amount">{row.living}</span>
                    </td>
                    <td>
                      <strong className={`table-total ${row.isHighlight ? "india-total" : ""}`}>
                        {row.totalAnnual}
                      </strong>
                    </td>
                    <td>
                      <span className={`roi-pill ${row.isHighlight ? "roi-pill-super" : ""}`}>
                        {row.roiBadge}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="comparison-footnote">
            <ShieldCheck size={16} color="#0b655d" />
            <span>
              All estimates derived from UNESCO Global Education Database & Study in India 2026 indicative figures. Figures represent average undergraduate bachelor's degree ranges in USD.
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          VOICES OF INTERNATIONAL STUDENTS
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="reasons-testimonials-section">
        <div className="container-custom">
          <div className="section-header-centered">
            <span className="section-eyebrow">
              <Star size={15} color="#e87524" /> STUDENT EXPERIENCES
            </span>
            <h2 className="section-title">What International Alumni Say About India</h2>
            <p className="section-subtitle">
              Hear directly from scholars across Asia, Africa, Europe, and the Americas who transformed their career trajectories in India.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                “Studying Computer Engineering at IIT Madras prepared me for global tech competition. The hands-on project culture and startup atmosphere on campus gave me skills I couldn't have gained anywhere else.”
              </p>
              <div className="testi-author">
                <img src="/media/student-amina.jpg" alt="Amina" className="testi-avatar" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div>
                  <strong>Amina Yusuf</strong>
                  <span>Software Engineer, Nairobi</span>
                  <small>IIT Madras Alumna (Kenya)</small>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                “India welcomed me with open arms. The hospitality of professors, the deep cultural immersion, and the vibrant campus festivals made my four years an unforgettable adventure.”
              </p>
              <div className="testi-author">
                <img src="/media/student-chinedu.jpg" alt="Chinedu" className="testi-avatar" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div>
                  <strong>Chinedu Eze</strong>
                  <span>Biomedical Researcher</span>
                  <small>AIIMS New Delhi Alumnus (Nigeria)</small>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                “Graduating with zero student debt while holding an internationally accredited degree allowed me to invest directly into my own renewable energy startup back home. India was the best decision of my life.”
              </p>
              <div className="testi-author">
                <img src="/media/student-aarav.jpg" alt="Aarav" className="testi-avatar" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <div>
                  <strong>Farhan Malik</strong>
                  <span>CleanTech Founder</span>
                  <small>BITS Pilani Alumnus (UAE)</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BOTTOM CTA: TAKE THE NEXT STEP
          ══════════════════════════════════════════════════════════════════════ */}
      <section className="reasons-cta-banner">
        <div className="container-custom">
          <div className="reasons-cta-box">
            <div className="cta-left">
              <span className="cta-eyebrow">YOUR JOURNEY BEGINS HERE</span>
              <h2 className="cta-heading">Ready to Experience World-Class Education in India?</h2>
              <p className="cta-sub">
                Explore accredited engineering, management, medicine, pure sciences, and humanities programmes. Check eligibility, review scholarship waivers, and submit your application in 5 simple steps.
              </p>
              <div className="cta-buttons-wrap">
                <Link to="/courses" className="btn-cta-primary">
                  Browse All 500+ Programmes <ArrowRight size={16} />
                </Link>
                <button
                  type="button"
                  className="btn-cta-outline"
                  onClick={() => setGpaModalOpen(true)}
                >
                  Calculate Admission Eligibility
                </button>
              </div>
            </div>
            <div className="cta-right-card">
              <div className="guarantee-badge">
                <ShieldCheck size={28} color="#0b655d" />
                <div>
                  <strong>Official Study in India Portal</strong>
                  <p>Ministry of Education Accredited Institution Network</p>
                </div>
              </div>
              <ul className="cta-perks">
                <li><CheckCircle2 size={15} color="#16a34a" /> 100% English-medium curriculum</li>
                <li><CheckCircle2 size={15} color="#16a34a" /> Up to 100% Tuition Waivers</li>
                <li><CheckCircle2 size={15} color="#16a34a" /> Direct Student Visa (S-Visa) sponsorship</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* International GPA Modal */}
      {gpaModalOpen && <GpaCalculatorModal onClose={() => setGpaModalOpen(false)} />}
    </div>
  );
}
