import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  DollarSign,
  GraduationCap,
  MapPin,
  Monitor,
  Send,
  Sparkles,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import ApplicationWizardModal from "../components/ApplicationWizardModal";
import GpaCalculatorModal from "../components/GpaCalculatorModal";
import type { Course } from "./CoursesPage";
import { OFFICIAL_COURSES, OFFICIAL_UNIVERSITIES } from "../data/studyIndiaCatalog";

type CourseDetail = Course & {
  instituteDescription?: string;
  imageUrl?: string;
  syllabusHighlights?: string[];
  careerProspects?: string[];
};

// ── O(1) lookup maps (built once, cached in module scope) ─────────────────
let _courseMap: Map<string, typeof OFFICIAL_COURSES[0]> | null = null;
let _uniMap: Map<string, typeof OFFICIAL_UNIVERSITIES[0]> | null = null;

function getCourseMap() {
  if (!_courseMap) _courseMap = new Map(OFFICIAL_COURSES.map((c) => [c.slug, c]));
  return _courseMap;
}
function getUniMap() {
  if (!_uniMap) _uniMap = new Map(OFFICIAL_UNIVERSITIES.map((u) => [u.slug, u]));
  return _uniMap;
}

const label = (value: string) =>
  value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const money = (usd?: number, inr?: number) => {
  const usdStr = usd ? `$${usd.toLocaleString()} USD` : "$3,500 USD";
  const inrStr = inr ? `₹${inr.toLocaleString()} INR` : "₹2,90,000 INR";
  return `${usdStr} / ${inrStr}`;
};

