import React, { useState, useEffect } from"react";
import toast from '../../utils/toast';
import { getCleanExcerpt } from "../../utils/utils";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  User,
  Calendar,
  Clock,
  Loader2,
  Youtube,
  Instagram,
  BookOpen,
  PlayCircle,
  Layers,
  ArrowRight,
  Users,
  BookMarked,
  Share2,
  FileText,
  ClipboardCheck,
  HelpCircle,
  Star,
  Download,
  ShoppingCart,
  Heart,
  Globe,
  Book as BookIcon,
  Check,
  MessageSquare
} from"lucide-react";
import url, { getImageUrl } from"../../url";
import axios from"axios";
import MyBreadcrumb from"../common/Breadcrumb";
import { fetchWishlist, addToWishlist, removeFromWishlist } from"../../utils/wishlistApi";
import { getUserRole, getStoredUser, isAuthenticated, getCartKey } from"../../utils/global_auth";
import Swal from"sweetalert2";
import StylishEmptyState from"../common/StylishEmptyState";
import ImgWithFallback from "../common/ImgWithFallback";
import"./BlogDetails.css";
import"../homes/home/PopularBooks.css";
import ShareButton from"../common/ShareButton";
import SEO from"../common/SEO";
import"../courses/CoursesArea.css";
import"../test-series/TestSeriesArea.css";
import"../books/BooksArea.css";
import"../homes/home/PopularTestSeries.css";

