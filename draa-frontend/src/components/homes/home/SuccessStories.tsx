import React, { useState, useEffect, useRef } from"react";
import { Link } from"react-router-dom";
import {
  Star,
  Award,
  ChevronRight,
  ChevronLeft,
  Quote,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Filter,
} from"lucide-react";
import axios from"axios";
import url from"../../../url";
import"./SuccessStories.css";
import StylishEmptyState from"../../common/StylishEmptyState";

interface SuccessStory {
  _id?: string;
  name: string;
  examName: string;
  examYear?: string;
  rank?: string;
  score?: string;
  imageUrl?: string;
  quote?: string;
  category?: string;
  batch?: string;
  postedAt?: string;
}

const examFilters = [
"All",
"SSC",
"Banking",
"Railway",
"UPSC",
"State Exams",
"Teaching",
];

const defaultStories: SuccessStory[] = [
  {
    name:"Rahul Sharma",
    examName:"SSC CGL",
    examYear:"2025",
    rank:"AIR 1",
    score:"687/700",
    quote:"Draa test series was my secret weapon. The pattern matched the real exam so closely that I felt prepared for every section. The detailed solutions helped me understand my mistakes clearly.",
    category:"SSC",
    batch:"2024-25",
  },
  {
    name:"Priya Verma",
    examName:"IBPS PO",
    examYear:"2025",
    rank:"AIR 3",
    score:"578/600",
    quote:"The banking books from Draa are exceptionally well-structured. The reasoning and quantitative aptitude sections improved dramatically with their practice sets. Cleared in my first attempt!",
    category:"Banking",
    batch:"2024-25",
  },
  {
    name:"Amit Kumar",
    examName:"Railway NTPC",
    examYear:"2025",
    rank:"AIR 7",
    score:"245/300",
    quote:"Railway exam prep was stress-free with Draa. The previous year papers compilation and mock tests gave me the exact practice I needed. Forever grateful!",
    category:"Railway",
    batch:"2024-25",
  },
  {
    name:"Sneha Patel",
    examName:"SBI Clerk",
    examYear:"2025",
    rank:"AIR 12",
    score:"412/500",
    quote:"The video courses are incredibly detailed. Faculty explains every concept from scratch. Draa gave me the perfect blend of theory and practice.",
    category:"Banking",
    batch:"2024-25",
  },
  {
    name:"Vikram Singh",
    examName:"UPSC CSE",
    examYear:"2025",
    rank:"AIR 45",
    score:"985/2025",
    quote:"Current affairs compilation and the structured syllabus coverage made all the difference. The resources here cover everything required for such a competitive exam.",
    category:"UPSC",
    batch:"2024-25",
  },
  {
    name:"Deepa Nair",
    examName:"CTET",
    examYear:"2025",
    rank:"AIR 8",
    score:"148/150",
    quote:"Teaching exam preparation became so much easier with Draa books. Every topic was covered with practice questions. Highly recommended for all teaching aspirants!",
    category:"Teaching",
    batch:"2024-25",
  },
  {
    name:"Arjun Reddy",
    examName:"SSC CHSL",
    examYear:"2025",
    rank:"AIR 22",
    score:"342/400",
    quote:"The mock tests built my speed and accuracy. The level of questions was perfectly aligned with the actual exam pattern. Draa is the best investment I made.",
    category:"SSC",
    batch:"2024-25",
  },
  {
    name:"Meera Joshi",
    examName:"MPSC Rajyaseva",
    examYear:"2025",
    rank:"AIR 15",
    score:"625/800",
    quote:"State exam preparation needs focused resources. Draa provided exactly that with their comprehensive study material and regular current affairs updates.",
    category:"State Exams",
    batch:"2024-25",
  },
];