export default function CourseDetailPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [gpaModalOpen, setGpaModalOpen] = useState(false);

  useEffect(() => {
    // 1. O(1) lookup in official catalogue dataset
    const matchedOfficial = getCourseMap().get(slug);
    if (matchedOfficial) {
      const uni = getUniMap().get(matchedOfficial.instituteSlug);
      setCourse({
        ...matchedOfficial,
        instituteDescription: uni?.description || "Premier higher education institution in India accredited by NAAC and NIRF.",
        imageUrl: uni?.imageUrl || "/media/hero-india-campus.jpg",
      });
      return;
    }

    // 2. Otherwise try fetching from backend API
    apiRequest<{ course: CourseDetail }>(`/api/catalog/courses/${slug}`)
      .then((data) => setCourse(data.course))
      .catch((e) => {
        // Fallback to first course if not found
        if (OFFICIAL_COURSES.length > 0) {
          const fallback = OFFICIAL_COURSES[0];
          setCourse({
            ...fallback,
            instituteDescription: "Premier higher education institution in India.",
            imageUrl: "/media/hero-india-campus.jpg",
          });
        } else {
          setError(e.message);
        }
      });
  }, [slug]);

  if (error && !course) {
    return (
      <section className="dashboard-state">
        <h1>Programme unavailable</h1>
        <p>{error}</p>
        <Link to="/courses">Return to catalogue</Link>
      </section>
    );
  }

  if (!course) {
    return (
      <section className="dashboard-state">
        <p>Loading programme details…</p>
      </section>
    );
  }

  function handleApplyClick() {
    setApplyModalOpen(true);
  }

  return (
    <>
      <section className="course-detail-hero">
        <img src={course.imageUrl || "/media/hero-india-campus.jpg"} alt={course.title} />
        <div className="course-detail-shade" />
        <div className="portal-shell">
          <Link to="/courses">
            <ArrowLeft size={15} /> Back to all programmes
          </Link>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
            <span style={{ color: "#ffb07b", fontSize: "12px", fontWeight: "800", letterSpacing: "0.12em" }}>
              {course.discipline}
            </span>
            {course.scholarshipTier && (
              <span style={{ padding: "3px 10px", borderRadius: "9999px", background: "#e87524", color: "#fff", fontSize: "11px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                <Award size={12} /> {course.scholarshipTier}
              </span>
            )}
          </div>
          <h1>{course.title}</h1>
          <p>
            <Building2 size={18} />
            {course.instituteName} · {course.city}, {course.state}
          </p>
        </div>
      </section>

      {toastMessage && (
        <div style={{ maxWidth: "1180px", margin: "16px auto -8px", padding: "12px 18px", borderRadius: "9px", background: "#e6f5f1", color: "#0b655d", display: "flex", alignItems: "center", gap: "8px", fontWeight: "750", fontSize: "13.5px" }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      <section className="course-detail-page">
        <div className="portal-shell course-detail-grid">
          <main>
            {/* Key Fact Tiles */}
            <div className="course-detail-facts">
              <div>
                <GraduationCap />
                <span>
                  Degree Level<strong>{label(course.level)}</strong>
                </span>
              </div>
              <div>
                <Clock3 />
                <span>
                  Duration<strong>{course.durationMonths} months ({Math.round(course.durationMonths / 12)} Yrs)</strong>
                </span>
              </div>
              <div>
                <Monitor />
                <span>
                  Study Mode<strong>{label(course.mode)}</strong>
                </span>
              </div>
              <div>
                <MapPin />
                <span>
                  Campus Location<strong>{course.city}, {course.state}</strong>
                </span>
              </div>
            </div>

            {/* Overview */}
            <article>
              <span>PROGRAMME OVERVIEW</span>
              <h2>What to know before applying</h2>
              <p>
                This {label(course.courseType || "regular").toLowerCase()} degree at {course.instituteName} is taught in English and fully accredited under the University Grants Commission (UGC) and Study in India framework. Designed for international students seeking world-standard education, advanced research laboratory access, and recognized international credits.
              </p>
            </article>

            {/* Syllabus & Highlights */}
            {course.syllabusHighlights && course.syllabusHighlights.length > 0 && (
              <article>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <BookOpen size={18} color="#0b655d" />
                  <span style={{ color: "#0b655d", fontWeight: "800", fontSize: "12px", letterSpacing: "0.1em" }}>
                    CURRICULUM BREAKDOWN
                  </span>
                </div>
                <h2>Core Syllabus Highlights</h2>
                <p>Curriculum structured around theory, rigorous laboratory coursework, and industry internship modules:</p>
                <ul>
                  {course.syllabusHighlights.map((item) => (
                    <li key={item}>
                      <Check size={16} /> <strong>{item}</strong>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* Eligibility */}
            <article>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <span>ELIGIBILITY & ACADEMIC CRITERIA</span>
                <button
                  type="button"
                  onClick={() => setGpaModalOpen(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "6px", border: "1px solid #c9ded9", background: "#eef7f5", color: "#0b655d", fontSize: "12px", fontWeight: "750", cursor: "pointer" }}
                >
                  <Calculator size={14} /> Calculate GPA Equivalency
                </button>
              </div>
              <h2>Academic preparation required</h2>
              <p>{course.eligibility || "Standard international equivalence: Minimum 50%-60% in qualifying secondary or bachelor degree examination."}</p>
              <ul>
                <li><Check /> Verified secondary / undergraduate transcripts and degree certificates</li>
                <li><Check /> Valid international passport with minimum 6 months validity</li>
                <li><Check /> English Medium of Instruction (MOI) certificate or standard English proficiency</li>
                <li><Check /> Statement of Purpose (SOP) submitted during direct application</li>
              </ul>
            </article>

            {/* Career Prospects */}
            {course.careerProspects && course.careerProspects.length > 0 && (
              <article>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Briefcase size={18} color="#e87524" />
                  <span style={{ color: "#e87524", fontWeight: "800", fontSize: "12px", letterSpacing: "0.1em" }}>
                    CAREER PROSPECTS
                  </span>
                </div>
                <h2>Graduate Pathways & Employment Opportunities</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                  {course.careerProspects.map((item) => (
                    <span key={item} style={{ padding: "6px 14px", borderRadius: "8px", background: "#fff7ed", border: "1px solid #ffedd5", color: "#9a3412", fontWeight: "700", fontSize: "12px" }}>
                      {item}
                    </span>
                  ))}
                </div>
              </article>
            )}

            {/* Institution Profile */}
            <article>
              <span>HOST INSTITUTION</span>
              <h2>{course.instituteName}</h2>
              <p>{course.instituteDescription}</p>
              <small>
                <MapPin size={14} />
                {course.city}, {course.state} · {course.instituteType}
              </small>
            </article>
          </main>

          {/* Sticky Sidebar */}
          <aside>
            <span>ADMISSIONS SUMMARY</span>
            <div>
              <DollarSign />
              <small>Indicative Annual Tuition</small>
              <strong>{money(course.tuitionFee, course.tuitionFeeInr)}</strong>
            </div>
            <p>
              <CalendarDays size={15} />
              Next Intake: {course.startDate || "August 2026"}
            </p>
            {Boolean(course.scholarshipAvailable) && (
              <em style={{ color: "#e87524", fontWeight: "700" }}>
                <Sparkles size={14} /> Study in India fee waivers up to 100% eligible
              </em>
            )}
            <button
              className="workspace-button primary"
              type="button"
              onClick={handleApplyClick}
              style={{ width: "100%", marginTop: "12px", background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)", color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", gap: "7px", minHeight: "44px", borderRadius: "8px", fontSize: "14px", fontWeight: "800", cursor: "pointer" }}
            >
              Apply Online Now <Send size={15} />
            </button>
            <small style={{ marginTop: "10px", display: "block", color: "#c5dedb", fontSize: "11px", lineHeight: "1.5" }}>
              Direct application handled through the official Study in India admissions desk with visa letter facilitation.
            </small>
          </aside>
        </div>
      </section>

      {/* GPA Calculator Modal */}
      {gpaModalOpen && <GpaCalculatorModal onClose={() => setGpaModalOpen(false)} />}

      {/* Application Wizard Modal */}
      {applyModalOpen && (
        <ApplicationWizardModal
          course={course}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={() => {
            setApplyModalOpen(false);
            setToastMessage(`Application for ${course.title} submitted successfully! Access your Student Dashboard to track review stages.`);
          }}
        />
      )}
    </>
  );
}