/*  YouTube Helper  */
const getYouTubeEmbedUrl = (link: string): string => {
  try {
    const urlObj = new URL(link);
    if (urlObj.hostname ==="youtu.be")
      return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
    if (urlObj.hostname.includes("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    }
    return link.includes("/embed/") ? link : link;
  } catch {
    return link;
  }
};

export default function BlogDetailsArea() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const formatCategory = (cat: string) => {
    if (!cat) return"Updates";
    try {
      const parsed = JSON.parse(cat);
      if (Array.isArray(parsed)) return parsed[0] ||"Updates";
    } catch (e) {}
    return cat;
  };

  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [togglingLike, setTogglingLike] = useState(false);
  const [recCourses, setRecCourses] = useState<any[]>([]);
  const [recBooks, setRecBooks] = useState<any[]>([]);
  const [recExamCats, setRecExamCats] = useState<any[]>([]);
  const [authorInfo, setAuthorInfo] = useState<any>(null);

  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<Record<string,"digital" |"physical">>({});
  const [shareStates, setShareStates] = useState<Record<string, boolean>>({});

  /*  WISHLIST INITIALIZATION  */
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        if (getUserRole() ==="STUDENT") {
          const items = await fetchWishlist();
          const ids = new Set<string>(
            items.map((i: any) => String(i.item_id))
          );
          setWishlistIds(ids);
        }
      } catch (err) { }
    };
    loadWishlist();
  }, []);

  /*  CART HELPERS  */

  const getFinalPrice = (price: number, discount?: number) =>
    !discount || discount <= 0 ? price : Math.round(price - (price * discount) / 100);

  const addBookToCart = (book: any, format:"digital" |"physical", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    } catch {
      cart = [];
    }

    const existing = cart.find(
      (i: any) => i.bookId === book._id && i.bookType === bookType
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        cartItemId: `${book._id}-${bookType}-${Date.now()}`,
        book_id: book._id,
        bookId: book._id,
        bookType,
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
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

  const toggleWishlist = async (item: any, type:"test_series" |"course" |"book", e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistLoadingId) return;

    const role = getUserRole();
    if (role ==="GUEST") {
      Swal.fire({
        title:"Login Required",
        text:"Please login as a student to use wishlist",
        icon:"info",
        showCancelButton: true,
        confirmButtonText:"Login Now",
      }).then(res => {
        if (res.isConfirmed) navigate("/student-login");
      });
      return;
    }

    if (role !=="STUDENT") {
      toast.error("Only students can use wishlist");
      return;
    }

    try {
      setWishlistLoadingId(item._id);
      if (wishlistIds.has(item._id)) {
        const res = await removeFromWishlist({ item_type: type, item_id: item._id });
        if (res?.success) {
          setWishlistIds(prev => {
            const next = new Set(prev);
            next.delete(item._id);
            return next;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        const snapshot: any = {};
        if (type ==="test_series") {
          snapshot.name = item.name;
          snapshot.code = item.code;
          snapshot.year = item.year;
        } else if (type ==="course") {
          snapshot.title = item.title;
          snapshot.price = item.price;
          snapshot.coverphoto = item.coverphoto;
        } else if (type ==="book") {
          snapshot.title = item.title;
          snapshot.author = item.author;
          snapshot.coverImage = item.coverImage;
        }
        
        const res = await addToWishlist({
          item_type: type,
          item_id: item._id,
          snapshot
        });
        if (res?.success || res?.message ==="Already in wishlist") {
          setWishlistIds(prev => new Set(prev).add(item._id));
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

  const handleShare = async (e: React.MouseEvent, title: string, urlPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${urlPath}`;
    const shareData = {
      title,
      text: `Check out ${title} on Draa!`,
      url: shareUrl,
    };
    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if ((err as Error).name !=='AbortError') {
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    }
  };

  const handleBookShare = async (e: React.MouseEvent, book: any) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/book-details/${book._id}`;
    const shareData = {
      title: `${book.title} by ${book.author}`,
      text: `Check out"${book.title}" on Draa!`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStates((prev) => ({ ...prev, [book._id]: true }));
        toast.success("Link copied to clipboard!");
        setTimeout(
          () => setShareStates((prev) => ({ ...prev, [book._id]: false })),
          2000
        );
      }
    } catch (err) {
      if ((err as Error).name !=='AbortError') {
        await navigator.clipboard.writeText(shareUrl);
        setShareStates((prev) => ({ ...prev, [book._id]: true }));
        toast.success("Link copied to clipboard!");
        setTimeout(
          () => setShareStates((prev) => ({ ...prev, [book._id]: false })),
          2000
        );
      }
    }
  };

  const formatDuration = (mins = 0) => {
    if (!mins) return'0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getTeacherProfile = (course: any) => {
    const p = course.teacher?.profile || course.teacher?.tprofile;
    if (!p) return'/assets/img/review/1.jpg';
    if (p.startsWith('http')) return p;
    return `${url}${p.startsWith('/') ?'' :'/'}${p}`;
  };

  /*  FETCH  */
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        const actualId = id?.includes("-") ? id.split("-").pop() : id;

        // 1. Fetch blog content
        const blogRes = await fetch(`${url}/course/courseContentDetails/${actualId}`);
        const blogData = await blogRes.json();
        setBlog(blogData.contents);
        setLikes(blogData.contents?.likes || []);
        setComments(blogData.contents?.comments || []);
        setAuthorInfo(blogData.authorInfo || null);
      } catch (err) {
        console.error("Blog fetch error:", err);
      } finally {
        setLoading(false);
      }

      // 2. Fetch courses (independent)
      try {
        const cRes = await fetch(`${url}/course/allCourses?limit=3`);
        const cData = await cRes.json();
        setRecCourses(cData?.data?.courses?.slice(0, 3) || []);
      } catch (err) {
        console.error("Courses fetch error:", err);
      }

      // 3. Fetch books (independent)
      try {
        const bRes = await fetch(`${url}/books/approved?limit=100`);
        const bData = await bRes.json();
        const allBooks: any[] = bData?.books || [];
        const shuffledBooks = [...allBooks].sort(() => 0.5 - Math.random()).slice(0, 4);
        setRecBooks(shuffledBooks);
        setSelectedFormats(() => {
          const map: Record<string,"digital" |"physical"> = {};
          shuffledBooks.forEach((b: any) => {
            map[b._id] = (typeof b.physicalPrice ==="number" && b.physicalPrice > 0) ?"physical" :"digital";
          });
          return map;
        });
      } catch (err) {
        console.error("Books fetch error:", err);
      }

      // 4. Fetch exam categories via axios  exactly like PopularTestSeries.tsx
      try {
        const exRes = await axios.get(`${url}/test-series/navigation/examinations`);
        if (exRes.data?.success) {
          const allExamCats: any[] = exRes.data.data.examinationCategories || [];
          console.log("[BlogDetails] examCats count:", allExamCats.length);
          const shuffled = [...allExamCats].sort(() => 0.5 - Math.random()).slice(0, 4);
          setRecExamCats(shuffled);
        }
      } catch (err) {
        console.error("Exam categories fetch error:", err);
      }
    };
    fetchPageData();
  }, [id]);

  const handleLikeToggle = async () => {
    if (togglingLike) return;
    if (!isAuthenticated()) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please log in to like this blog post.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Log In",
        cancelButtonText: "Cancel"
      }).then((res) => {
        if (res.isConfirmed) navigate("/student-login");
      });
      return;
    }

    try {
      setTogglingLike(true);
      const token = getStoredUser()?.token;
      const res = await axios.post(
        `${url}/course/content/${blog._id}/like`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (res.data?.success) {
        setLikes(res.data.likes || []);
      }
    } catch (err) {
      console.error("Like toggle failed:", err);
      toast.error("Unable to toggle like");
    } finally {
      setTogglingLike(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingComment) return;
    if (!commentText.trim()) {
      toast.warning("Comment text cannot be empty");
      return;
    }
    if (!isAuthenticated()) {
      Swal.fire({
        title: "Authentication Required",
        text: "Please log in to leave a comment.",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Log In",
        cancelButtonText: "Cancel"
      }).then((res) => {
        if (res.isConfirmed) navigate("/student-login");
      });
      return;
    }

    try {
      setSubmittingComment(true);
      const token = getStoredUser()?.token;
      const res = await axios.post(
        `${url}/course/content/${blog._id}/comment`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (res.data?.success) {
        setComments(res.data.comments || []);
        setCommentText("");
        toast.success("Comment added successfully!");
      }
    } catch (err) {
      console.error("Comment submission failed:", err);
      toast.error("Unable to post comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  /*  Author display helper  */
  const authorName = authorInfo?.name ||"Draa Editorial";
  const authorType = authorInfo?.type ||"editorial";

  if (loading)
    return (
      <div className="loader-full">
        <Loader2 className="spin-icon" size={40} />
      </div>
    );

  if (!blog) {
    return (
      <StylishEmptyState 
        title="Blog Post Not Found"
        description="The blog post you are looking for might have been removed or the link is incorrect."
        actionText="Back to Blogs"
        actionPath="/grid-blog"
        icon={BookOpen}
        showBack={true}
      />
    );
  }

  /*  RENDER  */
  return (
    <main className="blog-details-premium">
      <SEO 
        title={blog.content_subject} 
        description={blog.seo?.meta_description || getCleanExcerpt(blog.content || "", 155)}
        ogImage={blog.schema_image ? getImageUrl(blog.schema_image) : undefined}
      />
      <div className="container">

        <MyBreadcrumb 
          title={blog.content_subject} 
          subtitle={blog.seo?.meta_description || getCleanExcerpt(blog.content || "", 155) || "Expert insights to help you master the latest exam patterns."} 
          category="Blog"
          paths={[
            { pathName:"Blogs", url:"/grid-blog" },
            { pathName: blog.content_subject }
          ]}
        />

        {/*  HERO  */}
        <header className="detail-hero">
          <span className="cat-pill">
            {formatCategory(blog.content_category).toUpperCase()}
          </span>
          <h1 className="hero-title">{blog.content_subject}</h1>
          <p className="hero-desc">
            {blog.seo?.meta_description || getCleanExcerpt(blog.content || "", 155) ||
"Expert insights to help you master the latest exam patterns."}
          </p>
          <div className="hero-meta">
            <span className="m-item author-item">
              {authorInfo?.avatar ? (
                <img
                  src={getImageUrl(authorInfo.avatar)}
                  alt={authorName}
                  className="author-avatar-img"
                />
              ) : (
                <User size={15} />
              )}
              <span className={`author-name author-${authorType}`}>{authorName}</span>
              <span className="author-type-badge">{authorType ==="student" ?"Student" : authorType ==="teacher" ?"Teacher" :"Editorial"}</span>
            </span>
            <span className="m-item">
              <Calendar size={15} />
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                month:"short",
                day:"numeric",
                year:"numeric",
              })}
            </span>
            <span className="m-item">
              <Clock size={15} /> 8 min read
            </span>
            <button 
              className={`m-item blog-detail-like-badge ${likes.some((l: any) => String(l.userId) === String(getStoredUser()?.id)) ? 'liked' : ''}`}
              onClick={handleLikeToggle}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title={likes.some((l: any) => String(l.userId) === String(getStoredUser()?.id)) ? 'Unlike post' : 'Like post'}
            >
              <Heart size={15} fill={likes.some((l: any) => String(l.userId) === String(getStoredUser()?.id)) ? '#ef4444' : 'transparent'} stroke={likes.some((l: any) => String(l.userId) === String(getStoredUser()?.id)) ? '#ef4444' : 'currentColor'} />
              <span>{likes.length}</span>
            </button>
            <ShareButton 
              url={`/blog-details/${blog._id}`} 
              title={blog.content_subject}
              className="blog-detail-share"
            />
          </div>
        </header>

        {/*  HERO IMAGE  */}
        <div className="main-media-box">
          {blog.schema_image ? (
            <img
              src={getImageUrl(blog.schema_image)}
              alt={blog.content_subject}
              className="hero-img"
            />
          ) : (
            <div className="draa-copyright-stamp">
              <img
                src="/brand/draa-mark.png"
                alt="Draa"
                className="stamp-logo"
              />
              <span>By {authorName} · Draa Verified</span>
            </div>
          )}
        </div>

        {/*  ARTICLE  */}
        <div className="article-container">

          {/* Main HTML content */}
          <div
            className="article-body-html"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* YouTube embed */}
          {blog.youtube_url && (
            <div className="blog-video-embed">
              <h4>
                <Youtube size={20} color="#ff0000" /> Watch Video Lesson
              </h4>
              <div className="video-responsive">
                <iframe
                  src={getYouTubeEmbedUrl(blog.youtube_url)}
                  frameBorder="0"
                  allowFullScreen
                  title="YouTube Video"
                />
              </div>
            </div>
          )}

          {/* Instagram */}
          {blog.instagram_url && (
            <div className="social-embed-box">
              <a
                href={blog.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="insta-btn"
              >
                <Instagram size={17} /> View related post on Instagram
              </a>
            </div>
          )}

          {/* Tags */}
          {blog.seo?.meta_keywords && (
            <div className="article-tags">
              {blog.seo.meta_keywords
                .split(",")
                .map((tag: string) => (
                  <span key={tag} className="fig-tag">
                    #{tag.trim().toUpperCase()}
                  </span>
                ))}
            </div>
          )}

          {/* Likes & Comments Section */}
          <section className="blog-engagement-section">
            <div className="engagement-bar">
              <button 
                className={`like-action-btn ${likes.some((l: any) => String(l.userId) === String(getStoredUser()?.id)) ? 'liked' : ''}`}
                onClick={handleLikeToggle}
                disabled={togglingLike}
                title={likes.some((l: any) => String(l.userId) === String(getStoredUser()?.id)) ? 'Unlike' : 'Like'}
              >
                <Heart size={20} className="heart-icon" fill={likes.some((l: any) => String(l.userId) === String(getStoredUser()?.id)) ? '#ef4444' : 'transparent'} />
                <span>{likes.length} {likes.length === 1 ? 'Like' : 'Likes'}</span>
              </button>
              
              <div className="comment-count-badge">
                <MessageSquare size={20} />
                <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
              </div>
            </div>

            <div className="comment-section-box">
              <h3 className="section-title">Discussion ({comments.length})</h3>
              
              {/* Comment Form */}
              {isAuthenticated() ? (
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <div className="form-avatar-col">
                    <div className="user-avatar-placeholder">
                      {getStoredUser()?.name ? getStoredUser()?.name.charAt(0).toUpperCase() : <User size={16} />}
                    </div>
                  </div>
                  <div className="form-input-col">
                    <textarea
                      placeholder="Share your thoughts, ask a question, or leave feedback..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      maxLength={1000}
                      required
                      rows={3}
                      className="comment-textarea"
                    />
                    <button type="submit" className="submit-comment-btn" disabled={submittingComment}>
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="guest-comment-prompt">
                  <p>You must be signed in to leave a comment and interact with this post.</p>
                  <button className="signin-prompt-btn" type="button" onClick={() => {
                    Swal.fire({
                      title: "Authentication Required",
                      text: "Please sign in to comment or like posts.",
                      icon: "info",
                      showCancelButton: true,
                      confirmButtonText: "Sign In as Student",
                      cancelButtonText: "Cancel"
                    }).then((res) => {
                      if (res.isConfirmed) navigate("/student-login");
                    });
                  }}>
                    Sign In to Comment
                  </button>
                </div>
              )}

              {/* Comments List */}
              <div className="comments-list">
                {comments.length > 0 ? (
                  comments.map((cmt: any, idx: number) => (
                    <div key={cmt._id || idx} className="comment-item">
                      <div className="comment-avatar">
                        {cmt.userAvatar ? (
                          <img src={getImageUrl(cmt.userAvatar)} alt={cmt.userName} className="comment-avatar-img" />
                        ) : (
                          <div className="comment-avatar-placeholder">
                            {cmt.userName ? cmt.userName.charAt(0).toUpperCase() : '?'}
                          </div>
                        )}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="commenter-name">{cmt.userName}</span>
                          <span className={`role-badge role-${cmt.userRole || 'student'}`}>
                            {(cmt.userRole || 'student').toUpperCase()}
                          </span>
                          <span className="comment-time">
                            {new Date(cmt.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                        <p className="comment-text">{cmt.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-comments-yet">
                    <p>No comments yet. Be the first to start the discussion!</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <hr className="f-divider" />

        {/*  FREE RESOURCES CTA  */}
        <div className="bd-cta-banner">
          <div className="bd-cta-inner">
            <div className="bd-cta-icon"><FileText size={24} /></div>
            <div className="bd-cta-text">
              <h3>Get Free Study Material</h3>
              <p>Access PYQs, Current Affairs, Syllabus & more  absolutely free</p>
            </div>
          </div>
          <Link to="/free-resources" className="bd-cta-btn">
            Explore Free Resources <ArrowRight size={15} />
          </Link>
        </div>

        <hr className="f-divider" />

        {/*  EXAM CATEGORIES  using PopularTestSeries exact markup  */}
        {recExamCats.length > 0 && (
          <section className="rec-section" style={{ marginTop:'20px' }}>
            <div className="ed-section-header">
              <div className="ed-section-icon"><ClipboardCheck size={18} /></div>
              <h2 className="ed-section-title">Practice Tests</h2>
              <span className="ed-section-badge">{recExamCats.length}</span>
            </div>
            <div className="ts-grid" style={{ gridTemplateColumns:'repeat(4, 1fr)', marginBottom: 0 }}>
              {recExamCats.map((exam: any) => {
                const isWishlisted = wishlistIds.has(exam._id);
                const isCopied = shareStates[exam._id];
                const isProcessing = wishlistLoadingId === exam._id;
                return (
                  <div key={exam._id} className="ts-card-figma" onClick={() => navigate(`/exam-topics/${exam._id}`)} style={{ cursor:'pointer' }}>
                    {/* Top row: badges + action icons */}
                    <div className="ts-card-top">
                      <div className="ts-badges">
                        <span className="ts-badge-code">{exam.code}</span>
                        <span className="ts-badge-year">{exam.year}/{exam.year + 1}</span>
                      </div>
                      <div className="ts-card-actions">
                        <button
                          className="ts-share-btn"
                          onClick={(e) => { e.stopPropagation(); handleShare(e, `Practice ${exam.name}`, `/exam-topics/${exam._id}`); }}
                          disabled={isCopied}
                          title="Share"
                        >
                          {isCopied ? <Check size={15} /> : <Share2 size={15} />}
                        </button>
                        <button
                          className={`ts-wishlist-btn${isWishlisted ?' active' :''}${isProcessing ?' loading' :''}`}
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(exam,'test_series', e); }}
                          disabled={isProcessing}
                          title={isWishlisted ?'Remove from wishlist' :'Add to wishlist'}
                        >
                          <Heart size={16} stroke={isWishlisted ?'#ef4444' :'#9ca3af'} fill={isWishlisted ?'#ef4444' :'transparent'} />
                        </button>
                      </div>
                    </div>

                    {/* Title + description */}
                    <div className="ts-card-body">
                      <h3 className="ts-card-title" title={exam.name}>{exam.name}</h3>
                      <p className="ts-card-desc">
                        {exam.description ||'Updated questions based on latest exam pattern & negative marking'}
                      </p>
                    </div>

                    <hr className="ts-divider" />

                    {/* Stats row */}
                    <div className="ts-stats-row">
                      <div className="ts-stat-item">
                        <ClipboardCheck size={22} />
                        <strong>{exam.statistics?.totalTestSeries || 25} Mock</strong>
                        <span>TESTS</span>
                      </div>
                      <div className="ts-stat-item border-x">
                        <BookOpen size={22} />
                        <strong>{exam.statistics?.totalSubjects || 12} Subject</strong>
                        <span>WISE</span>
                      </div>
                      <div className="ts-stat-item">
                        <HelpCircle size={22} />
                        <strong>{exam.examPattern?.totalQuestions ||'3750+'}</strong>
                        <span>QUESTIONS</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to={`/exam-topics/${exam._id}`} className="ts-explore-link" onClick={(e) => e.stopPropagation()}>
                      Explore Test Series <ArrowRight size={16} />
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/*  COURSES (original site design)  */}
        {recCourses.length > 0 && (
          <section className="rec-section" style={{ marginTop:'40px' }}>
            <div className="ed-section-header">
              <div className="ed-section-icon"><PlayCircle size={18} /></div>
              <h2 className="ed-section-title">Top Courses</h2>
              <span className="ed-section-badge">{recCourses.length}</span>
            </div>
            <div className="courses-grid-new" style={{ padding:'10px 0' }}>
              {recCourses.map(course => {
                const isWishlisted = wishlistIds.has(course._id);
                const levelClass = course.skill_level?.toLowerCase() ||'advanced';
                const displayActualPrice = course.actual_price || course.price || 3400;
                const displayDiscountPrice = course.discounted_price || course.price || 1999;
                const calcDiscount = course.discount_percentage || Math.round(((displayActualPrice - displayDiscountPrice) / displayActualPrice) * 100);

                return (
                  <div key={course._id} className="course-card-new" onClick={() => navigate(`/course-details/${course._id}`)} style={{ cursor:'pointer' }}>
                    <div className="card-image-new">
                      <img
                        src={getImageUrl(course.coverphoto || "")}
                        alt={course.title}
                      />
                      <div className={`level-badge-new ${levelClass}`}>
                        {course.skill_level ||'ADVANCED'}
                      </div>
                      <div className="card-actions-new">
                        <button className="share-btn-new" onClick={e => handleShare(e, course.title, `/course-details/${course._id}`)} aria-label="Share">
                          <Share2 size={14} />
                        </button>
                        <button className={`wishlist-btn-new${isWishlisted ?' active' :''}`} onClick={e => toggleWishlist(course,"course", e)} aria-label="Wishlist">
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
                          <div className="syllabus-badge-new" onClick={(e) => { e.stopPropagation(); window.open(`${url}/${course.syllabus}`); }}>
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
                        <img src={getTeacherProfile(course)} alt={course.teacher?.name ||'Mentor'} onError={e => { (e.target as HTMLImageElement).src ='/assets/img/review/1.jpg'; }} />
                        <div className="instructor-info-new">
                          <strong>{course.teacher?.name || course.teacher?.tname ||'Expert Mentor'}</strong>
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
                        <button className="enroll-btn-new">Enroll Now</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/*  BOOKS (original site design)  */}
        {recBooks.length > 0 && (
          <section className="rec-section" style={{ marginTop:'40px' }}>
            <div className="ed-section-header">
              <div className="ed-section-icon"><BookOpen size={18} /></div>
              <h2 className="ed-section-title">Handpicked Books</h2>
              <span className="ed-section-badge">{recBooks.length}</span>
            </div>
            <div className="rec-grid-4" style={{ padding:'10px 0' }}>
              {recBooks.map(book => {
                const hasDigital = typeof book.digitalPrice ==='number' && book.digitalPrice > 0;
                const hasPhysical = typeof book.physicalPrice ==='number' && book.physicalPrice > 0;
                const wishlisted = wishlistIds.has(book._id);
                const isCopied = shareStates[book._id];
                const isProcessing = wishlistLoadingId === book._id;
                
                return (
                  <div key={book._id} className="pb-card" onClick={() => navigate(`/book-details/${book._id}`)} style={{ cursor:'pointer' }}>
                    <div className="pb-card-hero">
                      {book.isPopular && <span className="pb-badge best-seller">BEST SELLER</span>}
                      {book.isFeatured && !book.isPopular && <span className="pb-badge new-edition">NEW EDITION</span>}

                      <div className="pb-card-actions">
                        <button className="pb-share-btn" onClick={(e) => handleBookShare(e, book)} disabled={isCopied}>
                          {isCopied ? <Check size={14} /> : <Share2 size={14} />}
                        </button>
                        <button
                          className={`pb-wishlist-btn${wishlisted ?" active" :""}`}
                          onClick={(e) => toggleWishlist(book,"book", e)}
                          disabled={isProcessing}
                        >
                          <Heart size={14} stroke={wishlisted ?"#ef4444" :"#9ca3af"} fill={wishlisted ?"#ef4444" :"none"} />
                        </button>
                      </div>

                      <div className="pb-book-image-container">
                        <ImgWithFallback
                          src={book.coverImage ? getImageUrl(book.coverImage) : null}
                          alt={book.title}
                          className="pb-cover-img"
                        />
                      </div>
                    </div>

                    <div className="pb-card-body">
                      <div className="pb-meta-top">
                        <span className="pb-cat-tag">{book.category?.name || book.category ||"General"}</span>
                        <div className="pb-lang-wrapper"><Globe size={12} /><span>{book.language ||'English'}</span></div>
                      </div>
                      <h3 className="pb-book-title">{book.title}</h3>
                      <p className="pb-author">Author: {book.author}</p>

                      <div className="pb-sticky-footer" style={{ marginTop:'auto' }}>
                        <div className="pb-pricing-row">
                          <div
                            className={`pb-price-box ${selectedFormats[book._id] ==="digital" ?"active" :""} ${!hasDigital ?"disabled" :""}`}
                            onClick={(e) => { e.stopPropagation(); hasDigital && setSelectedFormats(p => ({ ...p, [book._id]:"digital" })) }}
                            style={{ cursor: hasDigital ?'pointer' :'not-allowed' }}
                          >
                            <div className="pb-box-label"><FileText size={12} /> Ebook</div>
                            <div className="pb-box-pricing">
                              <span className="pb-final">{getFinalPrice(book.digitalPrice || 0, book.digitalDiscountPercentage)}</span>
                              {book.digitalDiscountPercentage ? <span className="pb-old">{book.digitalPrice}</span> : null}
                            </div>
                            {book.digitalDiscountPercentage ? <div className="pb-discount-badge">{book.digitalDiscountPercentage}% OFF</div> : null}
                          </div>

                          <div
                            className={`pb-price-box ${selectedFormats[book._id] ==="physical" ?"active" :""} ${!hasPhysical ?"disabled" :""}`}
                            onClick={(e) => { e.stopPropagation(); hasPhysical && setSelectedFormats(p => ({ ...p, [book._id]:"physical" })) }}
                            style={{ cursor: hasPhysical ?'pointer' :'not-allowed' }}
                          >
                            <div className="pb-box-label"><BookIcon size={12} /> Paperback</div>
                            <div className="pb-box-pricing">
                              <span className="pb-final">{getFinalPrice(book.physicalPrice || 0, book.physicalDiscountPercentage)}</span>
                              {book.physicalDiscountPercentage ? <span className="pb-old">{book.physicalPrice}</span> : null}
                            </div>
                            {book.physicalDiscountPercentage ? <div className="pb-discount-badge">{book.physicalDiscountPercentage}% OFF</div> : null}
                          </div>
                        </div>

                        <div className="pb-buy-row">
                          <button className="pb-buy-now-btn" onClick={(e) => { e.stopPropagation(); navigate(`/book-details/${book._id}`); }}>Buy Now</button>
                          <button
                            className="pb-add-btn"
                            disabled={!hasPhysical || selectedFormats[book._id] !=="physical"}
                            onClick={(e) => {
                              if (!book.physicalPrice) {
                                toast.warning('Paperback not available for this book');
                                return;
                              }
                              addBookToCart(book,'physical', e);
                            }}
                          >
                            Add <ShoppingCart size={14} />
                          </button>
                        </div>
                        <div className="pb-details-link" onClick={(e) => { e.stopPropagation(); navigate(`/book-details/${book._id}`); }} style={{ cursor:'pointer', textAlign:'center' }}>View Details</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}