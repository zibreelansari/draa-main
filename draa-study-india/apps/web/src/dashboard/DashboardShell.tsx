import type { PublicUser, UserRole } from "@draa/shared";
import {
  Bell,
  BookOpenText,
  Building2,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  FileText,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, authApi } from "../lib/api";
import type { NotificationItem } from "./types";

const roleLabels: Record<UserRole, string> = { STUDENT: "Student workspace", INSTITUTE: "Institute workspace", ADMIN: "Administration" };

const navigation = {
  STUDENT: [
    ["overview", "Overview", LayoutDashboard],
    ["applications", "My applications", FileCheck2],
    ["saved", "Saved programmes", Heart],
    ["documents", "Documents", FileText],
    ["support", "Support", CircleHelp],
  ],
  INSTITUTE: [
    ["overview", "Overview", LayoutDashboard],
    ["applications", "Applications", FileCheck2],
    ["programmes", "Programmes", BookOpenText],
    ["profile", "Institute profile", Building2],
    ["support", "Support", LifeBuoy],
  ],
  ADMIN: [
    ["overview", "Overview", LayoutDashboard],
    ["institutes", "Institutes", Building2],
    ["applications", "Applications", FileCheck2],
    ["users", "Users & access", Users],
    ["support", "Support queue", LifeBuoy],
    ["audit", "Audit activity", ShieldCheck],
  ],
} as const;

type Props = {
  user: PublicUser;
  activeSection: string;
  onNavigate: (section: string) => void;
  notifications: NotificationItem[];
  onRefresh: () => Promise<void>;
  children: ReactNode;
};

export default function DashboardShell({ user, activeSection, onNavigate, notifications, onRefresh, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const items = navigation[user.role];
  const unread = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);
  const initials = user.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  useEffect(() => {
    function closeMenus(event: PointerEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) setNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
    }
    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setNotificationsOpen(false); setProfileOpen(false); setMobileOpen(false); }
    }
    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeWithEscape);
    return () => { document.removeEventListener("pointerdown", closeMenus); document.removeEventListener("keydown", closeWithEscape); };
  }, []);

  async function logout() {
    await authApi.logout();
    navigate("/");
  }

  async function readNotification(id: number) {
    await apiRequest(`/api/dashboard/notifications/${id}/read`, { method: "POST" });
    await onRefresh();
  }

  const RoleIcon = user.role === "STUDENT" ? GraduationCap : user.role === "INSTITUTE" ? Building2 : ShieldCheck;

  return (
    <div className="workspace-app">
      <aside className={`workspace-sidebar ${mobileOpen ? "is-open" : ""}`} aria-label="Dashboard navigation">
        <div className="workspace-brand-row">
          <Link className="workspace-brand" to="/" aria-label="Return to DRAA Study in India">
            <img src="/media/draa-mark.png" alt="" />
            <span><strong>DRAA</strong><small>STUDY IN INDIA</small></span>
          </Link>
          <button className="workspace-mobile-close" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button>
        </div>
        <div className="workspace-role-card">
          <RoleIcon size={20} />
          <span><small>Signed in to</small><strong>{roleLabels[user.role]}</strong></span>
        </div>
        <nav>
          <span className="workspace-nav-label">Workspace</span>
          {items.map(([id, label, Icon]) => (
            <button key={id} type="button" className={activeSection === id ? "is-active" : ""} onClick={() => { onNavigate(id); setMobileOpen(false); }}>
              <Icon size={18} /><span>{label}</span>{id === "support" && user.role === "ADMIN" ? <em>1</em> : null}
            </button>
          ))}
        </nav>
        <div className="workspace-sidebar-bottom">
          <Link to="/"><Search size={17} />Explore public portal</Link>
          <button type="button" onClick={logout}><LogOut size={17} />Log out</button>
          <p>Independent education guidance by DRAA (OPC) Private Limited.</p>
        </div>
      </aside>

      {mobileOpen && <button className="workspace-scrim" type="button" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}

      <div className="workspace-main">
        <header className="workspace-topbar">
          <button className="workspace-menu-button" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="workspace-breadcrumb"><span>{roleLabels[user.role]}</span><strong>{items.find(([id]) => id === activeSection)?.[1] || "Overview"}</strong></div>
          <div className="workspace-topbar-actions">
            <div className="workspace-notification-wrap" ref={notificationRef}>
              <button className="workspace-icon-button" type="button" onClick={() => setNotificationsOpen((open) => !open)} aria-label={`${unread} unread notifications`} aria-expanded={notificationsOpen}>
                <Bell size={19} />{unread > 0 && <span>{unread}</span>}
              </button>
              {notificationsOpen && (
                <div className="workspace-popover workspace-notification-popover">
                  <header><div><strong>Notifications</strong><small>{unread ? `${unread} unread` : "You are up to date"}</small></div><Bell size={19} /></header>
                  <div>
                    {notifications.length ? notifications.map((item) => (
                      <button key={item.id} type="button" className={!item.isRead ? "is-unread" : ""} onClick={() => readNotification(item.id)}>
                        <span className={`notification-dot ${item.kind.toLowerCase()}`} />
                        <span><strong>{item.title}</strong><small>{item.body}</small></span>
                      </button>
                    )) : <p className="workspace-empty-small">No notifications yet.</p>}
                  </div>
                </div>
              )}
            </div>
            <div className="workspace-profile-wrap" ref={profileRef}>
              <button className="workspace-profile-trigger" type="button" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
                <span>{initials}</span><div><strong>{user.displayName}</strong><small>{roleLabels[user.role]}</small></div><ChevronDown size={16} />
              </button>
              {profileOpen && <div className="workspace-popover workspace-profile-popover"><div><strong>{user.displayName}</strong><small>{user.email}</small></div><button type="button"><Settings size={16} />Account settings</button><button type="button" onClick={logout}><LogOut size={16} />Log out</button></div>}
            </div>
          </div>
        </header>
        <main className="workspace-content" id="workspace-content">{children}</main>
      </div>
    </div>
  );
}
