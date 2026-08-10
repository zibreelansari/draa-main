// import React, { useState, useEffect } from"react";
// import axios from"axios";
// import"./FeatureHomeOne.css";
// import url from"../../../url";

// export default function FeatureHomeOne() {
//   const [examCategories, setExamCategories] = useState<any[]>([]);
//   const [examCards, setExamCards] = useState<any[]>([]);
//   const [activeTab, setActiveTab] = useState<string>();

//   /* ================= LOAD CATEGORIES ================= */
//   useEffect(() => {
//     loadCategories();
//   }, []);

//   const loadCategories = async () => {
//     try {
//       const res = await axios.get(`${url}/exam-categories/all`);
//       const categories = res.data.categories || [];

//       setExamCategories(categories);

//       if (categories.length > 0) {
//         setActiveTab(categories[0]._id);
//         loadExamsByCategory(categories[0]._id);
//       }
//     } catch (err) {
//       console.error("Failed to load categories");
//     }
//   };

//   /* ================= LOAD EXAMS ================= */
//   const loadExamsByCategory = async (categoryId: string) => {
//     try {
//       const res = await axios.get(
//         `${url}/exams/by-category/${categoryId}`
//       );

//       setExamCards(res.data.exams || []);
//     } catch (err) {
//       console.error("Failed to load exams");
//     }
//   };

//   /* ================= TAB CLICK ================= */
//   const handleTabClick = (categoryId: string) => {
//     setActiveTab(categoryId);
//     loadExamsByCategory(categoryId);
//   };

//   return (
//     <section className="popular-exams-section">
//       <div className="container">

//         {/* Header Row */}
//         <div className="exam-header">
//           <div className="title-area">
//             <h2 className="exam-main-title">Popular Exams</h2>
//             <p className="exam-sub-text">
//               Prepare for Indias most competitive exams
//             </p>
//           </div>
//           <button
//             className="explore-all-btn"
//             onClick={() => window.location.href ="/exams-page"}
//           >
//             Explore All Exams
//           </button>
//         </div>

//         {/* Category Tabs */}
//         <div className="exam-tabs">
//           {examCategories.map((tab) => (
//             <button
//               key={tab._id}
//               className={`tab-btn ${activeTab === tab._id ?"active" :""}`}
//               onClick={() => handleTabClick(tab._id)}
//             >
//               {tab.name}
//             </button>
//           ))}
//         </div>

//         {/* Cards Grid */}
//         <div className="exams-grid">
//           {examCards.length === 0 ? (
//             <p style={{ padding:"20px" }}>No exams available.</p>
//           ) : (
//             examCards.map((exam: any) => (
//               <div key={exam._id} className="exam-mini-card">
//                 <div className="card-top">
//                   <div className="exam-logo-circle">
//                     {exam.examImage ? (
//                       <img
//                         src={`${url}${exam.examImage}`}
//                         alt={exam.name}
//                         style={{
//                           width:"100%",
//                           height:"100%",
//                           objectFit:"cover",
//                           borderRadius:"50%"
//                         }}
//                       />
//                     ) : (
//                       <div className="dummy-logo" />
//                     )}
//                   </div>

//                   <p className="exam-card-title">
//                     {exam.name}
//                   </p>
//                 </div>

//                 <button
//                   className="mini-explore-btn"
//                   onClick={() =>
//                     window.location.href = `/exams/${exam.slug}`
//                   }
//                 >
//                   Explore More
//                 </button>
//               </div>
//             ))
//           )}
//         </div>

//       </div>
//     </section>
//   );
// }


import React, { useState, useLayoutEffect } from"react";

const MOBILE_HEADER_MQ ="(max-width: 640px)";
const DESKTOP_GRID_MQ ="(min-width: 1025px)";

function useMobileHeaderLayout() {
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_HEADER_MQ);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return isMobile;
}

function useDesktopFourCardLayout() {
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia(DESKTOP_GRID_MQ);
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return isDesktop;
}

const tabs = ["SSC","Teaching","Civil Services","Railways","Law & Judiciary"];

