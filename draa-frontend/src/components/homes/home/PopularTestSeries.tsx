import React, { useEffect, useState, useCallback } from "react";
import toast from '../../../utils/toast';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  Share2,
  ClipboardCheck,
  BookOpen,
  HelpCircle,
  ArrowRight,
  Check,
  Heart,
  Star,
} from "lucide-react";
import url, { BACKEND_UPLOAD_URL } from "../../../url";
import "./PopularTestSeries.css";
import StylishEmptyState from "../../common/StylishEmptyState";
import ImgWithFallback from "../../common/ImgWithFallback";
import {
  fetchWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../../../utils/wishlistApi";
import { getUserRole } from "../../../utils/global_auth";

/* ================= TYPES ================= */
interface ExaminationCategory {
  _id: string;
  name: string;
  code: string;
  year: number;
  description?: string;
  examPattern?: { totalQuestions: number };
  statistics?: {
    totalSubjects: number;
    totalTestSeries: number;
    averageRating?: number;
    totalReviews?: number;
  };
  bannerImage?: string;
  isActive: boolean;
}

const PopularTestSeries: React.FC = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<ExaminationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareStates, setShareStates] = useState<Record<string, boolean>>({});
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [wishlistLoading, setWishlistLoading] = useState<string | null>(null);

  /* ================= AUTH CHECK ================= */
  // Auth logic moved to global_auth.ts helper


  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/test-series/navigation/examinations`);
        if (res.data?.success) {
          setCategories(res.data.data.examinationCategories.slice(0, 3));
        }
        if (getUserRole() === "STUDENT") {
          const items = await fetchWishlist();
          const ids = new Set<string>(
            items
              .filter((i: any) => i.item_type === "test_series")
              .map((i: any) => String(i.item_id))
          );
          setWishlistIds(ids);
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ================= WISHLIST TOGGLE ================= */
  const handleWishlistToggle = async (
    exam: ExaminationCategory,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlistLoading) return;
    const role = getUserRole();
    if (role === "GUEST") {
      Swal.fire({
        title: "Login Required",
        text: "Please login as a student to use wishlist",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login Now",
        confirmButtonColor: "#3085d6",
      }).then((res) => {
        if (res.isConfirmed) navigate("/login");
      });
      return;
    }
    if (role !== "STUDENT") {
      toast.error(`Access Denied: As a ${role.toLowerCase()}, you are not permitted to use the wishlist. This feature is reserved for students.`);
      return;
    }
    const alreadyWishlisted = wishlistIds.has(exam._id);
    try {
      setWishlistLoading(exam._id);
      if (alreadyWishlisted) {
        const res = await removeFromWishlist({
          item_type: "test_series",
          item_id: exam._id,
        });
        if (res?.success) {
          setWishlistIds((prev) => {
            const s = new Set(prev);
            s.delete(exam._id);
            return s;
          });
          toast.success("Removed from wishlist");
        }
      } else {
        const res = await addToWishlist({
          item_type: "test_series",
          item_id: exam._id,
          snapshot: {
            name: exam.name,
            code: exam.code,
            year: exam.year,
            totalTests: exam.statistics?.totalTestSeries || 0,
          },
        });
        if (res?.success || res?.alreadyWishlisted) {
          setWishlistIds((prev) => new Set(prev).add(exam._id));
          toast.success("Added to wishlist");
        }
      }
    } catch (err) {
      console.error("Wishlist error:", err);
      toast.error("Wishlist action failed");
    } finally {
      setWishlistLoading(null);
    }
  };

  /* ================= SHARE ================= */
  const handleShare = async (exam: ExaminationCategory) => {
    const shareUrl = `${window.location.origin}/test-series/${exam._id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: exam.name, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setShareStates((prev) => ({ ...prev, [exam._id]: true }));
        toast.success("Link copied");
        setTimeout(() => {
          setShareStates((prev) => ({ ...prev, [exam._id]: false }));
        }, 2000);
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <section className="popular-ts-section">
        <div className="container">
          <div className="ts-header">
            <div>
              <h2 className="ts-section-title">Online Test Series</h2>
              <p className="ts-section-sub">Real exam experience with AI-powered analytics.</p>
            </div>
          </div>
          <div className="ts-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="ts-card-figma ts-skeleton-card">
                <div className="skeleton ts-card-top-skel" />
                <div className="ts-card-content">
                  <div className="skeleton skel-line short" />
                  <div className="skeleton skel-line" />
                  <div className="skeleton skel-line medium" />
                  <div className="skeleton ts-stats-skel" />
                  <div className="skeleton skel-btn-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ================= RENDER ================= */
  return (
    <section className="popular-ts-section">
      <div className="container">

        {/*  HEADER  */}
        <div className="ts-header">
          <div className="ts-title-group">
            <h2 className="ts-main-title">
              Popular Test Series
            </h2>
            <p className="ts-sub-text">
              Practice with mock tests and track your progress.
            </p>
          </div>
          <Link to="/online-test-series" className="ts-view-all-btn">
            View All Test Series
          </Link>
        </div>

        {/*  CARDS  */}
        <div className="ts-grid">
          {categories.length > 0 ? (
            categories.map((exam) => {
              const isWishlisted = wishlistIds.has(exam._id);
              const isCopied = shareStates[exam._id];
              const isProcessing = wishlistLoading === exam._id;

              return (
                <div key={exam._id} className="ts-card-figma">
                  {exam.bannerImage && (
                    <div className="ts-card-banner">
                      <ImgWithFallback
                        src={exam.bannerImage.startsWith('http') ? exam.bannerImage : `${BACKEND_UPLOAD_URL}/${exam.bannerImage}`}
                        alt={exam.name}
                        size="lg"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}

                  {/* Top row: badges + action icons */}
                  <div className="ts-card-top">
                    <div className="ts-badges">
                      {/* Rating replaces the year badge */}
                      <div className="ts-card-rating">
                        <Star size={13} fill={exam.statistics?.averageRating && exam.statistics.averageRating > 0 ? "#faad14" : "none"} stroke={exam.statistics?.averageRating && exam.statistics.averageRating > 0 ? "#faad14" : "#94a3b8"} />
                        <span className="rating-text">{exam.statistics?.averageRating && exam.statistics.averageRating > 0 ? exam.statistics.averageRating.toFixed(1) : "New"}</span>
                        {exam.statistics?.totalReviews && exam.statistics.totalReviews > 0 ? (
                          <span className="reviews-count">({exam.statistics.totalReviews})</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="ts-card-actions">
                      <button
                        className="ts-share-btn"
                        onClick={() => handleShare(exam)}
                        disabled={isCopied}
                        title="Share"
                      >
                        {isCopied ? <Check size={15} /> : <Share2 size={15} />}
                      </button>
                      <button
                        className={`ts-wishlist-btn${isWishlisted ? " active" : ""}${isProcessing ? " loading" : ""}`}
                        onClick={(e) => handleWishlistToggle(exam, e)}
                        disabled={isProcessing}
                        title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      >
                        <Heart
                          size={16}
                          stroke={isWishlisted ? "#ef4444" : "#9ca3af"}
                          fill={isWishlisted ? "#ef4444" : "transparent"}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Title + description wrapper for flex growth */}
                  <div className="ts-card-body">
                    <h3 className="ts-card-title" title={exam.name}>{exam.name}</h3>
                    <p className="ts-card-desc">
                      {exam.description ||
                        "Updated questions based on latest exam pattern & negative marking"}
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
                      <strong>{exam.examPattern?.totalQuestions || "3750+"}</strong>
                      <span>QUESTIONS</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to={`/exam-topics/${exam._id}`}
                    className="ts-explore-link"
                  >
                    Explore Test Series <ArrowRight size={16} />
                  </Link>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', padding: '40px 0', width: '100%' }}>
              <StylishEmptyState
                title="No Test Series Found"
                description="We're currently preparing new mock tests for you. Stay tuned for expert-curated test series coming soon!"
                actionText="Explore All Categories"
                actionPath="/online-test-series"
                showBack={false}
              />
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="ts-footer-note">
          Join over 10,000+ students practicing daily on Draa.
        </p>
      </div>
    </section>
  );
};

export default PopularTestSeries;
