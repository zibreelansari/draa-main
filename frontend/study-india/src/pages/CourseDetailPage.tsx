import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";
import ApplicationWizardModal from "../components/ApplicationWizardModal";
import GpaCalculatorModal from "../components/GpaCalculatorModal";
import type { Course } from "./CoursesPage";

type CourseDetail = Course & { instituteDescription: string; imageUrl: string };
const label = (value: string) => value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const money = (value?: number, currency: string = "USD") => {
  if (value === undefined || value === null) return "Confirm with institution";
  const curr = (currency || "USD").toUpperCase();
  try {
    const locale = curr === "INR" ? "en-IN" : "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency: curr, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${curr} ${value.toLocaleString()}`;
  }
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
    apiRequest<{ course: CourseDetail }>(`/api/catalog/courses/${slug}`)
      .then((data) => setCourse(data.course))
      .catch((e) => setError(e.message));
  }, [slug]);

  if (error)
    return (
      <section className="dashboard-state">
        <h1>Programme unavailable</h1>
        <p>{error}</p>
        <Link to="/courses">Return to catalogue</Link>
      </section>
    );
  if (!course)
    return (
      <section className="dashboard-state">
        <p>Loading programme details…</p>
      </section>
    );

  function handleApplyClick() {
    apiRequest("/api/workspaces/student")
      .then(() => setApplyModalOpen(true))
      .catch(() => navigate("/login/student"));
  }

  return (
    <>
      <section className="course-detail-hero">
        <img src={course.imageUrl} alt="" />
        <div className="course-detail-shade" />
        <div className="portal-shell">
          <Link to="/courses">
            <ArrowLeft size={15} /> Back to all programmes
          </Link>
          <span>{course.discipline}</span>
          <h1>{course.title}</h1>
          <p>
            <Building2 size={17} />
            {course.instituteName}
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
            <div className="course-detail-facts">
              <div>
                <GraduationCap />
                <span>
                  Level<strong>{label(course.level)}</strong>
                </span>
              </div>
              <div>
                <Clock3 />
                <span>
                  Duration<strong>{course.durationMonths} months</strong>
                </span>
              </div>
              <div>
                <Monitor />
                <span>
                  Study mode<strong>{label(course.mode)}</strong>
                </span>
              </div>
              <div>
                <MapPin />
                <span>
                  Location<strong>{course.city}, {course.state}</strong>
                </span>
              </div>
            </div>

            <article>
              <span>PROGRAMME OVERVIEW</span>
              <h2>What to know before applying</h2>
              <p>
                This {label(course.courseType).toLowerCase()} programme at {course.instituteName} is delivered in English and verified by the Indian Ministry of Education and Study in India (SII) guidelines.
              </p>
            </article>

            <article>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>ELIGIBILITY & CRITERIA</span>
                <button
                  type="button"
                  onClick={() => setGpaModalOpen(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "6px", border: "1px solid #c9ded9", background: "#eef7f5", color: "#0b655d", fontSize: "11.5px", fontWeight: "750", cursor: "pointer" }}
                >
                  <Calculator size={13} /> Convert My Foreign GPA
                </button>
              </div>
              <h2>Academic preparation</h2>
              <p>{course.eligibility || "Standard international equivalence: Minimum 50%-60% in qualifying degree/school."}</p>
              <ul>
                <li><Check /> Verified academic transcripts and graduation certificates</li>
                <li><Check /> Valid international passport with minimum 6 months validity</li>
                <li><Check /> English proficiency score (IELTS, TOEFL, Duolingo or MOI English certificate)</li>
                <li><Check /> Statement of Purpose (SOP) submitted during direct application</li>
              </ul>
            </article>

            <article>
              <span>INSTITUTION</span>
              <h2>{course.instituteName}</h2>
              <p>{course.instituteDescription}</p>
              <small>
                <MapPin size={14} />
                {course.city}, {course.state} · {course.instituteType}
              </small>
            </article>
          </main>

          <aside>
            <span>ADMISSIONS SUMMARY</span>
            <div>
              <DollarSign />
              <small>Indicative annual tuition</small>
              <strong>{money(course.tuitionFee || course.tuitionFeeInr, course.currency || "USD")}</strong>
            </div>
            <p>
              <CalendarDays size={15} />
              Indicative intake: {course.startDate ? new Date(course.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Fall 2026"}
            </p>
            {Boolean(course.scholarshipAvailable) && (
              <em style={{ color: "#e87524", fontWeight: "700" }}>
                <Sparkles size={14} /> Study in India fee waivers up to 100% available
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
            <small>Direct application processed through the secure Study in India admissions gateway.</small>
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
