import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Calendar, BookOpen, Download } from "lucide-react";
import axios from "axios";
import url from "../../../url";
import "./LatestSyllabus.css";

interface SyllabusItem {
  _id: string;
  examName: string;
  examCategory?: string;
  title: string;
  description: string;
  subjects?: string[];
  syllabusPDF: string;
}

export default function LatestSyllabus() {
  const [syllabuses, setSyllabuses] = useState<SyllabusItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestSyllabus = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${url}/syllabus/approved`);
        const allSyllabuses = res.data.syllabuses || [];
        // The API sorts by createdAt desc. We take the first 4 latest items
        setSyllabuses(allSyllabuses.slice(0, 4));
      } catch (err) {
        console.error("Failed to fetch latest syllabus:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatestSyllabus();
  }, []);

  if (loading) {
    return (
      <section className="latest-syllabus-section">
        <div className="container">
          <div className="syllabus-header">
            <div className="syllabus-title-group">
              <h2 className="syllabus-main-title">Latest Official Syllabus</h2>
              <p className="syllabus-sub-text">Stay updated with the latest exam structures and official syllabi.</p>
            </div>
          </div>
          <div className="syllabus-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="syllabus-card-skeleton sk-shimmer" style={{ height: 200, borderRadius: 16 }} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (syllabuses.length === 0) return null;

  return (
    <section className="latest-syllabus-section">
      <div className="container">
        {/* HEADER */}
        <div className="syllabus-header">
          <div className="syllabus-title-group">
            <h2 className="syllabus-main-title">Latest Official Syllabus</h2>
            <p className="syllabus-sub-text">Review the structure, subject weightages, and marking schemes for upcoming exams.</p>
          </div>
          <Link to="/syllabus" className="syllabus-view-all-btn">
            Explore All Syllabus
          </Link>
        </div>

        {/* GRID */}
        <div className="syllabus-grid">
          {syllabuses.map((syllabus) => (
            <div key={syllabus._id} className="syllabus-item-card">
              <div className="syllabus-card-accent"></div>
              
              {/* Card Header */}
              <div className="syllabus-card-top">
                <span className="syllabus-tag-category">
                  {syllabus.examCategory || "General Exam"}
                </span>
                {syllabus.subjects && syllabus.subjects.length > 0 && (
                  <span className="syllabus-tag-subjects">
                    {syllabus.subjects.length} Subjects
                  </span>
                )}
              </div>

              {/* Card Title */}
              <h3 className="syllabus-card-title">{syllabus.title || `${syllabus.examName} Syllabus`}</h3>
              <p className="syllabus-card-desc">
                {syllabus.description
                  ? syllabus.description.slice(0, 100) + (syllabus.description.length > 100 ? "..." : "")
                  : "Official exam structure, mark distribution, and detailed topic-wise syllabus breakdown."}
              </p>

              {/* Actions */}
              <div className="syllabus-card-actions">
                <button
                  className="syllabus-action-btn view-btn"
                  onClick={() => window.open(`/view-resource/syllabus/${syllabus._id}`, "_blank")}
                >
                  <BookOpen size={14} />
                  View Syllabus
                </button>
                <button
                  className="syllabus-action-btn download-btn"
                  onClick={() => {
                    const finalUrl = syllabus.syllabusPDF.startsWith("http")
                      ? syllabus.syllabusPDF
                      : `${url}/${syllabus.syllabusPDF.replace(/\\/g, "/")}`;
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
