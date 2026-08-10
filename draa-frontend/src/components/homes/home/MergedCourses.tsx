import React, { useState, useEffect, useCallback, useRef } from'react';
import toast from '../../../utils/toast';
import { Link, useNavigate } from'react-router-dom';
import {
  PlayCircle,
  FileText,
  Users,
  Clock,
  BookOpen,
  Download,
  Star,
  Share2,
  Heart,
  ChevronRight,
  ChevronLeft,
  LayoutGrid
} from'lucide-react';
import url from'../../../url';
import'./MergedCourses.css';
import StylishEmptyState from'../../common/StylishEmptyState';
import ImgWithFallback from'../../common/ImgWithFallback';
import'../../common/SkeletonLoader.css';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from'../../../utils/wishlistApi';
import { getUserRole } from'../../../utils/global_auth';

/*  TYPES  */

interface CourseCategory {
  _id: string;
  name: string;
  slug?: string;
  courseCount?: number;
}

interface Teacher {
  _id: string;
  name?: string;
  tname?: string;
  profile?: string;
  tprofile?: string;
}

interface Course {
  _id: string;
  title: string;
  short_desc?: string;
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
  chapters_count?: number;
  video_count?: number;
  pdf_count?: number;
  practice_set_count?: number;
  teacher?: Teacher;
}

/*  COMPONENT  */