const examCards = [
  {
    id: 1,
    name:"Staff Selection Commission  Combined Graduate Level",
    logo:"https://indianexpress.com/wp-content/uploads/2018/12/SSClogo759.jpg",
    slug:"ssc-cgl",
  },
  {
    id: 2,
    name:"Central Board of Secondary Education",
    logo:"https://www.ameyaworldschool.in/idea/2017/03/cbse-logo-300x259.png",
    slug:"cbse-1",
  },
  {
    id: 3,
    name:"Union Public Service Commission",
    logo:"https://thecsrjournal.in/wp-content/uploads/2025/10/UPSC-Logo.webp",
    slug:"upsc",
  },
  {
    id: 4,
    name:"National Testing Agency",
    logo:"https://d35xcwcl37xo08.cloudfront.net/current-affairs-wp-uploads/2025/04/national_testing_agency.webp",
    slug:"nta",
  },
  {
    id: 5,
    name:"Staff Selection Commission  Combined Graduate Level",
    logo:"https://indianexpress.com/wp-content/uploads/2018/12/SSClogo759.jpg",
    slug:"ssc-cgl-2",
  },
  {
    id: 6,
    name:"Central Board of Secondary Education",
    logo:"https://www.ameyaworldschool.in/idea/2017/03/cbse-logo-300x259.png",
    slug:"cbse-4",
  },
  {
    id: 7,
    name:"Central Board of Secondary Education",
    logo:"https://www.ameyaworldschool.in/idea/2017/03/cbse-logo-300x259.png",
    slug:"cbse-5",
  },
  {
    id: 8,
    name:"Central Board of Secondary Education",
    logo:"https://www.ameyaworldschool.in/idea/2017/03/cbse-logo-300x259.png",
    slug:"cbse-6",
  },
];

