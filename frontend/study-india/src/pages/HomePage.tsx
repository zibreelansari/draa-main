import {
  ArrowRight,
  Award,
  BadgeIndianRupee,
  BookOpen,
  Building2,
  Calendar,
  Clock,
  Cpu,
  GraduationCap,
  Globe2,
  Heart,
  Landmark,
  Layers,
  MapPin,
  Palmtree,
  Plane,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  Quote,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { useLanguage } from "../context/LanguageContext";

/* ── Data ─────────────────────────────────────────────────────────── */

const stats = [
  { icon: Building2, number: "1,200+", label: "Accredited Universities", bg: "#f0fdfa", color: "#0b655d" },
  { icon: BookOpen, number: "24,270+", label: "Verified Degree Programmes", bg: "#fff7ed", color: "#ea580c" },
  { icon: Globe2, number: "160+", label: "Countries Represented", bg: "#eff6ff", color: "#2563eb" },
  { icon: Award, number: "$3,500/yr", label: "Avg. Indicative Tuition", bg: "#fdf2f8", color: "#db2777" },
];

const steps = [
  {
    number: "01",
    stepTag: "IDENTITY",
    icon: Users,
    title: "Register & Create DRAA ID",
    desc: "Create one unified student profile to organise your entire education journey across 500+ Indian universities.",
    badge: "1-Click Setup",
    color: "#0b655d",
    bg: "#f0fdfa",
  },
  {
    number: "02",
    stepTag: "EXPLORE",
    icon: Search,
    title: "Explore 24,000+ Courses",
    desc: "Filter and compare accredited programmes across disciplines, NIRF rankings, and transparent USD fees.",
    badge: "Free Comparison",
    color: "#ea580c",
    bg: "#fff7ed",
  },
  {
    number: "03",
    stepTag: "APPLY",
    icon: FileCheck2,
    title: "Submit Verified Application",
    desc: "Apply directly to multiple chosen institutions with your uploaded transcripts and passport verification.",
    badge: "Zero Paperwork",
    color: "#2563eb",
    bg: "#eff6ff",
  },
  {
    number: "04",
    stepTag: "OFFERS",
    icon: CheckCircle2,
    title: "Review Offer Letters",
    desc: "Receive official provisional admission letters and up to 100% scholarship fee concessions in your portal.",
    badge: "Visa-Ready Letters",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    number: "05",
    stepTag: "VISA",
    icon: ShieldCheck,
    title: "Visa & Pre-Departure",
    desc: "Obtain official embassy visa facilitation, health insurance guidance, and pre-departure webinars.",
    badge: "Embassy Support",
    color: "#7c3aed",
    bg: "#f5f3ff",
  },
  {
    number: "06",
    stepTag: "ARRIVAL",
    icon: Plane,
    title: "Arrival & Campus Life",
    desc: "Airport pickup coordination, hostel room allocation, and local e-FRRO statutory registration within 14 days.",
    badge: "Hostel & Airport",
    color: "#db2777",
    bg: "#fdf2f8",
  },
];

const disciplines = [
  {
    title: "AI, Computing & Robotics",
    count: "4,800+ Courses",
    icon: Cpu,
    color: "#0b655d",
    bg: "#f0fdfa",
    border: "#ccfbf1",
    tag: "High Placement",
    avgFee: "$3,200/yr",
    image: "/media/discipline-ai.jpg",
    desc: "Study in Bengaluru & Hyderabad — the Silicon Valley of Asia with cutting-edge AI labs, robotics, and Fortune 500 tech ecosystems.",
  },
  {
    title: "Global MBA & Management",
    count: "3,200+ Courses",
    icon: TrendingUp,
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#ffedd5",
    tag: "AACSB / AMBA",
    avgFee: "$4,100/yr",
    image: "/media/discipline-mba.jpg",
    desc: "Premier business schools offering FinTech, Supply Chain, and corporate linkages with direct Indian campus placements.",
  },
  {
    title: "Medicine & Health Sciences",
    count: "2,600+ Courses",
    icon: Heart,
    color: "#e11d48",
    bg: "#fff1f2",
    border: "#ffe4e6",
    tag: "WHO / NMC Approved",
    avgFee: "$3,800/yr",
    image: "/media/discipline-medical.jpg",
    desc: "World-class medical colleges, clinical training hospitals, biotechnology research, and affordable pharmaceutical studies.",
  },
  {
    title: "Indian Knowledge Systems & Yoga",
    count: "1,100+ Courses",
    icon: Sparkles,
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fef3c7",
    tag: "Authentic Heritage",
    avgFee: "$1,800/yr",
    image: "/media/discipline-yoga.jpg",
    desc: "Authentic university degrees in Traditional Yoga Sciences, Ayurveda, Sanskrit Heritage, and Vedic Mathematics.",
  },
  {
    title: "UI/UX Design & Media Arts",
    count: "1,500+ Courses",
    icon: Layers,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ede9fe",
    tag: "Creative Studio",
    avgFee: "$3,400/yr",
    image: "/media/discipline-design.jpg",
    desc: "Premier creative academies in Mumbai & Pune for Industrial Design, 3D Animation, VFX, and Game Art.",
  },
  {
    title: "Sustainable Agriculture",
    count: "950+ Courses",
    icon: Palmtree,
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#dcfce7",
    tag: "Agro-Tech Hub",
    avgFee: "$2,200/yr",
    image: "/media/discipline-agri.jpg",
    desc: "Agro-tech, organic farming, climate resilience, and food processing in India's top agricultural universities.",
  },
];

const whyReasons: [typeof GraduationCap, string, string][] = [
  [GraduationCap, "Global Academic Prestige", "Learn from internationally recognised institutions with high NAAC A++ ratings, NIRF Top rankings, and English-taught curricula."],
  [Sparkles, "Rich Cultural Fabric", "Experience India's 28 states, vibrant festivals, 5,000-year philosophical roots, and peaceful campus communities."],
  [BadgeIndianRupee, "Value & Affordability", "Save up to 70% in tuition compared to Western destinations without compromising on laboratory infrastructure and faculty standards."],
];

const testimonials = [
  {
    name: "Amina Al-Mansoor",
    photo: "/media/student-amina.jpg",
    country: "United Arab Emirates",
    flag: "ae",
    program: "B.Tech in Artificial Intelligence",
    university: "DRAA Institute of Technology, Bengaluru",
    quote: "Studying in India gave me hands-on access to world-class AI professors and internships in top tech companies. The vibrant campus and warm Indian hospitality made me feel right at home!",
    scholarship: "50% Merit Scholarship",
    rating: 5,
    intake: "2024-2028 Scholar",
  },
  {
    name: "Aarav Shrestha",
    photo: "/media/student-aarav.jpg",
    country: "Nepal",
    flag: "np",
    program: "Global MBA (FinTech)",
    university: "DRAA School of Management, New Delhi",
    quote: "The English-medium curriculum and global case studies prepared me for international business. The cost of living and tuition in USD is unbeatable for the quality of education.",
    scholarship: "25% Fee Waiver",
    rating: 5,
    intake: "2023-2025 Scholar",
  },
  {
    name: "Chinedu Okafor",
    photo: "/media/student-chinedu.jpg",
    country: "Nigeria",
    flag: "ng",
    program: "M.Sc. in Biotechnology",
    university: "DRAA College of Life Sciences, Hyderabad",
    quote: "The admission process through the DRAA Study in India portal was smooth and transparent. I received my verified provisional offer letter in just 5 days!",
    scholarship: "Full Tuition Concession",
    rating: 5,
    intake: "2024-2026 Scholar",
  },
];

const events = [
  {
    title: "Global Virtual Education Fair 2026-27",
    desc: "Meet deans & admissions directors from 50+ accredited Indian universities with on-the-spot provisional evaluations.",
    date: { day: "18", month: "OCT" },
    tag: "LIVE VIRTUAL EXPO",
    time: "2:00 PM – 6:30 PM IST",
    image: "/media/event-fair.jpg",
    badge: "50+ Universities",
    link: "/register/student",
    cta: "Book Free Pass",
  },
  {
    title: "Study in India (SII) Scholarship Masterclass",
    desc: "Step-by-step guidance on securing up to 100% tuition waivers, documents required, and selection interview criteria.",
    date: { day: "24", month: "OCT" },
    tag: "SCHOLARSHIP WEBINAR",
    time: "4:00 PM – 5:30 PM IST",
    image: "/media/event-scholarship.jpg",
    badge: "100% Fee Concessions",
    link: "/register/student",
    cta: "Join Masterclass",
  },
  {
    title: "STEM, AI & Robotics Careers in Bengaluru",
    desc: "Explore high-growth tech degrees, R&D labs, industry internships, and post-study opportunities across Silicon Asia.",
    date: { day: "05", month: "NOV" },
    tag: "INDUSTRY KEYNOTE",
    time: "3:00 PM – 4:30 PM IST",
    image: "/media/event-stem.jpg",
    badge: "IIT & Tech Deans",
    link: "/register/student",
    cta: "Reserve Seat",
  },
];

const topUniversities = [
  {
    name: "Indian Institute of Technology (IIT) Delhi",
    location: "New Delhi, Delhi",
    image: "/media/uni-iit.jpg",
    badges: ["NIRF Rank #2", "Institute of Eminence"],
  },
  {
    name: "Indian Institute of Science (IISc)",
    location: "Bengaluru, Karnataka",
    image: "/media/uni-iisc.jpg",
    badges: ["NIRF Rank #1", "Global Top 200"],
  },
  {
    name: "Indian Institute of Management (IIM) Ahmedabad",
    location: "Ahmedabad, Gujarat",
    image: "/media/uni-iim.jpg",
    badges: ["AMBA / EQUIS", "Top MBA in Asia"],
  },
  {
    name: "National Institute of Technology (NIT) Trichy",
    location: "Tiruchirappalli, Tamil Nadu",
    image: "/media/uni-nit.jpg",
    badges: ["NAAC A++", "Top Engineering Hub"],
  },
];

const campusLifeImages = [
  { image: "/media/campus-1.jpg", title: "Global Peer Network", desc: "Collaborate with brilliant minds from 160+ countries", span: "row-span-2 col-span-2" },
  { image: "/media/campus-2.jpg", title: "Vibrant Festivals", desc: "Celebrate India's rich cultural heritage on campus", span: "col-span-2" },
  { image: "/media/campus-3.jpg", title: "Cutting-Edge Labs", desc: "Access world-class research and innovation centres", span: "" },
  { image: "/media/campus-4.jpg", title: "Extracurriculars", desc: "Join 500+ student clubs, from robotics to classical arts", span: "" },
];

/* ── Component ────────────────────────────────────────────────────── */

export default function HomePage() {
  useReveal();
  const { t } = useLanguage();

  return (
    <div className="home-container">

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <section className="reference-hero">
        <img src="/media/hero-india-campus.jpg" alt="International university students walking on a beautiful Indian campus" />
        <div className="reference-hero-shade" />

        <div className="portal-shell reference-hero-copy" data-reveal>
          <div className="hero-eyebrows-wrap">
            <span className="hero-eyebrow hero-eyebrow--primary">
              <span className="hero-eyebrow-dot" />
              {t("hero.eyebrow", "DRAA STUDY IN INDIA")}
            </span>
            <span className="hero-eyebrow hero-eyebrow--secondary">
              <Sparkles size={11} color="#f59e0b" /> 5,000+ Years of Heritage
            </span>
          </div>

          <h1>
            Your world-class<br />education begins in <em>India</em>
          </h1>

          <p className="hero-subtitle">
            {t("hero.subtitle", "Access world-ranked universities, transparent tuition in USD, and scholarships up to 100% \u2014 all with English-medium instruction.")}
          </p>

          <div className="hero-cta-row">
            <Link className="solid-button" to="/courses" style={{ background: "linear-gradient(135deg, #e87524, #ea580c)", boxShadow: "0 6px 24px rgba(232, 117, 36, 0.4)" }}>
              <Search size={16} /> {t("hero.explore", "Explore 24,000+ Courses")}
            </Link>
            <Link className="outline-button" to="/register/student" style={{ background: "rgba(255,255,255,0.95)", color: "#0f172a", fontWeight: 800 }}>
              <GraduationCap size={16} color="#0b655d" /> {t("hero.apply", "Apply Now for 2026-27")}
            </Link>
          </div>

          <div className="hero-trust-strip">
            <small>TRUSTED BY</small>
            <div className="hero-trust-badges">
              <span>UGC</span>
              <span>AICTE</span>
              <span>NAAC</span>
              <span>NIRF</span>
              <span>Study in India</span>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="hero-wave-divider">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,40 1440,30 L1440,60 L0,60 Z" fill="#f6f9f8" />
          </svg>
        </div>
      </section>

      {/* ═══════════════ STATS BAND ═══════════════ */}
      <section className="stats-band">
        <div className="portal-shell">
          <div className="stats-band-grid">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div className="stat-card" key={s.label} data-reveal>
                  <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <span className="stat-card-number">{s.number}</span>
                    <span className="stat-card-label">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ ACADEMIC DISCIPLINES ═══════════════ */}
      <section className="disciplines-section">
        <div className="portal-shell">
          <div className="section-header" data-reveal>
            <span className="section-eyebrow">ACADEMIC EXCELLENCE</span>
            <h2 className="section-title">Top Study Disciplines in India</h2>
            <p className="section-subtitle">
              Explore world-class academic avenues from STEM and Artificial Intelligence to Classical Indian Knowledge Systems.
            </p>
          </div>

          <div className="disciplines-grid">
            {disciplines.map((d) => {
              const Icon = d.icon;
              return (
                <div className="discipline-card" key={d.title} data-reveal>
                  <div className="discipline-card-media">
                    <img src={d.image} alt={d.title} loading="lazy" />
                    <div className="discipline-card-media-shade" />
                    <span className="discipline-floating-tag" style={{ background: d.color }}>
                      {d.tag}
                    </span>
                    <span className="discipline-floating-count">
                      {d.count}
                    </span>
                  </div>
                  <div className="discipline-card-content">
                    <div className="discipline-meta-top">
                      <div className="discipline-icon" style={{ background: d.bg, color: d.color }}>
                        <Icon size={18} />
                      </div>
                      <span className="discipline-fee-badge">
                        Avg. {d.avgFee}
                      </span>
                    </div>
                    <h3>{d.title}</h3>
                    <p>{d.desc}</p>
                    <div className="discipline-card-footer">
                      <Link to="/courses" className="discipline-card-link" style={{ color: d.color }}>
                        Explore Programmes <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TOP UNIVERSITIES ═══════════════ */}
      <section className="universities-section">
        <div className="portal-shell">
          <div className="section-header--center" data-reveal>
            <span className="section-eyebrow">WORLD-RANKED INSTITUTIONS</span>
            <h2 className="section-title">Featured Top Universities</h2>
            <p className="section-subtitle">Study at India's most prestigious campuses recognized globally for research and innovation.</p>
          </div>
          
          <div className="universities-grid">
            {topUniversities.map((uni, idx) => (
              <div className="university-card" key={idx} data-reveal style={{ animationDelay: `${idx * 100}ms` }}>
                <div className="university-image-wrap">
                  <img src={uni.image} alt={uni.name} loading="lazy" />
                  <div className="university-badges">
                    {uni.badges.map((b) => (
                      <span key={b} className="uni-badge">{b}</span>
                    ))}
                  </div>
                </div>
                <div className="university-card-body">
                  <span className="uni-location"><MapPin size={12} /> {uni.location}</span>
                  <h3>{uni.name}</h3>
                  <Link to="/courses" className="uni-link">Explore Campus <ArrowRight size={14} /></Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ 6-STEP ROADMAP ═══════════════ */}
      <section className="journey-section">
        <div className="portal-shell">
          <div className="reference-heading" data-reveal>
            <span>{t("roadmap.eyebrow", "YOUR ROADMAP")}</span>
            <h2>{t("roadmap.title", "Steps to study in India")}</h2>
            <p>From initial registration to airport arrival and campus hostel onboarding — a clear 6-step roadmap.</p>
          </div>
          <div className="reference-steps">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div className="step-card" key={step.title} data-reveal style={{ animationDelay: `${index * 60}ms` }}>
                  <div className="step-card-header">
                    <div className="step-tag-pill" style={{ color: step.color, background: step.bg }}>
                      STEP {step.number}
                    </div>
                    <div className="step-icon-box" style={{ background: step.bg, color: step.color }}>
                      <Icon size={20} />
                    </div>
                  </div>
                  <span className="step-badge-subtle">{step.badge}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  {index < steps.length - 1 && <ArrowRight className="step-arrow" size={16} />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ SCHOLARSHIP BANNER ═══════════════ */}
      <section className="scholarship-banner-section">
        <div className="portal-shell">
          <div className="scholarship-banner" data-reveal>
            <img src="/media/scholarship-banner.jpg" alt="Students celebrating graduation" className="scholarship-banner-bg" />
            <div className="scholarship-banner-overlay" />
            <div className="scholarship-banner-content">
              <span className="scholarship-eyebrow"><Award size={14} /> STUDY IN INDIA (SII) SCHOLARSHIPS</span>
              <h2>Unlock Up to 100% Tuition Fee Concessions</h2>
              <p>The Government of India and partner universities offer substantial merit-based scholarships to international students, making world-class education highly affordable.</p>
              <div className="scholarship-stats">
                <div className="scholarship-stat"><strong>$200M+</strong><span>Funds Disbursed</span></div>
                <div className="scholarship-stat"><strong>15,000+</strong><span>Scholars Funded</span></div>
                <div className="scholarship-stat"><strong>100%</strong><span>Merit-Based</span></div>
              </div>
              <Link to="/register/student" className="solid-button scholarship-btn">Check Eligibility <ArrowRight size={16} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY STUDY IN INDIA ═══════════════ */}
      <section className="why-reference">
        <div className="why-grid-overlay" />
        <div className="portal-shell">
          <div className="reference-heading light" data-reveal>
            <span>{t("why.eyebrow", "DISCOVER THE DIFFERENCE")}</span>
            <h2>{t("why.title", "Why Study in India?")}</h2>
            <p style={{ color: "#c8deda" }}>An unparalleled blend of ancient academic heritage, modern technological leadership, and warm hospitality.</p>
          </div>
          <div className="why-reference-grid">
            {whyReasons.map(([Icon, title, text]) => (
              <div className="why-card" key={title} data-reveal>
                <div className="why-card-icon">
                  <Icon size={28} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CAMPUS LIFE GALLERY ═══════════════ */}
      <section className="campus-life-section">
        <div className="portal-shell">
          <div className="section-header" data-reveal>
            <span className="section-eyebrow">VIBRANT STUDENT LIFE</span>
            <h2 className="section-title">Beyond the Classroom</h2>
            <p className="section-subtitle">Experience a culturally rich, diverse, and dynamic campus environment that shapes global leaders.</p>
          </div>
          
          <div className="campus-life-grid">
            {campusLifeImages.map((item, idx) => (
              <div className={`campus-life-card ${item.span || ""}`} key={idx} data-reveal style={{ animationDelay: `${idx * 100}ms` }}>
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="campus-life-overlay">
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SCHOLAR TESTIMONIALS ═══════════════ */}
      <section className="testimonials-section">
        <div className="portal-shell">
          <div className="section-header--center" data-reveal>
            <span className="section-eyebrow" style={{ color: "#0b655d" }}>SCHOLAR VOICES</span>
            <h2 className="section-title">What International Students Say</h2>
            <p className="section-subtitle">Read real stories from foreign scholars currently pursuing their degrees in top Indian universities.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((s) => (
              <div className="testimonial-card" key={s.name} data-reveal>
                <div className="testimonial-card-top">
                  <div className="testimonial-stars" aria-label="5 out of 5 stars">
                    {[...Array(s.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#f59e0b" color="#f59e0b" />
                    ))}
                    <span>5.0</span>
                  </div>
                  <Quote size={22} color="#0b655d" style={{ opacity: 0.25 }} />
                </div>

                <p className="testimonial-quote">&ldquo;{s.quote}&rdquo;</p>

                <div className="testimonial-footer">
                  <div className="testimonial-student-row">
                    <div className="testimonial-avatar-wrap">
                      <img src={s.photo} alt={s.name} className="testimonial-avatar-img" />
                      <span className="testimonial-verified-badge" title="Verified International Scholar">
                        <CheckCircle2 size={12} color="#ffffff" />
                      </span>
                    </div>
                    <div className="testimonial-meta">
                      <div className="testimonial-name-line">
                        <strong>{s.name}</strong>
                        <img src={`https://flagcdn.com/w40/${s.flag}.png`} alt={s.country} className="testimonial-flag-icon" />
                      </div>
                      <small className="testimonial-program">{s.program}</small>
                      <small className="uni-name">{s.university}</small>
                    </div>
                  </div>
                  <div className="testimonial-badge-row">
                    <span className="testimonial-scholarship">{s.scholarship}</span>
                    <span className="testimonial-intake-pill">{s.intake}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ EVENTS & WEBINARS ═══════════════ */}
      <section className="events-reference">
        <div className="portal-shell">
          <div className="reference-heading" data-reveal>
            <span>{t("events.eyebrow", "EVENTS & WEBINARS")}</span>
            <h2>{t("events.title", "Step into your academic future.")}</h2>
            <p>Meet university deans, learn about scholarships, and prepare questions for your international education journey.</p>
          </div>
          <div className="events-grid">
            {events.map((ev) => (
              <article className="event-card-rich" key={ev.title} data-reveal>
                <div className="event-card-thumb">
                  <img src={ev.image} alt={ev.title} loading="lazy" />
                  <div className="event-date-badge">
                    <span className="event-date-day">{ev.date.day}</span>
                    <span className="event-date-month">{ev.date.month}</span>
                  </div>
                  <span className="event-live-pill">
                    <span className="event-live-dot" /> LIVE EVENT
                  </span>
                </div>
                <div className="event-card-body">
                  <div className="event-meta-line">
                    <span className="event-badge-highlight">{ev.badge}</span>
                    <span className="event-time-text"><Clock size={12} /> {ev.time}</span>
                  </div>
                  <h3>{ev.title}</h3>
                  <p>{ev.desc}</p>
                  <div className="event-card-footer">
                    <Link to={ev.link} className="event-card-button">
                      {ev.cta} <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA BANNER ═══════════════ */}
      <section className="cta-banner">
        <div className="portal-shell" data-reveal>
          <span className="section-eyebrow" style={{ color: "#ffb07b", justifyContent: "center" }}>START YOUR JOURNEY</span>
          <h2>Ready to study in India?</h2>
          <p>Join thousands of international scholars who chose India for world-class education at unbeatable value.</p>
          <div className="cta-banner-buttons">
            <Link className="solid-button" to="/register/student" style={{ background: "linear-gradient(135deg, #e87524, #ea580c)", boxShadow: "0 6px 24px rgba(232, 117, 36, 0.4)" }}>
              <GraduationCap size={16} /> Apply Now
            </Link>
            <Link className="outline-button" to="/courses" style={{ borderColor: "rgba(255,255,255,0.25)", color: "#ffffff", background: "transparent" }}>
              <Search size={16} /> Browse Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