const MergedCourses: React.FC = () => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /*  FETCH DATA  */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const catRes = await fetch(`${url}/course/categories?active=true&includeCount=true`);
      const catData = await catRes.json();
      const catList = Array.isArray(catData?.data?.categories) 
        ? catData.data.categories.filter((c: any) => c.isActive) 
        : [];
      
      setCategories([{ _id:'all', name:'All Courses' }, ...catList]);

      // 2. Fetch Initial Courses (All Popular)
      const courseRes = await fetch(`${url}/course/allCourses`);
      const courseData = await courseRes.json();
      const courseList = courseData?.data?.courses || [];
      setCourses(courseList.slice(0, 8)); // Show top 8 initially

    } catch (err) {
      console.error('Failed to load merged data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /*  HANDLE CATEGORY CHANGE  */
  const handleCategoryChange = async (catId: string) => {
    if (catId === activeCategoryId) return;
    setActiveCategoryId(catId);
    setLoading(true);

    try {
      let endpoint = `${url}/course/allCourses`;
      if (catId !=='all') {
        endpoint = `${url}/course/getCourseByCategory/${catId}`;
      }

      const res = await fetch(endpoint);
      const json = await res.json();
      const list = json?.data?.courses || [];
      setCourses(list.slice(0, 8));
    } catch (err) {
      console.error('Filter error', err);
    } finally {
      setLoading(false);
    }
  };

  /*  HELPERS  */
  const getTeacherName = (course: Course) =>
    course.teacher?.name || course.teacher?.tname ||'Expert Mentor';

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
      url: `${window.location.origin}/course-details/${course._id}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard!');
      }
    } catch {}
  };

  /*  WISHLIST  */
  useEffect(() => {
    if (getUserRole() ==='GUEST') return;
    const loadWishlist = async () => {
      try {
        const items = await fetchWishlist();
        const ids = new Set<string>(items.map((i: any) => String(i.item_id)));
        setWishlistIds(ids);
      } catch {}
    };
    loadWishlist();
  }, []);

  const toggleWishlist = async (course: Course, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const role = getUserRole();
    if (role ==='GUEST') {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      if (wishlistIds.has(course._id)) {
        await removeFromWishlist({ item_type:'course', item_id: course._id });
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(course._id);
          return next;
        });
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({
          item_type:'course',
          item_id: course._id,
          snapshot: { title: course.title, price: course.price, coverphoto: course.coverphoto },
        });
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.add(course._id);
          return next;
        });
        toast.success('Added to wishlist!');
      }
    } catch {
      toast.error('Wishlist action failed');
    }
  };

  const scroll = (direction:'left' |'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const scrollTo = direction ==='left' ? scrollLeft - 200 : scrollLeft + 200;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior:'smooth' });
    }
  };

  return (
    <section className="merged-courses-section">
      <div className="container">
        
        {/* HEADER */}
        <div className="merged-header">
          <div className="merged-title-block">
            <span className="merged-badge">Premium Learning</span>
            <h2 className="merged-main-title">Explore Our Top-Rated Courses</h2>
            <p className="merged-sub-text">Hand-picked courses from India's finest mentors to help you excel in competitive exams.</p>
          </div>
          <Link to="/courses" className="merged-view-all">
            View All Courses <ChevronRight size={16} />
          </Link>
        </div>

        {/* CATEGORY SELECTOR */}
        <div className="merged-category-nav">
          <button className="nav-arrow left" onClick={() => scroll('left')}><ChevronLeft size={20} /></button>
          <div className="category-scroll-container" ref={scrollContainerRef}>
            {categories.map(cat => (
              <button
                key={cat._id}
                className={`cat-pill ${activeCategoryId === cat._id ?'active' :''}`}
                onClick={() => handleCategoryChange(cat._id)}
              >
                {cat._id ==='all' ? <LayoutGrid size={14} /> : null}
                {cat.name}
                {cat.courseCount ? <span className="cat-count">{cat.courseCount}</span> : null}
              </button>
            ))}
          </div>
          <button className="nav-arrow right" onClick={() => scroll('right')}><ChevronRight size={20} /></button>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="merged-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mc-card" style={{ pointerEvents: 'none' }}>
                <div className="mc-image sk-shimmer" style={{ minHeight: 180 }} />
                <div className="mc-body">
                  <div className="sk-shimmer" style={{ height: 14, width: '40%', borderRadius: 6, marginBottom: 10 }} />
                  <div className="sk-shimmer" style={{ height: 18, width: '85%', borderRadius: 6, marginBottom: 8 }} />
                  <div className="sk-shimmer" style={{ height: 14, width: '60%', borderRadius: 6, marginBottom: 16 }} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div className="sk-shimmer" style={{ height: 36, flex: 1, borderRadius: 8 }} />
                    <div className="sk-shimmer" style={{ height: 36, flex: 1, borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="merged-grid">
            {courses.map(course => {
              const isWishlisted = wishlistIds.has(course._id);
              return (
                <div key={course._id} className="mc-card">
                  <div className="mc-image">
                    <ImgWithFallback
                      src={course.coverphoto ? `${url}/${course.coverphoto.replace(/\\/g,'/')}` : null}
                      alt={course.title}
                      size="lg"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className="mc-level">{course.skill_level ||'Beginner'}</div>
                    <div className="mc-actions">
                      <button className="mc-action-btn" onClick={e => handleShare(course, e)}><Share2 size={14} /></button>
                      <button className={`mc-action-btn ${isWishlisted ?'active' :''}`} onClick={e => toggleWishlist(course, e)}>
                        <Heart size={14} fill={isWishlisted ?'#ff4d4f' :'none'} stroke={isWishlisted ?'#ff4d4f' :'currentColor'} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mc-body">
                    <div className="mc-meta-top">
                      <div className="mc-rating"><Star size={11} fill="currentColor" /> 4.5</div>
                      <div className="mc-cat-tag">{course.course_category ||'General'}</div>
                    </div>
                    
                    <h3 className="mc-title">{course.title}</h3>
                    
                    <div className="mc-stats-grid">
                      <div className="mc-stat"><PlayCircle size={13} /> <span>{course.video_count || 12}+ Videos</span></div>
                      <div className="mc-stat"><FileText size={13} /> <span>{course.pdf_count || 5}+ PDFs</span></div>
                      <div className="mc-stat"><Clock size={13} /> <span>{Math.floor(course.duration / 60)}h+ Duration</span></div>
                      <div className="mc-stat"><Users size={13} /> <span>{course.enrolled_count || 120}+ Joined</span></div>
                    </div>

                    <div className="mc-footer">
                      <div className="mc-price-block">
                        <span className="mc-price">{(course.discounted_price || course.price).toLocaleString()}</span>
                        {course.actual_price && <span className="mc-old-price">{course.actual_price.toLocaleString()}</span>}
                      </div>
                      <Link to={`/course-details/${course._id}`} className="mc-enroll-btn">Enroll Now</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding:'60px 0', width:'100%' }}>
            <StylishEmptyState 
              title={`No courses in ${categories.find(c => c._id === activeCategoryId)?.name ||'this category'}`}
              description="We are currently preparing more comprehensive courses for this category. Stay tuned for new additions or explore our other top-rated courses!"
              actionText="Explore All Courses"
              actionPath="/courses"
              showBack={false}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default MergedCourses;
