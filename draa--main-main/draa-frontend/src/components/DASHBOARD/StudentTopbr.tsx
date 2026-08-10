import React, { useState, useRef, useEffect, useLayoutEffect } from"react";
import toast from '../../utils/toast';
import { Link, useNavigate } from"react-router-dom";
import { Icons, Avatar } from"./SharedDashboardAssets";

interface StudentHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (val: any) => void;
  loginUser: any;
  notifications?: number;
  currentPage: string;
}

const StudentHeader: React.FC<StudentHeaderProps> = ({ sidebarOpen, setSidebarOpen, loginUser, notifications = 0, currentPage }) => {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isCompactTopbar, setIsCompactTopbar] = useState(false);
  const [isVerySmallScreen, setIsVerySmallScreen] = useState(false);
  const [isMobileSidebarRange, setIsMobileSidebarRange] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useLayoutEffect(() => {
    if (typeof window ==="undefined") return;

    const compactMq = window.matchMedia("(max-width: 768px)");
    const tinyMq = window.matchMedia("(max-width: 420px)");
    const sidebarMq = window.matchMedia("(max-width: 768px)");

    const syncTopbarMode = () => {
      setIsCompactTopbar(compactMq.matches);
      setIsVerySmallScreen(tinyMq.matches);
      setIsMobileSidebarRange(sidebarMq.matches);
    };

    syncTopbarMode();
    compactMq.addEventListener("change", syncTopbarMode);
    tinyMq.addEventListener("change", syncTopbarMode);
    sidebarMq.addEventListener("change", syncTopbarMode);

    return () => {
      compactMq.removeEventListener("change", syncTopbarMode);
      tinyMq.removeEventListener("change", syncTopbarMode);
      sidebarMq.removeEventListener("change", syncTopbarMode);
    };
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("edudocs");
    toast.success("Logged out successfully");
    navigate("/");
  };

  const rawName = loginUser.name || loginUser.student_name || loginUser.aname || loginUser.tname || "";
  const firstName = rawName.trim() ? rawName.trim().split(" ")[0] : "Student";

  return (
    <>
      <style>{`
      .sidebar-toggle-press {
        transition: transform .14s ease, box-shadow .2s ease;
      }
      .sidebar-toggle-press:active {
        transform: scale(0.93);
      }
    `}</style>
      {isMobileSidebarRange && !sidebarOpen && (
        <button
          className="btn btn-ghost btn-icon sidebar-toggle-press"
          onClick={() => setSidebarOpen((v: boolean) => !v)}
          style={{
            position:"fixed",
            top: 10,
            left: 10,
            zIndex: 450,
            border:"1px solid var(--edge2)",
            background:"var(--surface)",
            boxShadow:"0 4px 14px rgba(13,12,29,.12)"
          }}
          aria-label={sidebarOpen ?"Close sidebar" :"Open sidebar"}
        >
          {sidebarOpen ?"×" : Icons.menu?.(18)}
        </button>
      )}
      <header className="topbar" style={{ gap: isCompactTopbar ? 8 : 12, padding: isCompactTopbar ?"0 10px 0 52px" : undefined }}>
        {!isMobileSidebarRange && (
          <button className="btn btn-ghost btn-icon sidebar-toggle-press" onClick={() => setSidebarOpen((v: boolean) => !v)}>
            {Icons.menu?.(18)}
          </button>
        )}

        {/* Breadcrumb */}
        <div style={{ display:"flex", alignItems:"center", gap: 6, marginRight:"auto", minWidth: 0 }}>
          <span style={{ color:"var(--ink3)", fontSize: 13 }}>Draa</span>
          {!isVerySmallScreen && <span style={{ color:"var(--ink3)" }}>{Icons.chevron?.(13,"var(--ink3)")}</span>}
          {!isVerySmallScreen && (
            <span style={{ color:"var(--ink)", fontSize: 13, fontWeight: 700, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
              {currentPage}
            </span>
          )}
        </div>

        {/* Search */}
        {!isCompactTopbar && <div style={{ position:"relative", width: 260 }}>
          <div style={{ position:"absolute", left: 11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", opacity: .5 }}>
            {Icons.search?.(15)}
          </div>
          <input placeholder="Search courses, books" className="search-input" style={{
            width:"100%", padding:"8px 14px 8px 34px", borderRadius: 99,
            border:"1px solid var(--edge2)", background:"var(--surface)",
            fontSize: 13, color:"var(--ink)", outline:"none", fontFamily:"var(--body)"
          }} />
        </div>}

        {/* Bell */}
        {!isVerySmallScreen && <div style={{ position:"relative" }}>
          <button className="btn btn-ghost btn-icon">
            {Icons.bell?.(18)}
            {notifications > 0 && <div className="pulse-ring" style={{ position:"absolute", top: 7, right: 7, width: 8, height: 8, background:"#ef4444", borderRadius:"50%", border:"2px solid var(--surface2)" }} />}
          </button>
          {notifications > 0 && <div style={{ position:"absolute", top: 4, right: 4, width: 16, height: 16, borderRadius:"50%", background:"#ef4444", color:"white", fontSize: 9, fontWeight: 800, display:"flex", alignItems:"center", justifyContent:"center" }}>{notifications}</div>}
        </div>}

        {/* Profile */}
        <div ref={profileRef} style={{ position:"relative" }}>
          <button onClick={() => setProfileOpen(v => !v)} style={{ display:"flex", alignItems:"center", gap: 8, padding: isCompactTopbar ?"4px 8px 4px 4px" :"5px 12px 5px 6px", border:"1px solid var(--edge2)", borderRadius: 99, background:"var(--surface)", cursor:"pointer" }}>
            <Avatar name={loginUser.name ||"S"} size={28} />
            {!isCompactTopbar && <span style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)" }}>{firstName}</span>}
          </button>
          {profileOpen && (
            <div style={{ position:"absolute", right: 0, top:"calc(100% + 8px)", background:"var(--surface)", border:"1px solid var(--edge2)", borderRadius: 12, boxShadow:"var(--sh2)", minWidth: 180, zIndex: 300, overflow:"hidden" }}>
              <Link to="/student/profile" style={{ textDecoration:"none" }} onClick={() => setProfileOpen(false)}>
                <div className="dropdown-item">{Icons.user?.(15,"var(--ink2)")} My Profile</div>
              </Link>
              <div style={{ height: 1, background:"var(--edge2)" }} />
              <div onClick={logoutHandler} className="dropdown-item" style={{ color:"#ef4444" }}>{Icons.logout?.(15,"#ef4444")} Logout</div>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default StudentHeader;