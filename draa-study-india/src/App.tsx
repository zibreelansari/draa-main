import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Compass,
  FileCheck2,
  GraduationCap,
  Landmark,
  Languages,
  LogIn,
  MapPin,
  Menu,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

const journey = [
  [Users, "Register & create profile", "Start with your basic academic and passport information."],
  [Search, "Explore programmes", "Compare disciplines, levels and participating institutions."],
  [FileCheck2, "Submit applications", "Organise preferences and send applications from one place."],
  [CheckCircle2, "Review your offers", "Compare eligible offers and choose the right academic fit."],
  [Plane, "Prepare visa & travel", "Follow a clear document and pre-departure checklist."],
  [ShieldCheck, "Arrival support", "Understand onboarding, accommodation and FRRO responsibilities."],
];

const disciplines = [
  ["Engineering & Technology", "Programmes in computing, design, manufacturing and emerging technology."],
  ["Business & Management", "Undergraduate and postgraduate pathways for modern organisations."],
  ["Sciences & Research", "Academic programmes across natural, applied and interdisciplinary sciences."],
  ["Arts & Humanities", "Culture, communication, languages, social sciences and creative practice."],
  ["Health & Life Sciences", "Selected allied-health, pharmacy, life-science and public-health pathways."],
  ["Yoga & Indian Knowledge", "Distinctive programmes rooted in India’s knowledge and wellness traditions."],
];