export default function FeatureHomeOne() {
  const [activeTab, setActiveTab] = useState("SSC");
  const isMobileHeader = useMobileHeaderLayout();
  const isDesktopGrid = useDesktopFourCardLayout();

  return (
    <section style={{ ...styles.section, ...(isMobileHeader ? styles.sectionMobile : {}) }}>
      <div style={{ ...styles.container, ...(isMobileHeader ? styles.containerMobile : {}) }}>

        {/* Header Row */}
        <div style={{ ...styles.examHeader, ...(isMobileHeader ? styles.examHeaderMobile : {}) }}>
          <div style={isMobileHeader ? styles.titleBlockMobile : undefined}>
            <h2 style={{ ...styles.mainTitle, ...(isMobileHeader ? styles.mainTitleMobile : {}) }}>
              Popular Exams
            </h2>
            <p style={{ ...styles.subText, ...(isMobileHeader ? styles.subTextMobile : {}) }}>
              Prepare for India's most competitive exams
            </p>
          </div>
          <button
            type="button"
            style={{ ...styles.exploreAllBtn, ...(isMobileHeader ? styles.exploreAllBtnMobile : {}) }}
            onMouseEnter={e => (e.currentTarget.style.background ="#4a5be0")}
            onMouseLeave={e => (e.currentTarget.style.background ="#bd7b20")}
            onClick={() => (window.location.href ="/exams-page")}
          >
            Explore All Exams
          </button>
        </div>

        {/* Category Tabs */}
        <div style={styles.tabsRow}>
          {tabs.map((tab) => (
            <button
              key={tab}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab ? styles.tabBtnActive : {}),
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div style={{ ...styles.grid, ...(isDesktopGrid ? styles.gridDesktop4 : {}) }}>
          {examCards.map((exam) => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>

      </div>
    </section>
  );
}

function ExamCard({ exam }: { exam: any }) {
  const [hovered, setHovered] = useState(false);
  const [btnHovered, setBtnHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const initial = exam.name.charAt(0).toUpperCase();

  return (
    <div
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.cardTop}>
        <div style={styles.logoCircle}>
          {!imgError ? (
            <img
              src={exam.logo}
              alt={exam.name}
              style={styles.logoImg}
              onError={() => setImgError(true)}
            />
          ) : (
            <div style={styles.logoFallback}>{initial}</div>
          )}
        </div>
        <p style={styles.cardTitle}>{exam.name}</p>
      </div>

      <button
        style={{
          ...styles.exploreBtn,
          ...(btnHovered ? styles.exploreBtnHover : {}),
        }}
        onMouseEnter={() => setBtnHovered(true)}
        onMouseLeave={() => setBtnHovered(false)}
        onClick={() => (window.location.href = `/exams/${exam.slug}`)}
      >
        Explore More
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: {
    padding:"80px 0",
    backgroundColor:"#ffffff",
    fontFamily:"'Segoe UI', sans-serif",
    maxWidth:"100%",
    boxSizing:"border-box",
  },
  container: {
    maxWidth:"1200px",
    margin:"0 auto",
    padding:"0 24px",
    boxSizing:"border-box",
  },
  containerMobile: {
    padding:"0 16px",
    maxWidth:"100%",
  },
  sectionMobile: {
    padding:"48px 0",
    overflowX:"hidden",
  },
  examHeader: {
    display:"flex",
    justifyContent:"space-between",
    alignItems:"flex-start",
    marginBottom:"40px",
  },
  examHeaderMobile: {
    flexDirection:"column",
    alignItems:"stretch",
    justifyContent:"flex-start",
    gap:"14px",
    marginBottom:"28px",
  },
  titleBlockMobile: {
    width:"100%",
    textAlign:"center",
    boxSizing:"border-box",
  },
  mainTitle: {
    fontSize:"42px",
    fontWeight: 800,
    color:"#111827",
    margin:"0 0 8px 0",
    lineHeight: 1.15,
  },
  mainTitleMobile: {
    fontSize:"26px",
    margin:"0 0 6px 0",
    letterSpacing:"-0.02em",
  },
  subText: {
    fontSize:"16px",
    color:"#6b7280",
    margin: 0,
    lineHeight: 1.5,
  },
  subTextMobile: {
    fontSize:"14px",
    padding:"0 4px",
  },
  exploreAllBtn: {
    background:"#bd7b20",
    color:"#fff",
    padding:"14px 32px",
    borderRadius:"10px",
    fontWeight: 700,
    border:"none",
    cursor:"pointer",
    fontSize:"15px",
    transition:"background 0.2s",
    whiteSpace:"nowrap" as const,
    flexShrink: 0,
    boxSizing:"border-box" as const,
  },
  exploreAllBtnMobile: {
    width:"100%",
    maxWidth:"100%",
    padding:"10px 14px",
    fontSize:"13px",
    borderRadius:"8px",
    alignSelf:"stretch",
    whiteSpace:"normal" as const,
    lineHeight: 1.25,
  },
  tabsRow: {
    display:"flex",
    gap:"10px",
    marginBottom:"32px",
    flexWrap:"wrap" as const,
  },
  tabBtn: {
    background:"#fff",
    border:"1.5px solid #e5e7eb",
    padding:"9px 22px",
    borderRadius:"8px",
    fontWeight: 600,
    color:"#374151",
    cursor:"pointer",
    fontSize:"14px",
    transition:"all 0.2s",
  },
  tabBtnActive: {
    background:"#f7f1e5",
    borderColor:"#bd7b20",
    color:"#bd7b20",
  },
  grid: {
    display:"grid",
    // Responsive grid:
    // - Using auto-fit + minmax so mobile wraps to ~2 cards/row (instead of forcing 4 columns).
    // - Prevents cramped cards that look like they are overlapping.
    gridTemplateColumns:"repeat(auto-fit, minmax(160px, 1fr))",
    gap:"20px",
  },
  gridDesktop4: {
    gridTemplateColumns:"repeat(4, minmax(0, 1fr))",
  },
  card: {
    background:"rgba(246, 246, 246, 1)",
    border:"none",
    borderRadius:"16px",
    padding:"20px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    transition:"all 0.3s ease",
    cursor:"default",
    minHeight:"160px",
  },
  cardHover: {
    background:"#fff",
    boxShadow:"0 10px 25px rgba(0,0,0,0.08)",
  },
  cardTop: {
    display:"flex",
    gap:"14px",
    alignItems:"flex-start",
    marginBottom:"20px",
  },
  logoCircle: {
    width:"48px",
    height:"48px",
    background:"#e8eaf6",
    borderRadius:"50%",
    flexShrink: 0,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    overflow:"hidden",
  },
  logoImg: {
    width:"40px",
    height:"40px",
    objectFit:"contain" as const,
    display:"block",
  },
  logoFallback: {
    width:"40px",
    height:"40px",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontSize:"18px",
    fontWeight: 700,
    color:"#bd7b20",
    background:"#f7f1e5",
    borderRadius:"50%",
  },
  cardTitle: {
    // Clamp keeps titles readable on small screens.
    fontSize:"clamp(12px, 3.2vw, 13px)",
    fontWeight: 600,
    color:"#1f2937",
    lineHeight: 1.45,
    margin: 0,
    overflowWrap:"break-word",
  },
  exploreBtn: {
    width:"100%",
    background:"#fff",
    border:"none",
    padding:"10px",
    borderRadius:"10px",
    color:"#bd7b20",
    fontWeight: 700,
    fontSize:"clamp(13px, 3.4vw, 14px)",
    cursor:"pointer",
    transition:"all 0.2s",
    boxSizing:"border-box" as const,
  },
  exploreBtnHover: {
    background:"#bd7b20",
    color:"#fff",
    borderColor:"#bd7b20",
  },
};