import React, { useState, useEffect, useMemo } from'react';
import toast from '../../utils/toast';
import { useParams, Link, useNavigate } from'react-router-dom';
import {
  AlertCircle, Clock, MapPin, Share2, Heart, HelpCircle, ClipboardList,
  ClipboardCheck, ClipboardList as ClipboardIcon,
  PlayCircle, BookOpen, FileText, Download, Star, Users, Briefcase, GraduationCap, ArrowRight, Bookmark, Globe, ShoppingCart, Eye,
  ChevronRight
} from'lucide-react';
import Swal from'sweetalert2';
import { addToWishlist, removeFromWishlist, fetchWishlist } from'../../utils/wishlistApi';
import { getUserRole, getCartKey } from'../../utils/global_auth';
import axios from'axios';
import url, { getImageUrl } from'../../url';
import ImgWithFallback from '../common/ImgWithFallback';
import HeaderOne from'../../layouts/headers/HeaderOne';
import MainFooter from'../../layouts/footers/MainFooter';
import ScrollToTop from'../common/ScrollToTop';
import MyBreadcrumb from'../common/Breadcrumb';
import PYQPreviewModal from'../pyqs/PYQPreviewModal';
import DownloadPopupModal from'../jobs/DownloadPopupModal';
import usePageTitle from'../../hooks/usePageTitle';
import'./TopicExplorePage.css';

/* 
   MAIN COMPONENT  EXHAUSTIVE TOPIC HUB
   Redesigned for a premium, minimalist feel.
 */
