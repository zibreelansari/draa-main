import { useState, useEffect, useCallback, useMemo, useRef } from'react';
import toast from '../../utils/toast';
import { Link, useNavigate } from'react-router-dom';
import {
  Share2,
  Download,
  Star,
  PlayCircle,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Heart,
  Users,
  Clock,
  BookOpen
} from'lucide-react';
import url, { getImageUrl } from'../../url';
import'./CoursesArea.css';
import DownloadPopupModal from'../jobs/DownloadPopupModal';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist
} from"../../utils/wishlistApi";
import { getUserRole } from"../../utils/global_auth";
import { Modal } from"antd";
import StylishEmptyState from'../common/StylishEmptyState';

/*  TYPES  */

interface Teacher {
  _id: string;
  name: string;
  tname?: string;
  email?: string;
  profile?: string;
  tprofile?: string;
  specialization?: string;
}

interface Course {
  _id: string;
  title: string;
  short_desc?: string;
  long_desc?: string;
  price: number;
  actual_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  duration: number;
  language?: string;
  skill_level?: string;
  course_category?: string;
  coverphoto?: string;
  enrolled_count?: number;
  rating?: number;
  reviews_count?: number;
  chapters_count?: number;
  video_count?: number;
  pdf_count?: number;
  practice_set_count?: number;
  syllabus?: string;
  teacher?: Teacher;
  createdAt?: string;
}

/*  COMPONENT  */

