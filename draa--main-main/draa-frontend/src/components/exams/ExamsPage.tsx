import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import {
  Search, Filter, ChevronDown, ChevronRight, Star,
  Calendar, Users, TrendingUp, Globe, Award,
  Bookmark, Share2, Clock, ArrowRight, LayoutGrid,
  List, X, CheckCircle, FileText, BookOpen, Briefcase
} from "lucide-react";
import url, { getImageUrl } from "../../url";
import { getAuthHeaders } from "../../utils/global_auth";
import { ChevronLeft, PlayCircle, Layers, ClipboardCheck, HelpCircle } from "lucide-react";
import Breadcrumb from "../common/Breadcrumb";
// import ExamsFeatures from'./ExamsFeatures';
import "./ExamsPage.css";
import "../common/SkeletonLoader.css";
import ImgWithFallback from "../common/ImgWithFallback";


const EXAM_COLORS = [
  'linear-gradient(135deg, #bd7b20, #7c7fff)',
  'linear-gradient(135deg, #e74c3c, #c0392b)',
  'linear-gradient(135deg, #3498db, #2980b9)',
  'linear-gradient(135deg, #2ecc71, #27ae60)',
  'linear-gradient(135deg, #9b59b6, #8e44ad)',
  'linear-gradient(135deg, #f39c12, #d68910)',
  'linear-gradient(135deg, #1abc9c, #16a085)',
  'linear-gradient(135deg, #e67e22, #d35400)',
];


const ExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<any[]>([]);
  const [testCategories, setTestCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 1000;

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const catSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateCatScrollBtns = () => {
    if (!catSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = catSliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollSlider = (dir: "left" | "right") => {
    if (!catSliderRef.current) return;
    const amount = 240;
    catSliderRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    loadTestCategories();
  }, []);

  useEffect(() => {
    loadExams();
  }, [page, search, selectedCategory, selectedLevel, selectedMode, sortBy]);

  const loadTestCategories = async () => {
    try {
      const res = await axios.get(`${url}/exam-categories/all`, { headers: getAuthHeaders() });
      setTestCategories(res.data?.categories || []);
    } catch { }
  };

  const loadExams = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/exams/all`, {
        params: {
          status: "ACTIVE",
          page,
          limit,
          search: search || undefined,
        },
        headers: getAuthHeaders()
      });
      let examList = res.data.exams || [];

      if (selectedCategory) {
        examList = examList.filter((e: any) => {
          const category = testCategories.find(c => c._id === selectedCategory);
          if (!category) return false;

          const examCat = typeof e.categoryId === 'object' ? e.categoryId.name : testCategories.find(c => c._id === e.categoryId)?.name;
          return examCat === category.name;
        });
      }
      if (selectedLevel) {
        examList = examList.filter((e: any) => e.examLevel === selectedLevel);
      }
      if (selectedMode) {
        examList = examList.filter((e: any) => e.mode === selectedMode);
      }
      if (sortBy === "latest") {
        examList = [...examList].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      } else if (sortBy === "views") {
        examList = [...examList].sort((a, b) => (b.views || 0) - (a.views || 0));
      } else if (sortBy === "name") {
        examList = [...examList].sort((a, b) => a.name.localeCompare(b.name));
      }

      setExams(examList);
      setTotal(examList.length);
    } catch (err) {
      console.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (exam: any) => {
    const shareUrl = `${window.location.origin}/exams/${exam.slug}`;
    if (navigator.share) {
      await navigator.share({ title: exam.name, text: exam.shortDescription || "Check exam details", url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedLevel("");
    setSelectedMode("");
    setSortBy("latest");
    setPage(1);
    if (catSliderRef.current) catSliderRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  };

  const hasActiveFilters = search || selectedCategory || selectedLevel || selectedMode;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="ex-page">
      {/*  Breadcrumb Hero  */}
      <Breadcrumb
        theme="exams"
        title="Exam Sections"
        subtitle={`Explore ${total > 0 ? `${total}+` : '100+'} government and competitive exams. Expert-curated mock tests, study material, and live classes to ace your preparation.`}
        category="Exams"
        paths={[{ pathName: 'Exam Sections' }]}
        showSearch={true}
        searchPlaceholder="Search for UPSC, SSC, IBPS..."
        searchBtnText="Find Exams"
        stats={[
          { value: total > 0 ? `${total}+` : '100+', label: 'Active Exams' },
          { value: testCategories.length > 0 ? `${testCategories.length}+` : '20+', label: 'Categories' },
          { value: '50K+', label: 'Aspirants' },
          { value: '100%', label: 'Free Info' },
        ]}
      />

      <div className="container">

        {/*  Category and Search Row  */}
        <div className="ex-cat-slider-wrapper">
          {/* Slider section (Left side, flexible) */}
          <div className="ex-slider-container">
            <button
              className={`ex-slider-btn ex-slider-left${canScrollLeft ? " visible" : ""}`}
              onClick={() => scrollSlider("left")}
            >
              <ChevronLeft size={18} />
            </button>

            <div
              className="ex-cat-slider"
              ref={catSliderRef}
              onScroll={updateCatScrollBtns}
            >
              <button
                className={`ex-cat-chip${selectedCategory === "" ? " active" : ""}`}
                onClick={() => { setSelectedCategory(""); setPage(1); }}
              >
                All Exams
              </button>
              {testCategories.map((cat: any) => (
                <button
                  key={cat._id}
                  className={`ex-cat-chip${selectedCategory === cat._id ? " active" : ""}`}
                  onClick={() => { setSelectedCategory(cat._id); setPage(1); }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button
              className={`ex-slider-btn ex-slider-right${canScrollRight ? " visible" : ""}`}
              onClick={() => scrollSlider("right")}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Right section: Total count and Search (Right side, fixed width) */}
          <div className="ex-slider-right-controls">
            <div className="ex-total-badge">
              <span className="ex-total-num">{total}</span>
              <span className="ex-total-lbl">Exams</span>
            </div>

            <div className="ex-mini-search">
              <Search size={15} className="ex-mini-search-icon" />
              <input
                type="text"
                placeholder="Search exams..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button className="ex-mini-search-clear" onClick={() => setSearch("")} aria-label="Clear Search">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/*  Popular Exams Grid  */}
        {/* {!selectedCategory && !search && exams.length > 0 && (
          <div className="ex-popular-wrap">
            <div className="ex-section-header">
              <h2 className="ex-section-title"> Popular Exams</h2>
              <p className="ex-section-subtitle">Most searched by aspirants across India</p>
            </div>
            <div className="ex-popular-grid">
              {exams
                .filter(e => e.isPopular || (e.views && e.views > 20))
                .slice(0, 18)
                .map((exam, idx) => (
                  <div
                    key={exam._id}
                    className="ex-pop-card"
                    onClick={() => navigate(`/exams/${exam.slug}`)}
                  >
                    <div className="ex-pop-icon-wrap">
                      <ImgWithFallback
                        src={exam.examImage ? getImageUrl(exam.examImage) : null}
                        alt={exam.name}
                        size="sm"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    </div>
                    <span className="ex-pop-name">{exam.name}</span>
                  </div>
                ))}
            </div>
          </div>
        )} */}

        {/*  Main Layout (Full Width)  */}
        <div className="ex-main-layout">

          {/*  Content Area  */}
          <div className="ex-content">



            {/* Active Filter Chips */}
            {hasActiveFilters && (
              <div className="ex-active-filters">
                {search && (
                  <span className="ex-filter-chip">
                    Search:"{search}" <X size={11} onClick={() => setSearch("")} />
                  </span>
                )}
                {selectedCategory && (
                  <span className="ex-filter-chip">
                    {testCategories.find(c => c._id === selectedCategory)?.name || selectedCategory}
                    <X size={11} onClick={() => setSelectedCategory("")} />
                  </span>
                )}
                {selectedLevel && (
                  <span className="ex-filter-chip">
                    {selectedLevel} <X size={11} onClick={() => setSelectedLevel("")} />
                  </span>
                )}
                {selectedMode && (
                  <span className="ex-filter-chip">
                    {selectedMode} <X size={11} onClick={() => setSelectedMode("")} />
                  </span>
                )}
              </div>
            )}

            {/* Grid/List */}
            {loading ? (
              <div className="sk-exam-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="sk-exam-card">
                    <div className="sk-exam-accent sk-shimmer" />
                    <div className="sk-exam-body">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="sk-exam-logo sk-shimmer" />
                        <div className="sk-exam-tag sk-shimmer" />
                      </div>
                      <div className="sk-exam-title sk-shimmer" />
                      <div className="sk-exam-desc sk-shimmer" />
                      <div className="sk-exam-desc2 sk-shimmer" />
                      <div className="sk-exam-btn sk-shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : exams.length === 0 ? (
              <div className="ex-empty">
                <div className="ex-empty-icon"><Search size={36} /></div>
                <h3>No exams found</h3>
                <p>Try adjusting your filters or search for a different exam name.</p>
                <button className="ex-btn-primary" onClick={clearFilters} style={{ maxWidth: 200, border: 'none', cursor: 'pointer' }}>Clear All Filters</button>
              </div>
            ) : viewMode === "grid" ? (
              <div className={`ex-cards-grid ${viewMode}`}>
                {exams.map((exam, i) => {
                  const primaryPhase = exam.phases?.[0] || {};
                  const dates = exam.importantDates || {};
                  const catId = typeof exam.categoryId === 'object' ? exam.categoryId._id : exam.categoryId;
                  const category = testCategories.find(c => c._id === catId);
                  return (
                    <div key={exam._id} className="ex-card">
                      {/* Premium Accent Bar */}
                      <div className="ex-card-accent" style={{ background: EXAM_COLORS[i % EXAM_COLORS.length] }} />

                      <div className="ex-card-header">
                        <div className="ex-card-logo-wrap">
                          <ImgWithFallback
                            src={exam.examImage ? getImageUrl(exam.examImage) : null}
                            alt={exam.name}
                            className="ex-card-logo"
                            size="sm"
                            style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'transparent' }}
                          />
                        </div>

                        <div className="ex-card-badges-wrap">
                          {exam.examLevel && (
                            <span className="ex-card-badge-clean">{exam.examLevel}</span>
                          )}
                          {exam.mode && (
                            <span className="ex-card-badge-mode-clean">{exam.mode}</span>
                          )}
                        </div>
                      </div>

                      <div className="ex-card-body">
                        <div className="ex-card-info">
                          <h3 className="ex-card-title">{exam.name}</h3>
                          <p className="ex-card-desc">
                            {exam.shortDescription || "Official exam as per latest notification"}
                          </p>
                        </div>

                        {(dates.applicationStart || dates.applicationEnd) && (
                          <div className="ex-card-meta">
                            {dates.applicationStart && (
                              <div className="ex-meta-item">
                                <Calendar size={14} />
                                <span>Apply: {dayjs(dates.applicationStart).format("D MMM")}</span>
                              </div>
                            )}
                            {dates.applicationStart && dates.applicationEnd && <div className="ex-meta-sep" />}
                            {dates.applicationEnd && (
                              <div className="ex-meta-item">
                                <Clock size={14} />
                                <span>End: {dayjs(dates.applicationEnd).format("D MMM")}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="ex-card-footer">
                          <Link to={`/exams/${exam.slug}`} className="ex-btn-modern">
                            View Details <ArrowRight size={16} />
                          </Link>
                          <button className="ex-btn-icon" onClick={() => handleShare(exam)}>
                            <Share2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="ex-cards-grid list">
                {exams.map((exam, i) => {
                  const primaryPhase = exam.phases?.[0] || {};
                  const dates = exam.importantDates || {};
                  const catId = typeof exam.categoryId === 'object' ? exam.categoryId._id : exam.categoryId;
                  const category = testCategories.find(c => c._id === catId);
                  return (
                    <div key={exam._id} className="ex-card ex-card-list">
                      <div className="ex-card-list-band" style={{ background: EXAM_COLORS[i % EXAM_COLORS.length] }}>
                        <ImgWithFallback
                          src={exam.examImage ? getImageUrl(exam.examImage) : null}
                          alt={exam.name}
                          className="ex-list-img"
                          size="sm"
                        />
                        <div className="ex-card-band-overlay" />
                        {exam.examLevel && <span className="ex-card-badge ex-badge-level">{exam.examLevel}</span>}
                      </div>
                      <div className="ex-card-list-body">
                        <div className="ex-card-list-top">
                          <div className="ex-card-list-info">
                            {category && <span className="ex-card-cat-small">{category.name}</span>}
                            <h3 className="ex-card-title">{exam.name}</h3>
                            {exam.conductingBody && <p className="ex-card-org">By {exam.conductingBody}</p>}
                          </div>
                          {(dates.applicationStart || dates.applicationEnd) && (
                            <span className="ex-card-apply-list">
                              <Calendar size={14} />
                              {dates.applicationStart && dayjs(dates.applicationStart).format("DD MMM")}
                              {dates.applicationStart && dates.applicationEnd && ""}
                              {dates.applicationEnd && dayjs(dates.applicationEnd).format("DD MMM YYYY")}
                            </span>
                          )}
                        </div>
                        <p className="ex-card-desc">{exam.shortDescription || "Official exam as per latest notification"}</p>
                        <div className="ex-card-list-footer">
                          <div className="ex-card-actions">
                            <Link to={`/exams/${exam.slug}`} className="ex-btn-primary">
                              View Details <ArrowRight size={16} />
                            </Link>
                            <button className="ex-btn-share-icon" onClick={() => handleShare(exam)}><Share2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamsPage;
