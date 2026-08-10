import React, { useState } from"react";
import toast from"../../utils/toast";
import url from"../../url";

interface Props {
  examId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TestSeriesReviewModal({ examId, onClose, onSuccess }: Props) {
  const userStr = localStorage.getItem("edudocs");
  const user = userStr ? JSON.parse(userStr) : null;

  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const submitReview = async () => {
    if (!comment.trim()) {
      toast.error("Please provide a comment");
      return;
    }

    if (comment.length < 10) {
      toast.error("Comment must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${url}/test-series/review/${examId}/submit`, {
        method:"POST",
        headers: {
"Content-Type":"application/json",
          Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          rating,
          title,
          comment }) });

      const data = await res.json();

      if (data.success) {
        toast.success("Review submitted successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message ||"Failed to submit review");
      }
    } catch (err) {
      toast.error("Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Write a Review</h3>
          <button onClick={onClose}></button>
        </div>

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

        <input
          className="inp"
          placeholder="Review title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          className="inp"
          rows={5}
          placeholder="What did you think of the test series?"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        <div className="review-actions">
          <button 
            className="btn-primary" 
            onClick={submitReview}
            disabled={loading}
          >
            {loading ?"Submitting..." :"Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
