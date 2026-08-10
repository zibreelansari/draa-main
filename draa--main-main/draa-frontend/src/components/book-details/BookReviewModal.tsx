import React, { useEffect, useState } from"react";
import toast from '../../utils/toast';
import uri from"../../url";

interface Props {
  bookId: string;
  onClose: () => void;
}

interface Review {
  _id: string;
  rating: number;
  title: string;
  review: string;
  createdAt: string;
  isEdited: boolean;
}

export default function BookReviewModal({ bookId, onClose }: Props) {
  const userStr = localStorage.getItem("edudocs");
  const user = userStr ? JSON.parse(userStr) : null;

  const [loading, setLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [editing, setEditing] = useState(false);

  // form state
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  /*  */
  /* CHECK REVIEW ELIGIBILITY */
  /*  */
  const checkEligibility = async () => {
    try {
      const res = await fetch(
        `${uri}/books/review/book/${bookId}/can-review`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        setCanReview(data.canReview);

        if (data.hasReviewed && data.existingReview) {
          setMyReview(data.existingReview);
          setRating(data.existingReview.rating);
          setTitle(data.existingReview.title);
          setText(data.existingReview.review);
          setEditing(true);
        }
      }
    } catch {
      toast.error("Failed to check review eligibility");
    } finally {
      setLoading(false);
    }
  };

  /*  */
  /* SUBMIT / UPDATE REVIEW */
  /*  */
  const submitReview = async () => {
    if (!title.trim() || !text.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const url = editing && myReview
        ? `${uri}/books/review/review/${myReview._id}`
        : `${uri}/books/review/book/${bookId}/review`;

      const res = await fetch(url, {
        method: editing ?"PUT" :"POST",
        headers: {
"Content-Type":"application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          rating,
          title,
          review: text,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success(editing ?"Review updated" :"Review submitted");
        onClose();
      } else {
        toast.error(data.message ||"Review failed");
      }
    } catch {
      toast.error("Failed to submit review");
    }
  };

  /*  */
  /* DELETE REVIEW */
  /*  */
  const deleteReview = async () => {
    if (!myReview) return;

    if (!window.confirm("Delete your review?")) return;

    try {
      const res = await fetch(
        `${uri}/reviews/review/${myReview._id}`,
        {
          method:"DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        toast.success("Review deleted");
        onClose();
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  useEffect(() => {
    if (!user?.token) {
      toast.warning("Please login");
      onClose();
      return;
    }

    checkEligibility();
  }, []);

  if (loading) {
    return (
      <div className="modal-bg">
        <div className="modal-box">
          <p>Loading review form...</p>
        </div>
      </div>
    );
  }
  /*  */
  /* UI */
  /*  */
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <h3>{editing ?"Edit Review" :"Write a Review"}</h3>
          <button onClick={onClose}></button>
        </div>

        {!canReview && !myReview ? (
          <div className="locked-review">
             Purchase this book to write a review
          </div>
        ) : (
          <>
            {/* Rating */}
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map(r => (
                <span
                  key={r}
                  onClick={() => setRating(r)}
                  className={r <= rating ?"active" :""}
                >
                  
                </span>
              ))}
            </div>

            {/* Title */}
            <input
              className="inp"
              placeholder="Review title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            {/* Review */}
            <textarea
              className="inp"
              rows={5}
              placeholder="Write your review..."
              value={text}
              onChange={e => setText(e.target.value)}
            />

            {/* Actions */}
            <div className="review-actions">
              <button className="btn-primary" onClick={submitReview}>
                {editing ?"Update Review" :"Submit Review"}
              </button>

              {editing && (
                <button className="btn-danger" onClick={deleteReview}>
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}