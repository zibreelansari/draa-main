import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Award,
  DollarSign,
  Sparkles,
  Calculator,
  CheckCircle2,
  Calendar,
  FileCheck2,
  ChevronDown,
  ArrowRight,
  TrendingDown,
  Globe2,
  BookOpen,
  Landmark,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";
import "../styles/Scholarships.css";

interface CalculatorState {
  level: "ug" | "pg" | "phd";
  gpaTier: "high" | "mid" | "standard";
  discipline: "stem" | "mgmt" | "med" | "arts";
  currency: "USD" | "INR";
}

const TIERS = [
  {
    code: "G1 Category",
    concession: "100% Free Tuition",
    headline: "Full Tuition Fee Waiver",
    featured: true,
    cohort: "Top 10% International Applicants",
    gpaReq: "GPA 3.8+ / 85%+ or High School Equivalent",
    desc: "Complete exemption from all academic tuition charges across undergraduate, master's, and doctoral degrees at partner universities.",
    points: [
      "100% tuition waiver for the complete standard programme duration.",
      "Allocated automatically based on academic merit via Study in India screening.",
      "Student only pays nominal living/dormitory costs ($100–$150/month).",
      "Renewable each academic year subject to maintaining a 6.5+ CGPA.",
    ],
    ctaText: "Explore G1 Courses",
  },
  {
    code: "G2 Category",
    concession: "50% Tuition Waiver",
    headline: "Half Tuition Fee Concession",
    featured: false,
    cohort: "Next 20% International Applicants",
    gpaReq: "GPA 3.3+ / 75%+ or High School Equivalent",
    desc: "Substantial 50% tuition deduction providing an affordable pathway into India's premier engineering, management, and science institutions.",
    points: [
      "50% deduction applied directly to annual semester invoices.",
      "Covers engineering, computing, commerce, and natural sciences.",
      "Average net annual tuition: only $1,500 – $2,500 USD per year.",
      "High acceptance rate across 100+ accredited partner campuses.",
    ],
    ctaText: "Explore G2 Courses",
  },
  {
    code: "G3 Category",
    concession: "25% Tuition Waiver",
    headline: "Quarter Tuition Fee Concession",
    featured: false,
    cohort: "Next 30% International Applicants",
    gpaReq: "GPA 2.8+ / 60%+ or High School Equivalent",
    desc: "Accessible 25% tuition relief designed to encourage international student diversity across regional hubs and private research institutions.",
    points: [
      "25% tuition fee waiver for all verified international students meeting standard criteria.",
      "Low barrier to entry with straightforward high school certificate verification.",
      "Average net annual tuition: $2,000 – $3,500 USD per year.",
      "Applicable across hundreds of multidisciplinary degree programmes.",
    ],
    ctaText: "Explore G3 Courses",
  },
];

const GOV_SCHOLARSHIPS = [
  {
    name: "ICCR Bilateral Cultural Scholarships",
    org: "Indian Council for Cultural Relations (Ministry of External Affairs)",
    icon: Landmark,
    desc: "India's premier bilateral fully funded scholarship scheme covering over 100 partner nations across Africa, ASEAN, SAARC, Central Asia, and Latin America.",
    highlights: "Full Tuition + Monthly Living Allowance (₹18,000–₹25,000) + Free University Hostel + Annual Book Grant + Return Economy Airfare + Medical Insurance!",
    tags: ["100% Fully Funded", "Living Stipend", "Free Airfare", "Hostel Included"],
  },
  {
    name: "ASEAN-India Research Training Fellowships (AIRTF)",
    org: "Department of Science & Technology (DST) / ASEAN Secretariat",
    icon: Globe2,
    desc: "Dedicated doctoral and postdoctoral research grants for young scientists and engineers from ASEAN member states to conduct cutting-edge laboratory research at premier Indian institutions.",
    highlights: "Full research bench fee waiver + ₹50,000 monthly research stipend + one-time contingency grant of ₹30,000 for laboratory materials and books.",
    tags: ["Doctoral / Postdoc", "₹50,000/mo Grant", "IIT & IISc Labs", "STEM Focus"],
  },
  {
    name: "Quad STEM Fellowship (Australia, India, Japan, US)",
    org: "Quad Leaders Initiative / Schmidt Futures",
    icon: ShieldCheck,
    desc: "An elite fellowship initiative sponsoring outstanding STEM master's and doctoral scholars to accelerate scientific discovery and technological leadership.",
    highlights: "$50,000 USD grant per fellow, cross-cultural leadership events, and direct mentorship from leading scientific advisors and industry CEOs.",
    tags: ["$50,000 Grant", "Global Mentorship", "Apex STEM Degrees"],
  },
  {
    name: "COMPEX & Silver Jubilee Scholarship Schemes",
    org: "Embassy of India (Bilateral Neighbour Schemes)",
    icon: Award,
    desc: "Flagship scholarship initiatives specifically for students from neighbouring countries (Nepal, Bhutan, Bangladesh, Sri Lanka) enrolling in professional degree programmes.",
    highlights: "100% tuition subsidy for B.Tech, MBBS, B.Sc Agriculture, Pharmacy, and Nursing with preferential hostel allotments.",
    tags: ["Bilateral Neighbors", "100% Tuition", "Professional Degrees"],
  },
];

