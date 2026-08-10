import React, { useEffect, useState, useRef } from'react';
import { useNavigate } from'react-router-dom';
import axios from'axios';
import { BookOpen, ChevronLeft, ChevronRight } from'lucide-react';
import url, { getImageUrl } from'../../../url';
import { getAuthHeaders } from"../../../utils/global_auth";
import'./PopularExams.css';

/* ================= TYPES ================= */
interface Exam {
  _id: string;
  name: string;
  slug: string;
  categoryId: string | { _id: string; name: string };
  examImage?: string;
  status?: string;
}

interface ExamCategory {
  _id: string;
  name: string;
  slug: string;
}


export default function PopularExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [loading, setLoading] = useState(true);

  // Slider refs and states
  const catSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [examsRes, catsRes] = await Promise.all([
          axios.get(`${url}/exams/all?limit=150`, { headers: getAuthHeaders() }),
          axios.get(`${url}/exam-categories/all`, { headers: getAuthHeaders() }),
        ]);
        setExams((examsRes.data?.exams || []) as Exam[]);
        setCategories((catsRes.data?.categories || []) as ExamCategory[]);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateCatScrollBtns = () => {
    if (!catSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = catSliderRef.current;
    // adding small buffer
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollSlider = (dir:"left" |"right") => {
    if (!catSliderRef.current) return;
    const amount = 240;
    catSliderRef.current.scrollBy({
      left: dir ==="right" ? amount : -amount,
      behavior:"smooth",
    });
  };

  const getFilteredExams = () => {
    const activeExams = exams.filter(e => e.status !=='INACTIVE');
    if (selectedCategory ==="All Categories") {
      return activeExams.slice(0, 18); // Show plenty by default
    }
    return activeExams.filter(exam => {
       const catObj = typeof exam.categoryId ==='object' ? exam.categoryId.name : categories.find(c => c._id === exam.categoryId)?.name;
       return catObj === selectedCategory;
    });
  };

  const filteredExams = getFilteredExams();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.display ='none';
    if (target.nextElementSibling) {
      (target.nextElementSibling as HTMLElement).style.display ='flex';
    }
  };

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <section className="pe-section">
        <div className="container">
          <div className="pe-header-container">
            <div className="pe-header-left">
              <h2 className="pe-section-title">Choose Your Exam</h2>
              <p className="pe-section-sub">Prepare smarter with India's top competitive exams. Expert-curated content, mock tests & more.</p>
            </div>
          </div>
          <div className="pe-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="pe-skeleton-card">
                <div className="pe-skel-icon" />
                <div className="pe-skel-text" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pe-section">
      <div className="container">

        {/*  HEADER  */}
        <div className="pe-header-container">
          <div className="pe-header-left">
            <div className="pe-eyebrow">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Top Competitive Exams
            </div>
            <h2 className="pe-section-title">
              Choose Your <span className="pe-title-gradient">Examination</span>
            </h2>
            <p className="pe-section-sub">Select an examination to begin your preparation. Expert study material, live classes, and mock tests available.</p>

            {/*  CATEGORY SLIDER  */}
            <div className="pe-slider-wrapper">
              <button
                className={`pe-slider-btn pe-slider-left${canScrollLeft ?" visible" :""}`}
                onClick={() => scrollSlider("left")}
              >
                <ChevronLeft size={16} />
              </button>

              <div
                className="pe-cat-slider"
                ref={catSliderRef}
                onScroll={updateCatScrollBtns}
              >
                <button
                  className={`pe-cat-chip${selectedCategory ==="All Categories" ?" active" :""}`}
                  onClick={() => setSelectedCategory("All Categories")}
                >
                  All Exams
                  {selectedCategory ==="All Categories" && (
                    <span style={{ background:'rgba(255,255,255,0.25)', borderRadius:'50px', padding:'1px 7px', fontSize:'11px', fontWeight: 800 }}>
                      {exams.filter(e => e.status !=='INACTIVE').length}
                    </span>
                  )}
                </button>
                {categories.map((cat) => {
                  const count = exams.filter(e => {
                    const catObj = typeof e.categoryId ==='object' ? e.categoryId.name : categories.find(c => c._id === e.categoryId)?.name;
                    return catObj === cat.name && e.status !=='INACTIVE';
                  }).length;
                  return (
                    <button
                      key={cat._id}
                      className={`pe-cat-chip${selectedCategory === cat.name ?" active" :""}`}
                      onClick={() => setSelectedCategory(cat.name)}
                    >
                      {cat.name}
                      {count > 0 && (
                        <span style={{
                          background: selectedCategory === cat.name ?'rgba(255,255,255,0.25)' :'rgba(99,102,241,0.1)',
                          color: selectedCategory === cat.name ?'white' :'#bd7b20',
                          borderRadius:'50px',
                          padding:'1px 7px',
                          fontSize:'11px',
                          fontWeight: 800
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                className={`pe-slider-btn pe-slider-right${canScrollRight ?" visible" :""}`}
                onClick={() => scrollSlider("right")}
              >
                <ChevronRight size={16} />
              </button>
            </div>

          </div>

          <div className="pe-header-right">
            <img
              src="https://www.oliveboard.in/lp/ocimg/girl.svg"
              alt="Student graphic"
              style={{ width:'100%', height:'auto', filter:'drop-shadow(0 16px 40px rgba(99,102,241,0.2))' }}
            />
          </div>
        </div>

        {/*  GRID  */}
        <div className="pe-grid-wrapper">
          {filteredExams.length > 0 ? (
            <div className="pe-grid">
              {filteredExams.map((exam, idx) => (
                <div
                  key={exam._id}
                  className="pe-clean-card"
                  onClick={() => navigate(`/exams/${exam.slug}`)}
                  style={{ animationDelay: `${(idx % 12) * 40}ms` }}
                >
                  <div className="pe-card-logo-wrap">
                    {exam.examImage ? (
                      <>
                        <img
                          src={getImageUrl(exam.examImage)}
                          alt={exam.name}
                          className="pe-card-logo"
                          onError={handleImageError}
                        />
                        <div className="pe-card-fallback-icon" style={{ display:'none' }}>
                          <BookOpen size={20} />
                        </div>
                      </>
                    ) : (
                      <div className="pe-card-fallback-icon">
                        <BookOpen size={22} />
                      </div>
                    )}
                  </div>
                  <h3 className="pe-card-name" title={exam.name}>
                    {exam.name.length > 30 ? exam.name.substring(0, 28) +'..' : exam.name}
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="pe-empty-state">
              <div className="pe-empty-icon-box">
                <BookOpen size={32} />
              </div>
              <h3>No Exams Found</h3>
              <p>We couldn't find active exams for"{selectedCategory}".</p>
              <button className="pe-view-all-btn" onClick={() => setSelectedCategory("All Categories")}>
                Show All Exams
              </button>
            </div>
          )}

          {filteredExams.length > 0 && (
            <div className="pe-view-all-container">
              <button className="pe-view-all-btn" onClick={() => navigate('/exams-page')}>
                View All Exams
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

