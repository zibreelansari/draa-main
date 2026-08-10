import React, { useState, useEffect, useRef } from"react";
import toast from '../../utils/toast';
import { useNavigate, Link } from"react-router-dom";
import axios from"axios";
import url from"../../url";
import StudentSidebar from"../DASHBOARD/StudentSidebar";
import StudentHeader from"../DASHBOARD/StudentTopbr";

//  TYPES 
interface LoginUser {
  name?: string; email?: string; id?: string; phn?: string; token?: string;[key: string]: any;
}

//  SVG ICONS (identical to dashboard) 
const Icons: Record<string, (s?: number, c?: string) => React.ReactNode> = {
  grid: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  book: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>,
  flash: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  file: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
  video: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
  chart: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  bell: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  user: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  logout: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>,
  menu: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  chevron: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>,
  home: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  edit: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  lock: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  save: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  mail: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  phone: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.37 2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.92-1.14a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21.73 16z" /></svg>,
  check: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>,
  x: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  eye: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  eyeOff: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
  warning: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
  shield: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  heart: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>,
  experiment: (s = 18, c ="currentColor") => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-4 6h14l-4-6V3" /></svg> };

//  HELPERS 
const Avatar = ({ name, size = 34 }: { name: string; size?: number }) => {
  const i = name ? name.split("").map(n => n[0]).join("").toUpperCase().slice(0, 2) :"?";
  return (
    <div style={{
      width: size, height: size, borderRadius:"50%", flexShrink: 0,
      background:"linear-gradient(135deg,#bd7b20,#ec4899)",
      display:"flex", alignItems:"center", justifyContent:"center",
      color:"white", fontSize: size * 0.36, fontWeight: 800,
      fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{i}</div>
  );
};

//  MAIN COMPONENT 
export default function StudentUpdateProfile() {
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null);

  const [loginUser, setLoginUser] = useState<LoginUser>({});
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  const [formData, setFormData] = useState({ name:"", email:"", phn:"" });
  const [passwordData, setPasswordData] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [errors, setErrors] = useState<any>({});
  const [passwordErrors, setPasswordErrors] = useState<any>({});

  // Close profile dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => { if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("edudocs");
    if (!userData) { toast.error("Please login first"); navigate("/student-login"); return; }
    try {
      const user: LoginUser = JSON.parse(userData);
      setLoginUser(user);
      setFormData({ name: user.name ||"", email: user.email ||"", phn: user.phn ||"" });
    } catch { navigate("/student-login"); }
  }, [navigate]);

  // Validation
  const validateProfile = () => {
    const e: any = {};
    if (!formData.name.trim() || formData.name.trim().length < 2) e.name ="Name must be at least 2 characters";
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email ="Please enter a valid email";
    if (formData.phn && !/^\d{10}$/.test(formData.phn.replace(/\s/g,""))) e.phn ="Phone must be 10 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePassword = () => {
    const e: any = {};
    if (!passwordData.currentPassword) e.currentPassword ="Current password is required";
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) e.newPassword ="Password must be at least 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword) e.confirmPassword ="Passwords do not match";
    setPasswordErrors(e);
    return Object.keys(e).length === 0;
  };

  // Update profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setLoading(true);
    try {
      const res = await axios.put(`${url}/users/profile/${loginUser.id}`, {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phn: formData.phn.replace(/\s/g,"")
      });
      if (res.data.success) {
        const updated = { ...loginUser, name: res.data.user.name, email: res.data.user.email, phn: res.data.user.phn };
        localStorage.setItem("edudocs", JSON.stringify(updated));
        setLoginUser(updated);
        setEditMode(false);
        setSuccessBanner("Profile updated successfully!");
        setTimeout(() => setSuccessBanner(null), 4000);
      } else { toast.error(res.data.message ||"Failed to update profile"); }
    } catch (err: any) { toast.error(err.response?.data?.message ||"Error updating profile"); }
    finally { setLoading(false); }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setLoading(true);
    try {
      const res = await axios.put(`${url}/users/profile/${loginUser.id}`,
        { currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword },
        { headers: { Authorization: `Bearer ${loginUser.token}` } }
      );
      if (res.data.success) {
        if (res.data.logoutAllDevices) {
          toast.warning("For security, please login again.");
          localStorage.removeItem("edudocs");
          navigate("/");
          return;
        }
        setPasswordChangeMode(false);
        setPasswordData({ currentPassword:"", newPassword:"", confirmPassword:"" });
        setPasswordErrors({});
        setSuccessBanner("Password changed successfully!");
        setTimeout(() => setSuccessBanner(null), 4000);
      } else { toast.error(res.data.message ||"Failed to change password"); }
    } catch (err: any) { toast.error(err.response?.data?.message ||"Error changing password"); }
    finally { setLoading(false); }
  };

  const handleProfileInput = (field: string, val: string) => {
    setFormData(p => ({ ...p, [field]: val }));
    if (errors[field]) setErrors((p: any) => ({ ...p, [field]:"" }));
  };

  const handlePwdInput = (field: string, val: string) => {
    setPasswordData(p => ({ ...p, [field]: val }));
    if (passwordErrors[field]) setPasswordErrors((p: any) => ({ ...p, [field]:"" }));
  };

  const logoutHandler = () => { localStorage.removeItem("edudocs"); toast.success("Logged out successfully"); navigate("/"); };
  const userName = loginUser.name ??"Student";
  const firstName = userName.split("")[0];

  // Password strength
  const pwdStrength = (pwd: string) => {
    if (!pwd) return { label:"", color:"", pct: 0 };
    if (pwd.length < 6) return { label:"Weak", color:"#ef4444", pct: 25 };
    if (pwd.length < 8 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label:"Fair", color:"#f59e0b", pct: 50 };
    if (pwd.length >= 10 && /[!@#$%^&*]/.test(pwd)) return { label:"Strong", color:"#10b981", pct: 100 };
    return { label:"Good", color:"#bd7b20", pct: 75 };
  };
  const strength = pwdStrength(passwordData.newPassword);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Fraunces:opsz,wght@9..144,300;9..144,600;9..144,800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ink:#0d0c1d; --ink2:#4b4966; --ink3:#9896b8;
          --surface:#ffffff; --surface2:#f5f4ff;
          --edge:rgba(99,102,241,0.1); --edge2:#e8e7f8;
          --accent:#bd7b20; --accent2:#66735b; --accent-bg:rgba(99,102,241,0.07);
          --green:#10b981; --amber:#f59e0b; --red:#ef4444; --pink:#ec4899;
          --sh:0 1px 3px rgba(13,12,29,.05),0 4px 16px rgba(99,102,241,.07);
          --sh2:0 4px 24px rgba(99,102,241,.13),0 1px 4px rgba(13,12,29,.07);
          --sh3:0 8px 40px rgba(99,102,241,.18);
          --r:16px; --rs:10px; --tr:.2s cubic-bezier(.4,0,.2,1);
          --sidebar:252px; --header:60px;
          --body:'Plus Jakarta Sans',sans-serif; --display:'Fraunces',serif;
        }
        html,body{height:100%;font-family:var(--body);background:var(--surface2);color:var(--ink);-webkit-font-smoothing:antialiased;}
        *{font-family:var(--body);}
        ::-webkit-scrollbar{width:4px;height:4px;}
        ::-webkit-scrollbar-track{background:transparent;}
        ::-webkit-scrollbar-thumb{background:var(--edge2);border-radius:99px;}
        ::-webkit-scrollbar-thumb:hover{background:var(--accent2);}

        /* Layout */
        .app-shell{display:flex;min-height:100vh;}
        .sidebar{width:var(--sidebar);min-width:var(--sidebar);height:100vh;position:sticky;top:0;background:var(--surface);border-right:1px solid var(--edge2);display:flex;flex-direction:column;overflow:hidden;transition:width var(--tr),min-width var(--tr),transform var(--tr);z-index:200;}
        .sidebar.closed{width:0;min-width:0;}
        .main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden;}
        .topbar{height:var(--header);position:sticky;top:0;z-index:150;background:rgba(245,244,255,.88);backdrop-filter:blur(18px);border-bottom:1px solid var(--edge2);display:flex;align-items:center;gap:12px;padding:0 24px;}
        .content{flex:1;overflow-y:auto;padding:28px 28px 48px;}

        /* Nav */
        .nav-label{font-size:10px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.1em;padding:6px 14px 3px;}
        .nav-item{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:12px;cursor:pointer;font-size:13.5px;font-weight:500;color:var(--ink2);transition:all var(--tr);margin:1px 8px;white-space:nowrap;overflow:hidden;text-decoration:none;}
        .nav-item:hover{background:var(--accent-bg);color:var(--accent);}
        .nav-item.active{background:linear-gradient(135deg,rgba(99,102,241,.14),rgba(139,92,246,.08));color:var(--accent);font-weight:700;}

        /* Cards */
        .card{background:var(--surface);border-radius:var(--r);border:1px solid var(--edge2);box-shadow:var(--sh);}

        /* Buttons */
        .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:99px;border:none;cursor:pointer;font-size:13px;font-weight:600;transition:all var(--tr);font-family:var(--body);white-space:nowrap;}
        .btn-primary{background:linear-gradient(135deg,#bd7b20,#66735b);color:#fff;box-shadow:0 4px 14px rgba(99,102,241,.32);}
        .btn-primary:hover{box-shadow:0 6px 22px rgba(99,102,241,.46);transform:translateY(-1px);}
        .btn-amber{background:linear-gradient(135deg,#f59e0b,#f97316);color:#fff;box-shadow:0 4px 14px rgba(245,158,11,.3);}
        .btn-amber:hover{box-shadow:0 6px 22px rgba(245,158,11,.4);transform:translateY(-1px);}
        .btn-ghost{background:var(--surface);color:var(--ink2);border:1px solid var(--edge2);}
        .btn-ghost:hover{background:var(--accent-bg);color:var(--accent);border-color:rgba(99,102,241,.3);}
        .btn-danger{background:#fff1f0;color:#ef4444;border:1.5px solid rgba(239,68,68,.25);}
        .btn-danger:hover{background:#ef4444;color:white;box-shadow:0 4px 14px rgba(239,68,68,.3);}
        .btn-icon{padding:8px;border-radius:10px;}
        .btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;}
        .btn-full{width:100%;justify-content:center;}

        /* Typography */
        .display{font-family:var(--display);}
        .stat-val{font-family:var(--display);font-weight:800;line-height:1;color:var(--ink);}

        /* Form inputs */
        .field-wrap{margin-bottom:18px;}
        .field-label{font-size:12px;font-weight:700;color:var(--ink2);text-transform:uppercase;letter-spacing:.04em;margin-bottom:7px;display:block;}
        .inp-wrap{position:relative;}
        .inp-icon-left{position:absolute;left:12px;top:50%;transform:translateY(-50%);pointer-events:none;opacity:.5;}
        .inp-icon-right{position:absolute;right:10px;top:50%;transform:translateY(-50%);cursor:pointer;opacity:.5;transition:opacity var(--tr);}
        .inp-icon-right:hover{opacity:1;}
        .inp{width:100%;padding:11px 14px 11px 38px;border-radius:11px;border:1.5px solid var(--edge2);background:var(--surface);font-size:13.5px;color:var(--ink);outline:none;font-family:var(--body);transition:border-color var(--tr),box-shadow var(--tr);}
        .inp:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.1);}
        .inp.err{border-color:#ef4444;box-shadow:0 0 0 3px rgba(239,68,68,.1);}
        .inp.no-icon{padding-left:14px;}
        .inp-pr{padding-right:40px;}
        .field-err{font-size:11.5px;color:#ef4444;margin-top:5px;display:flex;align-items:center;gap:4px;font-weight:600;}
        .field-hint{font-size:11.5px;color:var(--ink3);margin-top:5px;}

        /* Info row (view mode) */
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .info-cell{padding:14px 16px;background:var(--surface2);border-radius:12px;border:1px solid var(--edge2);}
        .info-label{font-size:10.5px;font-weight:700;color:var(--ink3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;}
        .info-val{font-size:14px;font-weight:700;color:var(--ink);}

        /* Animations */
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{opacity:0;animation:fadeUp .45s cubic-bezier(.4,0,.2,1) forwards;}
        .spinner{animation:spin 1s linear infinite;}
        .slide-down{animation:slideDown .3s cubic-bezier(.4,0,.2,1) forwards;}

        /* Badge / tag */
        .badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:11px;font-weight:700;}
        .tag{display:inline-block;padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;}

        /* Progress bar */
        .progress-bar{height:5px;background:var(--edge2);border-radius:99px;overflow:hidden;margin-top:6px;}
        .progress-fill{height:100%;border-radius:99px;transition:width .6s cubic-bezier(.4,0,.2,1),background .3s;}

        /* Lift */
        .lift{transition:transform var(--tr),box-shadow var(--tr);}
        .lift:hover{transform:translateY(-2px);box-shadow:var(--sh2);}

        /* Modal */
        .modal-bg{position:fixed;inset:0;background:rgba(13,12,29,.55);z-index:700;display:flex;align-items:center;justify-content:center;padding:20px;}
        .modal-box{background:var(--surface);border-radius:20px;overflow:hidden;width:100%;max-width:400px;box-shadow:0 20px 60px rgba(13,12,29,.25);}

        /* Success banner */
        .success-banner{display:flex;align-items:center;gap:10px;background:#ecfdf5;border:1px solid rgba(16,185,129,.25);border-radius:14px;padding:14px 18px;font-size:13.5px;color:#065f46;font-weight:600;margin-bottom:20px;}

        /* Section divider */
        .sec-div{height:1px;background:var(--edge2);margin:20px 0;}

        /* Responsive */
        @media(max-width:900px){
          .sidebar{position:fixed!important;top:0;left:0;height:100vh;z-index:300;}
          .sidebar.closed{transform:translateX(-100%);width:var(--sidebar)!important;min-width:var(--sidebar)!important;}
          .profile-grid{grid-template-columns:1fr!important;}
          .info-grid{grid-template-columns:1fr!important;}
        }
        @media(max-width:600px){
          .content{padding:16px 12px 40px;}
          .topbar{padding:0 14px;}
        }
      `}</style>

      <div className="app-shell">

        {/*  SIDEBAR (identical to dashboard)  */}
        <StudentSidebar
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          loginUser={loginUser}
        // stats={stats}
        />

        {/*  MAIN  */}
        <div className="main">

          {/*  TOPBAR (identical to dashboard)  */}
          <StudentHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            loginUser={loginUser}
            // notifications={notifications} 
            currentPage="My Profile"
          />

          {/*  CONTENT  */}
          <main className="content">
            <div style={{ maxWidth: 1120, margin:"0 auto" }}>

              {/* Success banner */}
              {successBanner && (
                <div className="success-banner slide-down">
                  <span style={{ fontSize: 20 }}></span>
                  {successBanner}
                  <button onClick={() => setSuccessBanner(null)} className="btn btn-icon" style={{ marginLeft:"auto", padding:"4px", background:"transparent", border:"none" }}>
                    {Icons.x?.(14,"#065f46")}
                  </button>
                </div>
              )}

              {/* PAGE HEADER */}
              <div className="fade-up" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap: 12, marginBottom: 24 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 13, background:"linear-gradient(135deg,#bd7b20,#ec4899)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 14px rgba(99,102,241,.35)", fontSize: 20 }}></div>
                    <h1 className="display" style={{ fontSize: 28, fontWeight: 800, color:"var(--ink)", lineHeight: 1.15 }}>My Profile</h1>
                  </div>
                  <p style={{ color:"var(--ink2)", fontSize: 13.5 }}>Manage your account information and security settings</p>
                </div>
              </div>

              {/* HERO BANNER */}
              <div className="fade-up" style={{ animationDelay:".05s", marginBottom: 22 }}>
                <div style={{ borderRadius: 20, overflow:"hidden", position:"relative", background:"linear-gradient(135deg,#0f0b2d 0%,#1e1060 40%,#3b1fa8 70%,#bd7b20 100%)", padding:"32px 36px", boxShadow:"var(--sh3)" }}>
                  <div style={{ position:"absolute", top: -40, right: -40, width: 200, height: 200, borderRadius:"50%", background:"rgba(139,92,246,.22)", filter:"blur(50px)" }} />
                  <div style={{ position:"absolute", bottom: -20, left:"40%", width: 140, height: 140, borderRadius:"50%", background:"rgba(236,72,153,.15)", filter:"blur(35px)" }} />
                  <div style={{ position:"relative", display:"flex", alignItems:"center", gap: 24, flexWrap:"wrap" }}>
                    {/* Big avatar */}
                    <div style={{ width: 80, height: 80, borderRadius:"50%", background:"linear-gradient(135deg,rgba(255,255,255,.25),rgba(255,255,255,.1))", border:"3px solid rgba(255,255,255,.3)", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 32, flexShrink: 0, backdropFilter:"blur(10px)" }}>
                      {userName.split("").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="display" style={{ fontSize: 24, fontWeight: 800, color:"white", lineHeight: 1.2, marginBottom: 6 }}>
                        Welcome back, {firstName}! 
                      </div>
                      <div style={{ color:"rgba(255,255,255,.7)", fontSize: 13, marginBottom: 12 }}>
                        Manage your profile information and account settings
                      </div>
                      {/* <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <span className="badge" style={{ background:"rgba(16,185,129,.2)", color:"#6ee7b7", border:"1px solid rgba(16,185,129,.3)" }}> Email Verified</span>
                        <span className="badge" style={{ background:"rgba(255,255,255,.12)", color:"white", border:"1px solid rgba(255,255,255,.2)" }}>
                           Phone: {loginUser.phn ?" Added" :" Not added"}
                        </span>
                        <span className="badge" style={{ background:"rgba(99,102,241,.3)", color:"#c4b5fd", border:"1px solid rgba(139,92,246,.3)" }}> Student</span>
                      </div> */}
                    </div>
                    <button className="btn" style={{ background:"rgba(255,255,255,.15)", color:"white", border:"1px solid rgba(255,255,255,.25)", backdropFilter:"blur(10px)" }} onClick={() => setEditMode(true)}>
                      {Icons.edit?.(14,"white")} Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* MAIN GRID */}
              <div className="profile-grid" style={{ display:"grid", gridTemplateColumns:"1fr 360px", gap: 20 }}>

                {/* LEFT: Profile Info */}
                <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>

                  {/* Profile Information Card */}
                  <div className="card fade-up" style={{ overflow:"hidden", animationDelay:".1s" }}>
                    {/* Card header */}
                    <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--edge2)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background:"rgba(99,102,241,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          {Icons.user?.(16,"#bd7b20")}
                        </div>
                        <div>
                          <div className="display" style={{ fontSize: 15, fontWeight: 700, color:"var(--ink)" }}>Profile Information</div>
                          <div style={{ fontSize: 11, color:"var(--ink3)" }}>Your personal details</div>
                        </div>
                      </div>
                      {!editMode ? (
                        <button className="btn btn-ghost" onClick={() => setEditMode(true)} style={{ padding:"7px 14px", fontSize: 12, borderRadius: 10 }}>
                          {Icons.edit?.(13)} Edit
                        </button>
                      ) : (
                        <button className="btn btn-ghost" onClick={() => { setEditMode(false); setFormData({ name: loginUser.name ||"", email: loginUser.email ||"", phn: loginUser.phn ||"" }); setErrors({}); }} style={{ padding:"7px 14px", fontSize: 12, borderRadius: 10 }}>
                          {Icons.x?.(13)} Cancel
                        </button>
                      )}
                    </div>

                    <div style={{ padding:"22px" }}>
                      {!editMode ? (
                        /* VIEW MODE */
                        <div>
                          <div className="info-grid">
                            <div className="info-cell">
                              <div className="info-label">Full Name</div>
                              <div className="info-val">{loginUser.name}</div>
                            </div>
                            <div className="info-cell">
                              <div className="info-label">Email Address</div>
                              <div className="info-val" style={{ wordBreak:"break-all" }}>{loginUser.email}</div>
                            </div>
                            <div className="info-cell">
                              <div className="info-label">Phone Number</div>
                              <div className="info-val">{loginUser.phn || <span style={{ color:"var(--ink3)", fontWeight: 400 }}>Not provided</span>}</div>
                            </div>

                          </div>
                          <div style={{ marginTop: 16, display:"flex", justifyContent:"flex-end" }}>
                            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
                              {Icons.edit?.(14,"white")} Edit Profile
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* EDIT MODE */
                        <form onSubmit={handleUpdateProfile}>
                          <div className="field-wrap">
                            <label className="field-label">Full Name *</label>
                            <div className="inp-wrap">
                              <span className="inp-icon-left">{Icons.user?.(15)}</span>
                              <input className={`inp ${errors.name ?"err" :""}`} placeholder="Enter your full name" value={formData.name} onChange={e => handleProfileInput("name", e.target.value)} disabled={loading} />
                            </div>
                            {errors.name && <div className="field-err">{Icons.warning?.(12,"#ef4444")} {errors.name}</div>}
                          </div>

                          <div className="field-wrap">
                            <label className="field-label">Email Address *</label>
                            <div className="inp-wrap">
                              <span className="inp-icon-left">{Icons.mail?.(15)}</span>
                              <input className={`inp ${errors.email ?"err" :""}`} type="email" placeholder="Enter your email" value={formData.email} onChange={e => handleProfileInput("email", e.target.value)} disabled={loading} />
                            </div>
                            {errors.email && <div className="field-err">{Icons.warning?.(12,"#ef4444")} {errors.email}</div>}
                          </div>

                          <div className="field-wrap">
                            <label className="field-label">Phone Number <span style={{ color:"var(--ink3)", fontWeight: 500, textTransform:"none" }}>(optional)</span></label>
                            <div className="inp-wrap">
                              <span className="inp-icon-left">{Icons.phone?.(15)}</span>
                              <input className={`inp ${errors.phn ?"err" :""}`} placeholder="Enter 10-digit phone" value={formData.phn} onChange={e => handleProfileInput("phn", e.target.value.replace(/\D/g,"").slice(0, 10))} maxLength={10} disabled={loading} />
                            </div>
                            {errors.phn && <div className="field-err">{Icons.warning?.(12,"#ef4444")} {errors.phn}</div>}
                            <div className="field-hint">{formData.phn.length}/10 digits</div>
                          </div>

                          <div style={{ display:"flex", gap: 10, marginTop: 6 }}>
                            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent:"center" }} onClick={() => { setEditMode(false); setFormData({ name: loginUser.name ||"", email: loginUser.email ||"", phn: loginUser.phn ||"" }); setErrors({}); }} disabled={loading}>
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent:"center" }} disabled={loading}>
                              {loading ? <div style={{ width: 14, height: 14, borderRadius:"50%", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"white" }} className="spinner" /> : Icons.save?.(14,"white")}
                              {loading ?"Saving" :"Save Changes"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="card fade-up" style={{ overflow:"hidden", borderTop:"3px solid #ef4444", animationDelay:".18s" }}>
                    <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--edge2)", display:"flex", alignItems:"center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background:"rgba(239,68,68,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {Icons.warning?.(16,"#ef4444")}
                      </div>
                      <div>
                        <div className="display" style={{ fontSize: 15, fontWeight: 700, color:"#ef4444" }}>Danger Zone</div>
                        <div style={{ fontSize: 11, color:"var(--ink3)" }}>Irreversible account actions</div>
                      </div>
                    </div>
                    <div style={{ padding:"20px 22px" }}>
                      <div style={{ background:"#fff7f7", border:"1px solid rgba(239,68,68,.15)", borderRadius: 12, padding:"14px 16px", marginBottom: 16, display:"flex", alignItems:"flex-start", gap: 10 }}>
                        {Icons.warning?.(15,"#ef4444")}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", marginBottom: 2 }}>Logout from your account</div>
                          <div style={{ fontSize: 12, color:"var(--ink2)" }}>You will be logged out and redirected to the login page.</div>
                        </div>
                      </div>
                      <button className="btn btn-danger btn-full" onClick={() => setLogoutModal(true)}>
                        {Icons.logout?.(14,"#ef4444")}  Logout
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Password & Security */}
                <div style={{ display:"flex", flexDirection:"column", gap: 18 }}>

                  {/* Password Card */}
                  <div className="card fade-up" style={{ overflow:"hidden", animationDelay:".14s" }}>
                    <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--edge2)", display:"flex", alignItems:"center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, background:"rgba(245,158,11,.1)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {Icons.lock?.(16,"#f59e0b")}
                      </div>
                      <div>
                        <div className="display" style={{ fontSize: 15, fontWeight: 700, color:"var(--ink)" }}>Password & Security</div>
                        <div style={{ fontSize: 11, color:"var(--ink3)" }}>Manage your credentials</div>
                      </div>
                    </div>

                    <div style={{ padding:"20px 22px" }}>
                      {!passwordChangeMode ? (
                        <div>
                          <div style={{ background:"rgba(99,102,241,.06)", border:"1px solid var(--edge)", borderRadius: 12, padding:"14px 16px", marginBottom: 16, display:"flex", alignItems:"flex-start", gap: 10 }}>
                            {Icons.shield?.(15,"#bd7b20")}
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color:"var(--ink)", marginBottom: 2 }}>Keep your password secure</div>
                              <div style={{ fontSize: 12, color:"var(--ink2)" }}>Change it regularly to protect your account from unauthorized access.</div>
                            </div>
                          </div>
                          <button className="btn btn-amber btn-full" onClick={() => setPasswordChangeMode(true)}>
                            {Icons.lock?.(14,"white")} Change Password
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleChangePassword}>
                          {/* Current Password */}
                          <div className="field-wrap">
                            <label className="field-label">Current Password *</label>
                            <div className="inp-wrap">
                              <span className="inp-icon-left">{Icons.lock?.(15)}</span>
                              <input className={`inp inp-pr ${passwordErrors.currentPassword ?"err" :""}`} type={showPwd.current ?"text" :"password"} placeholder="Enter current password" value={passwordData.currentPassword} onChange={e => handlePwdInput("currentPassword", e.target.value)} disabled={loading} />
                              <span className="inp-icon-right" onClick={() => setShowPwd(p => ({ ...p, current: !p.current }))}>
                                {showPwd.current ? Icons.eyeOff?.(15) : Icons.eye?.(15)}
                              </span>
                            </div>
                            {passwordErrors.currentPassword && <div className="field-err">{Icons.warning?.(12,"#ef4444")} {passwordErrors.currentPassword}</div>}
                          </div>

                          <div className="sec-div" />

                          {/* New Password */}
                          <div className="field-wrap">
                            <label className="field-label">New Password *</label>
                            <div className="inp-wrap">
                              <span className="inp-icon-left">{Icons.lock?.(15)}</span>
                              <input className={`inp inp-pr ${passwordErrors.newPassword ?"err" :""}`} type={showPwd.new ?"text" :"password"} placeholder="Min 6 characters" value={passwordData.newPassword} onChange={e => handlePwdInput("newPassword", e.target.value)} disabled={loading} />
                              <span className="inp-icon-right" onClick={() => setShowPwd(p => ({ ...p, new: !p.new }))}>
                                {showPwd.new ? Icons.eyeOff?.(15) : Icons.eye?.(15)}
                              </span>
                            </div>
                            {/* Strength meter */}
                            {passwordData.newPassword && (
                              <div>
                                <div className="progress-bar">
                                  <div className="progress-fill" style={{ width: `${strength.pct}%`, background: strength.color }} />
                                </div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: strength.color, marginTop: 4 }}>Strength: {strength.label}</div>
                              </div>
                            )}
                            {passwordErrors.newPassword && <div className="field-err">{Icons.warning?.(12,"#ef4444")} {passwordErrors.newPassword}</div>}
                          </div>

                          {/* Confirm Password */}
                          <div className="field-wrap">
                            <label className="field-label">Confirm Password *</label>
                            <div className="inp-wrap">
                              <span className="inp-icon-left">{Icons.lock?.(15)}</span>
                              <input className={`inp inp-pr ${passwordErrors.confirmPassword ?"err" :""}`} type={showPwd.confirm ?"text" :"password"} placeholder="Repeat new password" value={passwordData.confirmPassword} onChange={e => handlePwdInput("confirmPassword", e.target.value)} disabled={loading} />
                              <span className="inp-icon-right" onClick={() => setShowPwd(p => ({ ...p, confirm: !p.confirm }))}>
                                {showPwd.confirm ? Icons.eyeOff?.(15) : Icons.eye?.(15)}
                              </span>
                            </div>
                            {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                              <div style={{ fontSize: 11, color:"#10b981", fontWeight: 700, marginTop: 4, display:"flex", alignItems:"center", gap: 4 }}>{Icons.check?.(12,"#10b981")} Passwords match</div>
                            )}
                            {passwordErrors.confirmPassword && <div className="field-err">{Icons.warning?.(12,"#ef4444")} {passwordErrors.confirmPassword}</div>}
                          </div>

                          <div style={{ display:"flex", gap: 10 }}>
                            <button type="button" className="btn btn-ghost" style={{ flex: 1, justifyContent:"center" }} onClick={() => { setPasswordChangeMode(false); setPasswordData({ currentPassword:"", newPassword:"", confirmPassword:"" }); setPasswordErrors({}); }} disabled={loading}>
                              Cancel
                            </button>
                            <button type="submit" className="btn btn-amber" style={{ flex: 1, justifyContent:"center" }} disabled={loading}>
                              {loading ? <div style={{ width: 14, height: 14, borderRadius:"50%", border:"2px solid rgba(255,255,255,.4)", borderTopColor:"white" }} className="spinner" /> : Icons.save?.(14,"white")}
                              {loading ?"Saving" :"Update"}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* Quick Links card */}
                  <div className="card fade-up" style={{ padding:"18px 20px", animationDelay:".2s" }}>
                    <div className="display" style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)", marginBottom: 14 }}> Quick Actions</div>
                    <div style={{ display:"flex", flexDirection:"column", gap: 8 }}>
                      {[
                        { label:"Go to Dashboard", icon:"grid", to:"/student-dashboard", primary: true },
                        { label:"My Courses", icon:"book", to: `/sudent/my-courses/${loginUser.id}`, primary: false },
                        { label:"My Test Series", icon:"flash", to: `/v2/student/my-test-series/${loginUser.id}`, primary: false },
                        { label:"Wishlist", icon:"heart", to:"/student/wishlist", primary: false },
                      ].map((a, i) => (
                        <button key={i} className={`btn ${a.primary ?"btn-primary" :"btn-ghost"}`} style={{ width:"100%", justifyContent:"flex-start", borderRadius: 12, padding:"10px 14px" }}
                          onClick={() => navigate(a.to)}>
                          <span>{Icons[a.icon]?.(14, a.primary ?"white" :"currentColor")}</span>
                          <span style={{ fontSize: 13 }}>{a.label}</span>
                          <span style={{ marginLeft:"auto" }}>{Icons.chevron?.(12, a.primary ?"rgba(255,255,255,.5)" :"var(--ink3)")}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account info card */}
                  <div className="card fade-up" style={{ padding:"18px 20px", animationDelay:".24s" }}>
                    <div className="display" style={{ fontSize: 14, fontWeight: 700, color:"var(--ink)", marginBottom: 14 }}> Account Info</div>
                    {[
                      { label:"Account ID", val: loginUser.id ? `#${loginUser.id}` :"" },
                      { label:"Member Since", val: new Date().getFullYear().toString() },
                      { label:"Account Type", val:"Student" },
                      { label:"Status", val:"Active" },
                    ].map((r, i, arr) => (
                      <div key={r.label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom: i < arr.length - 1 ?"1px solid var(--edge2)" :"none" }}>
                        <span style={{ fontSize: 12.5, color:"var(--ink2)" }}>{r.label}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color:"var(--ink)" }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/*  LOGOUT CONFIRM MODAL  */}
      {logoutModal && (
        <div className="modal-bg" onClick={() => setLogoutModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ padding:"28px", textAlign:"center" }}>
              <div style={{ width: 68, height: 68, borderRadius:"50%", background:"rgba(239,68,68,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize: 32, margin:"0 auto 16px", border:"2px solid rgba(239,68,68,.15)" }}></div>
              <div className="display" style={{ fontSize: 20, fontWeight: 800, color:"var(--ink)", marginBottom: 8 }}>Logout?</div>
              <div style={{ fontSize: 13.5, color:"var(--ink2)", marginBottom: 24, lineHeight: 1.6 }}>
                Are you sure you want to logout?<br />You'll need to login again to access your account.
              </div>
              <div style={{ display:"flex", gap: 10 }}>
                <button className="btn btn-ghost" style={{ flex: 1, justifyContent:"center" }} onClick={() => setLogoutModal(false)}>Cancel</button>
                <button className="btn btn-danger" style={{ flex: 1, justifyContent:"center", background:"#ef4444", color:"white" }} onClick={logoutHandler}>
                  {Icons.logout?.(14,"white")} Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}