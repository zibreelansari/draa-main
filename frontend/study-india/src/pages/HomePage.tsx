import {
  ArrowRight,
  Award,
  BadgeCheck,
  BadgeIndianRupee,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Cpu,
  FileCheck2,
  Globe2,
  GraduationCap,
  Heart,
  Landmark,
  Layers,
  MapPin,
  Palmtree,
  Plane,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { useLanguage } from "../context/LanguageContext";

const steps = [
  [Users, "Register & Create DRAA ID", "Create one unified student profile to organise your entire education journey across India."],
  [Search, "Explore 24,000+ Courses", "Filter and compare accredited programmes across disciplines, rankings, and USD fees."],
  [FileCheck2, "Submit Verified Application", "Apply directly to multiple chosen institutions with your uploaded documents."],
  [CheckCircle2, "Review Offer Letters", "Receive official provisional admission letters and scholarship fee concessions."],
  [Plane, "Visa & Pre-Departure", "Obtain official visa facilitation support and join orientation modules."],
  [ShieldCheck, "Arrival & Campus Life", "Seamless onboarding, hostel allocation, and local e-FRRO registration."],
];

const disciplines = [
  {
    title: "AI, Computing & Robotics",
    count: "4,800+ Courses",
    icon: Cpu,
    color: "#0b655d",
    bg: "#f0fdfa",
    border: "#ccfbf1",
    desc: "Study in Bengaluru & Hyderabad — the Silicon Valley of Asia with cutting-edge AI labs and tech ecosystems.",
  },
  {
    title: "Global MBA & Management",
    count: "3,200+ Courses",
    icon: TrendingUp,
    color: "#c2410c",
    bg: "#fff7ed",
    border: "#ffedd5",
    desc: "AACSB/AMBA accredited business schools offering FinTech, Supply Chain, and Fortune 500 corporate linkages.",
  },
  {
    title: "Medicine & Health Sciences",
    count: "2,600+ Courses",
    icon: Heart,
    color: "#e11d48",
    bg: "#fff1f2",
    border: "#ffe4e6",
    desc: "World-class medical colleges, clinical training, biotechnology research, and affordable pharmaceutical studies.",
  },
  {
    title: "Indian Knowledge Systems & Yoga",
    count: "1,100+ Courses",
    icon: Sparkles,
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fef3c7",
    desc: "Authentic degrees in Traditional Yoga Sciences, Ayurveda, Sanskrit Heritage, and Vedic Mathematics.",
  },
  {
    title: "UI/UX Design & Media Arts",
    count: "1,500+ Courses",
    icon: Layers,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ede9fe",
    desc: "Premier creative academies in Mumbai & Pune for Industrial Design, 3D Animation, VFX, and Game Art.",
  },
  {
    title: "Sustainable Agriculture",
    count: "950+ Courses",
    icon: Palmtree,
    color: "#15803d",
    bg: "#f0fdf4",
    border: "#dcfce7",
    desc: "Agro-tech, organic farming, climate resilience, and food processing in India’s top agricultural universities.",
  },
];

const scholarTestimonials = [
  {
    name: "Amina Al-Mansoor",
    country: "United Arab Emirates",
    flag: "ae",
    program: "B.Tech in Artificial Intelligence",
    university: "DRAA Institute of Technology, Bengaluru",
    quote:
      "Studying in India gave me hands-on access to world-class AI professors and internships in top tech companies. The vibrant campus and warm Indian hospitality made me feel right at home!",
    scholarship: "50% Merit Scholarship",
  },
  {
    name: "Aarav Shrestha",
    country: "Nepal",
    flag: "np",
    program: "Global MBA (FinTech)",
    university: "DRAA School of Management, New Delhi",
    quote:
      "The English-medium curriculum and global case studies prepared me for international business. The cost of living and tuition in USD is unbeatable for the quality of education.",
    scholarship: "25% Fee Waiver",
  },
  {
    name: "Chinedu Okafor",
    country: "Nigeria",
    flag: "ng",
    program: "M.Sc. in Biotechnology",
    university: "DRAA College of Life Sciences, Hyderabad",
    quote:
      "The admission process through the DRAA Study in India portal was smooth and transparent. I received my verified provisional offer letter in just 5 days!",
    scholarship: "Full Tuition Concession",
  },
];

export default function HomePage() {
  useReveal();
  const { t } = useLanguage();

  return (
    <div className="home-container">
      {/* ── Premium Hero Banner ──────────────────────────────────── */}
      <section className="reference-hero">
        <img src="/media/banner-students-wide.png" alt="International university students collaborating around a laptop" />
        <div className="reference-hero-shade" />
        <div className="portal-shell reference-hero-copy" data-reveal>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255, 153, 51, 0.2)", border: "1px solid rgba(255, 153, 51, 0.4)", padding: "4px 10px", borderRadius: "100px", color: "#ffb07b", fontSize: "11px", fontWeight: "800", letterSpacing: "0.1em" }}>
              <span style={{ display: "inline-flex", width: "12px", height: "12px", borderRadius: "50%", background: "linear-gradient(135deg, #FF9933 0%, #FF9933 33%, #FFFFFF 33%, #FFFFFF 66%, #138808 66%, #138808 100%)", boxShadow: "0 0 4px rgba(255,153,51,0.5)" }} />
              {t("hero.eyebrow", "STUDY IN INDIA · OFFICIAL NATIONAL GATEWAY")}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", padding: "4px 10px", borderRadius: "100px", color: "#ffffff", fontSize: "11px", fontWeight: "700" }}>
              <Sparkles size={12} color="#f59e0b" /> 5,000+ Years of Academic Heritage to Modern Global Tech Leader
            </span>
          </div>

          <h1 style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}>
            Namaste, begin your<br />educational journey in <em style={{ color: "#ff9933", textDecoration: "underline", textDecorationColor: "#138808", textUnderlineOffset: "6px" }}>India</em>
          </h1>
          <p style={{ color: "#e2f1ee", fontSize: "15.5px", margin: "14px 0 0", maxWidth: "700px", lineHeight: 1.65, textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
            {t("hero.subtitle", "Access world-ranked universities, transparent tuition in USD, and scholarships up to 100% with English-medium instruction.")}
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px", flexWrap: "wrap" }}>
            <Link className="solid-button" to="/courses" style={{ background: "linear-gradient(135deg, #e87524 0%, #ea580c 100%)", boxShadow: "0 6px 20px rgba(232, 117, 36, 0.45)" }}>
              <Search size={16} /> {t("hero.explore", "Explore 24,000+ Courses")}
            </Link>
            <Link className="outline-button" to="/register/student" style={{ background: "rgba(255,255,255,0.95)", color: "#0f172a", fontWeight: "800" }}>
              <GraduationCap size={16} color="#0b655d" /> {t("hero.apply", "Apply Now for 2026-27")}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Indian Higher Education Key Statistics Band ─────────── */}
      <section className="hero-actions-band">
        <div className="portal-shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", width: "100%", maxWidth: "1100px" }}>
            <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#f0fdfa", color: "#0b655d", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Building2 size={22} />
              </span>
              <div>
                <strong style={{ fontSize: "20px", color: "#0f172a", display: "block" }}>1,200+</strong>
                <small style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>Accredited Universities</small>
              </div>
            </div>

            <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fff7ed", color: "#ea580c", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <BookOpen size={22} />
              </span>
              <div>
                <strong style={{ fontSize: "20px", color: "#0f172a", display: "block" }}>24,270+</strong>
                <small style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>Verified Degree Programmes</small>
              </div>
            </div>

            <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Globe2 size={22} />
              </span>
              <div>
                <strong style={{ fontSize: "20px", color: "#0f172a", display: "block" }}>160+</strong>
                <small style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>Countries Represented</small>
              </div>
            </div>

            <div style={{ padding: "16px 20px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ width: "42px", height: "42px", borderRadius: "10px", background: "#fdf2f8", color: "#db2777", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Award size={22} />
              </span>
              <div>
                <strong style={{ fontSize: "20px", color: "#0f172a", display: "block" }}>$3,500/yr</strong>
                <small style={{ color: "#64748b", fontSize: "12px", fontWeight: "600" }}>Avg. Indicative Tuition in USD</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Explore Academic Disciplines in India ────────────────── */}
      <section style={{ padding: "64px 0", background: "#ffffff" }}>
        <div className="portal-shell">
          <div className="reference-heading" data-reveal>
            <span style={{ color: "#ea580c" }}>ACADEMIC EXCELLENCE</span>
            <h2>Top Study Disciplines in India</h2>
            <p>Explore world-class academic avenues from STEM and Artificial Intelligence to Classical Indian Knowledge Systems.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginTop: "36px" }}>
            {disciplines.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.title}
                  data-reveal
                  style={{
                    padding: "24px",
                    borderRadius: "14px",
                    background: "#ffffff",
                    border: `1px solid ${d.border}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.22s ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <span style={{ width: "44px", height: "44px", borderRadius: "10px", background: d.bg, color: d.color, display: "grid", placeItems: "center" }}>
                        <Icon size={22} />
                      </span>
                      <span style={{ fontSize: "11.5px", fontWeight: "800", color: d.color, background: d.bg, padding: "3px 10px", borderRadius: "100px" }}>
                        {d.count}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>{d.title}</h3>
                    <p style={{ color: "#64748b", fontSize: "13px", lineHeight: 1.6, margin: 0 }}>{d.desc}</p>
                  </div>
                  <div style={{ marginTop: "18px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                    <Link
                      to="/courses"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        color: d.color,
                        fontWeight: "750",
                        fontSize: "12.5px",
                        textDecoration: "none",
                      }}
                    >
                      Browse Programmes <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6-Step Admission Roadmap ─────────────────────────────── */}
      <section className="journey-section">
        <div className="portal-shell">
          <div className="reference-heading" data-reveal>
            <span>{t("roadmap.eyebrow", "YOUR ROADMAP")}</span>
            <h2>{t("roadmap.title", "Steps to study in India")}</h2>
            <p>From initial registration to airport arrival and campus hostel onboarding — a clear 6-step roadmap.</p>
          </div>
          <div className="reference-steps">
            {steps.map(([Icon, title, text], index) => {
              const I = Icon as typeof Users;
              return (
                <article key={String(title)} data-reveal>
                  <div>
                    <b>STEP {index + 1}</b>
                    <I size={25} />
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                  {index < steps.length - 1 && <ArrowRight className="step-arrow" size={17} />}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Why Study in India (Cultural & Academic Pillars) ─────── */}
      <section className="why-reference" style={{ position: "relative", overflow: "hidden" }}>
        <div className="portal-shell">
          <div className="reference-heading light" data-reveal>
            <span>{t("why.eyebrow", "DISCOVER THE DIFFERENCE")}</span>
            <h2>{t("why.title", "Why Study in India?")}</h2>
            <p style={{ color: "#d1e4e1" }}>An unparalleled blend of ancient academic heritage, modern technological leadership, and warm hospitality.</p>
          </div>
          <div className="why-reference-grid">
            {[
              [GraduationCap, "Global Academic Prestige", "Learn from internationally recognised institutions with high NAAC A++ ratings, NIRF Top rankings, and English-taught curricula."],
              [Sparkles, "Rich Cultural Fabric", "Experience India’s 28 states, vibrant festivals, 5,000-year philosophical roots, and peaceful campus communities."],
              [BadgeIndianRupee, "Value & Affordability", "Save up to 70% in tuition compared to Western destinations without compromising on laboratory infrastructure and faculty standards."],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof GraduationCap;
              return (
                <article key={String(title)} data-reveal>
                  <I size={32} />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── International Scholar Voices (Testimonials) ─────────── */}
      <section style={{ padding: "68px 0", background: "#f8fafc" }}>
        <div className="portal-shell">
          <div className="reference-heading" data-reveal>
            <span style={{ color: "#0b655d" }}>SCHOLAR VOICES</span>
            <h2>What International Students Say</h2>
            <p>Read real stories from foreign scholars currently pursuing their degrees in top Indian universities.</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "22px", marginTop: "36px" }}>
            {scholarTestimonials.map((s) => (
              <div
                key={s.name}
                data-reveal
                style={{
                  padding: "26px",
                  borderRadius: "14px",
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Quote size={24} color="#0b655d" style={{ opacity: 0.3, marginBottom: "12px" }} />
                  <p style={{ color: "#334155", fontSize: "13.5px", lineHeight: 1.65, fontStyle: "italic", margin: "0 0 16px" }}>
                    "{s.quote}"
                  </p>
                </div>
                <div style={{ paddingTop: "14px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <strong style={{ fontSize: "14px", color: "#0f172a" }}>{s.name}</strong>
                      <img src={`https://flagcdn.com/w40/${s.flag}.png`} alt={s.country} style={{ width: "16px", height: "11px", borderRadius: "1px" }} />
                    </div>
                    <small style={{ color: "#64748b", fontSize: "11.5px", display: "block" }}>{s.program}</small>
                    <small style={{ color: "#0b655d", fontSize: "11.5px", fontWeight: "700" }}>{s.university}</small>
                  </div>
                  <span style={{ padding: "4px 8px", borderRadius: "6px", background: "#f0fdfa", color: "#0b655d", fontSize: "11px", fontWeight: "800", border: "1px solid #ccfbf1", whiteSpace: "nowrap" }}>
                    {s.scholarship}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Events & Guidance Webinars ───────────────────────────── */}
      <section className="events-reference">
        <div className="portal-shell">
          <div className="reference-heading" data-reveal>
            <span>{t("events.eyebrow", "EVENTS & WEBINARS")}</span>
            <h2>{t("events.title", "Step into your academic future.")}</h2>
            <p>Meet university deans, learn about scholarships, and prepare questions for your international education journey.</p>
          </div>
          <article data-reveal>
            <div>
              <Landmark size={30} />
              <span>
                <strong>Global Virtual Education Fairs 2026-27</strong>
                <small>Meet 50+ accredited Indian universities and get instant on-the-spot offer assessments.</small>
              </span>
            </div>
            <Link to="/register/student">
              {t("events.cta", "Register interest")} <ArrowRight size={15} />
            </Link>
          </article>
        </div>
      </section>

      {/* Floating Apply Button */}
      <Link className="floating-apply" to="/register/student">
        <Plane size={17} /> {t("hero.apply", "Apply Now")}
      </Link>
    </div>
  );
}