export default function TopicExplorePage() {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const decodedTopic = topic ? decodeURIComponent(topic).replace(/-/g,'') :'';

  usePageTitle(decodedTopic ? `Explore ${decodedTopic}` :"Explore Topics");

  const [loading, setLoading] = useState(true);
  const [results, setLoadingResults] = useState<any[]>([]);
  
  const [activeNav, setActiveNav] = useState('courses');
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

  // Download Modal State
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState('');
  const [downloadTitle, setDownloadTitle] = useState('');

  const handleDownloadTrigger = (target: string, title: string) => {
    setDownloadTarget(target);
    setDownloadTitle(title);
    setDownloadModalOpen(true);
  };

  /*  Load Wishlist  */
  useEffect(() => {
    const loadWishlist = async () => {
      if (getUserRole() !=="STUDENT") return;
      try {
        const items = await fetchWishlist();
        const ids = new Set(items.filter((i: any) => i.item_type ==="test_series").map((i: any) => String(i.item_id)));
        setWishlistIds(ids);
      } catch (err) { console.error(err); }
    };
    loadWishlist();
  }, []);

  const handleShare = async (item: any) => {
    const shareUrl = `${window.location.origin}/exam-topics/${item._id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.plainTitle, url: shareUrl });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const toggleWishlist = async (item: any) => {
    const role = getUserRole();
    if (role !=="STUDENT") {
      toast.info("Please login as a student to use wishlist");
      return;
    }
    const isWishlisted = wishlistIds.has(item._id);
    try {
      if (isWishlisted) {
        await removeFromWishlist({ item_type:"test_series", item_id: item._id });
        setWishlistIds(prev => { const s = new Set(prev); s.delete(item._id); return s; });
        toast.success("Removed from wishlist");
      } else {
        const snapshot: any = { name: item.plainTitle, code: item.code };
        if (item.type ==='course') { snapshot.title = item.plainTitle; snapshot.price = item.price; snapshot.coverphoto = item.thumbnail; snapshot.teacher = item.author; }
        if (item.type ==='book') { snapshot.title = item.plainTitle; snapshot.author = item.author; snapshot.coverImage = item.thumbnail; snapshot.price = item.price || 0; }

        await addToWishlist({ 
          item_type: item.type ==='course' ?'course' : item.type ==='book' ?'book' :'test_series', 
          item_id: item._id, 
          snapshot 
        });
        setWishlistIds(prev => new Set(prev).add(item._id));
        toast.success("Added to wishlist");
      }
    } catch (err) { toast.error("Action failed"); }
  };

  /*  Cart Logic  */
  const addBookToCart = (book: any, format:"digital" |"physical") => {
    const cartKey = getCartKey();
    const isEbook = format ==='digital';
    const bookType = isEbook ?'pdftype' :'paperback';
    const basePrice = isEbook ? book.digitalPrice : book.physicalPrice;
    const discount = isEbook ? book.digitalDiscountPercentage : book.physicalDiscountPercentage;

    if (!basePrice || basePrice <= 0) {
      toast.error('Invalid book price');
      return;
    }

    const finalPrice = getFinalPrice(basePrice, discount);

    let cart: any[] = [];
    try {
      cart = JSON.parse(localStorage.getItem(cartKey) ||'[]');
    } catch { cart = []; }

    const existing = cart.find((i: any) => i.bookId === book._id && i.bookType === bookType);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        cartItemId: `${book._id}-${bookType}-${Date.now()}`,
        book_id: book._id,
        bookId: book._id,
        bookType,
        title: book.plainTitle || book.title,
        author: book.author,
        coverImage: book.coverImage || book.thumbnail,
        basePrice,
        discountPercentage: discount || 0,
        finalPrice,
        quantity: 1,
        addedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Added to cart');
  };

  /*  Helpers  */
  const getTeacherProfile = (item: any) => {
    const p = item.teacherProfile || item.authorProfile;
    return getImageUrl(p ||'/assets/img/review/1.jpg');
  };

  const getFinalPrice = (price: number, discount?: number) =>
    !discount || discount <= 0 ? price : Math.round(price - (price * discount) / 100);

  /*  Fetch Everything via Global Search API  */
  useEffect(() => {
    if (!decodedTopic) { setLoading(false); return; }
    fetchTopicData(decodedTopic);
  }, [decodedTopic]);

  const fetchTopicData = async (t: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}/search/global?q=${encodeURIComponent(t)}&limit=50`);
      if (res.data.success) {
        setLoadingResults(res.data.data.results || []);
      }
    } catch (err) {
      console.error('TopicExplorePage Error:', err);
    } finally {
      setLoading(false);
    }
  };

  /*  Categorize Results  */
  const categorized = useMemo(() => {
    const groups: Record<string, any[]> = {
      course: [], book: [],'test-series': [], job: [], 
      pyq: [], syllabus: [], blog: [],'current-affair': [], examination: []
    };
    results.forEach(item => {
      if (groups[item.type]) groups[item.type].push(item);
    });
    return groups;
  }, [results]);

  const totalCount = results.length;

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior:'smooth' });
      setActiveNav(id.replace('-sect',''));
    }
  };

  const openModal = (id: string, title: string, type: string) => {
    const routeType = type.toLowerCase() ==='syllabus' ?'syllabus' :'pyq';
    window.open(`/view-resource/${routeType}/${id}`,'_blank');
  };

  if (totalCount === 0 && !loading) {
    return (
      <div className="tep-page">
        <HeaderOne />
        <div className="tep-no-results">
          <AlertCircle size={48} strokeWidth={1.5} />
          <h2>No Resources for"{decodedTopic}"</h2>
          <p>We are currently aggregating the best content for this topic. Try another keyword!</p>
          <Link to="/" className="tep-btn-minimal">Back to Home</Link>
        </div>
        <MainFooter />
      </div>
    );
  }

  return (
    <div className="tep-page">
      <HeaderOne />
      <ScrollToTop />

      {/*  UNIFIED HERO  */}
      <MyBreadcrumb 
        title={decodedTopic} 
        category="Explore"
        paths={[{ pathName: decodedTopic }]}
        showSearch={true}
      />

      {/*  DYNAMIC RESOURCE TABS  */}
      <section className="tep-hero-tabs-sect">
        <div className="tep-hero-container">
          <div className="tep-hero-grid-stats">
            {categorized.course.length > 0 && <div className="tep-res-tab" onClick={() => scrollToSection('courses-sect')}><PlayCircle size={18} /> <span>{categorized.course.length} Courses</span></div>}
            {categorized.book.length > 0 && <div className="tep-res-tab" onClick={() => scrollToSection('books-sect')}><BookOpen size={18} /> <span>{categorized.book.length} Books</span></div>}
            {categorized['test-series'].length > 0 && <div className="tep-res-tab" onClick={() => scrollToSection('tests-sect')}><ClipboardCheck size={18} /> <span>{categorized['test-series'].length} Series</span></div>}
            {categorized.job.length > 0 && <div className="tep-res-tab" onClick={() => scrollToSection('jobs-sect')}><Briefcase size={18} /> <span>{categorized.job.length} Notifications</span></div>}
            {(categorized.pyq.length + categorized.syllabus.length) > 0 && <div className="tep-res-tab" onClick={() => scrollToSection('docs-sect')}><FileText size={18} /> <span>{categorized.pyq.length + categorized.syllabus.length} Resources</span></div>}
          </div>
        </div>
      </section>

      {/*  STICKY NAV  */}
      <div className="tep-sticky-anchor">
        <div className="tep-sticky-inner">
          {categorized.course.length > 0 && <button className={activeNav ==='courses' ?'active' :''} onClick={() => scrollToSection('courses-sect')}>Courses</button>}
          {categorized.book.length > 0 && <button className={activeNav ==='books' ?'active' :''} onClick={() => scrollToSection('books-sect')}>Books</button>}
          {categorized['test-series'].length > 0 && <button className={activeNav ==='tests' ?'active' :''} onClick={() => scrollToSection('tests-sect')}>Test Series</button>}
          {categorized.job.length > 0 && <button className={activeNav ==='jobs' ?'active' :''} onClick={() => scrollToSection('jobs-sect')}>Jobs</button>}
          {(categorized.pyq.length + categorized.syllabus.length) > 0 && <button className={activeNav ==='docs' ?'active' :''} onClick={() => scrollToSection('docs-sect')}>Resources</button>}
          {(categorized.blog.length + categorized['current-affair'].length) > 0 && <button className={activeNav ==='insights' ?'active' :''} onClick={() => scrollToSection('insights-sect')}>Insights</button>}
        </div>
      </div>

      <div className="tep-main-content">
        <div className="tep-sections-stack">
          
          {/* COURSES */}
          {categorized.course.length > 0 && (
            <section id="courses-sect" className="tep-resource-group">
              <div className="tep-group-header">
                <div className="tep-group-info"><div className="tep-group-dot blue" /><h2>Learning Courses</h2></div>
                <Link to="/courses" className="tep-link-more">View All <ChevronRight size={14} /></Link>
              </div>
              <div className="tep-unified-grid native-style">
                {categorized.course.map(item => (
                  <CourseCardNative 
                    key={item._id} 
                    item={item} 
                    course={{
                      ...item,
                      title: item.plainTitle,
                      coverphoto: item.thumbnail,
                      teacher: { name: item.author, profile: getTeacherProfile(item) }
                    }} 
                    onShare={handleShare}
                    onWishlist={toggleWishlist}
                    isWishlisted={wishlistIds.has(item._id)}
                    onDownloadSyllabus={handleDownloadTrigger}
                    navigate={navigate} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* BOOKS */}
          {categorized.book.length > 0 && (
            <section id="books-sect" className="tep-resource-group">
              <div className="tep-group-header">
                <div className="tep-group-info"><div className="tep-group-dot green" /><h2>Books</h2></div>
                <Link to="/all-books" className="tep-link-more">Browse All <ChevronRight size={14} /></Link>
              </div>
              <div className="tep-unified-grid thin native-style">
                {categorized.book.map(item => (
                  <BookCardNative 
                    key={item._id} 
                    item={item}
                    book={{
                      ...item,
                      title: item.plainTitle,
                      coverImage: item.thumbnail,
                    }}
                    onShare={handleShare}
                    onWishlist={toggleWishlist}
                    onAddToCart={addBookToCart}
                    isWishlisted={wishlistIds.has(item._id)}
                    navigate={navigate} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* TEST SERIES */}
          {categorized['test-series'].length > 0 && (
            <section id="tests-sect" className="tep-resource-group">
              <div className="tep-group-header">
                <div className="tep-group-info"><div className="tep-group-dot orange" /><h2>Online Test Series</h2></div>
                <Link to="/online-test-series" className="tep-link-more">Practice More <ChevronRight size={14} /></Link>
              </div>
              <div className="tep-unified-grid ts-reference-layout">
                {categorized['test-series'].map(item => (
                  <TestSeriesReferenceCard 
                    key={item._id} 
                    item={item} 
                    navigate={navigate} 
                    onShare={handleShare}
                    onWaitlist={toggleWishlist}
                    isWishlisted={wishlistIds.has(item._id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* JOBS */}
          {categorized.job.length > 0 && (
            <section id="jobs-sect" className="tep-resource-group">
              <div className="tep-group-header">
                <div className="tep-group-info"><div className="tep-group-dot yellow" /><h2>Notifications</h2></div>
                <Link to="/jobs-notifications" className="tep-link-more">View More <ChevronRight size={14} /></Link>
              </div>
              <div className="tep-unified-grid native-style">
                {categorized.job.map(item => (
                  <JobCardNative 
                    key={item._id} 
                    item={item}
                    job={{
                      ...item,
                      title: item.plainTitle,
                      organization_name: item.organization
                    }}
                    navigate={navigate} 
                  />
                ))}
              </div>
            </section>
          )}

          {/* PAPERS & SYLLABUS */}
          {(categorized.pyq.length + categorized.syllabus.length) > 0 && (
            <section id="docs-sect" className="tep-resource-group">
              <div className="tep-group-header">
                <div className="tep-group-info"><div className="tep-group-dot purple" /><h2>Resources</h2></div>
              </div>
              <div className="tep-unified-grid native-style">
                {categorized.pyq.map(item => <GenericPaperCard key={item._id} item={item} type="PYQ" onView={() => openModal(item._id, item.plainTitle,'pyq')} />)}
                {categorized.syllabus.map(item => <GenericPaperCard key={item._id} item={item} type="SYLLABUS" onView={() => openModal(item._id, item.plainTitle,'syllabus')} />)}
              </div>
            </section>
          )}

          {/* INSIGHTS */}
          {(categorized.blog.length + categorized['current-affair'].length) > 0 && (
            <section id="insights-sect" className="tep-resource-group">
              <div className="tep-group-header">
                <div className="tep-group-info"><div className="tep-group-dot teal" /><h2>Insights</h2></div>
              </div>
              <div className="tep-unified-grid">
                {categorized.blog.slice(0, 4).map(blog => <BlogMiniCard key={blog._id} blog={blog} navigate={navigate} />)}
                {categorized['current-affair'].slice(0, 4).map(ca => <BlogMiniCard key={ca._id} blog={ca} navigate={navigate} isCA />)}
              </div>
            </section>
          )}

        </div>
      </div>

      <MainFooter />

      <DownloadPopupModal 
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        targetUrl={downloadTarget}
        resourceTitle={downloadTitle}
        resourceType="Course Syllabus"
      />
    </div>
  );
}

/*  specialized cards  */

function CourseCardNative({ course, item, navigate, onShare, onWishlist, isWishlisted, onDownloadSyllabus }: any) {
  const levelClass = course.skill_level?.toLowerCase() ||'advanced';
  const displayActualPrice = course.actual_price || course.price || 0;
  const displayDiscountPrice = course.discounted_price || course.price || 0;
  const calcDiscount = course.discount_percentage || (displayActualPrice > 0 ? Math.round(((displayActualPrice - displayDiscountPrice) / displayActualPrice) * 100) : 0);

  return (
    <div className="course-card-new">
      <div className="card-image-new">
        <ImgWithFallback src={getImageUrl(course.coverphoto)} alt={course.title} />
        <div className={`level-badge-new ${levelClass}`}>{course.skill_level ||'ADVANCED'}</div>
        <div className="card-actions-new">
          <button className="share-btn-new" onClick={e => onShare(item)}><Share2 size={14} /></button>
          <button className={`wishlist-btn-new${isWishlisted ?' active' :''}`} onClick={e => onWishlist(item)}>
            <Heart size={14} fill={isWishlisted ?'#ef4444' :'none'} stroke="#ef4444" />
          </button>
        </div>
      </div>
      <div className="card-content-new">
        <div className="top-row-new">
          <div className="rating-badge-new"><Star size={11} fill="#ffffff" stroke="#ffffff" /><span>{course.rating || 4}</span></div>
          {course.syllabus && (
            <div 
              className="syllabus-badge-new" 
              onClick={(e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                onDownloadSyllabus(course.syllabus, `${course.title} Syllabus`);
              }}
            >
              <Download size={11} /> Free Syllabus
            </div>
          )}
          <div className="category-badge-new">{course.course_category ||'General'}</div>
        </div>
        <h3 className="course-title-new">{course.title}</h3>
        <p className="course-desc-new">{course.short_desc?.substring(0, 100)}...</p>
        <div className="stats-row-new">
          <div className="stat-item-new"><PlayCircle size={13} /> {course.video_count || 0} Videos</div>
          <div className="stat-item-new"><FileText size={13} /> {course.pdf_count || 0} PDFs</div>
        </div>
        <div className="instructor-row-new">
          <img src={getTeacherProfile(course)} alt={course.teacher?.name} />
          <div className="instructor-info-new"><strong>{course.teacher?.name ||'Expert Mentor'}</strong><span>Mentor</span></div>
        </div>
        <div className="card-footer-new">
          <div className="price-block-new">
            <div className="price-main-new">{displayDiscountPrice.toLocaleString('en-IN')}</div>
            {calcDiscount > 0 && (
              <div className="price-old-discount">
                <div className="price-old-new">{displayActualPrice.toLocaleString('en-IN')}</div>
                <div className="discount-badge-new">{calcDiscount}% Off</div>
              </div>
            )}
          </div>
          <Link to={`/course-details/${course._id}`} className="enroll-btn-new">Enroll Now</Link>
        </div>
      </div>
    </div>
  );
}

function BookCardNative({ book, item, navigate, onShare, onWishlist, isWishlisted, onAddToCart }: any) {
  const [selectedFormat, setSelectedFormat] = useState<'physical' |'digital'>(book.physicalPrice ?'physical' :'digital');
  const getFinalPriceLocal = (price: number, discount?: number) => !discount || discount <= 0 ? price : Math.round(price - (price * discount) / 100);

  return (
    <div className="book-card-premium">
      <div className="card-hero">
        <div className="card-actions-overlay">
          <button className="share-overlay-btn" onClick={() => onShare(item)}><Share2 size={16} /></button>
          <button className={`wishlist-overlay-btn ${isWishlisted ?'active' :''}`} onClick={() => onWishlist(item)}>
            <Heart size={16} stroke="#ef4444" fill={isWishlisted ?'#ef4444' :'none'} />
          </button>
        </div>
        <div className="book-cover-container">
          <img 
            src={getImageUrl(book.coverImage)} 
            alt={book.title} 
            className="main-cover" 
            onError={(e) => {
              (e.target as HTMLImageElement).style.display ='none';
              (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
            }}
          />
          <div className="book-placeholder" style={{ display:'none' }}>
            <BookOpen size={40} />
            <span>COVER NOT AVAILABLE</span>
          </div>
        </div>
      </div>
      <div className="card-body-books">
        <div className="meta-top-row">
          <span className="cat-tag">{book.category?.name ||'General'}</span>
          <span className="lang-tag"><Globe size={12} /> {book.language}</span>
        </div>
        <h3 className="book-name-title">{book.title}</h3>
        <p className="book-author-text">Author: {book.author}</p>
        <div className="card-footer-sticky">
          <div className={`pricing-grid-dual ${book.digitalPrice && book.physicalPrice ?'dual' :'single'}`}>
            {book.digitalPrice > 0 && (
              <div onClick={() => setSelectedFormat('digital')} className={`price-box ${selectedFormat ==='digital' ?'active' :''}`}>
                <div className="box-label"><FileText size={14} /> Ebook</div>
                <div className="box-values"><span className="final">{getFinalPriceLocal(book.digitalPrice, book.digitalDiscountPercentage)}</span></div>
              </div>
            )}
            {book.physicalPrice > 0 && (
              <div onClick={() => setSelectedFormat('physical')} className={`price-box ${selectedFormat ==='physical' ?'active' :''}`}>
                <div className="box-label"><BookOpen size={14} /> Paperback</div>
                <div className="box-values"><span className="final">{getFinalPriceLocal(book.physicalPrice, book.physicalDiscountPercentage)}</span></div>
              </div>
            )}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'8px', marginTop:'16px' }}>
            <Link to={`/book-details/${book._id}`} className="buy-now-marketplace-btn">Buy Now</Link>
            <button className="add-cart-mini-btn" onClick={() => onAddToCart(book, selectedFormat)}>
              Add <ShoppingCart size={14} />
            </button>
          </div>
          <Link to={`/book-details/${book._id}`} className="details-link-text" style={{ display:'block', textAlign:'center', marginTop:'10px', fontSize:'13px', color:'#bd7b20', fontWeight: 600 }}>View Details</Link>
        </div>
      </div>
    </div>
  );
}

function JobCardNative({ job, item, navigate }: any) {
  return (
    <div className="job-card-figma">
      <div className="job-card-top">
        <span className="org-tag">{job.organization_name ||'Organization'}</span>
        <span className="post-time">
          {job.createdAt && !isNaN(new Date(job.createdAt).getTime()) 
            ? `Posted ${new Date(job.createdAt).toLocaleDateString()}` 
            :'Recently Posted'}
        </span>
      </div>
      <h3 className="job-title-text">{job.title}</h3>
      <div className="job-meta-row">
        <span><MapPin size={14} /> {job.location}</span>
        <span><Users size={14} /> {job.total_vacancies} Vacancies</span>
      </div>
      <div className="job-card-footer">
        <Link to={`/job-details/${job._id}`} className="view-details-link">View Details <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}

function PYQCardNative({ item, navigate }: any) {
  return (
    <div className="pyq-card">
      <div className="pyq-card-image-wrapper">
        {item.coverImage ? (
          <img src={getImageUrl(item.coverImage)} alt={item.examName || item.plainTitle} className="pyq-card-image" />
        ) : (
          <div className="pyq-card-letter-fallback">{item.examName?.[0] || item.plainTitle?.[0] ||'P'}</div>
        )}
      </div>
      <div className="card-top">
        <span className="badge-official">OFFICIAL</span>
        <span className="year-val">{item.year ||'2024'}</span>
      </div>
      <div className="card-mid">
        <h3 title={item.examName}>{item.examName || item.plainTitle}</h3>
        <p className="subject-text">{item.plainTitle ||'Complete Collection'}</p>
      </div>
      <button className="pyq-btn-view-ghost" onClick={() => navigate(item.url)}>
        <Eye size={16} /> View All
      </button>
    </div>
  );
}

function TestSeriesReferenceCard({ item, navigate, onShare, onWaitlist, isWishlisted }: any) {
  return (
    <div className="ts-card-figma-clone tep-ref-card">
      <div className="ts-card-top">
        <div className="ts-badge-group">
          <span className="ts-badge-code">{item.code}</span>
          <span className="ts-badge-year">{item.year}/{item.year + 1}</span>
        </div>
        <div className="ts-card-actions">
          <button className="ts-share-icon" onClick={(e) => { e.stopPropagation(); onShare(item); }}><Share2 size={16} /></button>
          <button className={`ts-wishlist-btn ${isWishlisted ?'active' :''}`} onClick={(e) => { e.stopPropagation(); onWaitlist(item); }}>
            <Heart size={16} fill={isWishlisted ?"#ef4444" :"none"} stroke={isWishlisted ?"#ef4444" :"#64748b"} />
          </button>
        </div>
      </div>
      <div className="ts-card-content" onClick={() => navigate(`/exam-topics/${item.id}`)}>
        <h3 className="ts-exam-name">{item.plainTitle}</h3>
        <p className="ts-exam-desc">{item.plainDescription ||"Updated questions based on latest exam pattern."}</p>
        <hr className="ts-card-divider" />
        <div className="ts-stats-grid">
          <div className="ts-stat-box">
            <ClipboardCheck size={20} className="stat-icon" />
            <div className="stat-labels">
              <strong>{item.statistics?.totalTestSeries || item.totalTests || (item.questions?.length > 0 ? 1 : 0)}</strong>
              <span>TESTS</span>
            </div>
          </div>
          <div className="ts-stat-box border-x">
            <BookOpen size={20} className="stat-icon" />
            <div className="stat-labels">
              <strong>{item.statistics?.totalSubjects || (item.category ? 1 : 0)}</strong>
              <span>SUBJECTS</span>
            </div>
          </div>
          <div className="ts-stat-box">
            <HelpCircle size={20} className="stat-icon" />
            <div className="stat-labels">
              <strong>{item.examPattern?.totalQuestions || item.totalQuestions ||"50+"}</strong>
              <span>QUES</span>
            </div>
          </div>
        </div>
        <button className="ts-explore-cta">Explore Test Series <ArrowRight size={18} /></button>
      </div>
    </div>
  );
}

function GenericPaperCard({ item, onView, type }: { item: any; onView: any; type:'SYLLABUS' |'PYQ' }) {
  const isSyl = type ==='SYLLABUS';
  return (
    <div className="tep-card-minimal doc-card">
      <div className="tep-card-body">
        <div className={`tep-doc-label ${isSyl ?'syl' :'pyq'}`}>{type}</div>
        <h3 className="tep-card-title">{item.plainTitle || item.examName}</h3>
        <p className="tep-card-expert">{item.category || item.year}</p>
        <div className="tep-doc-footer">
          <div className="tep-doc-stats">
            {item.totalQuestions ? <span>{item.totalQuestions} Qs</span> : <span>PDF Guide</span>}
          </div>
          <button className="tep-view-btn-sq" onClick={() => onView(item.thumbnail || item.url, item.plainTitle, type)}>
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function BlogMiniCard({ blog, navigate, isCA }: { blog: any; navigate: any; isCA?: boolean }) {
  return (
    <div className="tep-card-minimal blog-mini" onClick={() => navigate(blog.url)}>
      <div className="tep-card-thumb">
        <ImgWithFallback src={getImageUrl(blog.thumbnail)} alt={blog.plainTitle} />
      </div>
      <div className="tep-card-body">
        <div className={`tep-doc-label ${isCA ?'blue' :'teal'}`}>{isCA ?'CURRENT AFFAIR' :'BLOG POST'}</div>
        <h3 className="tep-card-title">{blog.plainTitle}</h3>
        <div className="tep-card-bottom">
          <span className="tep-card-date">
            {blog.createdAt && !isNaN(new Date(blog.createdAt).getTime()) 
              ? new Date(blog.createdAt).toLocaleDateString() 
              : new Date().toLocaleDateString()}
          </span>
          <button className="tep-btn-text" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`/view-resource/current-affairs/${blog._id}`,'_blank'); }}>Read More</button>
        </div>
      </div>
    </div>
  );
}
