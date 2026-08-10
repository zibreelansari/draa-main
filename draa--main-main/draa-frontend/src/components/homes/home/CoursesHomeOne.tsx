import { Link } from'react-router-dom';
import toast from '../../../utils/toast';
import { useEffect, useState } from'react';
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
} from'lucide-react';
import url, { getImageUrl } from'../../../url';
import'./PopularCourses.css';
import ElevatePreparation from'./ElevatePreparation';
import ImgWithFallback from'../../common/ImgWithFallback';
import'../../common/SkeletonLoader.css';
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from'../../../utils/wishlistApi';
import { getUserRole, getStoredUser } from'../../../utils/global_auth';

/*  TYPES  */

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
  youtube_links?: any[];
  enrolled_count?: number;
  rating?: number;
  chapters_count?: number;
  video_count?: number;
  pdf_count?: number;
  practice_set_count?: number;
  teacher?: Teacher;
}

/*  COMPONENT  */

export default function PopularCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  /*  FETCH COURSES  */
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${url}/course/allCourses`);
        const json = await res.json();
        const list = json?.data?.courses || [];
        setCourses(list.slice(0, 4));
      } catch (err) {
        console.error('Failed to load courses', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  /*  HELPERS  */
  // isLoggedIn moved to global_auth.ts helper


  const formatDuration = (mins = 0) => {
    if (!mins) return'0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getTeacherName = (course: Course) =>
    course.teacher?.name || course.teacher?.tname ||'Atul Biswas';

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
        alert('Course link copied to clipboard!');
      }
    } catch (err) {
      if (err instanceof Error && err.name !=='AbortError') {
        try {
          await navigator.clipboard.writeText(shareData.url);
          alert('Course link copied to clipboard!');
        } catch {}
      }
    }
  };

  /*  WISHLIST  */
  useEffect(() => {
    if (getUserRole() ==='GUEST') return;
    const loadWishlist = async () => {
      try {
        const items = await fetchWishlist();
        const ids = new Set<string>(
          items.map((i: any) => (i?.item_id ? String(i.item_id) :"")),
        );
        setWishlistIds(ids);
      } catch {
        toast.error('Failed to load wishlist');
        setWishlistIds(new Set<string>());
      }
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
    if (role !=='STUDENT') {
      toast.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to use the wishlist. This feature is reserved for students.`);
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
      } else {
        await addToWishlist({
          item_type:'course',
          item_id: course._id,
          snapshot: {
            title: course.title,
            price: course.price,
            coverphoto: course.coverphoto,
          },
        });
        setWishlistIds(prev => {
          const next = new Set<string>(prev);
          next.add(course._id);
          return next;
        });
      }
    } catch (err) {
      console.error('Wishlist error:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  /*  RENDER  */

  return (
    <section id="home-popular-courses" className="popular-courses-section-new">
      <div className="container">

        {/* HEADER */}
        <div className="courses-header-new">
          <div className="title-area-new">
            <h2 className="section-main-title-new">Popular Courses</h2>
            <p className="section-sub-text-new">
              Prepare for India's most competitive exams
            </p>
          </div>
          <Link to="/courses" className="view-all-btn-new">
            View All
          </Link>
        </div>

        {/* GRID */}
        {loading ? (
          <div className="courses-grid-new">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="course-card-new" style={{ pointerEvents: 'none' }}>
                <div className="card-image-new sk-shimmer" style={{ minHeight: 200 }} />
                <div className="card-content-new">
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <div className="sk-shimmer" style={{ height: 20, width: 40, borderRadius: 6 }} />
                    <div className="sk-shimmer" style={{ height: 20, width: 60, borderRadius: 6 }} />
                    <div className="sk-shimmer" style={{ height: 20, width: 70, borderRadius: 6 }} />
                  </div>
                  <div className="sk-shimmer" style={{ height: 20, width: '80%', borderRadius: 6, marginBottom: 8 }} />
                  <div className="sk-shimmer" style={{ height: 14, width: '95%', borderRadius: 6, marginBottom: 4 }} />
                  <div className="sk-shimmer" style={{ height: 14, width: '70%', borderRadius: 6, marginBottom: 16 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div className="sk-shimmer" style={{ height: 32, width: 80, borderRadius: 8 }} />
                    <div className="sk-shimmer" style={{ height: 32, width: 100, borderRadius: 8 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="courses-grid-new">
            {courses.length > 0 ? (
              courses.map(course => {
                const isWishlisted = wishlistIds.has(course._id);
                const levelClass = course.skill_level?.toLowerCase() ||'beginner';

                return (
                  <div key={course._id} className="course-card-new">

                    {/* IMAGE */}
                    <div className="card-image-new">
                      <ImgWithFallback
                        src={getImageUrl(course.coverphoto || "")}
                        alt={course.title}
                        size="lg"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />

                      {/* Level badge  top left */}
                      <div className={`level-badge-new ${levelClass}`}>
                        {course.skill_level ||'BEGINNER'}
                      </div>

                      {/* Action buttons  top right */}
                      <div className="card-actions-new">
                        <button
                          className="share-btn-new"
                          onClick={e => handleShare(course, e)}
                          aria-label="Share"
                        >
                          <Share2 size={14} />
                        </button>
                        <button
                          className={`wishlist-btn-new${isWishlisted ?' active' :''}`}
                          onClick={e => toggleWishlist(course, e)}
                          aria-label="Wishlist"
                        >
                          <Heart
                            size={14}
                            fill={isWishlisted ?'#ef4444' :'none'}
                            stroke="#ef4444"
                          />
                        </button>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="card-content-new">

                      {/* Top badges row */}
                      <div className="top-row-new">
                        <div className="rating-badge-new">
                          <Star size={11} fill="#ffffff" stroke="#ffffff" />
                          <span>4</span>
                        </div>
                        <div className="syllabus-badge-new">
                          <Download size={11} />
                          <span>Free Syllabus</span>
                        </div>
                        <div className="category-badge-new">
                          {course.course_category ||'Banking'}
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="course-title-new">
                        {course.title ||'Stock Market Fundamentals'}
                      </h3>

                      {/* Description */}
                      <p className="course-desc-new">
                        {course.short_desc
                          ? course.short_desc.length > 80
                            ? course.short_desc.slice(0, 80) +'...'
                            : course.short_desc
                          :'A beginner-friendly guide to understanding and investing in the...'}
                      </p>
                      <div className="divider-new" />

                      {/* Stats row */}
                      <div className="stats-row-new">
                        <div className="stat-item-new">
                          <PlayCircle size={13} />
                          <span>{course.video_count || 8} Videos</span>
                        </div>
                        <div className="stat-item-new">
                          <FileText size={13} />
                          <span>{course.pdf_count || 4} PDFs</span>
                        </div>
                        <div className="stat-item-new stat-item-live-new">
                          <div className="live-dot-new" />
                          <span>{course.practice_set_count || 2} Live Classes</span>
                        </div>
                      </div>

                      <div className="divider-new" />

                      {/* Bottom stats */}
                      <div className="bottom-stats-new">
                        <div className="bottom-stat-item-new">
                          <Users size={15} />
                          <span>{course.enrolled_count || 234} Enrolled</span>
                        </div>
                        <div className="bottom-stat-item-new">
                          <Clock size={15} />
                          <span>{formatDuration(course.duration || 200)}</span>
                        </div>
                        <div className="bottom-stat-item-new">
                          <BookOpen size={15} />
                          <span>{course.chapters_count || 16} Lessons</span>
                        </div>
                      </div>

                      <div className="divider-new" />

                      {/* Instructor */}
                      <div className="instructor-row-new">
                        <img
                          src={getTeacherProfile(course)}
                          alt={getTeacherName(course)}
                          onError={e => {
                            (e.target as HTMLImageElement).src =
'/assets/img/review/1.jpg';
                          }}
                        />
                        <div className="instructor-info-new">
                          <strong>{getTeacherName(course)}</strong>
                          <span>Mentor</span>
                        </div>
                      </div>

                      {/* Footer: price + enroll */}
                      <div className="card-footer-new">
                        <div className="price-block-new">
                          <div className="price-main-new">
                            {(course.discounted_price || course.price || 1999).toLocaleString('en-IN')}
                          </div>
                          <div className="price-old-discount">
                            <div className="price-old-new">
                              {(course.actual_price || course.price || 3400).toLocaleString('en-IN')}
                            </div>
                            <div className="discount-badge-new">
                              {course.discount_percentage || 40}% Off
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/course-details/${course._id}`}
                          className="enroll-btn-new"
                        >
                          Enroll Now
                        </Link>
                      </div>

                    </div>
                  </div>
                );
              })
            ) : (
              <div className="pe-empty-state">
                <div className="pe-empty-icon-box">
                  <PlayCircle size={32} />
                </div>
                <h3>No Courses Found</h3>
                <p>We're currently updating our course catalog. Please check back later!</p>
                <Link to="/courses" className="pe-view-all-btn" style={{ textDecoration:'none' }}>
                  Browse All Courses
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <ElevatePreparation />
    </section>
  );
}