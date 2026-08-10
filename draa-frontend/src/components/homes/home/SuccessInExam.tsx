import React from'react';
import { Link } from'react-router-dom';
import {
  CheckCircle2,
  PlayCircle,
  LayoutList,
  MessageCircle,
  BarChart3,
  Smartphone,
} from'lucide-react';
import'./SuccessInExam.css';

/*  Large Right-Side Illustration  */
const ExamPrepIllustration = () => (
  <svg
    viewBox="0 0 520 420"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="success-hero-svg"
    aria-hidden="true"
  >
    {/*  Background shapes  */}
    <circle cx="400" cy="80" r="60" fill="#f7f1e5"/>
    <circle cx="440" cy="360" r="40" fill="#fde2e8" fillOpacity="0.6"/>
    <circle cx="60" cy="340" r="30" fill="#fef9c3" fillOpacity="0.5"/>
    <circle cx="80" cy="80" r="20" fill="#dcfce7" fillOpacity="0.6"/>
    <rect x="30" y="140" width="60" height="60" rx="12" fill="#f0fdf4" transform="rotate(-15 30 140)"/>
    <rect x="420" y="240" width="50" height="50" rx="10" transform="rotate(10 420 240)" fill="#fff7ed"/>

    {/*  Main desk/workspace  */}
    {/* Desk surface */}
    <rect x="80" y="300" width="360" height="16" rx="8" fill="#e2e8f0"/>
    <rect x="80" y="300" width="360" height="8" rx="4" fill="#cbd5e1"/>

    {/* Laptop */}
    <rect x="140" y="220" width="200" height="130" rx="12" fill="#1e293b"/>
    <rect x="150" y="228" width="180" height="105" rx="6" fill="#0f172a"/>
    {/* Screen glow */}
    <rect x="155" y="233" width="170" height="95" rx="4" fill="#1e3a8a" fillOpacity="0.4"/>
    {/* Code lines on screen */}
    <rect x="162" y="245" width="80" height="6" rx="3" fill="#bd7b20" fillOpacity="0.5"/>
    <rect x="162" y="256" width="120" height="6" rx="3" fill="#d4a554" fillOpacity="0.4"/>
    <rect x="162" y="267" width="100" height="6" rx="3" fill="#d4a554" fillOpacity="0.4"/>
    <rect x="162" y="278" width="60" height="6" rx="3" fill="#22c55e" fillOpacity="0.4"/>
    <rect x="162" y="289" width="90" height="6" rx="3" fill="#bd7b20" fillOpacity="0.5"/>
    <rect x="162" y="300" width="70" height="6" rx="3" fill="#d4a554" fillOpacity="0.4"/>
    {/* Play button overlay on screen */}
    <circle cx="280" cy="280" r="24" fill="#bd7b20" fillOpacity="0.25"/>
    <circle cx="280" cy="280" r="16" fill="#bd7b20"/>
    <polygon points="277,274 277,286 288,280" fill="white"/>
    {/* Laptop base */}
    <rect x="120" y="350" width="240" height="12" rx="6" fill="#334155"/>
    <rect x="160" y="355" width="160" height="6" rx="3" fill="#475569"/>

    {/*  Book stack left of laptop  */}
    <rect x="60" y="272" width="70" height="28" rx="4" fill="#bd7b20"/>
    <rect x="63" y="275" width="64" height="4" rx="2" fill="white" fillOpacity="0.4"/>
    <rect x="63" y="282" width="50" height="3" rx="1.5" fill="white" fillOpacity="0.25"/>

    <rect x="62" y="246" width="68" height="26" rx="4" fill="#f97316"/>
    <rect x="65" y="249" width="62" height="4" rx="2" fill="white" fillOpacity="0.4"/>
    <rect x="65" y="256" width="48" height="3" rx="1.5" fill="white" fillOpacity="0.25"/>

    <rect x="58" y="222" width="72" height="24" rx="4" fill="#22c55e"/>
    <rect x="61" y="225" width="66" height="4" rx="2" fill="white" fillOpacity="0.4"/>
    <rect x="61" y="232" width="46" height="3" rx="1.5" fill="white" fillOpacity="0.25"/>

    {/*  Floating chart card right side  */}
    <rect x="360" y="100" width="130" height="110" rx="14" fill="white" filter="url(#shadow)"/>
    <rect x="375" y="115" width="70" height="6" rx="3" fill="#e2e8f0"/>
    {/* Bar chart */}
    <rect x="372" y="155" width="18" height="40" rx="4" fill="#e3d0ad"/>
    <rect x="372" y="175" width="18" height="20" rx="4" fill="#bd7b20"/>
    <rect x="395" y="140" width="18" height="55" rx="4" fill="#e3d0ad"/>
    <rect x="395" y="160" width="18" height="35" rx="4" fill="#bd7b20"/>
    <rect x="418" y="125" width="18" height="70" rx="4" fill="#e3d0ad"/>
    <rect x="418" y="145" width="18" height="50" rx="4" fill="#d4a554"/>
    <rect x="441" y="150" width="18" height="45" rx="4" fill="#e3d0ad"/>
    <rect x="441" y="165" width="18" height="30" rx="4" fill="#bd7b20"/>
    {/* Trend line */}
    <path d="M376 160 L400 140 L423 150 L460 120" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="460" cy="120" r="4" fill="#22c55e"/>

    {/*  Notification / bell card top  */}
    <rect x="340" y="35" width="100" height="55" rx="12" fill="white" filter="url(#shadow2)"/>
    <circle cx="362" cy="62" r="14" fill="#ef4444" fillOpacity="0.1"/>
    <path d="M362 52 C352 52 344 58 344 64 L344 68 L347 68 L348 72 L376 72 L377 68 L380 68 L380 64 C380 58 372 52 362 52 Z" fill="#ef4444"/>
    <circle cx="376" cy="55" r="7" fill="#ef4444"/>
    <text x="376" y="59.5" textAnchor="middle" fill="white" fontSize="9" fontWeight="800">3</text>
    <rect x="382" y="56" width="46" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="382" y="64" width="32" height="3" rx="1.5" fill="#f1f5f9"/>

    {/*  Floating phone bottom right  */}
    <rect x="430" y="270" width="52" height="90" rx="10" fill="#1e293b"/>
    <rect x="434" y="276" width="44" height="74" rx="6" fill="#0f172a"/>
    <rect x="434" y="276" width="44" height="30" rx="4" fill="#bd7b20" fillOpacity="0.3"/>
    {/* Play on phone */}
    <circle cx="456" cy="291" r="12" fill="#bd7b20"/>
    <polygon points="453,286 453,296 462,291" fill="white"/>
    {/* Content lines */}
    <rect x="440" y="312" width="32" height="4" rx="2" fill="#334155"/>
    <rect x="440" y="320" width="26" height="3" rx="1.5" fill="#475569"/>
    <rect x="440" y="327" width="28" height="3" rx="1.5" fill="#475569"/>
    {/* Home button */}
    <rect x="446" y="354" width="20" height="3" rx="1.5" fill="#475569"/>

    {/*  Floating elements  */}
    {/* Star 1 */}
    <path d="M50 120 L52 125 L57.5 125.5 L54 129 L55 135 L50 132.5 L45 135 L46 129 L42.5 125.5 L48 125 Z" fill="#fbbf24" fillOpacity="0.8"/>
    {/* Star 2 */}
    <path d="M460 200 L461.5 204 L466 204.3 L462.5 207.5 L463.5 212 L460 209.5 L456.5 212 L457.5 207.5 L454 204.3 L458.5 204 Z" fill="#bd7b20" fillOpacity="0.6"/>
    {/* Check badge */}
    <circle cx="310" cy="80" r="18" fill="#dcfce7"/>
    <circle cx="310" cy="80" r="12" fill="#22c55e"/>
    <path d="M305 80 L308.5 83.5 L316 76" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Pencil / note */}
    <rect x="90" y="170" width="40" height="50" rx="6" fill="white" filter="url(#shadow2)"/>
    <rect x="98" y="180" width="24" height="4" rx="2" fill="#e2e8f0"/>
    <rect x="98" y="190" width="20" height="3" rx="1.5" fill="#f1f5f9"/>
    <rect x="98" y="197" width="22" height="3" rx="1.5" fill="#f1f5f9"/>
    <rect x="98" y="204" width="16" height="3" rx="1.5" fill="#f1f5f9"/>
    {/* Award ribbon */}
    <circle cx="440" cy="390" r="20" fill="#fef3c7"/>
    <circle cx="440" cy="390" r="13" fill="#f59e0b"/>
    <path d="M433 395 L440 410 L447 395" fill="#f59e0b"/>
    <path d="M435 395 L440 408 L445 395" fill="#d97706"/>

    {/* Filters */}
    <defs>
      <filter id="shadow" x="0" y="0" width="140" height="120" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.08"/>
      </filter>
      <filter id="shadow2" x="0" y="0" width="110" height="65" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.07"/>
      </filter>
    </defs>
  </svg>
);

