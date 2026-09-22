import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Compass,
  DollarSign,
  ExternalLink,
  GraduationCap,
  Info,
  Layers,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { useReveal } from "../hooks/useReveal";
import ApplicationWizardModal from "../components/ApplicationWizardModal";
import GpaCalculatorModal from "../components/GpaCalculatorModal";
import {
  OFFICIAL_COURSES,
  OFFICIAL_UNIVERSITIES,
  OfficialCourse,
  OfficialUniversity,
  STUDY_INDIA_DISCIPLINES,
  STUDY_INDIA_STATES,
} from "../data/studyIndiaCatalog";

/** Items shown per page — tuned for fast rendering + good UX scroll depth */
const PAGE_SIZE = 24;

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
  scholarshipTier?: string;
  eligibility: string;
  startDate?: string;
  instituteName: string;
  instituteSlug: string;
  instituteType: string;
  city: string;
  state: string;
  nirfRank?: string;
  naacGrade?: string;
  syllabusHighlights?: string[];
  careerProspects?: string[];
  medium?: string;
};

type Institute = {
  id: string | number;
  name: string;
  slug: string;
  city: string;
  state: string;
  type: string;
  description: string;
  imageUrl: string;
  nirfRank?: string;
  naacGrade?: string;
  established?: string;
  tuitionPerYearUSD?: string;
  tuitionPerYearINR?: string;
  website?: string;
  facilities?: string[];
  coursesCount?: number;
};

type Filters = {
  discipline: string;
  level: string;
  state: string;
  mode: string;
  scholarshipOnly: boolean;
  feeRange: string;
};

const emptyFilters: Filters = {
  discipline: "",
  level: "",
  state: "",
  mode: "",
  scholarshipOnly: false,
  feeRange: "",
};

