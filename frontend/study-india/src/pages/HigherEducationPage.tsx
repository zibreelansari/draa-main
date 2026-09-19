import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Award,
  Globe2,
  CheckCircle2,
  BookOpen,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Layers,
  ShieldCheck,
  Scale,
  Users,
  Compass,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import "../styles/HigherEducation.css";

interface InstitutionalCategory {
  id: string;
  name: string;
  badge: string;
  authority: string;
  description: string;
  keyFeatures: { title: string; desc: string }[];
  flagships: string[];
  intQuota: string;
  avgTuition: string;
  admissionRoute: string;
}

const CATEGORIES: InstitutionalCategory[] = [
  {
    id: "ini",
    name: "Institutes of National Importance (INI)",
    badge: "Apex Research Hubs",
    authority: "Acts of Indian Parliament (Ministry of Education)",
    description:
      "India's most prestigious science, engineering, medical, and management institutions with supreme academic autonomy, cutting-edge supercomputing laboratories, and global faculty networks.",
    keyFeatures: [
      { title: "23 IITs & 21 IIMs", desc: "Consistently ranked among the top institutions globally for engineering & business." },
      { title: "Supreme Autonomy", desc: "Design independent industry-aligned curricula and international research charters." },
      { title: "Supernumerary Quotas", desc: "Up to 15% reserved seats for international students without domestic JEE/CAT exams." },
      { title: "Generous Research Grants", desc: "Direct funding from Department of Science & Technology (DST) and global corporate labs." },
    ],
    flagships: [
      "IIT Delhi",
      "IIT Bombay",
      "IIT Madras",
      "IISc Bangalore",
      "AIIMS New Delhi",
      "IIM Ahmedabad",
      "NIT Trichy",
    ],
    intQuota: "15% Supernumerary Seats",
    avgTuition: "$4,000 – $8,000 / year",
    admissionRoute: "Direct Study in India (SII) / University International Portal based on SAT, GRE or High School Transcripts",
  },
  {
    id: "central",
    name: "Central Universities",
    badge: "Multidisciplinary Flagships",
    authority: "Parliamentary Charter (UGC / MoE)",
    description:
      "Large-scale public research universities offering comprehensive humanities, sciences, legal studies, social sciences, and international relations with expansive collegiate campuses and massive heritage libraries.",
    keyFeatures: [
      { title: "56 National Universities", desc: "Universally recognized across Commonwealth, EU, and Americas." },
      { title: "High Subsidies", desc: "World-class education supported by central government scholarships and minimal tuition." },
      { title: "Cosmopolitan Campuses", desc: "Vibrant international student dormitories, language clubs, and cultural festivals." },
      { title: "Renowned Faculty", desc: "Home to National Research Fellows, Rhodes Scholars, and renowned authors." },
    ],
    flagships: [
      "University of Delhi (DU)",
      "Jawaharlal Nehru University (JNU)",
      "Banaras Hindu University (BHU)",
      "Aligarh Muslim University (AMU)",
      "University of Hyderabad",
      "Jamia Millia Islamia",
    ],
    intQuota: "10% – 15% Foreign Quota",
    avgTuition: "$1,200 – $3,500 / year",
    admissionRoute: "Direct Foreign Students Registry (FSR) application through Study in India portal",
  },
  {
    id: "ioe",
    name: "Institutes of Eminence (IoE)",
    badge: "World Top 500 Mandate",
    authority: "UGC Special Empowerment Regulatory Framework",
    description:
      "A select group of elite public and private institutions empowered with complete regulatory freedom, dedicated government funding, and a specific national mission to climb into the top 100 QS and Times Higher Education world rankings.",
    keyFeatures: [
      { title: "Complete Academic Autonomy", desc: "Freedom to hire up to 25% international faculty and admit up to 30% foreign scholars." },
      { title: "Joint & Dual Degrees", desc: "Pre-approved international partnerships with Ivy League, Russell Group, and European universities." },
      { title: "Modern Tech Incubation", desc: "Over 500+ university-backed tech start-ups and patent incubators." },
      { title: "Fast-Track Visas", desc: "Priority FRRO immigration assistance and dedicated international student concierge." },
    ],
    flagships: [
      "BITS Pilani",
      "Manipal Academy of Higher Education (MAHE)",
      "IIT Bombay",
      "IIT Delhi",
      "O.P. Jindal Global University",
      "Shiv Nadar University",
    ],
    intQuota: "Up to 30% International Scholars",
    avgTuition: "$3,500 – $7,500 / year",
    admissionRoute: "Direct online application with merit-based Chancellor's Scholarship evaluation",
  },
  {
    id: "state",
    name: "State Research Universities",
    badge: "Regional Powerhouses",
    authority: "State Legislative Acts (UGC Section 12B)",
    description:
      "Founded by state governments, these large public universities drive regional innovation corridors (Bangalore, Hyderabad, Pune, Chennai) and maintain deep linkages with local IT, automotive, and biotechnology industries.",
    keyFeatures: [
      { title: "Industry Corridors", desc: "Direct internships with India's leading tech parks and corporate R&D centres." },
      { title: "Affordable Tuition", desc: "Highly economical fee structures with state government merit incentives." },
      { title: "Specialized Centres", desc: "Pioneering research in renewable energy, aerospace, biotechnology, and agricultural sciences." },
      { title: "Affiliated Colleges", desc: "Vast networks of autonomous engineering, medical, and arts colleges." },
    ],
    flagships: [
      "Anna University (Chennai)",
      "Jadavpur University (Kolkata)",
      "Calcutta University",
      "Savitribai Phule Pune University",
      "Osmania University (Hyderabad)",
      "Panjab University (Chandigarh)",
    ],
    intQuota: "10% Supernumerary Seats",
    avgTuition: "$1,500 – $3,500 / year",
    admissionRoute: "International Student Cell direct portal or state consortium admissions",
  },
  {
    id: "private",
    name: "Premier Private & Deemed Universities",
    badge: "World-Class Campuses",
    authority: "UGC Approved / NAAC A++ Accredited",
    description:
      "Modern universities featuring American-style residential campuses, international accreditation, state-of-the-art sports facilities, global faculty, and 100% English-taught interdisciplinary degrees.",
    keyFeatures: [
      { title: "Ultra-Modern Infrastructure", desc: "Smart classrooms, Olympic-sized swimming pools, high-tech engineering labs." },
      { title: "Global Placements", desc: "Campus recruitment by Fortune 500 multinationals (Microsoft, Google, Amazon, Deloitte)." },
      { title: "Generous Merit Waivers", desc: "Up to 100% Study in India G1/G2/G3 fee concessions for qualified international students." },
      { title: "Dedicated Support", desc: "24/7 campus security, international cuisine, multi-faith prayer rooms, medical centres." },
    ],
    flagships: [
      "Vellore Institute of Technology (VIT)",
      "SRM Institute of Science and Technology",
      "Ashoka University",
      "Amity University",
      "Thapar Institute of Engineering & Technology",
      "Symbiosis International University",
    ],
    intQuota: "15% – 25% International Allocation",
    avgTuition: "$2,500 – $6,000 / year",
    admissionRoute: "Direct Study in India portal with expedited offer letters within 5 to 7 working days",
  },
];

