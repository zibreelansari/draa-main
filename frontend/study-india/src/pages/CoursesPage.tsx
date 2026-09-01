import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useReveal } from "../hooks/useReveal";
import ApplicationWizardModal from "../components/ApplicationWizardModal";
import GpaCalculatorModal from "../components/GpaCalculatorModal";

export type Course = {
  id: string | number;
  title: string;
  slug: string;
  discipline: string;
  level: string;
  durationMonths: number;
  tuitionFee?: number;
  tuitionFeeInr?: number;
  currency?: string;
  mode: string;
  courseType: string;
  scholarshipAvailable: number | boolean;
  eligibility: string;
  startDate?: string;
  instituteName: string;
  instituteSlug: string;
  instituteType: string;
  city: string;
  state: string;
};

type Institute = { id: string | number; name: string; slug: string; city: string; state: string; type: string; description: string; imageUrl: string };
type Filters = { discipline: string; level: string; state: string; mode: string; courseType: string; scholarship: boolean };
const emptyFilters: Filters = { discipline: "", level: "", state: "", mode: "", courseType: "", scholarship: false };
const formatLabel = (value: string) => value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const formatCourseFee = (fee?: number, currency: string = "USD") => {
  if (fee === undefined || fee === null) return "Confirm fee";
  const curr = (currency || "USD").toUpperCase();
  try {
    const locale = curr === "INR" ? "en-IN" : "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency: curr, maximumFractionDigits: 0 }).format(fee);
  } catch {
    return `${curr} ${fee.toLocaleString()}`;
  }
};