const GLOBAL_COMPARISON = [
  {
    country: "India (with SII Waiver)",
    annualTuition: "$0 – $2,500",
    annualLiving: "$1,800 – $2,400",
    total4Year: "$8,000 – $14,000",
    roi: "Unmatched (500%+ ROI)",
    highlight: true,
  },
  {
    country: "United States",
    annualTuition: "$30,000 – $55,000",
    annualLiving: "$14,000 – $18,000",
    total4Year: "$176,000 – $290,000",
    roi: "High Debt Burden",
    highlight: false,
  },
  {
    country: "United Kingdom",
    annualTuition: "$22,000 – $42,000",
    annualLiving: "$15,000 – $19,000",
    total4Year: "$111,000 – $183,000 (3 yrs)",
    roi: "Moderate ROI",
    highlight: false,
  },
  {
    country: "Canada",
    annualTuition: "$24,000 – $38,000",
    annualLiving: "$13,000 – $16,000",
    total4Year: "$148,000 – $216,000",
    roi: "Escalating Living Costs",
    highlight: false,
  },
  {
    country: "Australia",
    annualTuition: "$25,000 – $42,000",
    annualLiving: "$16,000 – $20,000",
    total4Year: "$164,000 – $248,000",
    roi: "High Initial Investment",
    highlight: false,
  },
  {
    country: "Germany (Public)",
    annualTuition: "$0 – $3,500",
    annualLiving: "$12,000 – $14,000",
    total4Year: "$50,000 – $65,000",
    roi: "Language Barrier / Living Cost",
    highlight: false,
  },
];

const TIMELINE = [
  {
    step: "1",
    phase: "Portal Registration",
    date: "Jan – April",
    desc: "Create your official Study in India profile, select your preferred degrees, and upload academic transcripts for preliminary evaluation.",
  },
  {
    step: "2",
    phase: "PRATIBHA Exam / Screening",
    date: "May – June",
    desc: "Direct evaluation of high school/bachelor credentials. Select disciplines may invite applicants for the online PRATIBHA evaluation.",
  },
  {
    step: "3",
    phase: "Waiver Allotment & Offer",
    date: "June – July",
    desc: "Universities release provisional admission letters with confirmed Study in India Fee Waiver tiers (G1, G2, or G3).",
  },
  {
    step: "4",
    phase: "Visa & Campus Onboarding",
    date: "July – August",
    desc: "Receive your official visa invitation letter, obtain your Indian Student Visa, and arrive on campus for welcome orientation.",
  },
];