const NEP_PATHWAYS = [
  {
    step: "1",
    year: "Year 1",
    credential: "Undergraduate Certificate",
    credits: "40 – 44 Credits",
    desc: "Foundational cross-disciplinary coursework in major discipline, digital literacy, and communicative English. Exit allowed with certified credential.",
  },
  {
    step: "2",
    year: "Year 2",
    credential: "Undergraduate Diploma",
    credits: "80 – 88 Credits",
    desc: "Intermediate subject mastery, laboratory research fundamentals, and vocational immersion. Full transferability across institutions via DigiLocker ABC.",
  },
  {
    step: "3",
    year: "Year 3",
    credential: "Bachelor's Degree",
    credits: "120 – 132 Credits",
    desc: "Complete collegiate bachelor's degree recognized globally for immediate employment or entry into standard 2-year international master's programmes.",
  },
  {
    step: "4",
    year: "Year 4",
    credential: "Bachelor (Honours / Research)",
    credits: "160 – 176 Credits",
    desc: "Rigorous honours thesis, peer-reviewed publications, and advanced research lab work. Qualifies for direct entry into 1-year Master's or direct global Ph.D.!",
  },
];

const ACCREDITATIONS = [
  {
    name: "NAAC A++ Accreditation",
    org: "National Assessment & Accreditation Council",
    icon: Award,
    desc: "The premier quality benchmark for Indian universities. NAAC A++ (CGPA 3.51–4.00) confirms world-class faculty qualifications, high-impact research, and superior infrastructure.",
    points: [
      "Assesses 7 critical parameters: Curriculum, Teaching-Learning, Research, Infrastructure, Student Support, Governance, and Best Practices.",
      "Recognized by foreign education departments, UNESCO, and bilateral credential evaluation bodies.",
      "Mandatory for universities to enrol foreign nationals under Study in India scholarships.",
    ],
  },
  {
    name: "Washington Accord (NBA Tier-1)",
    org: "National Board of Accreditation",
    icon: ShieldCheck,
    desc: "India is a full permanent signatory to the Washington Accord. Engineering degrees from Tier-1 NBA accredited institutions receive automatic professional recognition across the globe.",
    points: [
      "Signatory countries include USA (ABET), UK (Engineering Council), Canada, Australia, Japan, Singapore, and New Zealand.",
      "Graduates are eligible to practice as Licensed Professional Engineers (PE) internationally without extra qualifying exams.",
      "Applies to undergraduate B.Tech / B.E. degrees in computing, electronics, mechanical, and civil engineering.",
    ],
  },
  {
    name: "NIRF National Rankings",
    org: "Ministry of Education, Govt. of India",
    icon: Layers,
    desc: "An evidence-based annual assessment ranking all higher education institutions across 5 verified clusters: Teaching, Research Productivity, Graduation Outcomes, Inclusivity, and Perception.",
    points: [
      "Rigorous verification of faculty-student ratio, patents granted, citations per paper, and international placements.",
      "Specific rankings across Overall, Universities, Engineering, Management, Pharmacy, Dental, Law, and Medicine.",
      "Helps international students benchmark and pick the top 100 apex campuses with complete transparency.",
    ],
  },
  {
    name: "AIU Global Equivalency",
    org: "Association of Indian Universities",
    icon: Scale,
    desc: "The designated statutory agency that evaluates foreign high school diplomas and bachelor's degrees, granting official equivalence certificates for admission into Indian universities.",
    points: [
      "Automatic equivalence for IB Diploma, Cambridge GCE A-Levels, and US High School Diplomas.",
      "Facilitates smooth credit transfers and reciprocal degree recognition under international bilateral treaties.",
      "DRAA admissions counselors provide full end-to-end guidance for obtaining AIU equivalence smoothly.",
    ],
  },
  {
    name: "Statutory Professional Councils",
    org: "NMC, BCI, PCI, COA, AICTE",
    icon: FileCheck,
    desc: "Specialized government bodies ensuring international clinical, professional, and ethical benchmarks for licensed professions.",
    points: [
      "National Medical Commission (NMC): MBBS degrees recognized worldwide (WHO, ECFMG USA, GMC UK).",
      "Bar Council of India (BCI): LL.B and LL.M degrees recognized for international legal practice.",
      "Pharmacy Council of India (PCI) & Council of Architecture (COA) compliance.",
    ],
  },
  {
    name: "Academic Bank of Credits (ABC)",
    org: "National Digital Educational Ecosystem",
    icon: Globe2,
    desc: "A commercial-grade digital depository under DigiLocker where each international student's course credits are digitally recorded and recognized for seamless global mobility.",
    points: [
      "Enables multiple entry and exit without losing completed academic credits.",
      "Standard credit equivalency with European Credit Transfer (ECTS) and US Credit Hours.",
      "100% verified digital transcripts downloadable anytime for embassy or employer verification.",
    ],
  },
];