export default function CoursesPage() {
  useReveal();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [view, setView] = useState<"courses" | "institutes">("courses");
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [applyingCourse, setApplyingCourse] = useState<Course | null>(null);
  const [gpaModalOpen, setGpaModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([
      apiRequest<{ courses: Course[] }>("/api/catalog/courses"),
      apiRequest<{ institutes: Institute[] }>("/api/catalog/institutes"),
    ])
      .then(([courseData, instituteData]) => {
        setCourses(courseData.courses);
        setInstitutes(instituteData.institutes);
      })
      .catch((e) => setError(e.message));
  }, []);

  const options = useMemo(
    () => ({
      disciplines: [...new Set(courses.map((c) => c.discipline))].sort(),
      states: [...new Set(courses.map((c) => c.state))].sort(),
    }),
    [courses]
  );

  const visibleCourses = useMemo(
    () =>
      courses.filter((course) => {
        const haystack = `${course.title} ${course.discipline} ${course.instituteName} ${course.city} ${course.state}`.toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) &&
          (!filters.discipline || course.discipline === filters.discipline) &&
          (!filters.level || course.level === filters.level) &&
          (!filters.state || course.state === filters.state) &&
          (!filters.mode || course.mode === filters.mode) &&
          (!filters.courseType || course.courseType === filters.courseType) &&
          (!filters.scholarship || Boolean(course.scholarshipAvailable))
        );
      }),
    [courses, query, filters]
  );

  const visibleInstitutes = useMemo(
    () => institutes.filter((institute) => `${institute.name} ${institute.type} ${institute.city} ${institute.state}`.toLowerCase().includes(query.toLowerCase())),
    [institutes, query]
  );

  const setFilter = (name: keyof Filters, value: string | boolean) => setFilters((current) => ({ ...current, [name]: value }));

  function handleApplyClick(course: Course) {
    // Check if logged in by fetching student workspace
    apiRequest("/api/workspaces/student")
      .then(() => {
        setApplyingCourse(course);
      })
      .catch(() => {
        navigate("/login/student");
      });
  }

  return (
    <>
      <section className="catalogue-hero">
        <div className="portal-shell" data-reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "var(--orange)", fontWeight: "800", fontSize: "12px", letterSpacing: "0.14em" }}>
            <Sparkles size={16} /> DRAA INTERNATIONAL PROGRAMME DISCOVERY
          </div>
          <h1>Explore accredited courses and institutions across India.</h1>
          <p>
            Search India's premier academic catalogue with transparent international tuition in USD & local currencies, scholarship eligibility calculator, and 1-click application builder.
          </p>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", margin: "14px 0" }}>
            <button
              type="button"
              onClick={() => setGpaModalOpen(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "750",
                cursor: "pointer",
              }}
            >
              <Calculator size={15} color="#ffb07b" /> Check International GPA & Eligibility Equivalency
            </button>
          </div>

          <label className="catalogue-search">
            <Search size={20} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={view === "courses" ? "Search by course, discipline, degree or institution" : "Search by institution, city or accreditation"}
            />
          </label>
          <div className="catalogue-switch" role="tablist" aria-label="Catalogue view">
            <button role="tab" aria-selected={view === "courses"} onClick={() => setView("courses")}>
              <BookOpen size={16} /> Courses <strong>{courses.length}</strong>
            </button>
            <button role="tab" aria-selected={view === "institutes"} onClick={() => setView("institutes")}>
              <Building2 size={16} /> Institutes <strong>{institutes.length}</strong>
            </button>
          </div>
        </div>
      </section>

      {toastMessage && (
        <div style={{ maxWidth: "1180px", margin: "16px auto -8px", padding: "12px 18px", borderRadius: "9px", background: "#e6f5f1", color: "#0b655d", display: "flex", alignItems: "center", gap: "8px", fontWeight: "750", fontSize: "13.5px" }}>
          <CheckCircle2 size={18} /> {toastMessage}
        </div>
      )}

      <section className="catalogue-page">
        <div className="portal-shell">
          {error && <p className="form-error">{error}</p>}
          {view === "courses" ? (
            <div className="catalogue-layout">
              <aside className="catalogue-filters" data-reveal>
                <header>
                  <SlidersHorizontal size={18} />
                  <strong>Filter programmes</strong>
                </header>
                <label>
                  Discipline
                  <select value={filters.discipline} onChange={(e) => setFilter("discipline", e.target.value)}>
                    <option value="">All disciplines</option>
                    {options.disciplines.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Programme level
                  <select value={filters.level} onChange={(e) => setFilter("level", e.target.value)}>
                    <option value="">All levels</option>
                    {["UNDERGRADUATE", "POSTGRADUATE", "DOCTORAL", "CERTIFICATE"].map((value) => (
                      <option key={value} value={value}>
                        {formatLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  State
                  <select value={filters.state} onChange={(e) => setFilter("state", e.target.value)}>
                    <option value="">All states</option>
                    {options.states.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Study mode
                  <select value={filters.mode} onChange={(e) => setFilter("mode", e.target.value)}>
                    <option value="">All modes</option>
                    {["OFFLINE", "BLENDED", "ONLINE"].map((value) => (
                      <option key={value} value={value}>
                        {formatLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Course type
                  <select value={filters.courseType} onChange={(e) => setFilter("courseType", e.target.value)}>
                    <option value="">All course types</option>
                    {["REGULAR", "SHORT_TERM", "SKILL_BASED"].map((value) => (
                      <option key={value} value={value}>
                        {formatLabel(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="filter-checkbox">
                  <input type="checkbox" checked={filters.scholarship} onChange={(e) => setFilter("scholarship", e.target.checked)} /> Fee support indicated
                </label>
                <button
                  onClick={() => {
                    setFilters(emptyFilters);
                    setQuery("");
                  }}
                >
                  Clear all filters
                </button>
              </aside>
              <div className="catalogue-results">
                <header>
                  <div>
                    <span>PROGRAMMES</span>
                    <h2>{visibleCourses.length} opportunities found</h2>
                  </div>
                  <small>Live Verified Catalogue · Global Student Admissions Open</small>
                </header>
                <div className="programme-results">
                  {visibleCourses.map((course) => (
                    <article key={course.id} data-reveal>
                      <div className="programme-card-top">
                        <span>{formatLabel(course.courseType)}</span>
                        {Boolean(course.scholarshipAvailable) && <em>Fee support indicated</em>}
                      </div>
                      <h3>{course.title}</h3>
                      <p>{course.instituteName}</p>
                      <div className="programme-meta">
                        <span>
                          <GraduationCap size={14} />
                          {formatLabel(course.level)}
                        </span>
                        <span>
                          <MapPin size={14} />
                          {course.city}, {course.state}
                        </span>
                        <span>
                          <CalendarDays size={14} />
                          {course.durationMonths} months · {formatLabel(course.mode)}
                        </span>
                      </div>
                      <div className="programme-card-bottom">
                        <div>
                          <small>Indicative tuition</small>
                          <strong>{formatCourseFee(course.tuitionFee || course.tuitionFeeInr, course.currency || "USD")}</strong>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <Link to={`/courses/${course.slug}`} className="workspace-link-button">
                            Details
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleApplyClick(course)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "5px",
                              padding: "7px 14px",
                              borderRadius: "7px",
                              border: 0,
                              background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)",
                              color: "#fff",
                              fontWeight: "750",
                              fontSize: "12.5px",
                              cursor: "pointer",
                            }}
                          >
                            Apply <Send size={12} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {!visibleCourses.length && (
                  <div className="catalogue-empty">
                    <Search size={28} />
                    <h3>No programmes match these filters.</h3>
                    <p>Clear one or more filters and try again.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="institute-results">
              <header data-reveal>
                <span>INSTITUTION DIRECTORY</span>
                <h2>{visibleInstitutes.length} verified institution profiles</h2>
                <p>Top accredited universities and autonomous institutes welcoming foreign students under Study in India.</p>
              </header>
              <div>
                {visibleInstitutes.map((institute) => (
                  <article key={institute.id} data-reveal>
                    <img src={institute.imageUrl} alt="" />
                    <div>
                      <span>{institute.type}</span>
                      <h3>{institute.name}</h3>
                      <p>{institute.description}</p>
                      <small>
                        <MapPin size={14} />
                        {institute.city}, {institute.state}
                      </small>
                      <button
                        onClick={() => {
                          setView("courses");
                          setQuery(institute.name);
                        }}
                      >
                        View programmes <ArrowRight size={14} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* GPA Calculator Modal */}
      {gpaModalOpen && <GpaCalculatorModal onClose={() => setGpaModalOpen(false)} />}

      {/* 5-Step Application Wizard Modal */}
      {applyingCourse && (
        <ApplicationWizardModal
          course={applyingCourse}
          onClose={() => setApplyingCourse(null)}
          onSuccess={() => {
            setApplyingCourse(null);
            setToastMessage(`Application for ${applyingCourse.title} submitted successfully! Check your student dashboard for timeline updates.`);
            setTimeout(() => setToastMessage(""), 8000);
          }}
        />
      )}
    </>
  );
}
