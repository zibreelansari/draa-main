import React, { useEffect, useState } from"react";
import toast from '../../../utils/toast';
import { useNavigate, useParams, Link } from"react-router-dom";
import axios from"axios";
import {
  Calendar, Clock, Users, Globe, Award, FileText,
  CheckCircle, TrendingUp, BookOpen, PlayCircle, ArrowRight,
  Download, ChevronRight, Target, BarChart2, Book, Layers,
  Share2, Bell, BookMarked, Hash, ExternalLink, Heart, Star,
  ClipboardCheck, HelpCircle, CheckCheck, ShoppingCart, Search
} from"lucide-react";
import { motion, AnimatePresence } from'framer-motion';
import url, { getImageUrl } from"../../../url";
import MyBreadcrumb from"../../common/Breadcrumb";
import"./ExamDetails.css";
import"../../courses/CoursesArea.css";
import"../../books/BooksArea.css";
import"../../test-series/TestSeriesArea.css";
import"../../grid-blog/GridBlogArea.css";
import { fetchWishlist, addToWishlist, removeFromWishlist } from"../../../utils/wishlistApi";
import { getUserRole, getStoredUser, getCartKey } from"../../../utils/global_auth";
import { Modal } from"antd";
import {
  IsoHeroGraphic, IsoFeatureGraphic, IsoCalendarGraphic, IsoAccessGraphic,
  IsoFAQGraphic, IsoCertificateGraphic, IconTrophy, IconStar
} from"./ExamGraphics";
import { ChevronDown, Play, Check, Mail, Phone, Lock, User, KeyRound, Loader2, ArrowLeft, Eye } from"lucide-react";
import { GoogleLogin } from"@react-oauth/google";
import { googleClientId } from"../../../url";
import ToppersSection from"./ToppersSection";
import PYQPreviewModal from"../../pyqs/PYQPreviewModal";
import StylishEmptyState from"../../common/StylishEmptyState";
import ShareButton from"../../common/ShareButton";
import SEO from"../../common/SEO";
import { getCleanExcerpt } from "../../../utils/utils";
import ImgWithFallback from "../../common/ImgWithFallback";

/* ================= HELPERS ================= */

const dayjs = (d?: string) => {
  if (!d) return null;
  const date = new Date(d);
  return {
    format: (fmt: string) => {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const mm = date.toLocaleString("en-US", { month:"short" });
      const dd = String(date.getDate()).padStart(2,"0");
      const yyyy = date.getFullYear();
      if (fmt ==="DD MMM YYYY") return `${dd} ${mm} ${yyyy}`;
      if (fmt ==="MMM YYYY") return `${mm} ${yyyy}`;
      return `${dd} ${mm} ${yyyy}`;
    },
    isBefore: (other: any) => date < (other?._d || new Date(other)),
  };
};

const GRADIENTS = [
"linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)",
"linear-gradient(135deg, #064e3b 0%, #065f46 50%, #059669 100%)",
"linear-gradient(135deg, #7c2d12 0%, #9a3412 50%, #ea580c 100%)",
"linear-gradient(135deg, #4c1d95 0%, #66735b 50%, #66735b 100%)",
"linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #bd7b20 100%)",
];

/* ================= SECTION WRAPPER ================= */
const Section = ({ id, title, icon, children, count }: any) => (
  <section id={id} className="ed-section">
    <div className="ed-section-header">
      <div className="ed-section-icon">{icon}</div>
      <h2 className="ed-section-title">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="ed-section-badge">{count}</span>
      )}
    </div>
    {children}
  </section>
);

