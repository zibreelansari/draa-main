import React from "react";
import {
  ArrowRight,
  Award,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileCheck2,
  Globe2,
  GraduationCap,
  Landmark,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { guidancePages } from "../data/guidancePages";
import { useReveal } from "../hooks/useReveal";

const icons = [GraduationCap, Compass, Landmark, ShieldCheck];

export default function ContentPage() {
  useReveal();
  const { pathname } = useLocation();
  const page = guidancePages[pathname] || guidancePages["/about"];
  const ctaHref = page.ctaHref || "/register/student";
  const internalCta = ctaHref.startsWith("/");

  return (
    <div className="content-page">
      {/* ═══════════ HERO BANNER ═══════════ */}
      <section className="content-hero">
        {page.heroImage && (
          <img
            className="content-hero-bg"
            src={page.heroImage}
            alt=""
            loading="eager"
          />
        )}
        <div className="content-hero-overlay" />

        <div className="portal-shell content-hero-inner" data-reveal>
          {/* Breadcrumb */}
          <nav className="content-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <span>{page.eyebrow}</span>
          </nav>

          {/* Eyebrow */}
          <div className="content-hero-eyebrow">
            <Sparkles size={13} />
            {page.eyebrow}
          </div>

          {/* Title */}
          <h1 className="content-hero-title">{page.title}</h1>

          {/* Intro */}
          <p className="content-hero-intro">{page.intro}</p>
        </div>
      </section>

      {/* ═══════════ AT-A-GLANCE STRIP ═══════════ */}
      <section className="content-glance-strip">
        <div className="portal-shell content-glance-inner" data-reveal>
          <div className="content-glance-card">
            <ShieldCheck size={22} />
            <div>
              <strong>At a Glance</strong>
              <p>{page.summary}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HIGHLIGHTS COUNTER ═══════════ */}
      {page.highlights && (
        <section className="content-highlights">
          <div className="portal-shell content-highlights-grid">
            {page.highlights.map((item) => (
              <div key={item.label} className="content-highlight-card" data-reveal>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ PATH-SPECIFIC RICH ENRICHMENTS ═══════════ */}

      {/* 1. Things To Do in India: Real Landmark Photography */}
      {pathname === "/things-to-do" && (
        <section className="content-enrichment-section">
          <div className="portal-shell">
            <div className="content-section-heading" data-reveal>
              <span className="content-section-eyebrow">DISCOVER INDIA</span>
              <h2>Iconic Landmarks & Living Cultural Experiences</h2>
              <p style={{ color: "#64748b", fontSize: "14px", marginTop: "4px" }}>
                From Mughal architectural wonders to tranquil Himalayan spiritual centers, immerse in India's living cultural fabric.
              </p>
            </div>
            <div className="landmarks-gallery-grid">
              <div className="landmark-photo-card" data-reveal>
                <img src="/media/real-india-taj.jpg" alt="Taj Mahal at sunrise, Agra" />
                <div className="landmark-badge">UNESCO World Heritage</div>
                <div className="landmark-details">
                  <h3>Taj Mahal & Mughal Architecture</h3>
                  <p>Agra, Uttar Pradesh · World wonder of marble symmetry and gardens</p>
                </div>
              </div>
              <div className="landmark-photo-card" data-reveal>
                <img src="/media/real-india-fort.jpg" alt="Historic Fort in Rajasthan" />
                <div className="landmark-badge">Royal Heritage</div>
                <div className="landmark-details">
                  <h3>Palaces & Hill Forts of Rajasthan</h3>
                  <p>Jaipur & Jodhpur · Centuries of architectural mastery and vibrant bazaars</p>
                </div>
              </div>
              <div className="landmark-photo-card" data-reveal>
                <img src="/media/real-india-temple.jpg" alt="Classical Temple Architecture" />
                <div className="landmark-badge">Spiritual Arts</div>
                <div className="landmark-details">
                  <h3>Classical Heritage & Temple Arts</h3>
                  <p>Varanasi & South India · Ancient sculpture, philosophy and classical music</p>
                </div>
              </div>
              <div className="landmark-photo-card" data-reveal>
                <img src="/media/yoga-meditation.jpg" alt="Yoga & Holistic Wellness" />
                <div className="landmark-badge">Holistic Living</div>
                <div className="landmark-details">
                  <h3>Yoga, Ayurveda & Holistic Retreats</h3>
                  <p>Rishikesh & Kerala · Authentic science of mind, body, and mindfulness</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Higher Education: Structure & Institutional Matrix */}
      {pathname === "/higher-education" && (
        <section className="content-enrichment-section">
          <div className="portal-shell">
            <div className="content-section-heading" data-reveal>
              <span className="content-section-eyebrow">INSTITUTIONAL FRAMEWORK</span>
              <h2>Categories of Higher Education Institutions in India</h2>
            </div>
            <div className="framework-table-wrap" data-reveal>
              <table className="enrichment-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Governing Framework</th>
                    <th>Flagship Examples</th>
                    <th>Key Characteristics</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Institutes of National Importance (INI)</strong></td>
                    <td>Acts of Parliament (MoE)</td>
                    <td>IIT Delhi, IISc, AIIMS, NIT Trichy</td>
                    <td>Autonomous, world-standard research labs, global faculty & student exchanges</td>
                  </tr>
                  <tr>
                    <td><strong>Central Universities</strong></td>
                    <td>Department of Higher Education</td>
                    <td>University of Delhi, JNU, BHU, AMU</td>
                    <td>Vast multidisciplinary collegiate campuses, heavily subsidised tuition, large libraries</td>
                  </tr>
                  <tr>
                    <td><strong>Institutes of Eminence (IoE)</strong></td>
                    <td>UGC Special Status</td>
                    <td>BITS Pilani, Manipal, IIT Bombay</td>
                    <td>Full academic autonomy, top 500 global rankings mandate, foreign admissions quotas</td>
                  </tr>
                  <tr>
                    <td><strong>State Universities</strong></td>
                    <td>State Legislative Acts</td>
                    <td>Anna University, Jadavpur, Panjab Univ.</td>
                    <td>Regional excellence hubs with deep industry partnerships and local tech ecosystems</td>
                  </tr>
                  <tr>
                    <td><strong>Private Universities</strong></td>
                    <td>State Acts / UGC Sec 2(f)</td>
                    <td>Ashoka, Symbiosis, OP Jindal, VIT</td>
                    <td>Modern campus infrastructure, global curriculums, 100% English-medium seminars</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 3. Scholarships: Study in India (SII) Fee Waiver Table */}
      {pathname === "/scholarships" && (
        <section className="content-enrichment-section">
          <div className="portal-shell">
            {/* Visual banner */}
            <div className="scholarship-spotlight-card" data-reveal>
              <img src="/media/scholarship-banner.jpg" alt="Graduates celebrating with international flags" className="scholarship-spotlight-img" />
              <div className="scholarship-spotlight-overlay" />
              <div className="scholarship-spotlight-content">
                <span className="spotlight-tag"><Award size={14} /> GOVERNMENT & UNIVERSITY PARTNERSHIPS</span>
                <h2>Study in India (SII) Concession Tiers</h2>
                <p>
                  Partner institutions allocate designated scholarship quotas for foreign nationals under the Ministry of Education's flagship initiative.
                </p>
              </div>
            </div>

            <div className="framework-table-wrap" data-reveal style={{ marginTop: "24px" }}>
              <table className="enrichment-table">
                <thead>
                  <tr>
                    <th>Waiver Tier</th>
                    <th>Tuition Concession</th>
                    <th>Eligible Quotas</th>
                    <th>Selection Criteria</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge-g1">G1 Category</span></td>
                    <td><strong>100% Tuition Fee Waiver</strong></td>
                    <td>Top 10% International Cohort</td>
                    <td>Exemplary academic merit (GPA 3.8+ or 85%+), verified high school/bachelor credentials</td>
                  </tr>
                  <tr>
                    <td><span className="badge-g2">G2 Category</span></td>
                    <td><strong>50% Tuition Fee Waiver</strong></td>
                    <td>Next 20% International Cohort</td>
                    <td>Consistent academic record (GPA 3.3+ or 75%+), valid SOP, subject prerequisite strength</td>
                  </tr>
                  <tr>
                    <td><span className="badge-g3">G3 Category</span></td>
                    <td><strong>25% Tuition Fee Waiver</strong></td>
                    <td>Next 30% International Cohort</td>
                    <td>Standard admission eligibility (GPA 2.8+ or 60%+), regional student diversity criteria</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* 4. Eligibility: International Equivalencies */}
      {pathname === "/eligibility" && (
        <section className="content-enrichment-section">
          <div className="portal-shell">
            <div className="content-section-heading" data-reveal>
              <span className="content-section-eyebrow">GLOBAL ACADEMIC EQUIVALENCY</span>
              <h2>International Qualifications Recognised by Indian Universities</h2>
            </div>
            <div className="framework-table-wrap" data-reveal>
              <table className="enrichment-table">
                <thead>
                  <tr>
                    <th>Curriculum / Board</th>
                    <th>Undergraduate (UG) Entry</th>
                    <th>Postgraduate (PG) Entry</th>
                    <th>AIU Equivalence Requirement</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>US High School / AP</strong></td>
                    <td>High School Diploma with minimum 5 passed subjects (GPA 2.8+)</td>
                    <td>4-Year Bachelor's Degree with minimum GPA 3.0</td>
                    <td>Association of Indian Universities (AIU) Equivalence Certificate</td>
                  </tr>
                  <tr>
                    <td><strong>British Curriculum / GCE</strong></td>
                    <td>Minimum 5 IGCSE/GCSE passes + 2/3 GCE A-Levels</td>
                    <td>3 or 4-Year Bachelor's with Second Class Honours</td>
                    <td>Automatically recognized under bilateral conventions</td>
                  </tr>
                  <tr>
                    <td><strong>International Baccalaureate (IB)</strong></td>
                    <td>Full IB Diploma with minimum 24 points (Math/Science for STEM)</td>
                    <td>Recognised 3/4-Year Bachelor's Degree</td>
                    <td>Standard IB Diploma recognized by AIU</td>
                  </tr>
                  <tr>
                    <td><strong>African National Exams (WAEC / KCSE)</strong></td>
                    <td>WASSCE / KCSE with Credits in 5 relevant academic subjects</td>
                    <td>Bachelor's Degree from recognised national university</td>
                    <td>AIU Evaluation assisted by DRAA admissions team</td>
                  </tr>
                  <tr>
                    <td><strong>Middle East (Tawjihiyya / Thanawiya)</strong></td>
                    <td>General Secondary Education Certificate (minimum 65%+)</td>
                    <td>Recognised Bachelor's degree (minimum 55%+)</td>
                    <td>Embassy attestation + AIU verification</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ ROADMAP STEPS ═══════════ */}
      {page.steps && (
        <section className="content-steps-section">
          <div className="portal-shell">
            <div className="content-section-heading" data-reveal>
              <span className="content-section-eyebrow">YOUR ROADMAP</span>
              <h2>A clear sequence for your study journey.</h2>
            </div>
            <div className="content-steps-grid">
              {page.steps.map((step, i) => (
                <article
                  key={step.number}
                  className="content-step-card"
                  data-reveal
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="content-step-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ MAIN SECTIONS ═══════════ */}
      <section className="content-sections">
        <div className="portal-shell">
          <div className="content-section-heading" data-reveal>
            <span className="content-section-eyebrow">WHAT TO CONSIDER</span>
            <h2>Essential factors for an informed academic choice.</h2>
          </div>
          <div className="content-sections-grid">
            {page.sections.map((section, index) => {
              const Icon = icons[index % icons.length];
              return (
                <article
                  key={section.title}
                  className="content-section-card"
                  data-reveal
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="content-section-card-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                  {section.items && (
                    <ul className="content-section-card-list">
                      {section.items.map((item) => (
                        <li key={item}>
                          <Check size={14} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ PROGRAMMES / REGIONAL HUBS ═══════════ */}
      {page.programmes && (
        <section className="content-programmes-section">
          <div className="portal-shell">
            <div className="content-section-heading" data-reveal>
              <span className="content-section-eyebrow">EXPLORE STUDY HUBS</span>
              <h2>Programmes, pathways, and university clusters.</h2>
            </div>
            <div className="content-programmes-grid">
              {page.programmes.map((programme, i) => (
                <article
                  key={programme.title}
                  className="content-programme-card"
                  data-reveal
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span className="content-programme-tag">{programme.tag}</span>
                  <h3>{programme.title}</h3>
                  <p>{programme.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ NOTE ═══════════ */}
      {page.note && (
        <div className="portal-shell content-note" data-reveal>
          <ShieldCheck size={22} />
          <p>{page.note}</p>
        </div>
      )}

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="content-bottom-cta" data-reveal>
        <div className="portal-shell content-bottom-cta-inner">
          <div>
            <span className="content-section-eyebrow">NEXT STEP</span>
            <h2>Ready to find your course in India?</h2>
            <p style={{ color: "#c5dedb", fontSize: "14px", marginTop: "4px" }}>
              Explore over 24,000 verified courses across 35+ apex universities with up to 100% scholarships.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link to="/courses" className="content-cta-button secondary" style={{ background: "#ffffff", color: "#0b655d" }}>
              Browse 24,000+ Courses <GraduationCap size={16} />
            </Link>
            {internalCta ? (
              <Link to={ctaHref} className="content-cta-button">
                {page.ctaLabel || "Create a student account"} <ArrowRight size={16} />
              </Link>
            ) : (
              <a href={ctaHref} className="content-cta-button">
                {page.ctaLabel || "Contact DRAA"} <ArrowRight size={16} />
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
