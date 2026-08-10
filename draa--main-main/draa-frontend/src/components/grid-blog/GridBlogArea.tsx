import React, { useState, useEffect, useMemo, useRef } from"react";
import { Link } from"react-router-dom";
import {
  ChevronRight,
  ChevronLeft,
  Clock,
  Calendar,
  ArrowRight,
  Loader2,
  Search,
  X,
  Share2,
  CheckCheck,
  Heart,
  MessageSquare,
  Newspaper,
  Landmark,
  Atom,
  Palette,
  HeartHandshake
} from"lucide-react";
import { message } from"antd";
import url, { getImageUrl } from"../../url";
import"../courses/CoursesArea.css";
import"./GridBlogArea.css";
import StylishEmptyState from"../common/StylishEmptyState";
import { getCleanExcerpt } from"../../utils/utils";
import ImgWithFallback from"../common/ImgWithFallback";

// --- Types ---
interface BlogPost {
  _id: string;
  content_subject: string;
  content_category: string;
  content: string;
  createdAt: string;
  approved: boolean;
  views: number;
  schema_image?: string;
  featured_images?: string[];
  likes?: Array<{ userId: string; userRole: string }>;
  comments?: Array<any>;
}

// --- Predefined category metadata (same 5 as Current Affairs section) ---
const BLOG_CATEGORY_META: Record<string, {
  description: string;
  colorClass: string;
  icon: React.ReactNode;
}> = {
  'Current Affairs': {
    description: 'Daily national & international updates',
    colorClass: 'blog-cat-current-affairs',
    icon: <Newspaper size={22} />,
  },
  'Governance': {
    description: 'Policies, administration & public systems',
    colorClass: 'blog-cat-governance',
    icon: <Landmark size={22} />,
  },
  'Science & Technology': {
    description: 'Recent developments & discoveries',
    colorClass: 'blog-cat-science-tech',
    icon: <Atom size={22} />,
  },
  'Art & Culture': {
    description: 'Heritage, literature & fine arts',
    colorClass: 'blog-cat-art-culture',
    icon: <Palette size={22} />,
  },
  'Ethics': {
    description: 'Integrity, aptitude & moral philosophy',
    colorClass: 'blog-cat-ethics',
    icon: <HeartHandshake size={22} />,
  },
};