const CHECKLIST = [
  {
    title: "Official Academic Transcripts",
    desc: "Certified high school diploma (for UG) or bachelor's degree transcripts (for PG) with minimum required percentage/GPA.",
  },
  {
    title: "Valid International Passport",
    desc: "Passport must have at least 18 months of remaining validity from the date of proposed commencement.",
  },
  {
    title: "Statement of Purpose (SOP)",
    desc: "A 500-word personal essay outlining academic goals, interest in India, and how the chosen degree aligns with your career.",
  },
  {
    title: "AIU Equivalence Certificate",
    desc: "Association of Indian Universities certification confirming home diploma equivalence (assisted directly by DRAA advisors).",
  },
  {
    title: "Two Letters of Recommendation",
    desc: "From former high school teachers, department professors, or academic mentors endorsing your character and diligence.",
  },
  {
    title: "Medical Fitness Certificate",
    desc: "Standard health screening report confirming fitness for study abroad from an authorized medical practitioner.",
  },
];

const FAQS = [
  {
    q: "Does the G1 Fee Waiver cover hostel accommodation and food?",
    a: "The Study in India G1 Fee Waiver covers 100% of the institutional tuition fees for the entire duration of the programme. Accommodation, meal plans, and personal expenses are payable by the student, averaging a very economical $100 to $180 USD per month depending on the city. In contrast, ICCR scholarships do provide fully covered hostel accommodation and monthly living stipends.",
  },
  {
    q: "Do I have to reapply for my Study in India Fee Waiver every year?",
    a: "No, you do not need to reapply each year. Your fee waiver is locked in for the entire standard duration of your degree programme (e.g., 4 years for B.Tech, 2 years for Master's). However, you must maintain satisfactory academic progress, which is typically a minimum Cumulative Grade Point Average (CGPA) of 6.5 or 60% with zero standing backlogs.",
  },
  {
    q: "Are fee waivers available for clinical Medical (MBBS) and Dental (BDS) degrees?",
    a: "Due to statutory regulations established by the National Medical Commission (NMC) and Dental Council of India, MBBS and BDS programmes are excluded from the general SII G-tier tuition waivers. However, substantial scholarships are widely available for Allied Medical Sciences, Biotechnology, Biomedical Engineering, Pharmacy, Nursing, and Public Health.",
  },
  {
    q: "Can I work part-time in India while studying on a scholarship?",
    a: "Under current Indian immigration (FRRO) regulations, holders of a Student Visa are not permitted to engage in commercial off-campus employment. However, universities actively facilitate on-campus research assistantships, paid library apprenticeships, industrial internships, and semester incubation projects.",
  },
  {
    q: "Can I hold both a Study in India Fee Waiver and an ICCR scholarship simultaneously?",
    a: "No, students cannot combine multiple government awards. Since ICCR already covers 100% tuition, living stipends, and accommodation, it cannot be combined with an SII waiver. However, students may combine an institutional university scholarship (such as a Dean's Award) with private foundation grants.",
  },
];