export default function CoursesArea() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState('All Exams');
  const [searchQuery, setSearchQuery] = useState('');

  //  Category Slider 
  const catSliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateCatScroll = () => {
    if (!catSliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = catSliderRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  };

  const scrollCatSlider = (dir:'left' |'right') => {
    if (!catSliderRef.current) return;
    catSliderRef.current.scrollBy({ left: dir ==='right' ? 240 : -240, behavior:'smooth' });
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 12; // 12 fits nicely in a 4-col grid
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(null);

  // Download Modal State
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState('');
  const [downloadTitle, setDownloadTitle] = useState('');

  const navigate = useNavigate();

  /*  FETCH DATA  */

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, catRes] = await Promise.all([
        fetch(`${url}/course/allCourses?limit=500`),
        fetch(`${url}/course/categories?active=true`)
      ]);

      const courseJson = await courseRes.json();
      const catJson = await catRes.json();

      const fetchedCourses = courseJson?.data?.courses || [];
      setAllCourses(fetchedCourses);
      setCourses(fetchedCourses);

      const catList = catJson?.data?.categories || [];
      const derivedCategories = Array.from(new Set(fetchedCourses.map((c: Course) => c.course_category).filter(Boolean))) as string[];

      // Use API cats if available, otherwise derived
      if (catList.length > 0) {
        setDynamicCategories(['All Exams', ...catList.map((c: any) => c.name)]);
      } else {
        setDynamicCategories(['SSC', ...derivedCategories]);
      }
    } catch (err) {
      console.error('Failed to load courses page:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /*  FILTERING  */

  const filteredCourses = useMemo(() => {
    let filtered = allCourses;

    if (selectedCategory !=='All Exams') {
      filtered = filtered.filter(c => c.course_category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        (c.short_desc && c.short_desc.toLowerCase().includes(q)) ||
        (c.teacher?.name && c.teacher.name.toLowerCase().includes(q)) ||
        (c.course_category && c.course_category.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [allCourses, selectedCategory, searchQuery]);

  useEffect(() => {
    setCourses(filteredCourses);
    setCurrentPage(1);
  }, [filteredCourses]);

  /*  PAGINATION  */

  const indexOfLast = currentPage * coursesPerPage;
  const indexOfFirst = indexOfLast - coursesPerPage;
  const currentCourses = courses.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const changePage = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior:'smooth' });
  };

  /*  HELPERS  */

  const formatDuration = (mins = 0) => {
    if (!mins) return'0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getTeacherName = (course: Course) => course.teacher?.name || course.teacher?.tname ||'Expert Mentor';

  const getTeacherProfile = (course: Course) => {
    const p = course.teacher?.profile || course.teacher?.tprofile;
    if (!p) return'/assets/img/review/1.jpg';
    if (p.startsWith('http')) return p;
    return `${url}${p.startsWith('/') ?'' :'/'}${p}`;
  };

  const handleShare = async (course: Course, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareData = {
      title: course.title,
      text: `Check out this course: ${course.title}`,
      url: `${window.location.origin}/course-details/${course._id}`
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Course link copied to clipboard!');
      }
    } catch (err) {
      if (err instanceof Error && err.name !=='AbortError') {
        try {
          await navigator.clipboard.writeText(shareData.url);
          toast.success('Course link copied to clipboard!');
        } catch { }
      }
    }
  };

  /*  WISHLIST  */
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        if (getUserRole() ==="STUDENT") {
          const items = await fetchWishlist();
          const ids = new Set<string>(
            items
              .filter((i: any) => i.item_type ==="course")
              .map((i: any) => String(i.item_id))
          );
          setWishlistIds(ids);
        }
      } catch (err) {
        console.error("Wishlist load failed", err);
      }
    };
    loadWishlist();
  }, []);

  const toggleWishlist = async (course: Course, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (wishlistLoadingId) return;

    const role = getUserRole();
    if (role ==="GUEST") {
      Modal.confirm({
        title:"Login Required",
        content:"Please login as a student to use wishlist",
        okText:"Login",
        onOk: () => navigate("/student-login"),
      });
      return;
    }

    if (role !=="STUDENT") {
      toast.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to use the wishlist. This feature is reserved for students.`);
      return;
    }

    try {
      setWishlistLoadingId(course._id);
      if (wishlistIds.has(course._id)) {
        const res = await removeFromWishlist({ item_type:"course", item_id: course._id });
        if (res?.success) {
          setWishlistIds(prev => {
            const next = new Set(prev);
            next.delete(course._id);
            return next;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist({
          item_type:"course",
          item_id: course._id,
          snapshot: { title: course.title, price: course.price, coverphoto: course.coverphoto, teacher: course.teacher?.name }
        });
        if (res?.success || res?.message ==="Already in wishlist") {
          setWishlistIds(prev => new Set(prev).add(course._id));
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Wishlist action failed");
    } finally {
      setWishlistLoadingId(null);
    }
  };

  /*  RENDER  */

  return (
    <main className="explore-courses-page-new">
      <div className="container" style={{ maxWidth: 1280, margin:'0 auto', padding:'24px 24px 60px 24px' }}>

        {/* BREADCRUMB */}
        {/* <nav className="breadcrumb-nav-new">
          <Link to="/">Home</Link> <span></span>
          <span className="active">Courses</span>
        </nav> */}

        {/* HEADER */}
        {/* HEADER SECTION (Commented out as global breadcrumb is active) */}
        {/* <div className="courses-header-wrapper">
          <div className="courses-header-new">
            <div className="title-area-new">
              <h1 className="section-main-title-new">Explore Courses</h1>
              <p className="section-sub-text-new">
                Master new skills with our expert-led programs.
              </p>
            </div>
            <div className="showing-courses-text">
              Showing <strong>{courses.length}</strong> courses
            </div>
          </div>

          <div className="filters-row-new">
            <div className="cat-chip-slider-wrapper">
              <button
                className={`cat-chip-arrow cat-chip-left${canScrollLeft ?' visible' :''}`}
                onClick={() => scrollCatSlider('left')}
              >
                <ChevronLeft size={18} />
              </button>

              <div className="cat-chip-slider" ref={catSliderRef} onScroll={updateCatScroll}>
                <button
                  key="all"
                  className={`cat-chip${selectedCategory ==='All Exams' ?' active' :''}`}
                  onClick={() => setSelectedCategory('All Exams')}
                >
                  <span className="cat-chip-icon"><BookOpen size={14} /></span>
                  All Exams
                </button>
                {dynamicCategories.map(cat => (
                  <button
                    key={cat}
                    className={`cat-chip${selectedCategory === cat ?' active' :''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <span className="cat-chip-icon"><BookOpen size={14} /></span>
                    {cat}
                  </button>
                ))}
              </div>

              <button
                className={`cat-chip-arrow cat-chip-right${canScrollRight ?' visible' :''}`}
                onClick={() => scrollCatSlider('right')}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="search-input-wrapper-new">
              <Search size={16} className="search-icon-new" />
              <input
                className="course-search-input-new"
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn-new" onClick={() => setSearchQuery('')}></button>
              )}
            </div>
          </div>
        </div> */}

        {/* MAIN BODY */}
        {loading ? (
          <div className="loader-container-new">
            <div className="spinner-new" />
          </div>
        ) : currentCourses.length > 0 ? (
          <>
            <div className="courses-grid-new">
              {currentCourses.map(course => {
                const isWishlisted = wishlistIds.has(course._id);
                const levelClass = course.skill_level?.toLowerCase() ||'advanced';
                const displayActualPrice = course.actual_price || course.price || 3400;
                const displayDiscountPrice = course.discounted_price || course.price || 1999;
                const calcDiscount = course.discount_percentage || Math.round(((displayActualPrice - displayDiscountPrice) / displayActualPrice) * 100);

                return (
                  <div key={course._id} className="course-card-new">
                    <div className="card-image-new">
                      <img
                        src={getImageUrl(course.coverphoto || "")}
                        alt={course.title}
                      />
                      <div className={`level-badge-new ${levelClass}`}>
                        {course.skill_level ||'ADVANCED'}
                      </div>
                      <div className="card-actions-new">
                        <button className="share-btn-new" onClick={e => handleShare(course, e)} aria-label="Share">
                          <Share2 size={14} />
                        </button>
                        <button className={`wishlist-btn-new${isWishlisted ?' active' :''}`} onClick={e => toggleWishlist(course, e)} aria-label="Wishlist">
                          <Heart size={14} fill={isWishlisted ?'#ef4444' :'none'} stroke="#ef4444" />
                        </button>
                      </div>
                    </div>

                    <div className="card-content-new">
                      <div className="top-row-new">
                        <div className="rating-badge-new">
                          <Star size={11} fill="#ffffff" stroke="#ffffff" />
                          <span>{course.rating || 4}</span>
                        </div>
                        {course.syllabus ? (
                          <div
                            className="syllabus-badge-new"
                            onClick={() => {
                              setDownloadTarget(course.syllabus!);
                              setDownloadTitle(`${course.title} Syllabus`);
                              setDownloadModalOpen(true);
                            }}
                            style={{ cursor:'pointer' }}
                          >
                            <Download size={11} /> Free Syllabus
                          </div>
                        ) : (
                          <div className="syllabus-badge-new transparent" style={{ opacity: 0, pointerEvents:'none' }}>Empty</div>
                        )}
                        <div className="category-badge-new">{course.course_category ||'Banking'}</div>
                      </div>

                      <h3 className="course-title-new">{course.title}</h3>
                      <p className="course-desc-new">
                        {course.short_desc ? (course.short_desc.length > 70 ? course.short_desc.slice(0, 70) +'...' : course.short_desc) :'A beginner-friendly guide to understanding and investing in the...'}
                      </p>

                      <div className="divider-new" />

                      <div className="stats-row-new">
                        <div className="stat-item-new"><PlayCircle size={13} /> {course.video_count || 8} Videos</div>
                        <div className="stat-item-new"><FileText size={13} /> {course.pdf_count || 4} PDFs</div>
                        <div className="stat-item-new stat-item-live-new"><div className="live-dot-new" /> {course.practice_set_count || 2} Live Classes</div>
                      </div>

                      <div className="divider-new" />

                      <div className="bottom-stats-new">
                        <div className="bottom-stat-item-new"><Users size={15} /> {course.enrolled_count || 234} Enrolled</div>
                        <div className="bottom-stat-item-new"><Clock size={15} /> {formatDuration(course.duration || 200)}</div>
                        <div className="bottom-stat-item-new"><BookOpen size={15} /> {course.chapters_count || 16} Lessons</div>
                      </div>

                      <div className="divider-new" />

                      <div className="instructor-row-new">
                        <img src={getTeacherProfile(course)} alt={getTeacherName(course)} onError={e => { (e.target as HTMLImageElement).src ='/assets/img/review/1.jpg'; }} />
                        <div className="instructor-info-new">
                          <strong>{getTeacherName(course)}</strong>
                          <span>Mentor</span>
                        </div>
                      </div>

                      <div className="card-footer-new">
                        <div className="price-block-new">
                          <div className="price-main-new">{displayDiscountPrice.toLocaleString('en-IN')}</div>
                          <div className="price-old-discount">
                            <div className="price-old-new">{displayActualPrice.toLocaleString('en-IN')}</div>
                            <div className="discount-badge-new">{calcDiscount}% Off</div>
                          </div>
                        </div>
                        <Link to={`/course-details/${course._id}`} className="enroll-btn-new">Enroll Now</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination-wrapper-new">
                <button className="page-btn-new" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>
                  <ChevronLeft size={18} /> Previous
                </button>
                <span className="page-counter-new">Page {currentPage} of {totalPages}</span>
                <button className="page-btn-new" disabled={currentPage === totalPages} onClick={() => changePage(currentPage + 1)}>
                  Next <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <StylishEmptyState
            title="No Courses Found"
            description="We couldn't find any courses matching your search or category filter. Try clearing the filters or searching for something else."
            actionText="Clear All Filters"
            onAction={() => { setSearchQuery(''); setSelectedCategory('All Exams'); }}
            showBack={false}
          />
        )}
      </div>

      <DownloadPopupModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        targetUrl={downloadTarget}
        resourceTitle={downloadTitle}
        resourceType="Course Syllabus"
      />
    </main>
  );
}