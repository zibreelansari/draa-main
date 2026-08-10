import { useEffect, useState } from"react";
import { useParams, Link } from"react-router-dom";
import axios from"axios";
import moment from"moment";
import url from"../../../url";
import MyBreadcrumb from"../../common/Breadcrumb";
import PYQPreviewModal from"../../pyqs/PYQPreviewModal";
import StylishEmptyState from"../../common/StylishEmptyState";
import { Newspaper } from"lucide-react";
import"./CurrentAffairDetails.css";
import ShareButton from"../../common/ShareButton";
import usePageTitle from"../../../hooks/usePageTitle";
import { stripHtmlAndEntities } from "../../../utils/utils";

interface Affair {
  _id: string;
  title: string;
  slug: string;
  type:"DAILY" |"WEEKLY" |"MONTHLY";
  shortDescription: string;
  content: string;
  publishDate: string;
  coverImage?: string;
  pdfFile?: string;
  tags?: string[];
  categoryId?: { name: string };
}

const CurrentAffairDetails = () => {
  const { slug } = useParams();
  const [affair, setAffair] = useState<Affair | null>(null);
  usePageTitle(affair ? affair.title :"Current Affairs Article");
  const [related, setRelated] = useState<Affair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    fetchAffair();
    window.scrollTo({ top: 0, behavior:'smooth' });
  }, [slug]);

  const fetchAffair = async () => {
    try {
      setLoading(true);
      setError(false);

      const res = await axios.get(`${url}/current-affairs/details/${slug}`);
      setAffair(res.data.data);

      const relatedRes = await axios.get(
        `${url}/current-affairs/all?type=${res.data.data.type}&limit=6`
      );
      setRelated(
        relatedRes.data.data.filter((a: Affair) => a._id !== res.data.data._id).slice(0, 5)
      );

    } catch (err) {
      console.error("Error loading affair:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const textContent = stripHtmlAndEntities(content);
    const wordCount = textContent.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  if (loading) {
    return (
      <div className="ca-loader">
        <div className="ca-spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (error || !affair) {
    return (
      <StylishEmptyState 
        title="Article Not Found"
        description="The current affairs article you are looking for doesn't exist or has been removed."
        actionText="Back to Current Affairs"
        actionPath="/current-affairs"
        icon={Newspaper}
        showBack={true}
      />
    );
  }

  const readingTime = calculateReadingTime(affair.content);

  return (
    <div className="ca-container">
      <div className="ca-wrapper">

        <MyBreadcrumb 
          title={affair.title} 
          subtitle={affair.shortDescription} 
          category="Current Affairs"
          paths={[
            { pathName:"Current Affairs", url:"/current-affairs" },
            { pathName: affair.title }
          ]}
        />

        <div className="ca-grid">

          {/* MAIN CONTENT */}
          <article className="ca-main">

            {/* Cover Image */}
            {affair.coverImage && (
              <div className="ca-cover">
                <img
                  src={`${url}${affair.coverImage}`}
                  alt={affair.title}
                  loading="lazy"
                />
              </div>
            )}

            <div className="ca-content">

              {/* Meta */}
              <div className="ca-meta">
                <span className={`ca-badge ca-badge-${affair.type.toLowerCase()}`}>
                  {affair.type}
                </span>
                <span className="ca-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {moment(affair.publishDate).format("DD MMMM YYYY")}
                </span>
                <span className="ca-meta-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {readingTime} min read
                </span>
                <ShareButton 
                  url={`/current-affairs/${affair.slug}`} 
                  title={affair.title}
                  className="ca-detail-share"
                />
              </div>

              {/* Title */}
              <h1 className="ca-title">{affair.title}</h1>

              {/* Category */}
              {affair.categoryId?.name && (
                <span className="ca-category">{affair.categoryId.name}</span>
              )}

              {/* Short Description */}
              <p className="ca-description">{affair.shortDescription}</p>

              <div className="ca-divider"></div>

              {/* Main Content */}
              <div
                className="ca-article"
                dangerouslySetInnerHTML={{ __html: affair.content }}
              />

              {/* Tags */}
              {affair.tags && affair.tags.length > 0 && (
                <>
                  <div className="ca-divider"></div>
                  <div className="ca-tags">
                    {affair.tags.map((tag, index) => (
                      <span key={index} className="ca-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {/* PDF Download */}
              {affair.pdfFile && (
                <>
                  <div className="ca-divider"></div>
                  <button
                    onClick={() => window.open(`/view-resource/current-affairs/${affair._id}`,'_blank')}
                    className="ca-download-btn"
                    style={{width:'100%', cursor:'pointer', border:'none'}}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    View PDF Version Online
                  </button>
                </>
              )}

            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="ca-sidebar">
            {related.length > 0 && (
              <div className="ca-related">
                <h3 className="ca-related-title">Related Articles</h3>
                <div className="ca-related-list">
                  {related.map((item) => (
                    <Link
                      key={item._id}
                      to={`/current-affairs/${item.slug}`}
                      className="ca-related-item"
                    >
                      <h4>{item.title}</h4>
                      <div className="ca-related-date">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        {moment(item.publishDate).format("DD MMM YYYY")}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>

      </div>
    </div>
  );
};

export default CurrentAffairDetails;