const institutions = [
  ["Research universities", "Multidisciplinary campuses with advanced teaching and research ecosystems.", "/media/university-building.jpg"],
  ["Technology institutes", "Innovation-led environments across engineering, computing and applied sciences.", "/media/campus-students.jpg"],
  ["Specialist institutions", "Focused programmes in management, design, languages and professional fields.", "/media/books-library.jpg"],
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const nodes = document.querySelectorAll<HTMLElement>("[data-reveal]");
    nodes.forEach((node, index) => {
      node.classList.add("reveal-ready");
      node.style.setProperty("--delay", `${Math.min(index % 4, 3) * 60}ms`);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: "0px 0px -7%" });
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const demoAction = (label: string) => setNotice(`${label} will be connected in the next development phase.`);

  return (
    <div className="portal">
      <a className="skip-link" href="#main">Skip to main content</a>
      <div className="demo-bar">
        <div className="shell">
          <span><Sparkles size={14} /> Independent demonstration portal by DRAA</span>
          <a href="http://localhost:5173">Return to DRAA corporate site <ArrowRight size={13} /></a>
        </div>
      </div>
      <header>
        <div className="shell header-main">
          <a className="brand" href="#top" aria-label="DRAA Study in India home">
            <img src="/media/draa-mark.png" alt="" />
            <span><strong>DRAA</strong><small>STUDY IN INDIA</small></span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="#why">Why India</a>
            <a href="#institutions">Institutions</a>
            <a href="#programmes">Programmes</a>
            <a href="#journey">How to apply</a>
            <a href="#support">Student support</a>
          </nav>
          <div className="header-actions">
            <button className="login" onClick={() => demoAction("Student login")}><LogIn size={15} /> Login</button>
            <button className="register" onClick={() => demoAction("Registration")}>Register now <ArrowRight size={15} /></button>
          </div>
          <button className="menu-button" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="#why" onClick={() => setMenuOpen(false)}>Why India</a><a href="#institutions" onClick={() => setMenuOpen(false)}>Institutions</a><a href="#programmes" onClick={() => setMenuOpen(false)}>Programmes</a><a href="#journey" onClick={() => setMenuOpen(false)}>How to apply</a><a href="#support" onClick={() => setMenuOpen(false)}>Student support</a>
          <button onClick={() => demoAction("Registration")}>Register now</button>
        </nav>}
      </header>

      <main id="main">
        <section id="top" className="hero">
          <img className="hero-image" src="/media/study-india-campus.png" alt="International students exploring higher education opportunities in India" />
          <div className="hero-shade" />
          <div className="shell hero-content">
            <span className="eyebrow">YOUR EDUCATION JOURNEY TO INDIA</span>
            <h1>Discover learning.<br /><em>Experience India.</em></h1>
            <p>Explore universities, programmes and practical guidance for building your international education journey in India.</p>
            <form className="course-search" onSubmit={(event) => { event.preventDefault(); demoAction("Course search"); }}>
              <Search size={21} />
              <label><span>What would you like to study?</span><input aria-label="Search courses" placeholder="Search by programme or discipline" /></label>
              <label><span>Study level</span><select aria-label="Study level"><option>All levels</option><option>Undergraduate</option><option>Postgraduate</option><option>Doctoral</option></select></label>
              <button>Explore programmes <ArrowRight size={16} /></button>
            </form>
            <div className="hero-facts">
              <span><strong>UG · PG · PhD</strong><small>Multiple study levels</small></span>
              <span><strong>Across India</strong><small>Diverse academic destinations</small></span>
              <span><strong>One journey</strong><small>Discovery to arrival guidance</small></span>
            </div>
          </div>
        </section>

        <section className="quick-paths">
          <div className="shell">
            {[[GraduationCap,"Find a programme","Search by subject and level"],[Building2,"Explore institutions","Compare academic environments"],[BadgeIndianRupee,"Plan your budget","Understand fees and living costs"],[CircleHelp,"Get guidance","Prepare documents and next steps"]].map(([Icon,title,text]) => {
              const I = Icon as typeof GraduationCap;
              return <button key={String(title)} onClick={() => demoAction(String(title))}><I size={22}/><span><strong>{String(title)}</strong><small>{String(text)}</small></span><ArrowRight size={16}/></button>;
            })}
          </div>
        </section>

        <section id="why" className="why section">
          <div className="shell why-grid">
            <div className="section-heading" data-reveal><span>WHY STUDY IN INDIA?</span><h2>A world of academic opportunity and cultural discovery.</h2><p>India combines a vast higher-education landscape with diverse communities, contemporary industry connections and distinctive knowledge traditions.</p><a href="#journey">See how the journey works <ArrowRight size={15}/></a></div>
            <div className="why-cards">
              {[[Landmark,"Academic depth","Choose from broad disciplines and recognised programme levels."],[BadgeIndianRupee,"Considered value","Explore education and living-cost options across different cities."],[Languages,"Living culture","Learn within one of the world’s most diverse cultural landscapes."],[Compass,"Future pathways","Connect knowledge with research, entrepreneurship and industry exposure."]].map(([Icon,title,text]) => { const I=Icon as typeof Landmark; return <article key={String(title)} data-reveal><I size={25}/><h3>{String(title)}</h3><p>{String(text)}</p></article>; })}
            </div>
          </div>
        </section>

        <section id="programmes" className="programmes section">
          <div className="shell">
            <div className="section-row" data-reveal><div><span>EXPLORE PROGRAMMES</span><h2>Find the direction that fits your ambition.</h2></div><button onClick={() => demoAction("All programmes")}>View all programmes <ArrowRight size={15}/></button></div>
            <div className="discipline-grid">
              {disciplines.map(([title,text],index) => <button key={title} data-reveal onClick={() => demoAction(title)}><b>0{index+1}</b><BookOpen size={22}/><h3>{title}</h3><p>{text}</p><span>Explore <ArrowRight size={14}/></span></button>)}
            </div>
          </div>
        </section>

        <section id="journey" className="journey section">
          <div className="shell">
            <div className="journey-intro" data-reveal><span>YOUR APPLICATION ROADMAP</span><h2>Six clear stages—from exploration to arrival.</h2><p>This demo mirrors the practical journey international learners need to understand. Application services will be connected in a later phase.</p></div>
            <div className="journey-steps">
              {journey.map(([Icon,title,text],index) => { const I=Icon as typeof Users; return <article key={String(title)} data-reveal><span><b>{index+1}</b><I size={21}/></span><h3>{String(title)}</h3><p>{String(text)}</p>{index<journey.length-1&&<i><ArrowRight size={15}/></i>}</article>; })}
            </div>
          </div>
        </section>

        <section id="institutions" className="institutions section">
          <div className="shell">
            <div className="section-row" data-reveal><div><span>ACADEMIC ENVIRONMENTS</span><h2>Explore institutions across India.</h2></div><p>Discover different learning environments before comparing specific programmes, eligibility criteria and admission requirements.</p></div>
            <div className="institution-grid">
              {institutions.map(([title,text,image]) => <article key={title} data-reveal><img src={image} alt={`${title} in India`}/><div><span><MapPin size={14}/> India</span><h3>{title}</h3><p>{text}</p><button onClick={() => demoAction(title)}>Explore institutions <ArrowRight size={14}/></button></div></article>)}
            </div>
          </div>
        </section>

        <section id="support" className="support section">
          <div className="shell support-grid">
            <div className="support-copy" data-reveal><span>GUIDANCE BEYOND ADMISSION</span><h2>Prepare for the whole student journey.</h2><p>Good decisions require more than a course list. DRAA’s future portal will help learners organise the questions, documents and milestones surrounding their move to India.</p><button onClick={() => demoAction("Student guidance")}>Talk to a guidance expert <ArrowRight size={15}/></button></div>
            <div className="support-list">
              {[[BadgeIndianRupee,"Scholarships & fee planning","Understand scholarship routes, institutional fee waivers and budgeting."],[FileCheck2,"Eligibility & documents","Prepare academic records, passport details and application material."],[Plane,"Visa & pre-departure","Build a practical checklist after receiving an eligible admission offer."],[ShieldCheck,"Arrival & FRRO awareness","Understand the onboarding responsibilities relevant to international students."]].map(([Icon,title,text]) => {const I=Icon as typeof BadgeIndianRupee;return <article key={String(title)} data-reveal><I size={21}/><span><h3>{String(title)}</h3><p>{String(text)}</p></span></article>;})}
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="shell" data-reveal><div><span>READY WHEN YOU ARE</span><h2>Start shaping your study journey.</h2><p>Create a demo profile or speak with DRAA about guidance for studying in India.</p></div><button onClick={() => demoAction("Registration")}>Begin your journey <ArrowRight size={16}/></button></div>
        </section>
      </main>

      <footer>
        <div className="shell footer-grid">
          <div className="footer-brand"><div><img src="/media/draa-mark.png" alt=""/><strong>DRAA Study in India</strong></div><p>An independent demonstration portal for international education guidance.</p></div>
          <div><strong>Explore</strong><a href="#why">Why India</a><a href="#institutions">Institutions</a><a href="#programmes">Programmes</a></div>
          <div><strong>Student journey</strong><a href="#journey">How to apply</a><a href="#support">Scholarships</a><a href="#support">Arrival guidance</a></div>
          <div><strong>Important notice</strong><p>This is not the Government of India Study in India portal and does not process official applications or visas.</p><a href="https://studyinindia.gov.in/" target="_blank" rel="noreferrer">Visit the official government portal <ArrowRight size={13}/></a></div>
        </div>
        <div className="shell footer-bottom"><span>© {new Date().getFullYear()} DRAA (OPC) Private Limited</span><span>Demo experience · New Delhi, India</span></div>
      </footer>

      {notice && <div className="toast" role="status"><span>{notice}</span><button aria-label="Close notification" onClick={() => setNotice("")}><X size={16}/></button></div>}
    </div>
  );
}