const GridBlogArea: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Blogs");
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${url}/course/allCourseContent`);
        const data = await response.json();
        const approvedBlogs = data.result?.filter((blog: BlogPost) => blog.approved) || [];
        approvedBlogs.sort((a: BlogPost, b: BlogPost) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setBlogs(approvedBlogs);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesCategory =
        selectedCategory === "All Blogs" || blog.content_category === selectedCategory;
      const matchesSearch =
        searchQuery === '' ||
        blog.content_subject.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery, blogs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const generateSlug = (title: string, id: string): string => {
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return `${slug}-${id}`;
  };

  // Native share handler
  const handleShare = async (e: React.MouseEvent, blog: BlogPost) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/blog-details/${generateSlug(blog.content_subject, blog._id)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.content_subject,
          text: `Check out this blog post: ${blog.content_subject}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(blog._id);
      message.success("Link copied to clipboard!");
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) return <div className="loader-full"><Loader2 className="spin-icon" size={40} /></div>;

  return (
    <main className="blog-marketplace-page">
      <div className="container">

        <nav className="blog-breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={14} /> <span className="active">Blogs</span>
        </nav>

        <header className="blog-header">
         
          <div className="blog-header-right-controls">
            <div className="blog-search-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                className="blog-search-input"
                placeholder="Search blog topics..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
              {searchQuery && (
                <button
                  className="blog-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear Search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="blog-total-badge">
              <span className="count-num">{filteredBlogs.length}</span>
              <span className="count-label">Blogs</span>
            </div>
          </div>
        </header>

        {/* ── Explore by Category ── */}
        <div className="blog-explore-section">
          <div className="blog-explore-header-row">
            <h2 className="blog-explore-title">Explore by Category</h2>
            <button
              className="blog-view-all-btn"
              onClick={() => setSelectedCategory('All Blogs')}
            >
              View All <ArrowRight size={16} style={{ marginLeft: '4px' }} />
            </button>
          </div>

          <div className="blog-explore-slider-wrapper">
            <button 
              className="blog-slider-arrow left" 
              onClick={() => scroll('left')} 
              aria-label="Scroll Left"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="blog-explore-scroll-container" ref={scrollRef}>
              {Object.entries(BLOG_CATEGORY_META).map(([catName, meta]) => {
                const isActive = selectedCategory === catName;
                return (
                  <div
                    key={catName}
                    className={`blog-explore-card-new ${meta.colorClass}${isActive ? ' active' : ''}`}
                    onClick={() => setSelectedCategory(isActive ? 'All Blogs' : catName)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCategory(isActive ? 'All Blogs' : catName);
                      }
                    }}
                  >
                    <div className="blog-explore-icon-circle">
                      {meta.icon}
                    </div>
                    <span className="blog-explore-card-title-new">{catName}</span>
                  </div>
                );
              })}
            </div>

            <button 
              className="blog-slider-arrow right" 
              onClick={() => scroll('right')} 
              aria-label="Scroll Right"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* ── Section heading + active-filter clear ── */}
        <div className="blog-latest-header-row">
          <h2 className="blog-latest-title">
            {selectedCategory === 'All Blogs' ? 'All Blogs' : selectedCategory}
          </h2>
          {selectedCategory !== 'All Blogs' && (
            <button
              className="blog-clear-filter-btn"
              onClick={() => setSelectedCategory('All Blogs')}
            >
              <X size={14} /> Clear filter
            </button>
          )}
        </div>

        {/* ── Blog Grid ── */}
        <div className="blog-grid-marketplace">
          {filteredBlogs.length > 0 ? (
            filteredBlogs.map((blog) => (
              <div key={blog._id} className="blog-card-figma">
                <div className="card-body">
                  <div className="card-top-row">
                    {/* Category pill */}
                    {blog.content_category && (
                      <span
                        className={`blog-category-pill ${BLOG_CATEGORY_META[blog.content_category]?.colorClass || ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedCategory(blog.content_category);
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setSelectedCategory(blog.content_category);
                        }}
                      >
                        {blog.content_category}
                      </span>
                    )}
                    <button
                      className={`card-share-btn ${copiedId === blog._id ? 'copied' : ''}`}
                      onClick={(e) => handleShare(e, blog)}
                      title="Share this post"
                    >
                      {copiedId === blog._id ? <CheckCheck size={16} /> : <Share2 size={16} />}
                    </button>
                  </div>

                  {/* Hero image */}
                  <div className="card-image-box">
                    <ImgWithFallback
                      src={getImageUrl(blog.schema_image || blog.featured_images?.[0])}
                      alt={blog.content_subject}
                    />
                  </div>

                  <h3 className="blog-title">{blog.content_subject}</h3>
                  <p className="blog-excerpt">{getCleanExcerpt(blog.content, 85)}</p>

                  <div className="blog-meta-row" style={{ marginBottom: '12px' }}>
                    <span><Clock size={14} /> 8 min read</span>
                    <span className="dot"></span>
                    <span>
                      <Calendar size={14} />{' '}
                      {new Date(blog.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div
                    className="blog-interaction-row"
                    style={{
                      display: 'flex', gap: '15px', alignItems: 'center',
                      fontSize: '13px', color: '#64748b', fontWeight: 600, marginBottom: '20px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Heart
                        size={14}
                        fill={blog.likes && blog.likes.length > 0 ? '#ef4444' : 'transparent'}
                        stroke={blog.likes && blog.likes.length > 0 ? '#ef4444' : 'currentColor'}
                      />
                      <span>{blog.likes?.length || 0} Likes</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MessageSquare size={14} />
                      <span>{blog.comments?.length || 0} Comments</span>
                    </span>
                  </div>

                  <Link
                    to={`/blog-details/${generateSlug(blog.content_subject, blog._id)}`}
                    className="read-more-link"
                  >
                    Read More <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <StylishEmptyState
              title="No Blogs Found"
              description="We couldn't find any blog posts matching your search or category filter. Try something else or clear the filters."
              actionText="Clear All Filters"
              onAction={() => { setSearchQuery(''); setSelectedCategory('All Blogs'); }}
              showBack={false}
            />
          )}
        </div>

      </div>
    </main>
  );
};

export default GridBlogArea;
