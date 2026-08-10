import React, { useState, useEffect, useCallback } from"react";
import { Link } from"react-router-dom";
import { Spin, message } from"antd";
import { Clock, ArrowRight, Share2, CheckCheck } from"lucide-react";
import url, { getImageUrl } from"../../../url";
import"./BlogHomeOne.css";
import StylishEmptyState from"../../common/StylishEmptyState";
import { getCleanExcerpt, stripHtmlAndEntities } from "../../../utils/utils";
import ImgWithFallback from"../../common/ImgWithFallback";

/*  TYPES  */
interface BlogPost {
  _id: string;
  content_subject: string;
  content_category: string;
  content: string;
  createdAt: string;
  approved: boolean;
  views: number;
  featured_image?: string;
  schema_image?: string;
  featured_images?: string[];
}

export default function BlogHomeOne() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  /*  FETCH  */
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${url}/course/allCourseContent`);
      const data = await response.json();
      const blogPosts = data.result || data.data || [];

      const approvedBlogs = blogPosts
        .filter((blog: BlogPost) => blog.approved === true)
        .sort(
          (a: BlogPost, b: BlogPost) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 4);

      setBlogs(approvedBlogs);
    } catch (err) {
      console.error("Blog fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  /*  HELPERS  */
  const generateSlug = (title: string, id: string): string => {
    const slug = title.toLowerCase().replace(/[^\w\s-]/g,'').replace(/[\s_-]+/g,'-').replace(/^-+|-+$/g,'');
    return `${slug}-${id}`;
  };

  const formatCategory = (cat: string) => {
    if (!cat) return"Updates";
    try {
      const parsed = JSON.parse(cat);
      if (Array.isArray(parsed)) return parsed[0] ||"Updates";
    } catch (e) {}
    return cat;
  };

  const handleShare = async (e: React.MouseEvent, blog: BlogPost) => {
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = `${window.location.origin}/blog-details/${generateSlug(blog.content_subject, blog._id)}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: blog.content_subject,
          text: `Check out this insight: ${blog.content_subject}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedId(blog._id);
        message.success("Link copied!");
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      console.log("Sharing failed", err);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      day:"numeric",
      month:"short",
      year:"numeric",
    });

  const getReadingTime = (content: string) => {
    const text = stripHtmlAndEntities(content);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return `${Math.ceil(words / 200)} min read`;
  };

  const getCoverImage = (blog: BlogPost): string | null => {
    const rawPath = blog.schema_image || blog.featured_image || blog.featured_images?.[0];
    return rawPath ? getImageUrl(rawPath) : null;
  };

  const categoryClass = (cat: string) =>
    cat?.toLowerCase().replace(/[^a-z0-9]+/g,"-") ||"";

  return (
    <section className="blog-marketplace-section">
      <div className="container">
        <div className="blog-header">
          <div className="title-area">
            <h2 className="section-main-title">Latest from Our Blog</h2>
            <p className="section-sub-text">
              Expert insights and career guidance to help you stay ahead.
            </p>
          </div>
          <Link to="/grid-blog" className="view-all-blogs-btn">
            View All Blogs
          </Link>
        </div>

        <div className="blog-grid">
          {loading ? (
            <div className="loader-box">
              <Spin size="large" />
            </div>
          ) : blogs.length > 0 ? (
            blogs.map(blog => {
              const coverImg = getCoverImage(blog);
              const blogSlug = generateSlug(blog.content_subject, blog._id);

              return (
                <article key={blog._id} className="blog-card-figma">
                  {/* IMAGE WITH OVERLAY SHARE */}
                  <div className="blog-card-hero">
                    <ImgWithFallback
                      src={coverImg}
                      alt={blog.content_subject}
                      className="blog-main-img"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                    
                    {/* TOP RIGHT SHARE BUTTON */}
                    <button 
                      className={`blog-share-overlay ${copiedId === blog._id ?'active' :''}`}
                      onClick={(e) => handleShare(e, blog)}
                    >
                      {copiedId === blog._id ? <CheckCheck size={16} /> : <Share2 size={16} />}
                    </button>
                  </div>

                  <div className="blog-card-body">
                    {/* Category pill hidden as requested */}
                    {/*
                    <span className={`category-pill ${categoryClass(blog.content_category)}`}>
                      {formatCategory(blog.content_category)}
                    </span>
                    */}

                    <h3 className="blog-card-title">{blog.content_subject}</h3>

                    <p className="blog-card-excerpt">
                      {getCleanExcerpt(blog.content, 85)}
                    </p>

                    <div className="blog-card-meta">
                      <span><Clock size={13} /> {getReadingTime(blog.content)}</span>
                      <span className="dot-separator"></span>
                      <span>{formatDate(blog.createdAt)}</span>
                    </div>

                    <Link to={`/blog-details/${blogSlug}`} className="read-more-btn">
                      Read More <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div style={{ gridColumn:'1 / -1', padding:'40px 0', width:'100%' }}>
              <StylishEmptyState 
                title="No Insights Yet"
                description="Our experts are currently drafting new insights and guidance for you. Check back shortly for the latest updates!"
                actionText="Explore All Blogs"
                actionPath="/grid-blog"
                showBack={false}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}