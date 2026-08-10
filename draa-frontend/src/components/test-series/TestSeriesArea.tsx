import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Share2,
  ClipboardCheck,
  BookOpen,
  HelpCircle,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Search,
  Heart,
  X,
  ClipboardList,
  Star,
  Globe,
  Zap
} from "lucide-react";
import toast from "../../utils/toast";
import StylishEmptyState from "../common/StylishEmptyState";
import { useExaminationCategories } from "./../../layouts/headers/menu_data";
import { BACKEND_UPLOAD_URL } from "../../url";
import ImgWithFallback from "../common/ImgWithFallback";
import "../courses/CoursesArea.css";
import "./TestSeriesArea.css";
import "../common/SkeletonLoader.css";

import Swal from "sweetalert2";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist } from "../../utils/wishlistApi";
import { getUserRole } from "../../utils/global_auth";
const TestSeriesArea: React.FC = () => {
  const { categories: examinationCategories, loading: loadingCategories } = useExaminationCategories();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Exams');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);
  // Pagination removed - show all test series

  // Category Slider
  const catSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateCatScroll = () => {
    if (!catSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = catSliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollCatSlider = (dir: 'left' | 'right') => {
    if (!catSliderRef.current) return;
    catSliderRef.current.scrollBy({ left: dir === 'right' ? 240 : -240, behavior: 'smooth' });
  };
  /* ================= AUTH ================= */
  // getAuthStatus moved to global_auth.ts helper

  //  GENERATE DYNAMIC FILTER TABS
  const dynamicFilterList = useMemo(() => {
    if (!examinationCategories || examinationCategories.length === 0) return ['All Exams'];
    const codes = examinationCategories
      .map(cat => cat.code)
      .filter((value, index, self) => self && self.indexOf(value) === index);
    return ['All Exams', ...codes];
  }, [examinationCategories]);

  //  COMBINED FILTERING: CATEGORY + SEARCH
  const filteredCategories = useMemo(() => {
    let filtered = examinationCategories || [];

    // Filter by category
    if (selectedCategory !== 'All Exams') {
      filtered = filtered.filter(cat => cat.code === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name?.toLowerCase().includes(query) ||
        cat.code?.toLowerCase().includes(query) ||
        cat.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [examinationCategories, selectedCategory, searchQuery]);


  useEffect(() => {
    const loadWishlist = async () => {
      if (getUserRole() !== "STUDENT") return;

      try {
        const items = await fetchWishlist();
        const ids = new Set(
          items
            .filter((i: any) => i.item_type === "test_series")
            .map((i: any) => String(i.item_id))
        );
        setWishlistIds(ids);
      } catch {
        // silent
      }
    };

    loadWishlist();
  }, []);


  const toggleWishlist = async (exam: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoading) return;

    const role = getUserRole();

    if (role === "GUEST") {
      Swal.fire({
        title: "Login Required",
        text: "Please login as a student to use wishlist",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login Now" }).then(res => {
        if (res.isConfirmed) navigate("/student-login");
      });
      return;
    }

    if (role !== "STUDENT") {
      toast.error("Only students can use wishlist.");
      return;
    }

    const alreadyWishlisted = wishlistIds.has(exam._id);

    try {
      setWishlistLoading(exam._id);

      if (alreadyWishlisted) {
        const res = await removeFromWishlist({
          item_type: "test_series",
          item_id: exam._id });

        if (res?.success) {
          setWishlistIds(prev => {
            const s = new Set(prev);
            s.delete(exam._id);
            return s;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist({
          item_type: "test_series",
          item_id: exam._id,
          snapshot: {
            name: exam.name,
            code: exam.code,
            year: exam.year,
            totalTests: exam.statistics?.totalTestSeries || 0 } });

        if (res?.success || res?.message === "Already in wishlist") {
          setWishlistIds(prev => new Set(prev).add(exam._id));
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Wishlist action failed");
    } finally {
      setWishlistLoading(null);
    }
  };


  // Show all filtered items - no pagination
  const currentItems = filteredCategories;

  //  REAL-LIFE SHARING LOGIC
  const handleShare = async (exam: any) => {
    const shareUrl = `${window.location.origin}/exam-topics/${exam._id}`;
    const shareData = {
      title: `Practice ${exam.name} on Draa`,
      text: `Check out this ${exam.name} test series featuring ${exam.statistics?.totalTestSeries || 0} mock tests and ${exam.examPattern?.totalQuestions || '3750+'} questions!`,
      url: shareUrl };

    try {
      // 1. Try Native Browser Share (Mobile/Safari/Chrome)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // 2. Fallback: Copy to Clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      // User cancelled share or other error
      if ((err as Error).name !== 'AbortError') {
        navigator.clipboard.writeText(shareUrl);
        toast.info("Link copied to clipboard!");
      }
    }
  };

  if (loadingCategories) {
    return (
      <main className="test-series-explore-page">
        <div className="container">
          <div className="sk-ts-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="sk-ts-card">
                <div className="sk-ts-banner sk-shimmer" />
                <div className="sk-ts-body">
                  <div className="sk-ts-rating sk-shimmer" />
                  <div className="sk-ts-name sk-shimmer" />
                  <div className="sk-ts-desc sk-shimmer" />
                  <div className="sk-ts-desc2 sk-shimmer" />
                  <div className="sk-ts-divider sk-shimmer" />
                  <div className="sk-ts-stats">
                    <div className="sk-ts-stat sk-shimmer" />
                    <div className="sk-ts-stat sk-shimmer" />
                    <div className="sk-ts-stat sk-shimmer" />
                  </div>
                  <div className="sk-ts-btn sk-shimmer" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="test-series-explore-page">
      <div className="container">

        {/* DYNAMIC FILTER BAR */}
        <div className="filters-row-new">
          <div className="cat-chip-slider-wrapper">
            <button
              className={`cat-chip-arrow cat-chip-left${canScrollLeft ? ' visible' : ''}`}
              onClick={() => scrollCatSlider('left')}
            >
              <ChevronLeft size={18} />
            </button>

            <div className="cat-chip-slider" ref={catSliderRef} onScroll={updateCatScroll}>
              {dynamicFilterList.map(tab => (
                <button
                  key={tab}
                  className={`cat-chip${selectedCategory === tab ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(tab)}
                >
                  <span className="cat-chip-icon"><ClipboardList size={14} /></span>
                  {tab}
                </button>
              ))}
            </div>

            <button
              className={`cat-chip-arrow cat-chip-right${canScrollRight ? ' visible' : ''}`}
              onClick={() => scrollCatSlider('right')}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="search-input-wrapper-new">
            <Search className="search-icon-new" size={16} />
            <input
              type="text"
              className="course-search-input-new"
              placeholder="Search test series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn-new" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* TEST SERIES GRID */}
        <div className="ts-marketplace-grid">
          {currentItems.length > 0 ? (
            currentItems.map((exam) => {
              // --- Derived display values with safe fallbacks ---
              const totalTests = exam.statistics?.totalTestSeries || 0;
              const freeTests = (exam as any).statistics?.freeTests
                ?? (exam as any).freeTests
                ?? Math.max(0, Math.round(totalTests * 0.1));
              const totalQ = (exam as any).examPattern?.totalQuestions
                ?? (exam as any).statistics?.totalQuestions
                ?? "200+";
              const userCount = (exam as any).statistics?.totalEnrollments
                ?? (exam as any).statistics?.totalAttempts
                ?? (exam as any).statistics?.totalUsers
                ?? 0;
              const languages: string[] = Array.isArray((exam as any).languages) && (exam as any).languages.length
                ? (exam as any).languages
                : ((exam as any).language ? [(exam as any).language] : ['English', 'Hindi']);
              const moreLangs = languages.length > 3 ? languages.length - 3 : 0;
              const displayLangs = languages.slice(0, 3);

              const features: { icon: string; text: string }[] = (exam as any).features?.length
                ? (exam as any).features
                : [
                    { icon: '⚡', text: 'Instant results & detailed solutions' },
                    { icon: '🎯', text: 'Questions based on latest exam pattern' },
                    { icon: '📊', text: 'All-India rank & progress analytics' }
                  ];
              const displayFeatures = features.slice(0, 3);

              const ribbon: { label: string; tone: 'live' | 'new' | 'popular' | null } = (() => {
                if ((exam as any).isLive || (exam as any).hasLiveTests) return { label: 'LIVE TEST', tone: 'live' };
                const created = (exam as any).createdAt ? new Date((exam as any).createdAt) : null;
                const isNew = created && (Date.now() - created.getTime()) < 1000 * 60 * 60 * 24 * 30;
                if (isNew) return { label: 'NEW', tone: 'new' };
                if (userCount > 5000) return { label: 'POPULAR', tone: 'popular' };
                return { label: '', tone: null };
              })();

              const formatUsers = (n: number): string => {
                if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
                if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'k';
                return String(n || 0);
              };

              return (
              <div key={exam._id} className="ts-card-figma-clone">
                {/* TOP HEADER WITH PASTEL GRADIENT, LOGO & USER COUNT */}
                <div className="ts-card-top-header">
                  {/* TOP-CORNER RIBBON IF LIVE/NEW/POPULAR */}
                  {ribbon.tone && (
                    <span className={`ts-ribbon ts-ribbon-${ribbon.tone}`}>
                      {ribbon.label}
                    </span>
                  )}

                  {/* LOGO / ICON */}
                  <div className="ts-card-logo-box">
                    {exam.bannerImage ? (
                      <ImgWithFallback
                        src={exam.bannerImage.startsWith('http') ? exam.bannerImage : `${BACKEND_UPLOAD_URL}/${exam.bannerImage}`}
                        alt={exam.name}
                        size="md"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="ts-card-logo-fallback">
                        {exam.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* USER COUNT BADGE & ACTIONS */}
                  <div className="ts-card-header-right">
                    <div className="ts-users-badge-testbook">
                      <Zap size={13} fill="#f59e0b" stroke="#f59e0b" />
                      <span><strong>{formatUsers(userCount)}</strong> Users</span>
                    </div>

                    <div className="ts-card-actions">
                      <button
                        className="ts-share-icon"
                        onClick={() => handleShare(exam)}
                        aria-label="share"
                      >
                        <Share2 size={14} />
                      </button>

                      <button
                        className={`ts-wishlist-btn ${wishlistIds.has(exam._id) ? "active" : ""
                          } ${wishlistLoading === exam._id ? "loading" : ""}`}
                        onClick={(e) => toggleWishlist(exam, e)}
                        disabled={wishlistLoading === exam._id}
                        aria-label="wishlist"
                      >
                        <Heart
                          size={14}
                          stroke="#ef4444"
                          fill={wishlistIds.has(exam._id) ? "#ef4444" : "none"}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="ts-card-body-content">
                  <h3 className="ts-exam-name-tb">{exam.name}</h3>

                  {/* TOTAL TESTS | FREE TESTS */}
                  <div className="ts-tests-count-row">
                    <span className="ts-total-tests"><strong>{totalTests}</strong> Total Tests</span>
                    <span className="ts-v-pipe">|</span>
                    <span className="ts-free-tests"><strong>{freeTests}</strong> Free Tests</span>
                  </div>

                  {/* LANGUAGES */}
                  <div className="ts-lang-row-tb">
                    <Globe size={13} color="#3b82f6" />
                    <span className="ts-lang-text">
                      {displayLangs.join(', ')}
                      {moreLangs > 0 && <span className="ts-more-langs"> + {moreLangs} More</span>}
                    </span>
                  </div>

                  {/* BULLET FEATURE HIGHLIGHTS */}
                  <ul className="ts-bullet-list-tb">
                    <li><span className="tb-bullet">•</span> 1 Free Live Test</li>
                    <li><span className="tb-bullet">•</span> {Math.max(10, Math.round(totalTests * 0.4))} Chapter Tests</li>
                    <li><span className="tb-bullet">•</span> {Math.max(5, Math.round(totalTests * 0.15))} Subject Tests</li>
                    <li className="tb-more-tests-green">
                      <span className="tb-bullet">•</span> +{Math.max(1, totalTests - 15)} more tests
                    </li>
                  </ul>

                  {/* VIEW TEST SERIES BUTTON */}
                  <button className="ts-view-btn-tb" onClick={() => navigate(`/exam-topics/${exam._id}`)}>
                    View Test Series
                  </button>
                </div>
              </div>
              );
            })
          ) : (
            <StylishEmptyState
              title="No Test Series Found"
              description={`We couldn't find any test series ${searchQuery ? `for "${searchQuery}"` : `in "${selectedCategory}"`}.`}
              actionText="View All Exams"
              onAction={() => {
                setSelectedCategory('All Exams');
                setSearchQuery('');
              }}
              showBack={false}
            />
          )}
        </div>


      </div>
    </main>
  );
};

export default TestSeriesArea;