const SuccessStories = () => {
  const [stories, setStories] = useState<SuccessStory[]>(defaultStories);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    axios.get(`${url}/success-stories/all`)
      .then(res => {
        if (res.data?.data?.length > 0) {
          setStories(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeFilter ==="All"
    ? stories
    : stories.filter(s => s.category === activeFilter);

  const featured = filtered[featuredIdx];
  const rest = filtered.filter((_, i) => i !== featuredIdx);

  const getInitials = (name: string) =>
    name.split('').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const getRankColor = (rank?: string) => {
    if (!rank) return"#bd7b20";
    if (rank.includes("AIR 1")) return"#f59e0b";
    if (rank.includes("AIR 2")) return"#94a3b8";
    if (rank.includes("AIR 3")) return"#cd7f32";
    return"#bd7b20";
  };

  const getCategoryColor = (cat?: string) => {
    const map: Record<string, string> = {
      SSC:"#f7f1e5", Banking:"#f0fdf4", Railway:"#fff7ed",
      UPSC:"#fdf4ff","State Exams":"#f0f9ff", Teaching:"#fefce8",
    };
    return map[cat ||""] ||"#f0fdf4";
  };

  const getCategoryTextColor = (cat?: string) => {
    const map: Record<string, string> = {
      SSC:"#9b6118", Banking:"#15803d", Railway:"#c2410c",
      UPSC:"#7e22ce","State Exams":"#0369a1", Teaching:"#a16207",
    };
    return map[cat ||""] ||"#15803d";
  };

  const scrollCards = (dir:"left" |"right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir ==="right" ? 360 : -360, behavior:"smooth" });
  };

  return (
    <main className="ss-page">
      <div className="ss-container">

        {/*  BREADCRUMB  */}
        <nav className="ss-breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} />
          <span className="active">Success Stories</span>
        </nav>

        {/*  HERO HEADER  */}
        <div className="ss-hero">
          <div className="ss-eyebrow">
            <Award size={16} />
            <span>Our Achievers</span>
          </div>
          <h1 className="ss-hero-title">
            Real Students. <span>Real Results.</span>
          </h1>
          <p className="ss-hero-sub">
            Join thousands who cracked their dream exams with Draa.
            These are the faces behind the success.
          </p>

          {/* Quick Stats */}
          <div className="ss-quick-stats">
            <div className="ss-stat-pill">
              <TrendingUp size={14} />
              <span>1K+ Selections</span>
            </div>
            <div className="ss-stat-pill">
              <Users size={14} />
              <span>10K+ Students</span>
            </div>
            <div className="ss-stat-pill">
              <BookOpen size={14} />
              <span>150+ Exams</span>
            </div>
          </div>
        </div>

        {/*  FILTER CHIPS  */}
        <div className="ss-filters">
          {examFilters.map(f => (
            <button
              key={f}
              className={`ss-filter-chip${activeFilter === f ?" active" :""}`}
              onClick={() => { setActiveFilter(f); setFeaturedIdx(0); }}
            >
              {f}
            </button>
          ))}
        </div>

        {/*  FEATURED STORY  */}
        {!loading && featured && (
          <div className="ss-featured-card">
            <div className="ss-featured-badge">
              <Star size={14} fill="white" />
              <span>Featured Topper</span>
            </div>

            <div className="ss-featured-inner">
              {/* Left: Avatar + Rank */}
              <div className="ss-featured-left">
                <div className="ss-featured-avatar-wrap">
                  {featured.imageUrl ? (
                    <img
                      src={featured.imageUrl.startsWith('http')
                        ? featured.imageUrl
                        : `${url}${featured.imageUrl}`}
                      alt={featured.name}
                      className="ss-featured-avatar"
                    />
                  ) : (
                    <div className="ss-featured-initials">
                      {getInitials(featured.name)}
                    </div>
                  )}
                </div>
                <div
                  className="ss-rank-badge"
                  style={{ backgroundColor: getRankColor(featured.rank) }}
                >
                  <Star size={12} fill="white" />
                  {featured.rank}
                </div>
              </div>

              {/* Right: Content */}
              <div className="ss-featured-right">
                <div className="ss-featured-meta">
                  <span
                    className="ss-cat-tag"
                    style={{
                      background: getCategoryColor(featured.category),
                      color: getCategoryTextColor(featured.category),
                    }}
                  >
                    {featured.category || featured.examName}
                  </span>
                  {featured.examYear && (
                    <span className="ss-year-tag">{featured.examYear}</span>
                  )}
                </div>

                <h2 className="ss-featured-name">{featured.name}</h2>
                <p className="ss-featured-exam">{featured.examName}  {featured.score}</p>

                {featured.quote && (
                  <blockquote className="ss-featured-quote">
                    <Quote size={20} className="quote-icon" />
                    <p>{featured.quote}</p>
                  </blockquote>
                )}

                <div className="ss-featured-actions">
                  <Link to="/courses" className="ss-cta-btn">
                    Start Your Journey <ArrowRight size={16} />
                  </Link>
                  <Link to="/test-series" className="ss-outline-btn">
                    Explore Test Series
                  </Link>
                </div>
              </div>
            </div>

            {/* Thumbnail strip for other stories */}
            {filtered.length > 1 && (
              <div className="ss-thumbs-strip">
                <button className="ss-thumb-nav" onClick={() => scrollCards("left")}>
                  <ChevronLeft size={16} />
                </button>
                <div className="ss-thumbs-track" ref={scrollRef}>
                  {filtered.map((s, i) => (
                    <button
                      key={s._id || i}
                      className={`ss-thumb${i === featuredIdx ?" active" :""}`}
                      onClick={() => setFeaturedIdx(i)}
                    >
                      {s.imageUrl ? (
                        <img
                          src={s.imageUrl.startsWith('http') ? s.imageUrl : `${url}${s.imageUrl}`}
                          alt={s.name}
                        />
                      ) : (
                        <div className="ss-thumb-initials">{getInitials(s.name)}</div>
                      )}
                      <span>{s.name.split('')[0]}</span>
                    </button>
                  ))}
                </div>
                <button className="ss-thumb-nav" onClick={() => scrollCards("right")}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/*  ALL STORIES GRID  */}
        {!loading && (
          <>
            <div className="ss-section-header">
              <h2 className="ss-section-title">
                More <span>Success Stories</span>
              </h2>
              <p className="ss-section-sub">
                {filtered.length} student{filtered.length !== 1 ?"s" :""} cracked their exams
              </p>
            </div>

            {rest.length > 0 ? (
              <div className="ss-grid">
                {rest.map((story, i) => (
                  <div key={story._id || i} className="ss-card">
                    {/* Header row */}
                    <div className="ss-card-header">
                      <div
                        className="ss-rank-pill"
                        style={{ backgroundColor: getRankColor(story.rank) }}
                      >
                        <Star size={10} fill="white" />
                        {story.rank || story.category}
                      </div>
                      <span
                        className="ss-cat-chip"
                        style={{
                          background: getCategoryColor(story.category),
                          color: getCategoryTextColor(story.category),
                        }}
                      >
                        {story.category || story.examName}
                      </span>
                    </div>

                    {/* Avatar */}
                    <div className="ss-card-avatar-row">
                      {story.imageUrl ? (
                        <img
                          src={story.imageUrl.startsWith('http') ? story.imageUrl : `${url}${story.imageUrl}`}
                          alt={story.name}
                          className="ss-card-avatar"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display ='none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.add('show');
                          }}
                        />
                      ) : null}
                      <div className="ss-card-initials">
                        {getInitials(story.name)}
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="ss-card-name">{story.name}</h3>
                    <p className="ss-card-exam">{story.examName}</p>
                    {story.score && (
                      <div className="ss-card-score">
                        <CheckCircle size={13} />
                        <span>Score: {story.score}</span>
                      </div>
                    )}

                    {/* Quote */}
                    {story.quote && (
                      <p className="ss-card-quote">"{story.quote.slice(0, 100)}..."</p>
                    )}

                    <Link to="/courses" className="ss-card-link">
                      Start Preparing <ArrowRight size={13} />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding:'60px 0' }}>
                <StylishEmptyState 
                  title={`No Stories in ${activeFilter}`}
                  description="We are waiting for more students to share their amazing journey with us. Be the first to crack the exam and get featured!"
                  actionText="Explore Courses"
                  actionPath="/courses"
                  showBack={false}
                />
              </div>
            )}
          </>
        )}

        {/*  LOADING STATE  */}
        {loading && (
          <div className="ss-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="ss-card ss-skeleton">
                <div className="sk sk-badge" />
                <div className="sk sk-avatar" />
                <div className="sk sk-title" />
                <div className="sk sk-sub" />
                <div className="sk sk-text" />
                <div className="sk sk-text short" />
              </div>
            ))}
          </div>
        )}

        {/*  BOTTOM CTA  */}
        <div className="ss-bottom-cta">
          <div className="ss-cta-content">
            <Award size={32} />
            <h2>Your Success Story Starts Here</h2>
            <p>Join thousands of successful students who trusted Draa for their exam preparation.</p>
            <div className="ss-cta-btns">
              <Link to="/courses" className="ss-cta-btn">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/test-series" className="ss-outline-btn">
                Try Test Series
              </Link>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};

export default SuccessStories;