export default function ScholarshipsPage() {
  const [calcState, setCalcState] = useState<CalculatorState>({
    level: "ug",
    gpaTier: "high",
    discipline: "stem",
    currency: "USD",
  });
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Compute calculator result
  const isHigh = calcState.gpaTier === "high";
  const isMid = calcState.gpaTier === "mid";

  let tierCode = "G1 Category";
  let tierConcession = "100% Full Tuition Waiver";
  let savingsUSD = "$4,000 – $6,500 / year";
  let savingsINR = "₹3,30,000 – ₹5,40,000 / year";
  let netUSD = "$0 (100% Free Tuition)";
  let netINR = "₹0 (100% Free Tuition)";

  if (isMid) {
    tierCode = "G2 Category";
    tierConcession = "50% Tuition Waiver";
    savingsUSD = "$2,000 – $3,250 / year";
    savingsINR = "₹1,65,000 – ₹2,70,000 / year";
    netUSD = "$2,000 – $3,250 / year";
    netINR = "₹1,65,000 – ₹2,70,000 / year";
  } else if (!isHigh && !isMid) {
    tierCode = "G3 Category";
    tierConcession = "25% Tuition Waiver";
    savingsUSD = "$1,000 – $1,600 / year";
    savingsINR = "₹80,000 – ₹1,35,000 / year";
    netUSD = "$3,000 – $4,800 / year";
    netINR = "₹2,50,000 – ₹4,00,000 / year";
  }

  function toggleFaq(index: number) {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  }

  return (
    <div className="scholarships-page">
      {/* ════════════════ HERO BANNER ════════════════ */}
      <section className="sc-hero">
        <img
          className="sc-hero-bg"
          src="/media/scholarship-banner.jpg"
          alt="International graduates celebrating convocation"
        />
        <div className="sc-hero-overlay" />
        <div className="portal-shell">
          <div className="sc-eyebrow">
            <Sparkles size={14} color="#ffb07b" />
            <span>OFFICIAL STUDY IN INDIA & GOVERNMENT FINANCIAL AID</span>
          </div>

          <h1 className="sc-hero-title">
            Study in India Scholarships, Fee Waivers & Global Fellowships
          </h1>
          <p className="sc-hero-desc">
            Access merit-based tuition fee concessions up to 100%, fully funded government cultural exchange scholarships,
            and research stipends across 160+ partner countries.
          </p>

          {/* Quick Metrics */}
          <div className="sc-hero-metrics">
            <div className="sc-metric-chip">
              <Award size={16} color="#34d399" />
              <span><strong>100%</strong> Tuition Waiver (G1 Tier)</span>
            </div>
            <div className="sc-metric-chip">
              <TrendingDown size={16} color="#60a5fa" />
              <span><strong>15,000+</strong> Annual Fee Waivers</span>
            </div>
            <div className="sc-metric-chip">
              <DollarSign size={16} color="#fbbf24" />
              <span><strong>$0</strong> Application Fee on SII</span>
            </div>
            <div className="sc-metric-chip">
              <Globe2 size={16} color="#f472b6" />
              <span><strong>160+</strong> Eligible Jurisdictions</span>
            </div>
          </div>

          <div className="sc-hero-actions">
            <a href="#calculator" className="sc-btn-primary">
              <Calculator size={17} />
              <span>Calculate My Fee Waiver</span>
            </a>
            <Link to="/courses?scholarshipOnly=true" className="sc-btn-secondary">
              <BookOpen size={17} />
              <span>Explore Eligible Courses</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════ 1. INTERACTIVE SCHOLARSHIP CALCULATOR ════════════════ */}
      <section id="calculator" className="sc-section">
        <div className="portal-shell">
          <div className="sc-section-header">
            <span className="sc-section-badge">INTERACTIVE ESTIMATOR</span>
            <h2>Calculate Your Study in India Fee Waiver & Annual Savings</h2>
            <p>
              Select your academic background and preferred discipline to see your estimated concession tier and net payable tuition.
            </p>
          </div>

          <div className="sc-calculator-card">
            {/* Left inputs */}
            <div className="sc-calc-inputs">
              <div className="sc-input-group">
                <label>1. Select Your Study Level</label>
                <div className="sc-pill-selector">
                  {[
                    { id: "ug", label: "Undergraduate (UG)" },
                    { id: "pg", label: "Postgraduate (Master's)" },
                    { id: "phd", label: "Doctoral (Ph.D.)" },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      className={`sc-select-pill ${calcState.level === lvl.id ? "active" : ""}`}
                      onClick={() => setCalcState({ ...calcState, level: lvl.id as any })}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sc-input-group">
                <label>2. Your Academic Performance / Grade Average</label>
                <div className="sc-pill-selector">
                  {[
                    { id: "high", label: "GPA 3.8+ or 85%+ (Top 10%)" },
                    { id: "mid", label: "GPA 3.3+ or 75%+ (Top 30%)" },
                    { id: "standard", label: "GPA 2.8+ or 60%+ (Standard)" },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className={`sc-select-pill ${calcState.gpaTier === g.id ? "active" : ""}`}
                      onClick={() => setCalcState({ ...calcState, gpaTier: g.id as any })}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sc-input-group">
                <label>3. Preferred Academic Discipline</label>
                <div className="sc-pill-selector">
                  {[
                    { id: "stem", label: "Engineering, AI & Computing" },
                    { id: "mgmt", label: "Business & Management (MBA)" },
                    { id: "med", label: "Pharmacy & Allied Health" },
                    { id: "arts", label: "Humanities, Law & Design" },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      className={`sc-select-pill ${calcState.discipline === d.id ? "active" : ""}`}
                      onClick={() => setCalcState({ ...calcState, discipline: d.id as any })}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sc-input-group">
                <label>Display Currency</label>
                <div className="sc-pill-selector">
                  <button
                    type="button"
                    className={`sc-select-pill ${calcState.currency === "USD" ? "active" : ""}`}
                    onClick={() => setCalcState({ ...calcState, currency: "USD" })}
                  >
                    USD ($)
                  </button>
                  <button
                    type="button"
                    className={`sc-select-pill ${calcState.currency === "INR" ? "active" : ""}`}
                    onClick={() => setCalcState({ ...calcState, currency: "INR" })}
                  >
                    INR (₹)
                  </button>
                </div>
              </div>
            </div>

            {/* Right result box */}
            <div className="sc-calc-result-box">
              <div className={`sc-result-tier-badge ${isHigh ? "g1" : ""}`}>
                <Award size={14} />
                <span>{tierCode} Eligible</span>
              </div>
              <h3 className="sc-result-headline">{tierConcession}</h3>
              <p className="sc-result-sub">
                Based on your selected credentials, you are well within the eligibility threshold for this national fee concession.
              </p>

              <div className="sc-result-stats">
                <div className="sc-res-stat">
                  <span>Estimated Annual Savings</span>
                  <strong>{calcState.currency === "USD" ? savingsUSD : savingsINR}</strong>
                </div>
                <div className="sc-res-stat">
                  <span>Net Payable Tuition</span>
                  <strong>{calcState.currency === "USD" ? netUSD : netINR}</strong>
                </div>
              </div>

              <Link to="/courses?scholarshipOnly=true" className="sc-calc-cta">
                <span>View Eligible Programmes with this Waiver</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ 2. THE THREE CONCESSION TIERS ════════════════ */}
      <section className="sc-section sc-section-alt">
        <div className="portal-shell">
          <div className="sc-section-header">
            <span className="sc-section-badge">OFFICIAL FEE SUPPORT</span>
            <h2>Study in India (SII) Concession Tiers (G1, G2, G3)</h2>
            <p>
              Under the Ministry of Education's flagship initiative, partner universities allocate designated quotas
              providing 25% to 100% academic fee relief.
            </p>
          </div>

          <div className="sc-tiers-grid">
            {TIERS.map((tier) => (
              <div key={tier.code} className={`sc-tier-card ${tier.featured ? "featured" : ""}`}>
                {tier.featured && <div className="sc-tier-badge-top">Most Popular</div>}
                <span className="sc-tier-code">{tier.code}</span>
                <h3>{tier.headline}</h3>
                <div className="sc-tier-concession">{tier.concession}</div>
                <p>{tier.desc}</p>
                <ul className="sc-tier-points">
                  {tier.points.map((pt, idx) => (
                    <li key={idx}>
                      <CheckCircle2 size={15} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/courses?scholarshipOnly=true" className="sc-tier-apply-btn">
                  <span>{tier.ctaText}</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 3. GOVERNMENT & BILATERAL SCHOLARSHIPS ════════════════ */}
      <section className="sc-section">
        <div className="portal-shell">
          <div className="sc-section-header">
            <span className="sc-section-badge">GOVERNMENT FELLOWSHIPS</span>
            <h2>Fully Funded Bilateral & Multilateral Scholarship Schemes</h2>
            <p>
              In addition to institutional fee waivers, the Government of India provides fully funded cultural and scientific exchange awards.
            </p>
          </div>

          <div className="sc-gov-grid">
            {GOV_SCHOLARSHIPS.map((sch, index) => {
              const Icon = sch.icon;
              return (
                <div key={index} className="sc-gov-card">
                  <div className="sc-gov-card-header">
                    <div className="sc-gov-icon">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3>{sch.name}</h3>
                      <span>{sch.org}</span>
                    </div>
                  </div>
                  <p>{sch.desc}</p>
                  <div className="sc-gov-highlights">
                    <strong>Grant Benefits:</strong>
                    <p>{sch.highlights}</p>
                  </div>
                  <div className="sc-gov-coverage-tags">
                    {sch.tags.map((tag, i) => (
                      <span key={i} className="sc-cov-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ 4. GLOBAL COST OF LIVING & ROI COMPARISON ════════════════ */}
      <section className="sc-section sc-section-alt">
        <div className="portal-shell">
          <div className="sc-section-header">
            <span className="sc-section-badge">GLOBAL BENCHMARK</span>
            <h2>Affordability & Return on Investment: India vs Western Destinations</h2>
            <p>
              See how overall educational expenditure in India compares with studying in North America, Europe, and Australasia.
            </p>
          </div>

          <div className="sc-table-container">
            <table className="sc-table">
              <thead>
                <tr>
                  <th>Country / Destination</th>
                  <th>Annual Tuition (USD)</th>
                  <th>Annual Living Expenses (USD)</th>
                  <th>Estimated Total 4-Year Cost</th>
                  <th>Financial ROI Outlook</th>
                </tr>
              </thead>
              <tbody>
                {GLOBAL_COMPARISON.map((row, idx) => (
                  <tr key={idx} className={row.highlight ? "highlight-india" : ""}>
                    <td>
                      <div className="sc-country-cell">
                        {row.highlight && <Sparkles size={16} color="#e87524" />}
                        <strong>{row.country}</strong>
                      </div>
                    </td>
                    <td>{row.annualTuition}</td>
                    <td>{row.annualLiving}</td>
                    <td><strong>{row.total4Year}</strong></td>
                    <td>
                      {row.highlight ? (
                        <span className="sc-roi-badge">{row.roi}</span>
                      ) : (
                        <span>{row.roi}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════════ 5. APPLICATION TIMELINE & ROADMAP ════════════════ */}
      <section className="sc-section">
        <div className="portal-shell">
          <div className="sc-section-header">
            <span className="sc-section-badge">ADMISSION CYCLE 2026/2027</span>
            <h2>Four Steps to Secure Your Fee Waiver & Visa</h2>
            <p>Follow the streamlined admissions roadmap to guarantee your scholarship seat before university deadlines.</p>
          </div>

          <div className="sc-timeline-grid">
            {TIMELINE.map((t) => (
              <div key={t.step} className="sc-timeline-step">
                <div className="sc-timeline-number">{t.step}</div>
                <h3>{t.phase}</h3>
                <div className="sc-timeline-date">{t.date}</div>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 6. DOCUMENT CHECKLIST ════════════════ */}
      <section className="sc-section sc-section-alt">
        <div className="portal-shell">
          <div className="sc-section-header">
            <span className="sc-section-badge">VERIFICATION STANDARDS</span>
            <h2>Required Documents for Scholarship Allocation</h2>
            <p>Ensure you have certified digital copies of all mandatory credentials ready prior to portal submission.</p>
          </div>

          <div className="sc-checklist-grid">
            {CHECKLIST.map((chk, idx) => (
              <div key={idx} className="sc-check-item">
                <div className="sc-check-icon">
                  <FileCheck2 size={20} />
                </div>
                <div className="sc-check-info">
                  <h4>{chk.title}</h4>
                  <p>{chk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 7. FAQS ACCORDION ════════════════ */}
      <section className="sc-section">
        <div className="portal-shell">
          <div className="sc-section-header">
            <span className="sc-section-badge">FREQUENTLY ASKED QUESTIONS</span>
            <h2>Scholarships & Fee Concession Clarifications</h2>
            <p>Straightforward answers regarding renewal conditions, accommodation allowances, and visa processing.</p>
          </div>

          <div className="sc-faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`sc-faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="sc-faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <div className="sc-faq-icon">
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  {isOpen && <div className="sc-faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>

          {/* ════════════════ 8. FINAL CONVERSION CTA ════════════════ */}
          <div className="sc-cta-banner">
            <div className="sc-cta-content">
              <h2>Ready to Secure Your 100% Tuition Fee Waiver?</h2>
              <p>
                Explore thousands of pre-qualified degree programmes eligible for Study in India G1/G2/G3 fee waivers,
                and begin your free application today.
              </p>
            </div>
            <div className="sc-cta-actions">
              <Link to="/courses?scholarshipOnly=true" className="sc-btn-primary">
                <span>Browse Scholarship Courses</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/contact" className="sc-btn-secondary">
                <span>Speak with a Counselor</span>
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
