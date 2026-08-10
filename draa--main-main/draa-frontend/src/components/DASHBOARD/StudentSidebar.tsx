import React, { useLayoutEffect } from"react";
import toast from '../../utils/toast';
import { Link, useNavigate } from"react-router-dom";
import { Icons, Avatar } from"./SharedDashboardAssets"; // We'll create this helper file below
import GiftOutlined from"@ant-design/icons/lib/icons/GiftOutlined";
import { BarChartOutlined, BookOutlined, CalendarOutlined, DashboardOutlined, EditOutlined, FileTextOutlined, HeartOutlined, HomeOutlined, LogoutOutlined, MessageOutlined, ShoppingCartOutlined, ThunderboltOutlined, UserOutlined, VideoCameraOutlined } from"@ant-design/icons";
import { TrophyOutlined } from"@ant-design/icons";
import { SettingOutlined } from"@ant-design/icons";

interface StudentSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  loginUser: any;
  stats?: any;
}

const StudentSidebar: React.FC<StudentSidebarProps> = ({ isOpen, setIsOpen, loginUser, stats }) => {
  const navigate = useNavigate();
  const MOBILE_TABLET_MQ = "(max-width: 768px)";

  const isMobileOrTablet = () => {
    if (typeof window ==="undefined") return false;
    return window.matchMedia(MOBILE_TABLET_MQ).matches;
  };

  useLayoutEffect(() => {
    if (typeof window ==="undefined") return;
    const mq = window.matchMedia(MOBILE_TABLET_MQ);
    const syncSidebarState = () => {
      if (mq.matches) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    // Keep sidebar closed by default on 320/375/425/720 screens.
    syncSidebarState();
    mq.addEventListener("change", syncSidebarState);
    return () => mq.removeEventListener("change", syncSidebarState);
  }, [setIsOpen]);

  const logoutHandler = () => {
    localStorage.removeItem("edudocs");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const userName = loginUser?.name ??"Student";

  return (
    <aside className={`sidebar ${isOpen ?"" :"closed"}`} style={{ position:"relative" }}>
      {isMobileOrTablet() && (
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => setIsOpen(false)}
          style={{
            position:"absolute",
            top: 10,
            right: 10,
            zIndex: 2,
            border:"1px solid var(--edge2)",
            background:"var(--surface)",
            width: 34,
            height: 34,
            borderRadius: 10,
            lineHeight: 1,
            fontSize: 18,
            fontWeight: 700,
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            boxShadow:"0 4px 12px rgba(13,12,29,.12)",
            transition:"transform .14s ease, box-shadow .2s ease"
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform ="scale(0.93)"; }}
          onMouseUp={(e) => { e.currentTarget.style.transform ="scale(1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform ="scale(1)"; }}
          aria-label="Close sidebar"
        >
          ×
        </button>
      )}
      {/* Logo */}
      <div style={{ padding:"20px 20px 16px", borderBottom:"1px solid var(--edge2)", display:"flex", justifyContent:"center" }}>
        <div style={{
          width: 200, height: 70,
          display:"flex", alignItems:"center", justifyContent:"center"
        }}>
          <img src="/EduDocsNewLogo.png" alt="logo" style={{ width:'100%', height:'100%', objectFit:'contain' }} />
        </div>
      </div>

      {/* User pill */}
      {/* <div style={{ margin:"14px 12px 6px", padding:"11px 13px", borderRadius: 12, background:"var(--accent-bg)", border:"1px solid var(--edge)" }}>
        <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
          <Avatar name={userName} size={32} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{userName}</div>
            {stats && (
              <div style={{ fontSize: 11, color:"var(--accent)", fontWeight: 700, marginTop: 1 }}>
                 {stats?.learningStreak?.currentStreak || 0}d streak
              </div>
            )}
          </div>
        </div>
      </div> */}

      {/* Nav */}
      <nav style={{ flex: 1, overflowY:"auto", paddingBottom: 12 }}>

        <div className="nav-label" style={{ marginTop: 10, textTransform:'uppercase' }}>MAIN</div>

        {[
          { key:"1", icon: <DashboardOutlined />, label:"Dashboard", to:"/student-dashboard" },

          { key:"2", icon: <BookOutlined />, label:"My Courses", to: `/sudent/my-courses/${loginUser.id}` },

          { key:"3", icon: <FileTextOutlined />, label:"My Books", to: `/sudent/my-books/purchased/${loginUser.id}` },

          { key:"4", icon: <ThunderboltOutlined />, label:"My Test Series", to: `/v2/student/my-test-series/${loginUser.id || loginUser._id}` },

          { key:"5", icon: <CalendarOutlined />, label:"Exams", to:"/student/my-exams" },

          { 
            key:"6", 
            icon: (
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none" style={{ marginTop: 2 }}>
                <rect width="40" height="20" x="4" y="14" rx="4" fill="#ff4d4f" />
                <text x="24" y="28" fill="white" fontSize="11" fontWeight="800" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.5">LIVE</text>
              </svg>
            ), 
            label:"Live Sessions", 
            to:"/students/my-live-sessions" 
          },

          { key:"7", icon: <BarChartOutlined />, label:"Results", to:"/v2/student/exam-results" },

          { key:"8", icon: <HeartOutlined />, label:"Wishlist", to:"/student/wishlist" },

          { key:"9", icon: <ShoppingCartOutlined />, label:"Purchases", to:"/student/purchases" },

          { key:"10", icon: <EditOutlined />, label:"Blogs Writing", to:"/v2/student/blogs" },

          { key:"11", icon: <GiftOutlined />, label:"Rewards", to:"/student/my-rewards" },
          
          { key:"12", icon: <MessageOutlined />, label:"Support", to:"/support" },

        ].map((item) => {

          const isActive = window.location.pathname === item.to || (item.to !== "/" && window.location.pathname.startsWith(item.to + "/"));

          return (
            <Link
              key={item.key}
              to={item.to}
              style={{ textDecoration:"none" }}
              onClick={() => {
                if (isMobileOrTablet()) setIsOpen(false);
              }}
            >
              <div className={`nav-item ${isActive ?"active" :""}`}>

                <span
                  className="nav-icon"
                  style={{
                    display:"flex",
                    alignItems:"center",
                    marginRight: 10,
                    fontSize: 17,
                    color: isActive ?"#6366f1" :"inherit",
                  }}
                >
                  {item.icon}
                </span>

                {item.label}

              </div>
            </Link>
          );
        })}

        <div className="nav-label" style={{ marginTop: 10, textTransform:'uppercase' }}>ACCOUNT</div>

        <Link
          to="/student/profile"
          style={{ textDecoration:"none" }}
          onClick={() => {
            if (isMobileOrTablet()) setIsOpen(false);
          }}
        >
          <div className={`nav-item ${window.location.pathname ==="/student/profile" ?"active" :""}`}>
            <UserOutlined style={{ marginRight: 10 }} />
            My Profile
          </div>
        </Link>

        <Link
          to="/v2/student/leaderboard"
          style={{ textDecoration:"none" }}
          onClick={() => {
            if (isMobileOrTablet()) setIsOpen(false);
          }}
        >
          <div className={`nav-item ${window.location.pathname ==="/v2/student/leaderboard" ?"active" :""}`}>
            <TrophyOutlined style={{ marginRight: 10 }} />
            Leaderboard
          </div>
        </Link>

        <Link
          to="/v2/student/settings"
          style={{ textDecoration:"none" }}
          onClick={() => {
            if (isMobileOrTablet()) setIsOpen(false);
          }}
        >
          <div className={`nav-item ${window.location.pathname ==="/v2/student/settings" ?"active" :""}`}>
            <SettingOutlined style={{ marginRight: 10 }} />
            Settings
          </div>
        </Link>

        <Link
          to="/"
          style={{ textDecoration:"none" }}
          onClick={() => {
            if (isMobileOrTablet()) setIsOpen(false);
          }}
        >
          <div className="nav-item">
            <HomeOutlined style={{ marginRight: 10 }} />
            Home
          </div>
        </Link>

        <div className="nav-item" style={{ color:"#ef4444" }} onClick={logoutHandler}>
          <LogoutOutlined style={{ marginRight: 10 }} />
          Logout
        </div>

      </nav>

      {/* Upgrade CTA */}
      {/* <div style={{ margin:"8px 12px 18px", borderRadius: 14, overflow:"hidden", background:"linear-gradient(135deg,#1a1040,#2d1b69,#4c1d95)", padding:"16px", position:"relative" }}>
        <div style={{ position:"absolute", top: -20, right: -20, width: 80, height: 80, borderRadius:"50%", background:"rgba(94,107,255,.3)", filter:"blur(20px)" }} />
        <div style={{ position:"relative" }}>
          <div style={{ fontSize: 22, marginBottom: 6 }}></div>
          <div style={{ fontWeight: 800, fontSize: 13, color:"white", marginBottom: 3 }}>Go Premium</div>
          <div style={{ fontSize: 11, color:"rgba(255,255,255,.65)", marginBottom: 10, lineHeight: 1.4 }}>Unlock all courses & features</div>
          <div style={{ background:"rgba(255,255,255,.15)", borderRadius: 8, padding:"6px 10px", fontSize: 11, fontWeight: 700, color:"white", textAlign:"center", cursor:"pointer", border:"1px solid rgba(255,255,255,.25)" }}>
            Upgrade Now 
          </div>
        </div>
      </div> */}
    </aside>
  );
};

export default StudentSidebar;