const FAQS = [
  {
    q: "Are degrees from Indian universities recognized in the USA, UK, Canada, and Europe?",
    a: "Yes. Degrees awarded by UGC-recognized and NAAC-accredited Indian universities are recognized worldwide. Furthermore, India is a permanent signatory to the Washington Accord, which grants reciprocal professional recognition to engineering degrees across the United States, United Kingdom, Canada, Australia, Japan, and Singapore. The Association of Indian Universities (AIU) also maintains bilateral degree equivalence agreements with over 50 nations.",
  },
  {
    q: "Do international students have to sit for competitive entrance exams like JEE or NEET?",
    a: "No! For foreign nationals and international students, Indian universities provide a 15% supernumerary international quota (meaning seats above the domestic quota). Admissions are granted directly based on high school transcripts, SAT scores, Cambridge A-Levels, IB diplomas, or national secondary exam certificates. You do NOT have to take domestic competitive exams.",
  },
  {
    q: "Are classes taught in English?",
    a: "Yes. 100% of undergraduate, postgraduate, and doctoral curricula at accredited Indian higher education institutions are instructed and examined in English. India has the second-largest English-speaking academic population in the world, ensuring smooth seminars, textbooks, laboratory sessions, and campus interactions.",
  },
  {
    q: "How does the Indian 10-point CGPA convert to the US 4.0 GPA scale?",
    a: "Indian universities use a standard 10-point Cumulative Grade Point Average (CGPA). Generally, a CGPA of 8.5–10.0 corresponds to a US GPA of 3.8–4.0 (A/A+); 7.5–8.4 corresponds to 3.3–3.7 (B+/A-); and 6.5–7.4 corresponds to 2.8–3.2 (B). Our portal features a built-in GPA Evaluator to help you convert your home qualifications instantly.",
  },
  {
    q: "What is the difference between an Institute of National Importance (INI) and a Central University?",
    a: "Institutes of National Importance (INIs) are specialized apex research institutions (such as IITs for engineering, IIMs for business, and AIIMS for medicine) created by Acts of Parliament with hyper-focused research mandates and autonomous curricula. Central Universities (such as Delhi University or JNU) are comprehensive multidisciplinary collegiate campuses offering broad humanities, social sciences, sciences, and arts with subsidized fee structures.",
  },
  {
    q: "What international student support is available on campus?",
    a: "Accredited institutions operate dedicated International Student Offices (ISO) to assist with single-window FRRO student visa registration, airport reception, dedicated international student hostels with continental food options, campus health insurance, and cultural integration clubs.",
  },
];