const formatLabel = (value: string) =>
  value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function CoursesPage() {
  useReveal();
  const navigate = useNavigate();

  // Lazy state init — the array reference is reused, not re-created on every render
  const [courses, setCourses] = useState<Course[]>(() => OFFICIAL_COURSES);
  const [institutes, setInstitutes] = useState<Institute[]>(() => OFFICIAL_UNIVERSITIES);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [view, setView] = useState<"courses" | "institutes">("courses");
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [selectedDisciplinePill, setSelectedDisciplinePill] = useState<string>("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [instPage, setInstPage] = useState(1);
  const resultsTopRef = useRef<HTMLDivElement>(null);

  // Quick View Modal
  const [quickViewCourse, setQuickViewCourse] = useState<Course | null>(null);

  // Application & GPA Modals
  const [applyingCourse, setApplyingCourse] = useState<Course | null>(null);
  const [gpaModalOpen, setGpaModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // ── Debounce search input (300ms) to avoid filtering 24K items on every keystroke
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(1); // reset to page 1 on new search
      setInstPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
    setInstPage(1);
  }, [filters]);

  // Attempt background sync with backend API if running
  useEffect(() => {
    Promise.all([
      apiRequest<{ courses: Course[] }>("/api/catalog/courses").catch(() => null),
      apiRequest<{ institutes: Institute[] }>("/api/catalog/institutes").catch(() => null),
    ]).then(([backendCourses, backendInstitutes]) => {
      if (backendCourses?.courses && backendCourses.courses.length > 0) {
        const officialSlugs = new Set(OFFICIAL_COURSES.map((c) => c.slug));
        const customBackend = backendCourses.courses.filter((c) => !officialSlugs.has(c.slug));
        setCourses([...OFFICIAL_COURSES, ...customBackend]);
      }
      if (backendInstitutes?.institutes && backendInstitutes.institutes.length > 0) {
        const officialSlugs = new Set(OFFICIAL_UNIVERSITIES.map((u) => u.slug));
        const customBackend = backendInstitutes.institutes.filter((u) => !officialSlugs.has(u.slug));
        setInstitutes([...OFFICIAL_UNIVERSITIES, ...customBackend]);
      }
    });
  }, []);

  const setFilter = (name: keyof Filters, value: string | boolean) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handlePillSelect = (pill: string) => {
    setSelectedDisciplinePill(pill);
    if (pill === "All") {
      setFilter("discipline", "");
    } else {
      setFilter("discipline", pill);
    }
  };

  const formatMoney = (usd?: number, inr?: number) => {
    if (currency === "INR" && inr) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(inr);
    }
    if (usd) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(usd);
    }
    return currency === "INR" ? "₹2,50,000/yr" : "$3,000/yr";
  };

  // ── Filtered results (uses debounced query so we don't re-filter on every keystroke)
  const filteredCourses = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    return courses.filter((course) => {
      const haystack = `${course.title} ${course.discipline} ${course.instituteName} ${course.city} ${course.state} ${course.level}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesDiscipline = !filters.discipline || course.discipline.toLowerCase().includes(filters.discipline.toLowerCase());
      const matchesLevel = !filters.level || course.level.toUpperCase() === filters.level.toUpperCase();
      const matchesState = !filters.state || course.state.toLowerCase() === filters.state.toLowerCase();
      const matchesMode = !filters.mode || course.mode.toUpperCase() === filters.mode.toUpperCase();
      const matchesScholarship = !filters.scholarshipOnly || Boolean(course.scholarshipAvailable);

      let matchesFee = true;
      if (filters.feeRange === "under2500") {
        matchesFee = (course.tuitionFee || 0) < 2500;
      } else if (filters.feeRange === "2500to5000") {
        matchesFee = (course.tuitionFee || 0) >= 2500 && (course.tuitionFee || 0) <= 5000;
      } else if (filters.feeRange === "above5000") {
        matchesFee = (course.tuitionFee || 0) > 5000;
      }

      return matchesQuery && matchesDiscipline && matchesLevel && matchesState && matchesMode && matchesScholarship && matchesFee;
    });
  }, [courses, debouncedQuery, filters]);

  const filteredInstitutes = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    return institutes.filter((institute) => {
      const haystack = `${institute.name} ${institute.type} ${institute.city} ${institute.state} ${institute.nirfRank || ""}`.toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesState = !filters.state || institute.state.toLowerCase() === filters.state.toLowerCase();
      return matchesQuery && matchesState;
    });
  }, [institutes, debouncedQuery, filters.state]);

  // ── Paginate: only render PAGE_SIZE items at a time ─────────────────────────
  const courseTotalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
  const instTotalPages = Math.max(1, Math.ceil(filteredInstitutes.length / PAGE_SIZE));

  const visibleCourses = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCourses.slice(start, start + PAGE_SIZE);
  }, [filteredCourses, currentPage]);

  const visibleInstitutes = useMemo(() => {
    const start = (instPage - 1) * PAGE_SIZE;
    return filteredInstitutes.slice(start, start + PAGE_SIZE);
  }, [filteredInstitutes, instPage]);

  /** Scroll to results area after page change */
  const goToPage = useCallback((page: number, target: "courses" | "institutes") => {
    if (target === "courses") {
      setCurrentPage(Math.max(1, Math.min(page, courseTotalPages)));
    } else {
      setInstPage(Math.max(1, Math.min(page, instTotalPages)));
    }
    resultsTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [courseTotalPages, instTotalPages]);

  function handleApplyClick(course: Course) {
    apiRequest("/api/workspaces/student")
      .then(() => {
        setApplyingCourse(course);
      })
      .catch(() => {
        // Allow applying via guest / student account flow
        setApplyingCourse(course);
      });
  }

  const activeFiltersCount =
    (filters.discipline ? 1 : 0) +
    (filters.level ? 1 : 0) +
    (filters.state ? 1 : 0) +
    (filters.mode ? 1 : 0) +
    (filters.scholarshipOnly ? 1 : 0) +
    (filters.feeRange ? 1 : 0);

  return (
    <div className="courses-explorer-page">
      {/* ═══════════════ HERO BANNER ═══════════════ */}
      <section className="catalogue-hero">
        <img className="catalogue-hero-bg" src="/media/courses-hero.jpg" alt="Indian university campus library" />
        <div className="catalogue-hero-overlay" />
        <div className="portal-shell" data-reveal>
          <div className="catalogue-hero-eyebrow">
            <span className="sii-flag-dot" />
            <Sparkles size={14} color="#ffb07b" />
            <span>OFFICIAL STUDY IN INDIA (SII) PROGRAMME DISCOVERY</span>
          </div>

          <h1 className="catalogue-hero-title">
            Explore 24,000+ Courses & Top Accredited Universities in India
          </h1>
          <p className="catalogue-hero-desc">
            Direct international admissions with verified tuition fees in USD & INR, 100% Study in India merit scholarships, English-taught curricula, and NAAC A++ accredited institutions.
          </p>

          {/* Quick Metrics Strip */}
          <div className="catalogue-quick-metrics">
            <div className="metric-chip">
              <Building2 size={16} color="#0b655d" />
              <span><strong>35+</strong> Apex Universities</span>
            </div>
            <div className="metric-chip">
              <BookOpen size={16} color="#ea580c" />
              <span><strong>100+</strong> Flagship Degrees</span>
            </div>
            <div className="metric-chip">
              <Award size={16} color="#2563eb" />
              <span><strong>Up to 100%</strong> SII Fee Waivers</span>
            </div>
            <div className="metric-chip">
              <GraduationCap size={16} color="#16a34a" />
              <span><strong>English</strong> Medium Instruction</span>
            </div>
          </div>

          {/* Search Bar + Controls */}
          <div className="catalogue-search-row">
            <div className="catalogue-search-box">
              <Search size={20} className="search-icon" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  view === "courses"
                    ? "Search courses (e.g. B.Tech Computer Science, MBA, MBBS, Data Science, Yoga)..."
                    : "Search universities (e.g. IIT Delhi, IISc, Delhi University, JNU, BITS)..."
                }
                aria-label="Search catalogue"
              />
              {query && (
                <button type="button" className="search-clear-btn" onClick={() => setQuery("")} title="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="catalogue-actions-cluster">
              {/* Currency Switcher */}
              <div className="currency-toggle" role="group" aria-label="Select currency">
                <button
                  type="button"
                  className={currency === "USD" ? "active" : ""}
                  onClick={() => setCurrency("USD")}
                  title="Display in US Dollars ($)"
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  className={currency === "INR" ? "active" : ""}
                  onClick={() => setCurrency("INR")}
                  title="Display in Indian Rupees (₹)"
                >
                  INR (₹)
                </button>
              </div>

              {/* GPA Calculator Button */}
              <button
                type="button"
                className="gpa-calc-trigger"
                onClick={() => setGpaModalOpen(true)}
              >
                <Calculator size={16} />
                <span>GPA Evaluator</span>
              </button>
            </div>
          </div>

          {/* Quick Discipline Pills */}
          <div className="discipline-pills-bar">
            {["All", ...STUDY_INDIA_DISCIPLINES].map((pill) => (
              <button
                key={pill}
                type="button"
                className={`discipline-pill ${selectedDisciplinePill === pill ? "selected" : ""}`}
                onClick={() => handlePillSelect(pill)}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Dual Tab Switcher */}
          <div className="catalogue-switch-tabs" role="tablist" aria-label="Catalogue view modes">
            <button
              type="button"
              role="tab"
              aria-selected={view === "courses"}
              onClick={() => setView("courses")}
              className={`tab-btn ${view === "courses" ? "active" : ""}`}
            >
              <BookOpen size={17} />
              <span>Explore Courses</span>
              <span className="count-badge">{filteredCourses.length.toLocaleString()}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "institutes"}
              onClick={() => setView("institutes")}
              className={`tab-btn ${view === "institutes" ? "active" : ""}`}
            >
              <Building2 size={17} />
              <span>Universities & Campuses</span>
              <span className="count-badge">{filteredInstitutes.length.toLocaleString()}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="portal-toast">
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ═══════════════ MAIN CATALOGUE EXPLORER ═══════════════ */}
      <section className="catalogue-content-section">
        <div className="portal-shell">
          {/* Mobile Filter Toggle */}
          <div className="mobile-filter-bar">
            <button
              type="button"
              className="mobile-filter-trigger-btn"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              aria-expanded={mobileFiltersOpen}
            >
              <SlidersHorizontal size={16} />
              <span>{mobileFiltersOpen ? "Hide Filter Options" : "Filter Courses & Universities"}</span>
              {activeFiltersCount > 0 && (
                <span className="active-filters-count">{activeFiltersCount} active</span>
              )}
            </button>
          </div>

          <div className="catalogue-layout">
            {/* ── Filter Sidebar ── */}
            <aside className={`catalogue-filters-panel ${mobileFiltersOpen ? "mobile-open" : ""}`} data-reveal>
              <div className="filters-panel-header">
                <div className="header-title">
                  <SlidersHorizontal size={18} />
                  <strong>Filter Results</strong>
                </div>
                {activeFiltersCount > 0 && (
                  <span className="active-filters-count">{activeFiltersCount} active</span>
                )}
              </div>

              {/* Area of Study */}
              <div className="filter-group">
                <label htmlFor="filter-discipline">Area of Study / Discipline</label>
                <select
                  id="filter-discipline"
                  value={filters.discipline}
                  onChange={(e) => {
                    setFilter("discipline", e.target.value);
                    setSelectedDisciplinePill(e.target.value || "All");
                  }}
                >
                  <option value="">All Disciplines ({courses.length})</option>
                  {STUDY_INDIA_DISCIPLINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Degree Level */}
              <div className="filter-group">
                <label htmlFor="filter-level">Level of Study</label>
                <select
                  id="filter-level"
                  value={filters.level}
                  onChange={(e) => setFilter("level", e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="UNDERGRADUATE">Undergraduate (UG / Bachelor's)</option>
                  <option value="POSTGRADUATE">Postgraduate (PG / Master's)</option>
                  <option value="DOCTORAL">Doctoral (Ph.D. / Research)</option>
                  <option value="INTEGRATED">5-Year Integrated Degree</option>
                  <option value="DIPLOMA">Post-Graduate Diploma</option>
                </select>
              </div>

              {/* State / Location */}
              <div className="filter-group">
                <label htmlFor="filter-state">State / Location</label>
                <select
                  id="filter-state"
                  value={filters.state}
                  onChange={(e) => setFilter("state", e.target.value)}
                >
                  <option value="">All States in India</option>
                  {STUDY_INDIA_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Study Mode */}
              <div className="filter-group">
                <label htmlFor="filter-mode">Study Mode</label>
                <select
                  id="filter-mode"
                  value={filters.mode}
                  onChange={(e) => setFilter("mode", e.target.value)}
                >
                  <option value="">All Modes</option>
                  <option value="OFFLINE">Regular On-Campus (Offline)</option>
                  <option value="BLENDED">Blended / Hybrid</option>
                  <option value="ONLINE">Online Learning</option>
                </select>
              </div>

              {/* Tuition Budget */}
              <div className="filter-group">
                <label htmlFor="filter-fee">Indicative Tuition / Year</label>
                <select
                  id="filter-fee"
                  value={filters.feeRange}
                  onChange={(e) => setFilter("feeRange", e.target.value)}
                >
                  <option value="">Any Budget</option>
                  <option value="under2500">Under $2,500 / ₹2,00,000</option>
                  <option value="2500to5000">$2,500 – $5,000 / ₹2L – ₹4L</option>
                  <option value="above5000">Above $5,000 / ₹4L+</option>
                </select>
              </div>

              {/* Study in India Scholarship Toggle */}
              <div className="filter-checkbox-group">
                <label className="custom-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.scholarshipOnly}
                    onChange={(e) => setFilter("scholarshipOnly", e.target.checked)}
                  />
                  <span>Study in India (SII) Scholarship Eligible Only</span>
                </label>
              </div>

              {/* Reset Filters */}
              <button
                type="button"
                className="reset-filters-btn"
                onClick={() => {
                  setFilters(emptyFilters);
                  setSelectedDisciplinePill("All");
                  setQuery("");
                }}
              >
                Reset All Filters
              </button>
            </aside>

            {/* ── Main Results Panel ── */}
            <main className="catalogue-results-panel" ref={resultsTopRef}>
              {view === "courses" ? (
                <>
                  <div className="results-header">
                    <div>
                      <span className="results-eyebrow">VERIFIED COURSE LISTINGS</span>
                      <h2 className="results-title">
                        {filteredCourses.length.toLocaleString()} Programmes Available for 2026-27 Intake
                        {courseTotalPages > 1 && <span className="page-indicator"> — Page {currentPage} of {courseTotalPages}</span>}
                      </h2>
                    </div>
                    <span className="results-badge">
                      <CheckCircle2 size={14} color="#16a34a" /> Direct Admissions Open
                    </span>
                  </div>

                  <div className="courses-grid">
                    {visibleCourses.map((course) => (
                      <article key={course.id} className="course-card" data-reveal>
                        {/* Card Header & Badges */}
                        <div className="course-card-head">
                          <span className="course-level-badge">{formatLabel(course.level)}</span>
                          {course.scholarshipTier ? (
                            <span className="course-scholarship-badge" title="Scholarship available">
                              <Award size={12} /> {course.scholarshipTier}
                            </span>
                          ) : (
                            <span className="course-mode-badge">{formatLabel(course.mode)}</span>
                          )}
                        </div>

                        {/* Title & University */}
                        <h3 className="course-title">{course.title}</h3>
                        <div className="course-university">
                          <Building2 size={15} className="uni-icon" />
                          <span className="uni-name">{course.instituteName}</span>
                        </div>

                        {/* Location & Meta info */}
                        <div className="course-meta-tags">
                          <span className="meta-tag">
                            <MapPin size={13} /> {course.city}, {course.state}
                          </span>
                          <span className="meta-tag">
                            <CalendarDays size={13} /> {course.durationMonths} Months ({Math.round(course.durationMonths / 12)} Yrs)
                          </span>
                          {course.nirfRank && (
                            <span className="meta-tag rank-tag">
                              <Sparkles size={12} /> {course.nirfRank}
                            </span>
                          )}
                        </div>

                        {/* Syllabus snippet */}
                        {course.syllabusHighlights && course.syllabusHighlights.length > 0 && (
                          <div className="course-syllabus-preview">
                            <small>Key Modules:</small>
                            <div className="syllabus-chips">
                              {course.syllabusHighlights.slice(0, 3).map((item) => (
                                <span key={item} className="syllabus-chip">
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer with Tuition & Action Buttons */}
                        <div className="course-card-footer">
                          <div className="tuition-box">
                            <small>Annual Tuition ({currency})</small>
                            <strong>{formatMoney(course.tuitionFee, course.tuitionFeeInr)}</strong>
                          </div>

                          <div className="card-actions">
                            <button
                              type="button"
                              className="btn-quick-view"
                              onClick={() => setQuickViewCourse(course)}
                              title="View details and syllabus"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              className="btn-apply-now"
                              onClick={() => handleApplyClick(course)}
                            >
                              Apply <Send size={13} />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {!filteredCourses.length && (
                    <div className="catalogue-empty-state">
                      <Compass size={44} color="#ea580c" />
                      <h3>No programmes matched your current filters</h3>
                      <p>Try clearing specific filters like state or budget range to see more options.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setFilters(emptyFilters);
                          setSelectedDisciplinePill("All");
                          setQuery("");
                        }}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}

                  {/* ── Pagination Controls ── */}
                  {courseTotalPages > 1 && (
                    <nav className="catalogue-pagination" aria-label="Course results pagination">
                      <button type="button" disabled={currentPage <= 1} onClick={() => goToPage(1, "courses")} title="First page" aria-label="First page">
                        <ChevronsLeft size={18} />
                      </button>
                      <button type="button" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1, "courses")} title="Previous page" aria-label="Previous page">
                        <ChevronLeft size={18} />
                      </button>

                      <span className="pagination-info">
                        Page <strong>{currentPage}</strong> of <strong>{courseTotalPages}</strong>
                        <span className="pagination-total">({filteredCourses.length.toLocaleString()} results)</span>
                      </span>

                      <button type="button" disabled={currentPage >= courseTotalPages} onClick={() => goToPage(currentPage + 1, "courses")} title="Next page" aria-label="Next page">
                        <ChevronRight size={18} />
                      </button>
                      <button type="button" disabled={currentPage >= courseTotalPages} onClick={() => goToPage(courseTotalPages, "courses")} title="Last page" aria-label="Last page">
                        <ChevronsRight size={18} />
                      </button>
                    </nav>
                  )}
                </>
              ) : (
                /* ── Universities Tab View ── */
                <>
                  <div className="results-header">
                    <div>
                      <span className="results-eyebrow">INSTITUTION DIRECTORY</span>
                      <h2 className="results-title">
                        {filteredInstitutes.length.toLocaleString()} Accredited Partner Campuses
                        {instTotalPages > 1 && <span className="page-indicator"> — Page {instPage} of {instTotalPages}</span>}
                      </h2>
                    </div>
                    <span className="results-badge">
                      <Building2 size={14} color="#0b655d" /> Ministry Verified
                    </span>
                  </div>

                  <div className="institutes-grid">
                    {visibleInstitutes.map((inst) => (
                      <article key={inst.id} className="institute-card text-only-card" data-reveal>
                        <div className="inst-card-top">
                          <div className="inst-icon-box">
                            <Building2 size={24} color="#334155" />
                          </div>
                          <div className="inst-header-text">
                            <h3>{inst.name}</h3>
                            <span>{inst.city}, {inst.state}</span>
                          </div>
                        </div>
                        
                        <div className="inst-card-bottom">
                          <ul className="inst-details-list">
                            <li>
                              <MapPin size={16} /> <span>{inst.city}</span>
                            </li>
                            <li>
                              <GraduationCap size={16} /> <span>{inst.type}</span>
                            </li>
                            <li>
                              <Award size={16} /> <span>NIRF Rank: {inst.nirfRank || 'NA'}</span>
                            </li>
                          </ul>
                          
                          <div className="inst-card-actions" style={{ justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn-inst-details"
                              onClick={() => {
                                setView("courses");
                                setQuery(inst.name);
                              }}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>

                  {/* ── Institutes Pagination ── */}
                  {instTotalPages > 1 && (
                    <nav className="catalogue-pagination" aria-label="Institute results pagination">
                      <button type="button" disabled={instPage <= 1} onClick={() => goToPage(1, "institutes")} title="First page" aria-label="First page">
                        <ChevronsLeft size={18} />
                      </button>
                      <button type="button" disabled={instPage <= 1} onClick={() => goToPage(instPage - 1, "institutes")} title="Previous page" aria-label="Previous page">
                        <ChevronLeft size={18} />
                      </button>
                      <span className="pagination-info">
                        Page <strong>{instPage}</strong> of <strong>{instTotalPages}</strong>
                        <span className="pagination-total">({filteredInstitutes.length.toLocaleString()} results)</span>
                      </span>
                      <button type="button" disabled={instPage >= instTotalPages} onClick={() => goToPage(instPage + 1, "institutes")} title="Next page" aria-label="Next page">
                        <ChevronRight size={18} />
                      </button>
                      <button type="button" disabled={instPage >= instTotalPages} onClick={() => goToPage(instTotalPages, "institutes")} title="Last page" aria-label="Last page">
                        <ChevronsRight size={18} />
                      </button>
                    </nav>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* ═══════════════ QUICK VIEW COURSE MODAL ═══════════════ */}
      {quickViewCourse && (
        <div className="course-dialog-backdrop" onClick={() => setQuickViewCourse(null)}>
          <div
            className="course-dialog-container"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="course-dialog-close-btn"
              onClick={() => setQuickViewCourse(null)}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="course-dialog-header">
              <div className="course-dialog-eyebrow">
                <span>{formatLabel(quickViewCourse.level)}</span>
                <span>·</span>
                <span>{quickViewCourse.discipline}</span>
                {quickViewCourse.scholarshipTier && (
                  <span className="scholarship-pill">
                    <Award size={13} /> {quickViewCourse.scholarshipTier}
                  </span>
                )}
              </div>
              <h2 className="course-dialog-title">{quickViewCourse.title}</h2>
              <div className="course-dialog-institution">
                <Building2 size={16} />
                <strong>{quickViewCourse.instituteName}</strong>
                <span>({quickViewCourse.city}, {quickViewCourse.state})</span>
              </div>
            </div>

            <div className="course-dialog-body">
              <div className="course-dialog-facts-grid">
                <div className="course-dialog-fact">
                  <small>Duration</small>
                  <strong>{quickViewCourse.durationMonths} Months</strong>
                </div>
                <div className="course-dialog-fact">
                  <small>Study Mode</small>
                  <strong>{formatLabel(quickViewCourse.mode)}</strong>
                </div>
                <div className="course-dialog-fact">
                  <small>Medium</small>
                  <strong>{quickViewCourse.medium || "English"}</strong>
                </div>
                <div className="course-dialog-fact">
                  <small>Next Intake</small>
                  <strong>{quickViewCourse.startDate || "August 2026"}</strong>
                </div>
              </div>

              {/* Tuition Box */}
              <div className="course-dialog-tuition-strip">
                <div>
                  <small>Annual Indicative Tuition</small>
                  <div className="dual-price">
                    <span className="price-usd">${(quickViewCourse.tuitionFee || 3500).toLocaleString()} USD</span>
                    <span className="price-sep">/</span>
                    <span className="price-inr">₹{(quickViewCourse.tuitionFeeInr || 290000).toLocaleString()} INR</span>
                  </div>
                </div>
                {quickViewCourse.scholarshipAvailable && (
                  <div className="scholarship-note">
                    <CheckCircle2 size={16} color="#16a34a" />
                    <span>Eligible for Study in India (SII) Tuition Waivers up to 100%</span>
                  </div>
                )}
              </div>

              {/* Academic Eligibility */}
              <div className="course-dialog-section">
                <h3>Academic Eligibility</h3>
                <p>{quickViewCourse.eligibility}</p>
              </div>

              {/* Syllabus Highlights */}
              {quickViewCourse.syllabusHighlights && (
                <div className="course-dialog-section">
                  <h3>Syllabus & Curriculum Highlights</h3>
                  <ul className="course-dialog-bullet-list">
                    {quickViewCourse.syllabusHighlights.map((item) => (
                      <li key={item}>
                        <CheckCircle2 size={14} color="#0b655d" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Career Prospects */}
              {quickViewCourse.careerProspects && (
                <div className="course-dialog-section">
                  <h3>Career Pathways & Graduate Opportunities</h3>
                  <div className="course-dialog-career-chips">
                    {quickViewCourse.careerProspects.map((career) => (
                      <span key={career} className="career-chip">
                        {career}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="course-dialog-footer">
              <Link
                to={`/courses/${quickViewCourse.slug}`}
                className="btn-full-page"
              >
                Full Dedicated Page <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                className="btn-course-dialog-apply"
                onClick={() => {
                  const c = quickViewCourse;
                  setQuickViewCourse(null);
                  handleApplyClick(c);
                }}
              >
                Apply for this Programme <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GPA Calculator Modal */}
      {gpaModalOpen && <GpaCalculatorModal onClose={() => setGpaModalOpen(false)} />}

      {/* 5-Step Application Wizard Modal */}
      {applyingCourse && (
        <ApplicationWizardModal
          course={applyingCourse}
          onClose={() => setApplyingCourse(null)}
          onSuccess={() => {
            setApplyingCourse(null);
            setToastMessage(`Application for ${applyingCourse.title} submitted successfully! Your application reference number has been created.`);
            setTimeout(() => setToastMessage(""), 9000);
          }}
        />
      )}
    </div>
  );
}
