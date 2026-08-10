import React, { useState } from"react";
import { Link } from"react-router-dom";
import { ChevronDown } from"lucide-react";
import"./LowerBottom.css";

//  Static column definitions with 4+ items 
const FOOTER_COLUMNS = [
  {
    title:"UPSC / PCS",
    items: [
      { label:"UPSC CSE", path:"/exams-page" },
      { label:"UP PCS", path:"/exams-page" },
      { label:"Bihar PCS", path:"/exams-page" },
      { label:"MP PCS", path:"/exams-page" },
      { label:"NDA", path:"/exams-page" },
      { label:"CDS", path:"/exams-page" },
      { label:"State PSC", path:"/exams-page" },
    ]
  },
  {
    title:"SSC",
    items: [
      { label:"SSC CGL", path:"/exams-page" },
      { label:"SSC CHSL", path:"/exams-page" },
      { label:"SSC CPO", path:"/exams-page" },
      { label:"SSC GD", path:"/exams-page" },
      { label:"SSC MTS", path:"/exams-page" },
      { label:"SSC JE", path:"/exams-page" },
    ]
  },
  {
    title:"Banking",
    items: [
      { label:"IBPS PO", path:"/exams-page" },
      { label:"IBPS Clerk", path:"/exams-page" },
      { label:"IBPS RRB", path:"/exams-page" },
      { label:"SBI PO", path:"/exams-page" },
      { label:"SBI Clerk", path:"/exams-page" },
      { label:"RBI Grade B", path:"/exams-page" },
      { label:"SEBI Grade A", path:"/exams-page" },
    ]
  },
  {
    title:"Railway",
    items: [
      { label:"RRB NTPC", path:"/exams-page" },
      { label:"RRB Group D", path:"/exams-page" },
      { label:"RRB JE", path:"/exams-page" },
      { label:"RRB ALP", path:"/exams-page" },
      { label:"RRB Railways", path:"/exams-page" },
    ]
  },
  {
    title:"Courses",
    items: [
      { label:"All Courses", path:"/courses" },
      { label:"UPSC Prep", path:"/courses" },
      { label:"SSC Prep", path:"/courses" },
      { label:"Banking Prep", path:"/courses" },
      { label:"Railway Prep", path:"/courses" },
      { label:"State PSC", path:"/courses" },
    ]
  },
  {
    title:"Test Series",
    items: [
      { label:"Online Test Series", path:"/online-test-series" },
      { label:"UPSC Tests", path:"/online-test-series" },
      { label:"SSC Tests", path:"/online-test-series" },
      { label:"Banking Tests", path:"/online-test-series" },
      { label:"Railway Tests", path:"/online-test-series" },
      { label:"NEET Tests", path:"/online-test-series" },
    ]
  },
  {
    title:"Books",
    items: [
      { label:"All Books", path:"/all-books" },
      { label:"UPSC Books", path:"/all-books" },
      { label:"SSC Books", path:"/all-books" },
      { label:"Banking Books", path:"/all-books" },
      { label:"GATE Books", path:"/all-books" },
      { label:"NEET Books", path:"/all-books" },
    ]
  },
  {
    title:"Free Resources",
    items: [
      { label:"PYQs", path:"/previous-year-questions" },
      { label:"Syllabus", path:"/syllabus" },
      { label:"Current Affairs", path:"/current-affairs" },
      { label:"Job Alerts", path:"/jobs-notifications" },
      { label:"Study Notes", path:"/free-resources" },
      { label:"Practice Tests", path:"/online-test-series" },
    ]
  },
  {
    title:"More",
    items: [
      { label:"Free Resources", path:"/free-resources" },
      { label:"Blogs", path:"/grid-blog" },
      { label:"Success Stories", path:"/success-stories" },
      { label:"Download App", path:"/download-app" },
      { label:"About Us", path:"/about" },
      { label:"Meet the Team", path:"/teams" },
      { label:"Contact", path:"/contact" },
      { label:"Privacy Policy", path:"/privacy-policy" },
      { label:"Terms & Conditions", path:"/tnc" },
    ]
  },
];

const LIMIT = 4;

const FooterColumn: React.FC<{ col: typeof FOOTER_COLUMNS[0] }> = ({ col }) => {
  const [showMore, setShowMore] = useState(false);
  const visible = showMore ? col.items : col.items.slice(0, LIMIT);
  const hasMore = col.items.length > LIMIT;

  return (
    <div className="lb-column">
      <h6 className="lb-col-header">{col.title}</h6>
      <div className="lb-col-items">
        {visible.map((item, i) => (
          <Link key={i} to={item.path} className="lb-link">
            {item.label}
          </Link>
        ))}
        {hasMore && (
          <button
            className="lb-more-btn"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ?"Show Less" : `More ${col.title} `}
          </button>
        )}
      </div>
    </div>
  );
};

const LowerBottom: React.FC = () => {
  return (
    <section className="lb-section">
      <div className="container">
        <div className="lb-grid">
          {FOOTER_COLUMNS.map((col, i) => (
            <FooterColumn key={i} col={col} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LowerBottom;