export default function HigherEducationPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ini");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const selectedCategory = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  function toggleFaq(index: number) {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  }

  return (
    <div className="higher-ed-page">
      {/* ════════════════ HERO BANNER ════════════════ */}
      <section className="he-hero">
        <img
          className="he-hero-bg"
          src="/media/campus-aerial.jpg"
          alt="Aerial view of premier Indian university campus"
        />
        <div className="he-hero-overlay" />
        <div className="portal-shell">
          <div className="he-eyebrow">
            <Sparkles size={14} color="#ffb07b" />
            <span>MINISTRY OF EDUCATION & UGC REGULATORY FRAMEWORK</span>
          </div>

          <h1 className="he-hero-title">
            The Indian Higher Education System: Structure, Autonomy & World-Class Accreditation
          </h1>
          <p className="he-hero-desc">
            Home to the world's 2nd largest higher education ecosystem, combining 1,100+ accredited universities,
            apex research institutes of national importance, and NEP 2020 international credit mobility.
          </p>

          {/* Quick Metrics */}
          <div className="he-hero-metrics">
            <div className="he-metric-chip">
              <Building2 size={16} color="#34d399" />
              <span><strong>1,100+</strong> Accredited Universities</span>
            </div>
            <div className="he-metric-chip">
              <Layers size={16} color="#fbbf24" />
              <span><strong>45,000+</strong> Specialized Colleges</span>
            </div>
            <div className="he-metric-chip">
              <Users size={16} color="#60a5fa" />
              <span><strong>15%</strong> Foreign Supernumerary Quota</span>
            </div>
            <div className="he-metric-chip">
              <GraduationCap size={16} color="#f472b6" />
              <span><strong>100%</strong> English Medium Curricula</span>
            </div>
          </div>

          <div className="he-hero-actions">
            <Link to="/courses" className="he-btn-primary">
              <BookOpen size={17} />
              <span>Explore 24,000+ Verified Programmes</span>
            </Link>
            <a href="#taxonomy" className="he-btn-secondary">
              <Compass size={17} />
              <span>Compare University Categories</span>
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════ 1. INSTITUTIONAL TAXONOMY ════════════════ */}
      <section id="taxonomy" className="he-section">
        <div className="portal-shell">
          <div className="he-section-header">
            <span className="he-section-badge">INSTITUTIONAL TAXONOMY</span>
            <h2>Five Distinct Categories of Higher Education in India</h2>
            <p>
              India’s tertiary ecosystem is organized into five structured categories, each with distinct governance,
              autonomy levels, and dedicated international scholar admissions quotas.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="he-taxonomy-tabs" role="tablist">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={activeCategory === cat.id}
                className={`he-tab-button ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <Building2 size={15} />
                <span>{cat.name.split(" (")[0]}</span>
              </button>
            ))}
          </div>

          {/* Active Category Display */}
          <div className="he-category-card">
            <div className="he-category-left">
              <span className="he-category-authority">{selectedCategory.authority}</span>
              <h3>{selectedCategory.name}</h3>
              <p>{selectedCategory.description}</p>

              <div className="he-features-grid">
                {selectedCategory.keyFeatures.map((feat, idx) => (
                  <div key={idx} className="he-feature-item">
                    <div className="he-feature-icon">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="he-feature-text">
                      <strong>{feat.title}</strong>
                      <span>{feat.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="he-examples-strip">
                <strong>Flagship Institutions:</strong>
                <p>{selectedCategory.flagships.join(" · ")}</p>
              </div>
            </div>

            {/* Sidebar quick facts */}
            <div className="he-category-sidebar">
              <h4>Admissions & Quota Profile</h4>
              <div className="he-sidebar-fact">
                <span>International Quota</span>
                <strong>{selectedCategory.intQuota}</strong>
              </div>
              <div className="he-sidebar-fact">
                <span>Indicative Annual Tuition</span>
                <strong>{selectedCategory.avgTuition}</strong>
              </div>
              <div className="he-sidebar-fact">
                <span>Admission Pathway</span>
                <strong>{selectedCategory.admissionRoute}</strong>
              </div>
              <div className="he-sidebar-fact">
                <span>Instruction Medium</span>
                <strong>100% English Taught & Examined</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ 2. NEP 2020 DEGREE FRAMEWORK ════════════════ */}
      <section className="he-section he-section-alt">
        <div className="portal-shell">
          <div className="he-section-header">
            <span className="he-section-badge">NEP 2020 REVOLUTION</span>
            <h2>Flexible 4-Year Undergraduate & Research Degree Pathways</h2>
            <p>
              Under the National Education Policy (NEP 2020), Indian universities provide multi-entry and multi-exit
              flexibility, aligning directly with the US 4-year credit model and European Bologna standards.
            </p>
          </div>

          <div className="he-degree-grid">
            {NEP_PATHWAYS.map((p) => (
              <div key={p.step} className="he-degree-card">
                <div className="he-degree-step">{p.step}</div>
                <h3>{p.year}</h3>
                <div className="he-degree-credential">{p.credential}</div>
                <p>{p.desc}</p>
                <div className="he-degree-credits">
                  <Award size={14} />
                  <span>{p.credits} (ABC Tracked)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ 3. ACCREDITATIONS & GLOBAL RECOGNITION ════════════════ */}
      <section className="he-section">
        <div className="portal-shell">
          <div className="he-section-header">
            <span className="he-section-badge">QUALITY ASSURANCE</span>
            <h2>Accreditation Standards & Global Reciprocal Recognition</h2>
            <p>
              Every degree awarded by Study in India partner institutions is rigorously scrutinized by national
              statutory bodies and mutual international conventions.
            </p>
          </div>

          <div className="he-accreditation-grid">
            {ACCREDITATIONS.map((acc, idx) => {
              const Icon = acc.icon;
              return (
                <div key={idx} className="he-accred-card">
                  <div className="he-accred-header">
                    <div className="he-accred-icon">
                      <Icon size={22} />
                    </div>
                    <div>
                      <h3>{acc.name}</h3>
                      <span>{acc.org}</span>
                    </div>
                  </div>
                  <p>{acc.desc}</p>
                  <ul className="he-accred-points">
                    {acc.points.map((pt, i) => (
                      <li key={i}>
                        <CheckCircle2 size={15} />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════ 4. COMPARISON MATRIX TABLE ════════════════ */}
      <section className="he-section he-section-alt">
        <div className="portal-shell">
          <div className="he-section-header">
            <span className="he-section-badge">SIDE-BY-SIDE MATRIX</span>
            <h2>Comparing Higher Education Categories at a Glance</h2>
            <p>
              Understand how governance, funding, campus culture, and tuition compare to choose your ideal learning environment.
            </p>
          </div>

          <div className="he-table-container">
            <table className="he-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Governance Body</th>
                  <th>Faculty Focus</th>
                  <th>Campus Lifestyle</th>
                  <th>Average Annual Tuition</th>
                  <th>Foreign Quota</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Institutes of National Importance (INI)</strong></td>
                  <td>Acts of Parliament (MoE)</td>
                  <td>Cutting-edge R&D, Patents, Global Research</td>
                  <td>Intense STEM/Business focus, residential clubs</td>
                  <td>$4,000 – $8,000 USD</td>
                  <td>15% Supernumerary</td>
                </tr>
                <tr>
                  <td><strong>Central Universities</strong></td>
                  <td>Department of Higher Ed (UGC)</td>
                  <td>Pure Sciences, Arts, Law, Social Sciences</td>
                  <td>Historic multidisciplinary, vast libraries, cultural hubs</td>
                  <td>$1,200 – $3,500 USD</td>
                  <td>10% – 15% Quota</td>
                </tr>
                <tr>
                  <td><strong>Institutes of Eminence (IoE)</strong></td>
                  <td>UGC Special Autonomy Charter</td>
                  <td>Interdisciplinary, Global Top-500 Mandate</td>
                  <td>World-class incubators, global student exchanges</td>
                  <td>$3,500 – $7,500 USD</td>
                  <td>Up to 30% Intake</td>
                </tr>
                <tr>
                  <td><strong>State Research Universities</strong></td>
                  <td>State Legislative Acts</td>
                  <td>Regional Innovation & Applied Engineering</td>
                  <td>Deep city-hub linkages, vibrant regional student life</td>
                  <td>$1,500 – $3,500 USD</td>
                  <td>10% Quota</td>
                </tr>
                <tr>
                  <td><strong>Private & Deemed Universities</strong></td>
                  <td>UGC Approved / NAAC A++</td>
                  <td>Industry-Aligned, Silicon Valley Tie-ups</td>
                  <td>American-style residential, smart sports complexes</td>
                  <td>$2,500 – $6,000 USD</td>
                  <td>15% – 25% Allocation</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ════════════════ 5. FAQS ACCORDION ════════════════ */}
      <section className="he-section">
        <div className="portal-shell">
          <div className="he-section-header">
            <span className="he-section-badge">FREQUENTLY ASKED QUESTIONS</span>
            <h2>Common Questions from International Students</h2>
            <p>Everything you need to know about degree legitimacy, medium of instruction, and foreign quotas.</p>
          </div>

          <div className="he-faq-list">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`he-faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    type="button"
                    className="he-faq-question"
                    onClick={() => toggleFaq(index)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <div className="he-faq-icon">
                      <ChevronDown size={18} />
                    </div>
                  </button>
                  {isOpen && <div className="he-faq-answer">{faq.a}</div>}
                </div>
              );
            })}
          </div>

          {/* ════════════════ 6. CONVERSION CTA BANNER ════════════════ */}
          <div className="he-cta-banner">
            <div className="he-cta-content">
              <h2>Find Your Dream Degree in India Today</h2>
              <p>
                Browse over 24,000+ verified undergraduate, postgraduate, and research programmes with international
                scholarship eligibility and direct admission assistance.
              </p>
            </div>
            <div className="he-cta-actions">
              <Link to="/courses" className="he-btn-primary">
                <span>Browse Course Catalogue</span>
                <ArrowRight size={17} />
              </Link>
              <Link to="/scholarships" className="he-btn-secondary">
                <span>Check Fee Waivers</span>
                <ExternalLink size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
