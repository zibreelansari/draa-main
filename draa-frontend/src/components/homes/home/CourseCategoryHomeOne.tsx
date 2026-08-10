import React, { useState, useEffect, useCallback } from'react';
import { Link, useNavigate } from'react-router-dom';
import { Spin, Empty } from'antd';
import { ArrowRight } from'lucide-react';
import url from'../../../url';
import'./CourseCategoryHomeOne.css';
import StylishEmptyState from'../../common/StylishEmptyState';

/* ================= TYPES ================= */
interface CourseCategory {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;          //  DYNAMIC ICON CLASS
  isActive: boolean;
  slug?: string;
  keywords?: string[];
  courseCount?: number;
}

export default function CourseCategoryHomeOne() {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /* ================= FETCH ================= */
  const fetchCourseCategories = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `${url}/course/categories?active=true&includeCount=true`
      );
      const data = await res.json();

      const list: CourseCategory[] = Array.isArray(data?.data?.categories)
        ? data.data.categories.filter((c: CourseCategory) => c.isActive)
        : [];

      // Sort by popularity (courseCount)
      list.sort(
        (a, b) => (b.courseCount || 0) - (a.courseCount || 0)
      );

      setCategories(list.slice(0, 6)); // Top 6
    } catch (err: any) {
      console.error(err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourseCategories();
  }, [fetchCourseCategories]);

  /* ================= HANDLER ================= */
  const handleCategoryClick = (cat: CourseCategory) => {
    navigate(`/courses/category/${cat.slug || cat._id}`);
  };

  /* ================= UI ================= */
  return (
    <section className="courses-by-category">
      <div className="container">

        {/* ===== HEADER ===== */}
        <div className="category-header">
          <div className="title-area">
            <h2 className="main-title">Courses by Category</h2>
            <p className="sub-text">
              Prepare for Indias most competitive exams
            </p>
          </div>
          <Link to="/courses" className="explore-all-btn">
            Explore All Courses
          </Link>
        </div>

        {/* ===== GRID ===== */}
        <div className="category-grid">
          {loading ? (
            <div className="loader-box">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div style={{ gridColumn:'1 / -1', padding:'40px 0', width:'100%' }}>
              <StylishEmptyState 
                title="Connection Error"
                description={error}
                actionText="Retry Loading"
                onAction={fetchCourseCategories}
                showBack={false}
              />
            </div>
          ) : categories.length === 0 ? (
            <div style={{ gridColumn:'1 / -1', padding:'40px 0', width:'100%' }}>
              <StylishEmptyState 
                title="No Categories Available"
                description="We are currently organizing our course catalog into new specialized categories. Check back soon for structured learning paths!"
                actionText="View All Courses"
                actionPath="/courses"
                showBack={false}
              />
            </div>
          ) : (
            categories.map((cat) => (
              <div
                key={cat._id}
                className="figma-cat-card"
                onClick={() => handleCategoryClick(cat)}
                role="button"
                tabIndex={0}
              >
                {/* ===== CARD TOP ===== */}
                {/* ===== CARD TOP ===== */}
                <div className="card-top">
                  <div
                    className="icon-circle"
                    style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                      // Add a dynamic colored drop-shadow and inset shadow for a 3D sphere look
                      boxShadow: `0 8px 16px ${cat.color}35, inset 0 -3px 6px rgba(0,0,0,0.1)`
                    }}
                  >
                    {/*  FULLY DYNAMIC ICON */}
                    <i
                      className={cat.icon ||'bx bx-category'}
                      style={{ fontSize: 26 }}
                    />
                  </div>

                  <h3 className="card-cat-name">{cat.name}</h3>
                </div>

                {/* ===== KEYWORDS ===== */}
                <div className="tag-group">
                  {cat.keywords && cat.keywords.length > 0 ? (
                    cat.keywords.slice(0, 3).map((k, i) => (
                      <span key={i} className="mini-tag">
                        {k}
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="mini-tag">Beginner</span>
                      <span className="mini-tag">Online</span>
                    </>
                  )}

                  {cat.courseCount ? (
                    <span className="mini-tag course-count-tag">
                      {cat.courseCount} courses
                    </span>
                  ) : null}
                </div>

                {/* ===== FOOTER ===== */}
                <div className="explore-link">
                  <span>Explore Category</span>
                  <ArrowRight size={18} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}