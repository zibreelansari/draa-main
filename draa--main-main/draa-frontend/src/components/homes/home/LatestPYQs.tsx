import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Calendar, Clock, Download, ArrowRight, BookOpen } from "lucide-react";
import axios from "axios";
import url from "../../../url";
import "./LatestPYQs.css";

interface PYQItem {
  _id: string;
  examName: string;
  examCategory?: string;
  year: number;
  shift?: string;
  paper?: string;
  examStage?: string;
  title: string;
  totalQuestions?: number;
  totalMarks?: number;
  duration?: number;
  questionPaperPDF: string;
}

export default function LatestPYQs() {
  const [pyqs, setPyqs] = useState<PYQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPYQs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/pyq/approved`);
        const allPyqs = res.data.pyqs || [];
        // The API sorts by year desc, createdAt desc. We just take the first 4 latest items
        setPyqs(allPyqs.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch latest PYQs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestPYQs();
  }, []);

  if (loading) {
    return (
      <section className="latest-pyqs-section">
        <div className="container">
          <div className="pyqs-header">
            <div className="pyqs-title-group">
              <h2 className="pyqs-main-title">Latest Previous Year Questions</h2>
              <p className="pyqs-sub-text">Access recently uploaded official exam question papers.</p>
            </div>
          </div>
          <div className="pyqs-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="pyq-card-skeleton sk-shimmer" style={{ height: 200, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (pyqs.length === 0) return null;

  return (
    <section className="latest-pyqs-section">
      <div className="container">
        {/* HEADER */}
        <div className="pyqs-header">
          <div className="pyqs-title-group">
            <h2 className="pyqs-main-title">Latest Previous Year Papers (PYQs)</h2>
            <p className="pyqs-sub-text">Practice with real question papers from actual past examinations.</p>
          </div>
          <Link to="/previous-year-questions" className="pyqs-view-all-btn">
            Explore All PYQs
          </Link>
        </div>

        {/* GRID */}
        <div className="pyqs-grid">
          {pyqs.map((pyq) => (
            <div key={pyq._id} className="pyq-item-card">
              <div className="pyq-card-accent"></div>
              
              {/* Card Header */}
              <div className="pyq-card-top">
                <span className="pyq-tag-year">
                  <Calendar size={12} />
                  {pyq.year}
                </span>
                <span className="pyq-tag-stage">{pyq.examStage || "General"}</span>
              </div>

              {/* Card Title */}
              <h3 className="pyq-card-title">{pyq.title || `${pyq.examName} Paper`}</h3>
              <p className="pyq-card-exam">{pyq.examName} {pyq.paper ? `· ${pyq.paper}` : ""}</p>

              {/* Stats */}
              <div className="pyq-card-stats">
                {pyq.totalQuestions && (
                  <div className="pyq-stat">
                    <strong>{pyq.totalQuestions}</strong>
                    <span>Questions</span>
                  </div>
                )}
                {pyq.duration && (
                  <div className="pyq-stat border-left">
                    <Clock size={12} />
                    <strong>{pyq.duration} mins</strong>
                  </div>
                )}
                {pyq.totalMarks && (
                  <div className="pyq-stat border-left">
                    <strong>{pyq.totalMarks}</strong>
                    <span>Marks</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pyq-card-actions">
                <button
                  className="pyq-action-btn view-paper-btn"
                  onClick={() => window.open(`/view-resource/pyq/${pyq._id}`, "_blank")}
                >
                  <BookOpen size={14} />
                  View Online
                </button>
                <button
                  className="pyq-action-btn download-btn"
                  onClick={() => {
                    const finalUrl = pyq.questionPaperPDF.startsWith("http")
                      ? pyq.questionPaperPDF
                      : `${url}/${pyq.questionPaperPDF.replace(/\\/g, "/")}`;
                    window.open(finalUrl, "_blank");
                  }}
                >
                  <Download size={14} />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