/* ================= DATE CARD ================= */
const DateCard = ({ label, date, highlight }: any) => {
  const formatted = date ? dayjs(date).format("DD MMM YYYY") :"TBA";
  return (
    <div className={`ed-date-card ${highlight ?"ed-highlight" :""}`}>
      <div className="ed-date-inner">
        <span className="ed-date-label">{label}</span>
        <span className="ed-date-value">{formatted}</span>
      </div>
      <div className="ed-date-bar" />
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */
export default function ExamDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState<any>(null);

  const [linkedTestCats, setLinkedTestCats] = useState<any[]>([]);
  const [linkedCourses, setLinkedCourses] = useState<any[]>([]);
  const [linkedBooks, setLinkedBooks] = useState<any[]>([]);
  const [linkedContents, setLinkedContents] = useState<any[]>([]);
  const [relatedExams, setRelatedExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  // Wishlist & Share state
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoadingId, setWishlistLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);
  const [pdfConfig, setPdfConfig] = useState<{url: string, title: string}>({url:'', title:''});

  // Auth States
  const [authStep, setAuthStep] = useState<"register" |"verify">("register");
  const [authLoading, setAuthLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [regData, setRegData] = useState({ name:"", email:"", phn:"", password:"" });

  const formatCategory = (cat: string) => {
    if (!cat) return"Updates";
    try {
      const parsed = JSON.parse(cat);
      if (Array.isArray(parsed)) return parsed[0] ||"Updates";
    } catch (e) {}
    return cat;
  };


  useEffect(() => {
    if (slug) fetchExam();
  }, [slug]);

  useEffect(() => {
    const loadWishlist = async () => {
      if (getUserRole() !=="STUDENT") return;
      try {
        const items = await fetchWishlist();
        const ids = new Set<string>(
          items.map((i: any) => String(i.item_id))
        );
        setWishlistIds(ids);
      } catch { }
    };
    loadWishlist();
  }, []);



  const addBookToCart = (book: any, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const cartKey = getCartKey();

    // Determine which version to add to cart (prefer paperback)
    const hasPhysical = typeof book.physicalPrice ==='number' && book.physicalPrice > 0;
    const hasDigital = typeof book.digitalPrice ==='number' && book.digitalPrice > 0;

    // If it has physical, add physical, else add digital
    const isEbook = !hasPhysical && hasDigital;

    const bookType = isEbook ?"pdftype" :"paperback";
    const basePrice = isEbook ? book.digitalPrice : book.physicalPrice;
    const discount = isEbook ? book.digitalDiscountPercentage : book.physicalDiscountPercentage;

    if (!basePrice || basePrice <= 0) {
      toast.error("Invalid book price");
      return;
    }

    const finalPrice = Math.round(basePrice - (basePrice * (discount || 0)) / 100);

    let cart: any[] = [];
    try { cart = JSON.parse(localStorage.getItem(cartKey) ||"[]"); } catch { cart = []; }

    const existing = cart.find(i => i.bookId === book._id && i.bookType === bookType);
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
        addedAt: new Date().toISOString()
      });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));
    toast.success("Added to cart");
  };

  const toggleWishlist = async (id: string, type: string, snapshot: any, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (wishlistLoadingId) return;
    const role = getUserRole();
    if (role ==="GUEST") {
      Modal.confirm({ title:"Login Required", content:"Please login as a student to use wishlist", okText:"Login", onOk: () => navigate("/student-login") });
      return;
    }
    if (role !=="STUDENT") { toast.error("Only students can use wishlist"); return; }
    try {
      setWishlistLoadingId(id);
      if (wishlistIds.has(id)) {
        const res = await removeFromWishlist({ item_type: type, item_id: id });
        if (res?.success) {
          setWishlistIds(prev => { const n = new Set(prev); n.delete(id); return n; });
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist({ item_type: type, item_id: id, snapshot });
        if (res?.success || res?.message ==="Already in wishlist") {
          setWishlistIds(prev => new Set(prev).add(id));
          toast.success(`Added to wishlist `);
        }
      }
    } catch (err) { toast.error("Wishlist action failed"); }
    finally { setWishlistLoadingId(null); }
  };

  /* ================= AUTH HANDLERS ================= */
  const handleGoogleAuth = async (credential: string) => {
    try {
      toast.loading({ content:"Authenticating...", key:"google-auth" });
      const { data } = await axios.post(`${url}/users/google-auth`, { credential });
      if (data.success) {
        localStorage.setItem("edudocs", JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          token: data.user.token,
          role: "student",
          createdAt: data.user.createdAt
        }));
        toast.success({ content:"Login Successful!", key:"google-auth" });
        window.location.reload(); // Refresh to update auth state
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      toast.error({ content: err.message ||"Google Authentication failed", key:"google-auth" });
    }
  };

  const onRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    if (regData.password.length < 6) return toast.error("Password must be at least 6 characters");

    try {
      setAuthLoading(true);
      const res = await axios.post(`${url}/users/send-registration-otp`, regData);
      if (res.data.success) {
        toast.success("Verification code sent to your email!");
        setAuthStep("verify");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ||"Error sending OTP");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authLoading) return;
    if (otp.length !== 6) return toast.error("Enter valid 6-digit code");

    try {
      setAuthLoading(true);
      const res = await axios.post(`${url}/users/verify-registration-otp`, {
        email: regData.email,
        otp
      });
      if (res.data.success) {
        toast.success("Registration Successful! Redirecting to login...");
        navigate("/student-login");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ||"Verification failed");
    } finally {
      setAuthLoading(false);
    }
  };


  const fetchExam = async () => {
    try {
      const res = await axios.get(`${url}/exams/slug/${slug}`);
      const data = res.data.data;
      setExam(data);
      if (!data?._id) return;

      const promises: Promise<any>[] = [];

      if (data.testSeries?.length > 0) {
        promises.push(
          axios.get(`${url}/test-series/navigation/examinations?limit=100`).then(r => {
            const all = r.data.data?.examinationCategories || [];
            return all.filter((c: any) => data.testSeries.includes(c._id));
          }).catch(() => [])
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      if (data.courses?.length > 0) {
        promises.push(
          axios.get(`${url}/course/admin/courses/?limit=100`).then(r => {
            const all = r.data.data?.courses || [];
            return all.filter((c: any) => data.courses.some((x: any) => (x?._id || x) === c._id));
          }).catch(() => [])
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      if (data.books?.length > 0) {
        promises.push(
          axios.get(`${url}/books/approved?limit=100`).then(r => {
            const all = r.data.books || [];
            return all.filter((b: any) => data.books.some((x: any) => (x?._id || x) === b._id));
          }).catch(() => [])
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      if (data.courseContents?.length > 0) {
        promises.push(
          axios.get(`${url}/course/allCourseContent?limit=200`).then(r => {
            const all = r.data.result || [];
            return all.filter((c: any) => data.courseContents.some((x: any) => (x?._id || x) === c._id));
          }).catch(() => [])
        );
      } else {
        promises.push(Promise.resolve([]));
      }

      const [testCats, courses, books, contents] = await Promise.all(promises);
      setLinkedTestCats(testCats);
      setLinkedCourses(courses);
      setLinkedBooks(books);
      setLinkedContents(contents);

      // Fetch related exams from same category
      try {
        const catId = typeof data.categoryId ==='object' ? data.categoryId._id : data.categoryId;
        if (catId) {
          const relRes = await axios.get(`${url}/exams/all`, { params: { status:'ACTIVE', limit: 20 } });
          const allExams = relRes.data.exams || [];
          const related = allExams.filter((e: any) => {
            const eCatId = typeof e.categoryId ==='object' ? e.categoryId._id : e.categoryId;
            return eCatId === catId && e._id !== data._id;
          }).slice(0, 12);
          setRelatedExams(related);
        }
      } catch { }
    } catch (err) {
      console.error("Failed to load exam");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/exams/${slug}`;
    if (navigator.share) {
      await navigator.share({ title: exam?.name, text: exam?.shortDescription, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
    }
  };

  if (loading) {
    return (
      <div className="ed-shell">
        <div className="ed-skeleton">
          <div className="ed-skel-hero" />
          <div className="ed-skel-body">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="ed-skel-section">
                <div className="ed-skel-line ed-skel-wide" />
                <div className="ed-skel-line" />
                <div className="ed-skel-line ed-skel-short" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <StylishEmptyState 
        title="Exam Not Found"
        description="We couldn't find the exam you're looking for. It might have been moved, renamed, or is currently being updated by our team."
        actionText="Browse All Exams"
        actionPath="/exams-page"
      />
    );
  }

  const dates = exam.importantDates || {};
  const primaryPhase = exam.phases?.[0] || {};
  const gradient = GRADIENTS[0];
  const examDate = dates.examDate ? dayjs(dates.examDate).format("MMM YYYY") :"TBA";
  const appEnd = dates.applicationEnd ? dayjs(dates.applicationEnd) : null;
  const isOpen = appEnd ? !appEnd.isBefore(new Date()) : false;

  // Sidebar nav items
  const navItems = [
    { id:"overview", label:"Overview" },
    { id:"why_enroll", label:"Why Enroll?" },
    { id:"features", label:"Features" },
    { id:"dates", label:"Important Dates" },
    { id:"eligibility", label:"Eligibility" },
    { id:"pattern", label:"Exam Pattern" },
    { id:"vacancies", label:"Vacancies" },
    { id:"cutoffs", label:"Cutoffs", show: exam.cutoffs?.length > 0 },
    { id:"how_access", label:"How to Access", show: linkedCourses.length > 0 || linkedTestCats.length > 0 },
    { id:"courses", label:"Courses", show: linkedCourses.length > 0 },
    { id:"books", label:"Books", show: linkedBooks.length > 0 },
    { id:"tests", label:"Test Series", show: linkedTestCats.length > 0 },
    { id:"contents", label:"Study Material", show: linkedContents.length > 0 },
    { id:"faqs", label:"FAQs" },
  ].filter((i: any) => i.show !== false);

  return (
    <div className="ed-shell">
      <SEO 
        title={exam.name} 
        description={exam.shortDescription || `Prepare for ${exam.name} with expert study material, mock tests, and live classes.`}
        ogImage={exam.examImage ? getImageUrl(exam.examImage) : undefined}
      />

      {/*  Breadcrumb  */}
      <MyBreadcrumb
        title={exam.name}
        subtitle={exam.shortDescription || `Prepare for ${exam.name} with expert study material, mock tests, and live classes.`}
        category="Exams"
        showSearch={false}
        paths={[
          { pathName:"Exams", url:"/exams-page" },
          { pathName: exam.name }
        ]}
        stats={[
          { value: exam.phases?.length ? `${exam.phases.length}` :"2+", label:"Exam Phases" },
          { value: exam.vacancies?.[0]?.total ? `${exam.vacancies[0].total.toLocaleString()}+` :"1000+", label:"Vacancies" },
          { value:"100%", label:"Free Info" }
        ]}
      />

      {/*  Premium Hero Banner  */}
      <div className="ed-hero">
        <div className="container ed-hero-inner">

          <div className="ed-hero-content">
            <h1 className="ed-hero-title">{exam.name} Online Coaching Classes</h1>
            <p className="ed-hero-desc">Crack {exam.name} {new Date().getFullYear()} with India's Leading Educators. {exam.shortDescription ||"Comprehensive coverage of all topics with expert guidance."}</p>

            <div className="ed-hero-bullets">
              {[
"Complete Syllabus Coverage",
"Live Classes with Doubt Clearing",
"Mock Tests for Practice",
"Live Practice Sessions",
"Short Cuts and Tips"
              ].map((text, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="ed-hero-bullet"
                >
                  <div className="ed-check-icon"><Check size={14} strokeWidth={3} /></div>
                  <span>{text}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="ed-hero-actions">
              <ShareButton 
                url={`/exams/${slug}`} 
                title={exam.name}
                className="ed-hero-share"
              />
            </div>
          </div>

          <div className="ed-hero-form-col" style={{ padding:"18px" }}>
            {getUserRole() ==="GUEST" ? (
              <div className="ed-reg-card">
                {authStep ==="register" ? (
                  <>
                    <h3 className="ed-card-title">Create Free Account</h3>
                    <div className="ed-google-wrap">
                      <GoogleLogin
                        onSuccess={(res) => res.credential && handleGoogleAuth(res.credential)}
                        onError={() => toast.error("Google Login Failed")}
                        theme="outline"
                        width="100%"
                        text="signup_with"
                      />
                    </div>
                    <div className="ed-divider"><span>Or</span></div>
                    <form onSubmit={handleSendOTP} className="ed-hero-reg-form">
                      <div className="ed-input-box">
                        <User size={16} />
                        <input type="text" name="name" placeholder="Full Name" required value={regData.name} onChange={onRegChange} />
                      </div>
                      <div className="ed-input-box">
                        <Mail size={16} />
                        <input type="email" name="email" placeholder="Email Address" required value={regData.email} onChange={onRegChange} />
                      </div>
                      <div className="ed-input-box">
                        <Phone size={16} />
                        <input type="tel" name="phn" placeholder="Mobile Number" required value={regData.phn} onChange={onRegChange} />
                      </div>
                      <div className="ed-input-box">
                        <Lock size={16} />
                        <input type="password" name="password" placeholder="Create Password" required value={regData.password} onChange={onRegChange} />
                      </div>
                      <button className="ed-btn-register" type="submit" disabled={authLoading}>
                        {authLoading ? <Loader2 className="spinner" size={18} /> :"Register Now"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="ed-otp-step">
                    <button className="ed-back-btn" onClick={() => setAuthStep("register")}>
                      <ArrowLeft size={16} /> Back
                    </button>
                    <h3 className="ed-card-title">Verify Email</h3>
                    <p className="ed-card-sub">Six-digit code sent to {regData.email}</p>
                    <form onSubmit={handleVerifyOTP} className="ed-hero-reg-form">
                      <div className="ed-input-box">
                        <KeyRound size={16} />
                        <input
                          type="text"
                          placeholder="6-Digit OTP"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g,"").slice(0, 6))}
                        />
                      </div>
                      <button className="ed-btn-register" type="submit" disabled={authLoading}>
                        {authLoading ? <Loader2 className="spinner" size={18} /> :"Verify & Start"}
                      </button>
                    </form>
                  </div>
                )}
                <p className="ed-form-footer">Already a user? <Link to="/student-login">Login</Link></p>
              </div>
            ) : (
              <div className="ed-reg-card ed-auth-card">
                <h3>Your Preparation Starts Here</h3>
                <p>Welcome back! Attempt the free mock test to benchmark your preparation.</p>
                <button
                  className="ed-btn-register"
                  onClick={() => linkedTestCats?.[0] ? navigate("/free-resources") : toast.info("Mock tests not available for this exam yet")}
                >
                  Free Resources
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/*  Full-Width Content  */}
      <div className="ed-content-wrap container">
        <main className="ed-content">

          {/*  Overview  */}
          <section id="overview" className="ed-section" style={{ marginTop:"12px" }}>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="ed-ob-section-title"
            >
              Overview
            </motion.h2>
            {exam.description && (
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="ed-ob-section-sub"
              >
                {exam.description}
              </motion.p>
            )}
            <div className="ed-info-grid">
              {[
                { show: !!exam.examLevel, icon: <Globe size={20} />, label:"Exam Level", val: exam.examLevel },
                { show: !!exam.mode, icon: <Monitor size={20} />, label:"Mode", val: exam.mode },
                { show: !!exam.frequency, icon: <Calendar size={20} />, label:"Frequency", val: exam.frequency },
                { show: !!exam.conductingBody, icon: <Award size={20} />, label:"Conducted By", val: exam.conductingBody },
              ].filter(item => item.show).map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * idx }}
                  className="ed-info-card"
                >
                  <div className="ed-info-icon">{item.icon}</div>
                  <div>
                    <span className="ed-info-lbl">{item.label}</span>
                    <span className="ed-info-val">{item.val}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* 
              ZIGZAG SECTIONS
              Row 1: Stats LEFT  | Girl SVG RIGHT
              Row 2: Girl SVG LEFT | Features RIGHT
           */}

          {/*  Row 1: Why Enroll  stats LEFT, illustration RIGHT  */}
          <section id="why_enroll" className="ed-section ed-zz-section">
            <div className="ed-zz-row">
              {/* LEFT: text + stat cards */}
              <div className="ed-zz-content">
                <h2 className="ed-ob-section-title">Why Enroll for {exam.name}?</h2>
                <p className="ed-ob-section-sub">Thousands of students have used Draa to land their dream job. Most toppers use our platform to prepare for their exam.</p>
                <div className="ed-why-stat-grid">
                  <div className="ed-why-stat-card">
                    <div className="ed-why-stat-icon">
                      <svg viewBox="0 0 80 80" width="56" height="56">
                        <rect x="10" y="45" width="14" height="25" rx="3" fill="#bd7b20" opacity="0.7" />
                        <rect x="30" y="30" width="14" height="40" rx="3" fill="#bd7b20" />
                        <rect x="50" y="38" width="14" height="32" rx="3" fill="#bd7b20" opacity="0.8" />
                        <polygon points="30,12 34,22 45,22 36,29 40,40 30,33 20,40 24,29 15,22 26,22" fill="#f59e0b" />
                        <polygon points="47,20 49,26 56,26 51,30 53,36 47,32 41,36 43,30 38,26 45,26" fill="#f59e0b" opacity="0.7" />
                        <polygon points="18,22 20,28 27,28 22,32 24,38 18,34 12,38 14,32 9,28 16,28" fill="#f59e0b" opacity="0.7" />
                      </svg>
                    </div>
                    <h3 className="ed-why-stat-num">60,000+</h3>
                    <p className="ed-why-stat-lbl">Selections</p>
                    <p className="ed-why-stat-desc">Thousands of students landed their dream job</p>
                  </div>
                  <div className="ed-why-stat-card">
                    <div className="ed-why-stat-icon">
                      <svg viewBox="0 0 80 80" width="56" height="56">
                        <rect x="8" y="15" width="64" height="42" rx="5" fill="#eee3d0" />
                        <rect x="13" y="20" width="54" height="32" rx="3" fill="#bd7b20" />
                        <circle cx="25" cy="34" r="7" fill="white" opacity="0.9" />
                        <circle cx="40" cy="34" r="7" fill="white" opacity="0.9" />
                        <circle cx="55" cy="34" r="7" fill="white" opacity="0.9" />
                        <rect x="30" y="57" width="20" height="4" rx="2" fill="#94a3b8" />
                        <rect x="20" y="61" width="40" height="3" rx="2" fill="#cbd5e1" />
                      </svg>
                    </div>
                    <h3 className="ed-why-stat-num">AIR 1</h3>
                    <p className="ed-why-stat-lbl">For Major Exams</p>
                    <p className="ed-why-stat-desc">Most toppers use Draa to prepare</p>
                  </div>
                  <div className="ed-why-stat-card">
                    <div className="ed-why-stat-icon">
                      <svg viewBox="0 0 80 80" width="56" height="56">
                        <circle cx="40" cy="38" r="26" fill="none" stroke="#eee3d0" strokeWidth="8" />
                        <circle cx="40" cy="38" r="26" fill="none" stroke="#bd7b20" strokeWidth="8" strokeDasharray="32 164" strokeLinecap="round" transform="rotate(-90 40 38)" />
                        <text x="40" y="43" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e3a8a">9%</text>
                      </svg>
                    </div>
                    <h3 className="ed-why-stat-num">9%</h3>
                    <p className="ed-why-stat-lbl">Selection Rate</p>
                    <p className="ed-why-stat-desc">Highest selection ratio in the Country</p>
                  </div>
                </div>
              </div>
              {/* RIGHT: illustration */}
              <div className="ed-zz-visual">
                <img src="https://www.oliveboard.in/lp/ocimg/girl.svg" alt="Student" className="ed-zz-img" />
              </div>
            </div>
          </section>

          {/*  Toppers Section (Rankers)  */}
          {/* <ToppersSection /> */}

          {/*  Row 2: Why Choose  image LEFT (via row-reverse), features RIGHT  */}
          <section id="features" className="ed-section ed-zz-section ed-zz-alt">
            <div className="ed-zz-row">
              {/* content FIRST in DOM  row-reverse pushes it to the RIGHT visually */}
              <div className="ed-zz-content">
                <h2 className="ed-ob-section-title">Why choose {exam.name} Online Courses?</h2>
                <p className="ed-ob-section-sub">{exam.name} online coaching offers convenience, flexibility, study materials, mock tests, and expert guidance.</p>
                <div className="ed-features-ob-grid">
                  <div className="ed-ob-feature-item">
                    <div className="ed-ob-feature-icon">
                      <svg viewBox="0 0 48 48" width="38" height="38">
                        <rect x="4" y="8" width="40" height="28" rx="4" fill="#dbeafe" />
                        <rect x="8" y="12" width="32" height="20" rx="2" fill="#bd7b20" />
                        <circle cx="18" cy="22" r="5" fill="white" opacity="0.9" />
                        <circle cx="30" cy="22" r="5" fill="white" opacity="0.9" />
                        <path d="M18 27 Q18 31 24 31 Q30 31 30 27" stroke="white" strokeWidth="1.5" fill="none" />
                        <rect x="20" y="36" width="8" height="3" fill="#94a3b8" />
                      </svg>
                    </div>
                    <div>
                      <h4>Interactive Live Classes</h4>
                      <p>Engaged learning with active participation and real-time doubt clearing.</p>
                    </div>
                  </div>
                  <div className="ed-ob-feature-item">
                    <div className="ed-ob-feature-icon">
                      <svg viewBox="0 0 48 48" width="38" height="38">
                        <rect x="4" y="8" width="40" height="28" rx="4" fill="#dbeafe" />
                        <rect x="8" y="12" width="32" height="20" rx="2" fill="#bd7b20" />
                        <circle cx="24" cy="20" r="5" fill="white" opacity="0.9" />
                        <path d="M16 30 Q24 24 32 30" stroke="white" strokeWidth="1.5" fill="none" />
                        <circle cx="12" cy="9" r="3" fill="#f59e0b" />
                      </svg>
                    </div>
                    <div>
                      <h4>Expert Study Material</h4>
                      <p>Prepared by expert faculties covering every topic in the syllabus.</p>
                    </div>
                  </div>
                  <div className="ed-ob-feature-item">
                    <div className="ed-ob-feature-icon">
                      <svg viewBox="0 0 48 48" width="38" height="38">
                        <rect x="4" y="8" width="40" height="28" rx="4" fill="#dbeafe" />
                        <rect x="8" y="12" width="32" height="20" rx="2" fill="#bd7b20" />
                        <circle cx="18" cy="20" r="4" fill="white" opacity="0.8" />
                        <circle cx="30" cy="20" r="4" fill="white" opacity="0.8" />
                        <circle cx="24" cy="26" r="4" fill="white" opacity="0.8" />
                        <path d="M12 32 Q24 26 36 32" stroke="white" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                    <div>
                      <h4>Latest Exam Pattern</h4>
                      <p>Strictly aligned with the latest {exam.name} exam pattern and syllabus.</p>
                    </div>
                  </div>
                  <div className="ed-ob-feature-item">
                    <div className="ed-ob-feature-icon">
                      <svg viewBox="0 0 48 48" width="38" height="38">
                        <rect x="4" y="8" width="40" height="28" rx="4" fill="#dbeafe" />
                        <rect x="8" y="12" width="32" height="20" rx="2" fill="#bd7b20" />
                        <rect x="12" y="16" width="24" height="3" rx="1" fill="white" opacity="0.6" />
                        <rect x="12" y="21" width="18" height="3" rx="1" fill="white" opacity="0.6" />
                        <rect x="12" y="26" width="20" height="3" rx="1" fill="white" opacity="0.6" />
                        <circle cx="38" cy="16" r="5" fill="#22c55e" />
                        <path d="M35 16 L37 18 L41 14" stroke="white" strokeWidth="1.5" fill="none" />
                      </svg>
                    </div>
                    <div>
                      <h4>Detailed Mock Analysis</h4>
                      <p>In-depth analysis after each test to identify strengths and weak areas.</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* visual SECOND in DOM  row-reverse pushes it to the LEFT visually */}
              <div className="ed-zz-visual">
                <img
                  src="https://www.oliveboard.in/lp/ocimg/girl.svg"
                  alt="Student studying"
                  className="ed-zz-img"
                  style={{ filter:'hue-rotate(180deg)' }}
                />
              </div>
            </div>
          </section>


          {/*  Important Dates  */}
          {(dates.applicationStart || dates.applicationEnd || dates.examDate || dates.resultDate) && (
            <section id="dates" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon orange"><IsoCalendarGraphic /></div>
                <h2 className="ed-section-title">Important Dates</h2>
                {isOpen && <span className="ed-live-badge"><span className="ed-live-dot" /> Applications Open</span>}
              </div>
              <div className="ed-dates-grid">
                {dates.notificationDate && (
                  <DateCard label="Notification Released" date={dates.notificationDate} />
                )}
                {dates.applicationStart && (
                  <DateCard label="Application Start" date={dates.applicationStart} />
                )}
                {dates.applicationEnd && (
                  <DateCard label="Application End" date={dates.applicationEnd} highlight />
                )}
                {dates.examDate && (
                  <DateCard label="Exam Date" date={dates.examDate} highlight />
                )}
                {dates.resultDate && (
                  <DateCard label="Result Date" date={dates.resultDate} />
                )}
              </div>
            </section>
          )}

          {/*  Eligibility  */}
          {exam.eligibility && (
            <section id="eligibility" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon blue"><CheckCircle size={24} color="#9b6118" /></div>
                <h2 className="ed-section-title">Eligibility Criteria</h2>
              </div>
              <div className="ed-elig-grid">
                <div className="ed-elig-card">
                  <div className="ed-elig-icon"><Clock size={22} /></div>
                  <div className="ed-elig-content">
                    <span className="ed-elig-lbl">Age Limit</span>
                    <div className="ed-elig-val-row">
                      <span>{exam.eligibility.ageMin ||"18"}</span>
                      <span className="ed-elig-sep"></span>
                      <span>{exam.eligibility.ageMax ||"32"}</span>
                      <span className="ed-elig-unit">years</span>
                    </div>
                    {exam.eligibility.ageRelaxation && (
                      <p className="ed-elig-note">+ {exam.eligibility.ageRelaxation} yr relaxation for reserved</p>
                    )}
                  </div>
                </div>
                <div className="ed-elig-card">
                  <div className="ed-elig-icon"><BookOpen size={22} /></div>
                  <div className="ed-elig-content">
                    <span className="ed-elig-lbl">Education</span>
                    <div className="ed-elig-single">{exam.eligibility.education ||"Graduate"}</div>
                  </div>
                </div>
                <div className="ed-elig-card">
                  <div className="ed-elig-icon"><Users size={22} /></div>
                  <div className="ed-elig-content">
                    <span className="ed-elig-lbl">Experience</span>
                    <div className="ed-elig-single">{exam.eligibility.experience ||"Not Required"}</div>
                  </div>
                </div>
                {exam.eligibility.nationality && (
                  <div className="ed-elig-card">
                    <div className="ed-elig-icon"><Globe size={22} /></div>
                    <div className="ed-elig-content">
                      <span className="ed-elig-lbl">Nationality</span>
                      <div className="ed-elig-single">{exam.eligibility.nationality}</div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/*  Exam Pattern  */}
          {exam.phases?.length > 0 && (
            <section id="pattern" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon orange"><Target size={24} color="#ea580c" /></div>
                <h2 className="ed-section-title">Exam Pattern</h2>
              </div>
              <div className="ed-pattern-list">
                {exam.phases.map((phase: any, i: number) => (
                  <div key={i} className="ed-pattern-card">
                    <div className="ed-pattern-top">
                      <div className="ed-pattern-badge">{i + 1}</div>
                      <div className="ed-pattern-info">
                        <h3 className="ed-pattern-name">{phase.name}</h3>
                        <div className="ed-pattern-chips">
                          {phase.duration && (
                            <span className="ed-chip"><Clock size={11} /> {phase.duration} min</span>
                          )}
                          {phase.totalQuestions && (
                            <span className="ed-chip"><FileText size={11} /> {phase.totalQuestions} Qs</span>
                          )}
                          {phase.totalMarks && (
                            <span className="ed-chip"><Award size={11} /> {phase.totalMarks} marks</span>
                          )}
                          {phase.negativeMarking && (
                            <span className="ed-chip ed-chip-red">-{phase.negativeMarking} negative</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {phase.sections?.length > 0 && (
                      <div className="ed-pattern-table">
                        <div className="ed-pattern-thead">
                          <span>Section</span>
                          <span>Questions</span>
                          <span>Marks</span>
                        </div>
                        {phase.sections.map((sec: any, j: number) => (
                          <div key={j} className="ed-pattern-trow">
                            <span className="ed-pattern-sec-name">{sec.name}</span>
                            <span className="ed-pattern-val">{sec.questions}</span>
                            <span className="ed-pattern-val ed-pattern-marks">{sec.marks}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {phase.isQualifying && (
                      <span className="ed-qual-tag">Qualifying Only</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/*  Vacancies  */}
          {exam.vacancies?.length > 0 && (
            <section id="vacancies" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon"><BarChart2 size={18} /></div>
                <h2 className="ed-section-title">Vacancy Trends</h2>
              </div>
              <div className="ed-vacancy-row">
                {[...exam.vacancies].reverse().map((v: any, i: number) => (
                  <div key={i} className="ed-vacancy-card">
                    <div className="ed-vacancy-year">{v.year}</div>
                    <div className="ed-vacancy-count">
                      <span className="ed-vacancy-num">{v.total?.toLocaleString()}</span>
                      <span className="ed-vacancy-lbl">Total Seats</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/*  Cutoffs  */}
          {exam.cutoffs?.length > 0 && (
            <section id="cutoffs" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon"><TrendingUp size={18} /></div>
                <h2 className="ed-section-title">Previous Year Cutoffs</h2>
              </div>
              <div className="ed-table-wrap">
                <table className="ed-table">
                  <thead>
                    <tr>
                      <th>Year</th><th>Phase</th><th>Category</th><th>State</th><th>Cutoff Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam.cutoffs.map((cut: any, i: number) => (
                      <tr key={i}>
                        <td><span className="ed-year-chip">{cut.year}</span></td>
                        <td>{cut.phase ||""}</td>
                        <td><span className="ed-cat-chip">{cut.category ||"GEN"}</span></td>
                        <td>{cut.state ||"All India"}</td>
                        <td><strong className="ed-cutoff-val">{cut.cutoffMarks}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/*  Row 3: How to Access  steps LEFT, illustration RIGHT  */}
          {(linkedCourses.length > 0 || linkedTestCats.length > 0) && (
            <section id="how_access" className="ed-section ed-zz-section">
              <div className="ed-zz-row">
                {/* LEFT: steps */}
                <div className="ed-zz-content">
                  <h2 className="ed-ob-section-title" style={{ color:'#0ea5e9' }}>How to Access Live Classes?</h2>
                  <div className="ed-ob-steps-list" style={{ marginTop:'24px' }}>
                    <div className="ed-ob-step">
                      <div className="ed-ob-step-num">1</div>
                      <div>
                        <h4>Enroll for Individual Course/Super Elite</h4>
                        <p>Choose either an individual course or a subscription plan like Super Elite to start your {exam.name} Coaching.</p>
                      </div>
                    </div>
                    <div className="ed-ob-step">
                      <div className="ed-ob-step-num">2</div>
                      <div>
                        <h4>Visit the Courses Section</h4>
                        <p>After purchase, visit the Courses section and access the classes you wish to attend. You can also watch recorded sessions if you've missed the live classes.</p>
                      </div>
                    </div>
                    {linkedTestCats.length > 0 && (
                      <div className="ed-ob-step">
                        <div className="ed-ob-step-num">3</div>
                        <div>
                          <h4>Attempt Mock Tests</h4>
                          <p>Practice with full-length mock tests aligned to the latest {exam.name} pattern and get detailed score analysis.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/* RIGHT: illustration */}
                <div className="ed-zz-visual">
                  <img
                    src="https://www.oliveboard.in/lp/ocimg/girl.svg"
                    alt="How to access"
                    className="ed-zz-img"
                    style={{ filter:'hue-rotate(270deg) saturate(1.5)' }}
                  />
                </div>
              </div>
            </section>
          )}

          {/*  Linked Courses  */}
          {linkedCourses.length > 0 && (
            <section id="courses" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon"><PlayCircle size={18} /></div>
                <h2 className="ed-section-title">Available Courses</h2>
                <span className="ed-section-badge">{linkedCourses.length}</span>
              </div>
              <div className="courses-grid-new">
                {linkedCourses.map((course: any) => {
                  const isWishlisted = wishlistIds.has(course._id);
                  const levelClass = course.skill_level?.toLowerCase() ||'advanced';
                  const displayActualPrice = course.actual_price || course.price || 3400;
                  const displayDiscountPrice = course.discounted_price || course.price || 1999;
                  const calcDiscount = course.discount_percentage || Math.round(((displayActualPrice - displayDiscountPrice) / displayActualPrice) * 100);

                  return (
                    <div key={course._id} className="course-card-new">
                      <div className="card-image-new">
                        <img
                          src={course.coverphoto ? getImageUrl(course.coverphoto) :'/assets/img/default.jpg'}
                          alt={course.title}
                        />
                        <div className={`level-badge-new ${levelClass}`}>
                          {course.skill_level ||'ADVANCED'}
                        </div>
                        <div className="card-actions-new">
                          <button className="share-btn-new" onClick={e => { e.preventDefault(); e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/course-details/${course._id}`); toast.success('Link copied!'); }} aria-label="Share">
                            <Share2 size={14} />
                          </button>
                          <button className={`wishlist-btn-new${isWishlisted ?' active' :''}`} onClick={e => toggleWishlist(course._id,"course", { title: course.title, price: course.price, coverphoto: course.coverphoto }, e)} aria-label="Wishlist">
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
                            <div className="syllabus-badge-new" onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(`/view-resource/course/${course._id}`,'_blank'); }}>
                              <Eye size={11} /> View Syllabus
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
                          <div className="bottom-stat-item-new"><Clock size={15} /> {course.duration ? course.duration +'m' :'150m'}</div>
                          <div className="bottom-stat-item-new"><BookOpen size={15} /> {course.chapters_count || 16} Lessons</div>
                        </div>

                        <div className="divider-new" />

                        <div className="instructor-row-new">
                          <img src={course.teacher?.profile ? getImageUrl(course.teacher.profile) :'/assets/img/review/1.jpg'} alt={course.teacher?.name ||'Mentor'} onError={e => { (e.target as HTMLImageElement).src ='/assets/img/review/1.jpg'; }} />
                          <div className="instructor-info-new">
                            <strong>{course.teacher?.name ||'Expert Mentor'}</strong>
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
            </section>
          )}

          {/*  Linked Books  */}
          {linkedBooks.length > 0 && (
            <section id="books" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon"><Book size={18} /></div>
                <h2 className="ed-section-title">Available Books</h2>
                <span className="ed-section-badge">{linkedBooks.length}</span>
              </div>
              <div className="books-grid-marketplace">
                {linkedBooks.map((book: any) => {
                  const hasDigital = typeof book.digitalPrice ==='number' && book.digitalPrice > 0;
                  const hasPhysical = typeof book.physicalPrice ==='number' && book.physicalPrice > 0;
                  const wishlisted = wishlistIds.has(book._id);
                  const isWishlistLoad = wishlistLoadingId === book._id;

                  return (
                    <div key={book._id} className="book-card-premium" onClick={() => navigate(`/book-details/${book._id}`)}>
                      <div className="card-hero" style={{ backgroundColor:'#f1f5f9' }}>
                        {book.isPopular && <span className="badge best-seller">BEST SELLER</span>}
                        {!book.isPopular && book.isFeatured && <span className="badge new-edition">NEW EDITION</span>}

                        <div className="card-actions-overlay" onClick={e => e.stopPropagation()}>
                          <button className="share-overlay-btn" onClick={e => { e.preventDefault(); navigator.clipboard.writeText(`${window.location.origin}/book-details/${book._id}`); toast.success('Link copied!'); }}><Share2 size={16} /></button>
                          <button
                            className={`wishlist-overlay-btn ${wishlisted ?'active' :''} ${isWishlistLoad ?'loading' :''}`}
                            onClick={e => toggleWishlist(book._id,"book", { title: book.title, author: book.author, coverImage: book.coverImage, price: book.digitalPrice || book.physicalPrice || 0 }, e)}
                            disabled={isWishlistLoad}
                          >
                            <Heart size={16} stroke="#ef4444" fill={wishlisted ?'#ef4444' :'none'} />
                          </button>
                        </div>

                        <div className="book-cover-container">
                          <img src={book.coverImage ? getImageUrl(book.coverImage) :'/assets/img/default-book.png'} alt={book.title} className="main-cover" />
                        </div>
                      </div>

                      <div className="card-body-books">
                        <div className="meta-top-row">
                          <span className="cat-tag">{book.category?.name || book.category ||'General'}</span>
                          <span className="lang-tag"><Globe size={12} /> {book.language ||'English'}</span>
                        </div>
                        <h3 className="book-name-title">{book.title}</h3>
                        <p className="book-author-text">Author: {book.author}</p>

                        <div className="card-footer-sticky">
                          <div className={`pricing-grid-dual ${hasDigital && hasPhysical ?'dual' :'single'}`}>
                            {hasDigital && (
                              <div className="price-box active" style={{ cursor:'pointer' }}>
                                <div className="box-label"><FileText size={14} /> Ebook</div>
                                <div className="box-values">
                                  <span className="final">{Math.round(book.digitalPrice - (book.digitalPrice * (book.digitalDiscountPercentage || 0)) / 100)}</span>
                                  {book.digitalDiscountPercentage ? <span className="old">{book.digitalPrice}</span> : null}
                                </div>
                                {book.digitalDiscountPercentage ? <div className="disc-pill">{book.digitalDiscountPercentage}% OFF</div> : null}
                              </div>
                            )}
                            {hasPhysical && (
                              <div className="price-box active" style={{ cursor:'pointer' }}>
                                <div className="box-label"><Book size={14} /> Paperback</div>
                                <div className="box-values">
                                  <span className="final">{Math.round(book.physicalPrice - (book.physicalPrice * (book.physicalDiscountPercentage || 0)) / 100)}</span>
                                  {book.physicalDiscountPercentage ? <span className="old">{book.physicalPrice}</span> : null}
                                </div>
                                {book.physicalDiscountPercentage ? <div className="disc-pill">{book.physicalDiscountPercentage}% OFF</div> : null}
                              </div>
                            )}
                          </div>

                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
                            <button
                              className="add-to-cart-marketplace-btn"
                              style={{
                                marginBottom: 0,
                                display:'flex',
                                alignItems:'center',
                                justifyContent:'center',
                                gap:'6px',
                                background:'white',
                                color:'#bd7b20',
                                border:'1px solid #bd7b20',
                                borderRadius:'8px',
                                padding:'10px',
                                fontWeight: 600,
                                fontSize:'13px',
                                cursor:'pointer',
                                whiteSpace:'nowrap'
                              }}
                              onClick={(e) => addBookToCart(book, e)}
                            >
                              <ShoppingCart size={16} /> Cart
                            </button>
                            <button
                              className="buy-now-marketplace-btn"
                              style={{ marginBottom: 0 }}
                              onClick={(e) => { e.stopPropagation(); window.location.href = `/book-details/${book._id}`; }}
                            >
                              Buy Now
                            </button>
                          </div>

                          <Link to={`/book-details/${book._id}`} className="details-link-text" onClick={e => e.stopPropagation()}>View Details</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/*  Linked Exam Categories  */}
          {linkedTestCats.length > 0 && (
            <section id="tests" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon"><Layers size={18} /></div>
                <h2 className="ed-section-title">Available Tests Topics</h2>
                <span className="ed-section-badge">{linkedTestCats.length}</span>
              </div>
              <div className="ts-marketplace-grid">
                {linkedTestCats.map((cat: any) => {
                  const wishlisted = wishlistIds.has(cat._id);
                  const isWishlistLoad = wishlistLoadingId === cat._id;
                  return (
                    <div key={cat._id} className="ts-card-figma-clone">
                      <div className="ts-card-top">
                        <div className="ts-badge-group">
                          <span className="ts-badge-code">{cat.code ||"TEST"}</span>
                          <span className="ts-badge-year">
                            {cat.year || new Date().getFullYear()}/{cat.year ? cat.year + 1 : new Date().getFullYear() + 1}
                          </span>
                        </div>
                        <div className="ts-card-actions">
                          <button
                            className="ts-share-icon"
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/exam-topics/${cat._id}`); toast.success("Link copied!"); }}
                            aria-label="share"
                          >
                            <Share2 size={16} />
                          </button>
                          <button
                            className={`ts-wishlist-btn ${wishlisted ?"active" :""} ${isWishlistLoad ?"loading" :""}`}
                            onClick={(e) => toggleWishlist(cat._id,"test_series", { name: cat.name, code: cat.code, year: cat.year, totalTests: cat.statistics?.totalTestSeries || 0 }, e)}
                            disabled={isWishlistLoad}
                            aria-label="wishlist"
                          >
                            <Heart size={16} stroke="#ef4444" fill={wishlisted ?"#ef4444" :"none"} />
                          </button>
                        </div>
                      </div>

                      <div className="ts-card-content">
                        <h3 className="ts-exam-name">{cat.name}</h3>
                        <p className="ts-exam-desc">{cat.description ||"Updated questions based on latest exam pattern & negative marking."}</p>

                        <hr className="ts-card-divider" />

                        <div className="ts-stats-grid">
                          <div className="ts-stat-box">
                            <ClipboardCheck size={20} className="stat-icon" />
                            <div className="stat-labels">
                              <strong>{cat.statistics?.totalTestSeries || 0}</strong>
                              <span>MOCKS</span>
                            </div>
                          </div>
                          <div className="ts-stat-box border-x">
                            <BookOpen size={20} className="stat-icon" />
                            <div className="stat-labels">
                              <strong>{cat.statistics?.totalSubjects || 0}</strong>
                              <span>SUBJECTS</span>
                            </div>
                          </div>
                          <div className="ts-stat-box">
                            <HelpCircle size={20} className="stat-icon" />
                            <div className="stat-labels">
                              <strong>{(cat as any).examPattern?.totalQuestions ||"200+"}</strong>
                              <span>QUES</span>
                            </div>
                          </div>
                        </div>

                        <button className="ts-explore-cta" onClick={() => navigate(`/exam-topics/${cat._id}`)}>
                          Explore Test Series <ArrowRight size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/*  Linked Study Material  */}
          {linkedContents.length > 0 && (
            <section id="contents" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon"><FileText size={18} /></div>
                <h2 className="ed-section-title">Study Material</h2>
                <span className="ed-section-badge">{linkedContents.length}</span>
              </div>
              <div className="blog-grid-marketplace">
                {linkedContents.map((content: any) => {
                  const generateSlug = (title: string, id: string): string => {
                    const slug = (title ||"").toLowerCase().replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'');
                    return `${slug}-${id}`;
                  };
                  return (
                    <div key={content._id} className="blog-card-figma" onClick={() => navigate(`/blog-details/${generateSlug(content.content_subject, content._id)}`)}>
                      <div className="card-image-box">
                        <ImgWithFallback
                          src={getImageUrl(content.schema_image)}
                          alt={content.content_subject}
                        />
                        <button
                          className={`card-share-btn ${copiedId === content._id ?'copied' :''}`}
                          onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`${window.location.origin}/blog-details/${generateSlug(content.content_subject, content._id)}`); setCopiedId(content._id); toast.success("Link copied!"); setTimeout(() => setCopiedId(null), 2000); }}
                          title="Share this post"
                        >
                          {copiedId === content._id ? <CheckCheck size={16} /> : <Share2 size={16} />}
                        </button>
                      </div>

                      <div className="card-body">
                        <span className="category-pill">{formatCategory(content.content_category || content.content_type)}</span>
                        <h3 className="blog-title">{content.content_subject}</h3>
                        <p className="blog-excerpt">
                          {getCleanExcerpt(content.content_description || content.content ||"", 85)}
                        </p>
                        <div className="blog-meta-row">
                          <span><Clock size={14} /> 5 min read</span>
                          <span className="dot"></span>
                          <span><Calendar size={14} /> {dayjs(content.createdAt || new Date()).format("MMM DD, YYYY")}</span>
                        </div>
                        <Link
                          to={`/blog-details/${generateSlug(content.content_subject, content._id)}`}
                          className="read-more-link"
                          onClick={e => e.stopPropagation()}
                        >
                          Read More <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/*  How to Access Classes  */}
          {(linkedCourses.length > 0 || linkedTestCats.length > 0) && (
            <section id="how_access" className="ed-section">
              <div className="ed-section-header">
                <div className="ed-section-icon"><IsoAccessGraphic /></div>
                <h2 className="ed-section-title">How to Access Classes?</h2>
              </div>
              <div className="ed-steps-container">
                <div className="ed-step-card">
                  <div className="ed-step-number">1</div>
                  <div className="ed-step-content">
                    <h4>Enroll & Subscribe</h4>
                    <p>Choose your preferred course or test series from the list above and complete the secure payment process.</p>
                  </div>
                </div>
                <div className="ed-step-card">
                  <div className="ed-step-number">2</div>
                  <div className="ed-step-content">
                    <h4>Download the App or Visit Web</h4>
                    <p>Access your content anywhere by logging in through our Mobile App or this Web Portal.</p>
                  </div>
                </div>
                <div className="ed-step-card">
                  <div className="ed-step-number">3</div>
                  <div className="ed-step-content">
                    <h4>Start Learning!</h4>
                    <p>Go to'My Courses', join the Live Sessions, download PDFs, and take Mocks to boost your score.</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/*  Related Exams  */}
          {relatedExams.length > 0 && (
            <div className="ed-related-section">
              <h3 className="ed-related-title"> More Exams You May Like</h3>
              <p className="ed-related-sub">Other popular exams in the same category</p>
              <div className="ed-related-grid">
                {relatedExams.map((rel) => (
                  <div
                    key={rel._id}
                    className="ed-related-card"
                    onClick={() => navigate(`/exams/${rel.slug}`)}
                  >
                    <div className="ed-related-card-img">
                      {rel.examImage ? (
                        <img src={getImageUrl(rel.examImage)} alt={rel.name} />
                      ) : (
                        <BookOpen size={18} color="#bd7b20" />
                      )}
                    </div>
                    <span className="ed-related-card-name">{rel.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/*  FAQs  */}
          <section id="faqs" className="ed-section">
            <div className="ed-section-header">
              <div className="ed-section-icon blue"><IsoFAQGraphic /></div>
              <h2 className="ed-section-title">Frequently Asked Questions</h2>
            </div>
            <div className="ed-faq-list">
              {[
                { q: `When will the notification for ${exam.name} be released?`, a: exam.importantDates?.notificationDate ? `The notification is expected around ${dayjs(exam.importantDates.notificationDate).format("MMM YYYY")}.` :"The notification release date is yet to be announced by the conducting body. Keep checking this page for updates." },
                { q: `What is the validity of the courses for ${exam.name}?`, a:"The validity varies per course, but typically our premium courses offer access until the actual Date of Examination or for 12/24 months." },
                { q:"Are the mock tests based on the latest pattern?", a:"Yes, our dedicated team constantly updates the mock tests, including new negative marking systems, sectional timing, and difficulty levels matching the real exam." },
                { q:"Can I access the content on mobile?", a:"Absolutely! You can download our Android or iOS apps to access video classes, PDFs, and take mock tests on the go." },
                { q:"Is there any refund policy?", a:"We provide an initial demo period for you to test our teaching methodology. Please review our Terms & Conditions for specific refund eligibility." },
              ].map((faq, i) => (
                <div key={i} className={`ed-faq-item ${activeFaq === i ?'active' :''}`}>
                  <button className="ed-faq-header" onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                    <h4>{faq.q}</h4>
                    <span className="ed-faq-icon"><ChevronDown size={20} /></span>
                  </button>
                  <div className="ed-faq-body">
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </main>
      </div>
      {/* Preview Modal */}
      {preview && (
        <PYQPreviewModal
          open={preview}
          onClose={() => setPreview(false)}
          pdfUrl={pdfConfig.url}
          title={pdfConfig.title}
          subtitle="Course Syllabus"
        />
      )}
    </div>
  );
}

/* ================= INLINE MONITOR ICON ================= */
function Monitor({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}
