import { useState, useEffect, useCallback } from'react';
import toast from '../../utils/toast';
import { Link, useParams, useNavigate } from'react-router-dom';
import {
  Share2,
  Download,
  Star,
  PlayCircle,
  FileText,
  Calendar,
  Users,
  Clock,
  BookOpen,
  Loader2,
  ChevronRight,
  Search,
  X,
  Heart
} from'lucide-react';
import url, { getImageUrl } from'../../url';
import'./CoursesArea.css';
import { fetchWishlist, addToWishlist, removeFromWishlist } from'../../utils/wishlistApi';
import { getUserRole } from'../../utils/global_auth';
import StylishEmptyState from'../common/StylishEmptyState';

// --- Full Interfaces ---
interface Teacher {
  _id: string;
  tname: string;
  tspecialization: string;
  tprofile: string;
}

interface Course {
  _id: string;
  title: string;
  short_desc: string;
  price: number;
  duration: number;
  teacher_id: Teacher;
  coverphoto: string;
  skill_level: string;
  course_category?: string;
  chapterCount: number;
  enrollmentCount: number;
  averageRating: number;
}

export default function CategoryCourses() {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();

  const [courses, setCourses] = useState<Course[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<any[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loginUser, setLoginUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  //  INITIAL DATA FETCH: CURRENT CATEGORY + ALL CATEGORIES FOR FILTER BAR
  const fetchAllData = useCallback(async () => {
    if (!category) return;
    setLoading(true);

    try {
      // Fetching current category courses and the master list of categories simultaneously
      const [courseRes, allCatRes] = await Promise.all([
        fetch(`${url}/course/categories/${category}/courses?limit=50`),
        fetch(`${url}/course/categories?active=true`)
      ]);

      const courseData = await courseRes.json();
      const allCatData = await allCatRes.json();

      setCourses(courseData?.data?.courses || []);
      setCategoryInfo(courseData.data.category || null);

      // Setup the dynamic filter bar categories
      setDynamicCategories(allCatData?.data?.categories || []);

      if (courseData.data.category) {
        document.title = `${courseData.data.category.name} Courses - Draa`;
      }
    } catch (error) {
      console.error("Error loading category marketplace:", error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // --- WISHLIST LOGIC ---
  // isLoggedIn moved to global_auth.ts helper


  useEffect(() => {
    if (getUserRole() ==="GUEST") return;
    const loadWishlist = async () => {
      try {
        const items = await fetchWishlist();
        const ids = new Set<string>(
          items.map((i: any) => (i?.item_id ? String(i.item_id) :""))
        );
        setWishlistIds(ids);
      } catch {
        toast.error("Failed to load wishlist");
        setWishlistIds(new Set<string>());
      }
    };
    loadWishlist();
  }, []);

  const toggleWishlist = async (course: Course, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const role = getUserRole();
    if (role ==="GUEST") {
      toast.error("Please login to use wishlist");
      return;
    }

    if (role !=="STUDENT") {
      toast.error("Only students can use wishlist");
      return;
    }

    try {
      if (wishlistIds.has(course._id)) {
        await removeFromWishlist({ item_type:"course", item_id: course._id });
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.delete(course._id);
          return next;
        });
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist({
          item_type:"course",
          item_id: course._id,
          snapshot: {
            title: course.title,
            price: course.price,
            coverphoto: course.coverphoto,
          },
        });
        setWishlistIds(prev => {
          const next = new Set(prev);
          next.add(course._id);
          return next;
        });
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <main className="explore-courses-page-new">
      <div className="container">

        {/* BREADCRUMB */}
        <nav className="breadcrumb-nav-new">
          <Link to="/">Home</Link> <ChevronRight size={14} />
          <Link to="/courses">Courses</Link> <ChevronRight size={14} />
          <span className="active">{categoryInfo?.name ||"Category"}</span>
        </nav>

        {/* HEADER AREA */}
        <div className="courses-header-wrapper">
          <div className="courses-header-new">
            <div className="title-area-new">
              <h1 className="section-main-title-new">
                <span className="gradient-text">{categoryInfo?.name}</span> Courses
              </h1>
              <p className="section-sub-text-new">
                {categoryInfo?.description ||"Master new skills with our expert-led programs."}
              </p>
            </div>
            <div className="showing-courses-text">Showing <strong>{courses.length}</strong> courses</div>
          </div>

          {/* DYNAMIC CATEGORY FILTER BAR */}
          <div className="filters-row-new">
            {/* SEARCH */}
            <div className="search-input-wrapper-new">
              <Search className="search-icon-new" size={18} />
              <input
                type="text"
                className="course-search-input-new"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="clear-search-btn-new" onClick={() => setSearchQuery('')}>
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="category-tabs-container">
              <button
                className="category-tab-btn"
                onClick={() => navigate('/courses')}
              >
                All Exams
              </button>
              {dynamicCategories.map(cat => (
                <button
                  key={cat._id}
                  className={`category-tab-btn ${category === cat._id || category === cat.slug ?'active' :''}`}
                  onClick={() => navigate(`/courses/category/${cat.name}`)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COURSES GRID */}
        {loading ? (
          <div className="loader-container-new"><Loader2 className="spinner-new" size={40} /></div>
        ) : filteredCourses.length > 0 ? (
          <div className="courses-grid-new">
            {filteredCourses.map((course) => {
              const isWishlisted = wishlistIds.has(course._id);

              return (
                <div key={course._id} className="course-card-new">

                  {/* IMAGE AREA */}
                  <div className="card-image-new">
                    <img
                      src={getImageUrl(course.coverphoto || "")}
                      alt={course.title}
                    />
                    <div className={`level-badge-new ${course.skill_level?.toLowerCase() ||'beginner'}`}>
                      {course.skill_level ||'Beginner'}
                    </div>
                    <div className="card-actions-new">
                      <button
                        className={`wishlist-btn-new ${isWishlisted ?'active' :''}`}
                        onClick={(e) => toggleWishlist(course, e)}
                      >
                        <Heart size={16} fill={isWishlisted ?'#ef4444' :'none'} color={isWishlisted ?'#ef4444' :'currentColor'} />
                      </button>
                      <button className="share-btn-new"><Share2 size={16} /></button>
                    </div>
                  </div>

                  {/* CONTENT AREA */}
                  <div className="card-content-new">
                    <div className="top-row-new">
                      <span className="rating-badge-new"><Star size={12} fill="#fff" /> {course.averageRating || 4}</span>
                      <span className="syllabus-badge-new"><Download size={14} /> Free Syllabus</span>
                      <span className="category-badge-new">{course.course_category || categoryInfo?.name}</span>
                    </div>

                    <h3 className="course-title-new">{course.title}</h3>
                    <p className="course-desc-new">
                      {course.short_desc ? course.short_desc.slice(0, 70) +'...' :'Prepare for Indias most competitive exams with expert guidance...'}
                    </p>

                    <div className="stats-row-new">
                      <span className="stat-item-new"><PlayCircle size={14} /> {course.chapterCount || 8} Videos</span>
                      <span className="stat-item-new"><FileText size={14} /> 4 PDFs</span>
                      <span className="stat-item-new"><Calendar size={14} /> 2 Live Classes</span>
                    </div>

                    <div className="divider-new"></div>

                    <div className="bottom-stats-new">
                      <div className="bottom-stat-item-new">
                        <Users size={16} />
                        <span>{course.enrollmentCount || 234} Enrolled</span>
                      </div>
                      <div className="bottom-stat-item-new">
                        <Clock size={16} />
                        <span>{formatDuration(course.duration)}</span>
                      </div>
                      <div className="bottom-stat-item-new">
                        <BookOpen size={16} />
                        <span>{course.chapterCount || 16} Lessons</span>
                      </div>
                    </div>

                    <div className="divider-new"></div>

                    {/* INSTRUCTOR BOX */}
                    <div className="instructor-row-new">
                      <img
                        src={course.teacher_id?.tprofile ? `${url}${course.teacher_id.tprofile}` :'/assets/img/user.jpg'}
                        alt="mentor"
                      />
                      <div className="instructor-info-new">
                        <strong>{course.teacher_id?.tname ||'Atul Biswas'}</strong>
                        <span>Mentor</span>
                      </div>
                    </div>

                    {/* PRICE & ACTION */}
                    <div className="card-footer-new">
                      <div className="price-block-new">
                        <div className="price-old-discount">
                          <span className="price-old-new">3400</span>
                          <span className="discount-badge-new">40% Off</span>
                        </div>
                        <span className="price-main-new">{course.price.toLocaleString('en-IN')}</span>
                      </div>
                      <button className="enroll-btn-new" onClick={() => navigate(`/course-details/${course._id}`)}>
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding:'60px 0', width:'100%' }}>
            <StylishEmptyState 
              title={searchQuery ? `No results for"${searchQuery}"` : `No courses in ${categoryInfo?.name ||'this category'}`}
              description={searchQuery ?"We couldn't find any courses matching your search. Try different keywords or browse our main categories." :"We are currently designing a specialized curriculum for this category. Stay tuned or explore our other top-rated courses!"}
              actionText={searchQuery ?"Clear Search" :"Browse All Courses"}
              actionPath={searchQuery ?"#" :"/courses"}
              onAction={searchQuery ? () => setSearchQuery('') : undefined}
              showBack={false}
            />
          </div>
        )}
      </div>
    </main>
  );
}