const featureItems = [
  { icon: <PlayCircle size={22} color="#bd7b20" />, title:"Expert-Led Video Classes", desc:"Top educators with proven success records." },
  { icon: <LayoutList size={22} color="#f97316" />, title:"Structured Curriculum", desc:"Planned syllabus  no topic left behind." },
  { icon: <MessageCircle size={22} color="#22c55e" />, title:"Live Doubt Solving", desc:"Real-time sessions with subject experts." },
  { icon: <BarChart3 size={22} color="#ec4899" />, title:"Performance Tracking", desc:"Detailed analytics on every test." },
  { icon: <Smartphone size={22} color="#eab308" />, title:"Flexible Access", desc:"Learn anywhere, anytime on any device." },
];

const SuccessInExam = () => {
  return (
    <section className="success-exam-section">
      <div className="container">
        <div className="success-split-layout">

          {/*  LEFT: Content  */}
          <div className="success-content-side">
            <div className="success-eyebrow">
              <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#bd7b20"/></svg>
              <span>Why Draa?</span>
            </div>
            <h2 className="success-main-title">
              Everything You Need to<br/>
              <span className="title-accent">Succeed in Your Exams</span>
            </h2>
            <p className="success-sub-text">
              From video lessons to mock tests  our all-in-one platform gives you
              every tool toppers use to crack India's toughest exams.
            </p>

            {/* Feature list */}
            <div className="success-feature-list">
              {featureItems.map((item, i) => (
                <div key={i} className="success-feature-row">
                  <div className="success-feature-icon">{item.icon}</div>
                  <div>
                    <h5 className="success-feature-title">{item.title}</h5>
                    <p className="success-feature-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="success-cta-row">
              <Link to="/courses" className="success-primary-btn">
                Explore Courses
              </Link>
              <div className="success-trust-pill">
                <CheckCircle2 size={14} color="#22c55e" />
                <span>10,000+ students trust us</span>
              </div>
            </div>
          </div>

          {/*  RIGHT: Illustration  */}
          <div className="success-illustration-side">
            <ExamPrepIllustration />
          </div>

        </div>
      </div>
    </section>
  );
};

export default SuccessInExam;
