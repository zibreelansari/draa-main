import React, { useState, useEffect, useRef } from "react";
import toast from '../../utils/toast';
import { useNavigate } from "react-router-dom";
import { Modal, Layout, Spin, notification } from "antd";
import {
  ExclamationCircleOutlined, SaveOutlined, EditOutlined,
  LockOutlined, UserOutlined, ArrowLeftOutlined,
  CameraOutlined, EyeOutlined, EyeInvisibleOutlined,
  CheckCircleFilled, CloseCircleFilled,
} from "@ant-design/icons";
import axios from "axios";
import url, { getImageUrl } from "../../url";
import { getAuthHeaders } from "../../utils/global_auth";
import Topbar from "./Topbar";
import Sidebar2 from "./Sidebar2";
import usePageTitle from '../../hooks/usePageTitle';

const { Content } = Layout;

// ── Static dropdown data ────────────────────────────────────────────────────

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra & Nagar Haveli and Daman & Diu",
  "Delhi","Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const SPECIALIZATIONS = [
  "Mathematics","Physics","Chemistry","Biology","English Literature",
  "Hindi Literature","Social Science / History","Geography","Economics",
  "Political Science","Accountancy","Business Studies","Computer Science",
  "Information Technology","Physical Education","Music","Fine Arts",
  "Sanskrit","Environmental Science","Data Entry","Vocational Training",
  "Engineering","Medical / Healthcare","Law","Commerce","Other",
];

const QUALIFICATIONS = [
  "10th (SSC)","12th (HSC)","Diploma","ITI","B.A.","B.Sc.","B.Com.",
  "B.Ed.","B.Tech. / B.E.","BCA","BBA","M.A.","M.Sc.","M.Com.",
  "M.Ed.","M.Tech. / M.E.","MCA","MBA","LLB","LLM","MBBS","MD / MS",
  "Ph.D.","D.Litt.","Other",
];

const EXP_OPTIONS = Array.from({ length: 51 }, (_, i) => i); // 0..50

// ── helpers ─────────────────────────────────────────────────────────────────

const showSuccess = (msg: string) =>
  notification.success({
    message: "Success",
    description: msg,
    icon: <CheckCircleFilled style={{ color: "#22c55e" }} />,
    placement: "topRight",
    duration: 4,
  });

const showError = (msg: string) =>
  notification.error({
    message: "Error",
    description: msg,
    icon: <CloseCircleFilled style={{ color: "#ef4444" }} />,
    placement: "topRight",
    duration: 5,
  });

// ── field wrapper ────────────────────────────────────────────────────────────

const Field = ({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    <label style={{
      fontSize: 11, fontWeight: 700, color: "#374151",
      textTransform: "uppercase", letterSpacing: 0.5,
    }}>
      {label}
      {required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
    </label>
    {children}
    {error && (
      <span style={{ fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
        ⚠ {error}
      </span>
    )}
  </div>
);

const inputCss = (hasError?: boolean): React.CSSProperties => ({
  width: "100%", padding: "11px 14px",
  border: `1.5px solid ${hasError ? "#ef4444" : "#e5e7eb"}`,
  borderRadius: 10, fontSize: 14, color: "#111827",
  background: "#fafafa", outline: "none",
  transition: "border-color 0.2s", boxSizing: "border-box",
  fontFamily: "inherit",
});

const selectCss = (hasError?: boolean): React.CSSProperties => ({
  ...inputCss(hasError),
  appearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 12px center",
  backgroundSize: "20px",
  paddingRight: 40,
  cursor: "pointer",
});

// ─────────────────────────────────────────────────────────────────────────────

export default function TeacherUpdateProfile() {
  usePageTitle('Update Profile | Teacher');
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [teacher, setTeacher] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [passwordMode, setPasswordMode] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState({ curr: false, next: false, conf: false });

  const [form, setForm] = useState({
    tname: "", temail: "", tphn: "", tspecialization: "",
    texp: "0", tcity: "", tstate: "", tdesc: "",
    tqualification: "", taddress: "",
    github: "", linkedin: "", twitter: "",
  });

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pwdErrors, setPwdErrors] = useState<Record<string, string>>({});

  const resetForm = (t: any) => {
    if (!t) return;
    setForm({
      tname: t.tname || "",
      temail: t.temail || "",
      tphn: t.tphn || "",
      tspecialization: t.tspecialization || "",
      texp: String(t.texp ?? "0"),
      tcity: t.tcity || "",
      tstate: t.tstate || "",
      tdesc: t.tdesc || "",
      tqualification: t.tqualification || "",
      taddress: t.taddress || "",
      github:   t.socialLinks?.github   || "",
      linkedin: t.socialLinks?.linkedin || "",
      twitter:  t.socialLinks?.twitter  || "",
    });
  };

  // ── load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const raw = localStorage.getItem("edudocs");
    if (!raw) { showError("Please login first"); navigate("/teacher-login"); return; }
    
    let initialTeacher: any = null;
    try {
      initialTeacher = JSON.parse(raw);
      setTeacher(initialTeacher);
      resetForm(initialTeacher);
    } catch {
      navigate("/teacher-login");
      return;
    }

    // Fetch full fresh profile from server to resolve missing/stale extended fields
    const fetchFullProfile = async () => {
      try {
        const res = await axios.get(`${url}/teachers/verify-session`, {
          headers: getAuthHeaders(),
        });
        if (res.data.success && res.data.teacher) {
          const freshTeacher = { ...initialTeacher, ...res.data.teacher };
          localStorage.setItem("edudocs", JSON.stringify(freshTeacher));
          setTeacher(freshTeacher);
          resetForm(freshTeacher);
        }
      } catch (err: any) {
        console.error("Failed to fetch full teacher profile:", err);
        if (err.response?.status === 401) {
          showError("Session expired. Please login again.");
          localStorage.removeItem("edudocs");
          navigate("/teacher-login");
        }
      }
    };

    fetchFullProfile();
  }, [navigate]);

  // ── photo pick ────────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showError("Image must be less than 2 MB"); return; }
    if (!file.type.startsWith("image/")) { showError("Please select a valid image file"); return; }
    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // ── field helpers ─────────────────────────────────────────────────────────
  const setF = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  // ── profile validation ─────────────────────────────────────────────────────
  const validateProfile = () => {
    const e: Record<string, string> = {};
    if (!form.tname.trim() || form.tname.trim().length < 2)
      e.tname = "Name must be at least 2 characters";
    if (!form.temail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.temail.trim()))
      e.temail = "Enter a valid email address";
    if (form.tphn && !/^\d{10}$/.test(form.tphn.replace(/\s/g, "")))
      e.tphn = "Phone must be exactly 10 digits";
    if (!form.tspecialization)
      e.tspecialization = "Please select a specialization";
    if (!form.tstate)
      e.tstate = "Please select your state";
    if (!form.tcity.trim())
      e.tcity = "City is required";
    if (!form.tdesc.trim() || form.tdesc.trim().length < 5)
      e.tdesc = "Description must be at least 5 characters";
    if (form.tdesc.trim().length > 1000)
      e.tdesc = "Description cannot exceed 1000 characters";
    const expNum = parseInt(form.texp);
    if (isNaN(expNum) || expNum < 0 || expNum > 50)
      e.texp = "Experience must be between 0 and 50 years";
    // social links — optional but must be valid URLs if provided
    if (form.github && !/^https?:\/\/(www\.)?github\.com\/.+/.test(form.github.trim()))
      e.github = "Use format: https://github.com/username";
    if (form.linkedin && !/^https?:\/\/(www\.)?linkedin\.com\/.+/.test(form.linkedin.trim()))
      e.linkedin = "Use format: https://linkedin.com/in/username";
    if (form.twitter && !/^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/.test(form.twitter.trim()))
      e.twitter = "Use format: https://twitter.com/username";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── password validation ───────────────────────────────────────────────────
  const validatePwd = () => {
    const e: Record<string, string> = {};
    if (!pwdForm.currentPassword)
      e.currentPassword = "Current password is required";
    if (!pwdForm.newPassword)
      e.newPassword = "New password is required";
    else if (pwdForm.newPassword.length < 8)
      e.newPassword = "Password must be at least 8 characters";
    else if (!/[A-Z]/.test(pwdForm.newPassword))
      e.newPassword = "Include at least one uppercase letter";
    else if (!/[0-9]/.test(pwdForm.newPassword))
      e.newPassword = "Include at least one number";
    if (!pwdForm.confirmPassword)
      e.confirmPassword = "Please confirm your new password";
    else if (pwdForm.newPassword !== pwdForm.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (pwdForm.currentPassword && pwdForm.newPassword && pwdForm.currentPassword === pwdForm.newPassword)
      e.newPassword = "New password must be different from current password";
    setPwdErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── save profile ──────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) {
      showError("Please fix the highlighted errors before saving.");
      return;
    }
    setLoading(true);
    try {
      // Always use FormData — route uses multer which only parses multipart
      const fd = new FormData();
      fd.append("tname",          form.tname.trim());
      fd.append("temail",         form.temail.trim().toLowerCase());
      fd.append("tphn",           form.tphn.replace(/\s/g, ""));
      fd.append("tspecialization",form.tspecialization.trim());
      fd.append("texp",           form.texp.toString());
      fd.append("tcity",          form.tcity.trim());
      fd.append("tstate",         form.tstate.trim());
      fd.append("tdesc",          form.tdesc.trim());
      fd.append("tqualification", form.tqualification.trim());
      fd.append("taddress",       form.taddress.trim());
      fd.append("github",         form.github.trim());
      fd.append("linkedin",       form.linkedin.trim());
      fd.append("twitter",        form.twitter.trim());
      if (profileImage) fd.append("tprofile", profileImage);

      const res = await axios.put(
        `${url}/teachers/profile/${teacher._id || teacher.id}`,
        fd,
        { headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        const updated = { ...teacher, ...res.data.data.teacher };
        localStorage.setItem("edudocs", JSON.stringify(updated));
        setTeacher(updated);
        resetForm(updated);
        setEditMode(false);
        setProfileImage(null);
        setPreviewUrl(null);
        showSuccess("Profile updated successfully! Your changes have been saved.");
      } else {
        showError(res.data.message || "Profile update failed. Please try again.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Network error. Please check your connection.";
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── change password ───────────────────────────────────────────────────────
  // IMPORTANT: Uses FormData because the route uses multer (multipart only)
  const handleChangePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePwd()) {
      showError("Please fix the highlighted errors before submitting.");
      return;
    }
    setPwdLoading(true);
    try {
      // Must send as FormData — the /profile/:teacherId route uses multer
      // which only parses multipart/form-data. JSON body → req.body is empty.
      const fd = new FormData();
      fd.append("currentPassword", pwdForm.currentPassword);
      fd.append("newPassword",     pwdForm.newPassword);

      const res = await axios.put(
        `${url}/teachers/profile/${teacher._id || teacher.id}`,
        fd,
        { headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        showSuccess("Password changed successfully! Please use your new password next time you log in.");
        setPasswordMode(false);
        setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPwdErrors({});
      } else {
        showError(res.data.message || "Password change failed. Please try again.");
      }
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 401 || (msg && msg.toLowerCase().includes("incorrect"))) {
        setPwdErrors(p => ({ ...p, currentPassword: "Current password is incorrect" }));
        showError("The current password you entered is incorrect.");
      } else {
        showError(msg || "Failed to change password. Please try again.");
      }
    } finally {
      setPwdLoading(false);
    }
  };

  // ── logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Modal.confirm({
      title: "Confirm Logout",
      icon: <ExclamationCircleOutlined style={{ color: "#ef4444" }} />,
      content: "Are you sure you want to logout? Any unsaved changes will be lost.",
      okText: "Yes, Logout",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      onOk() {
        localStorage.removeItem("edudocs");
        toast.success("Logged out successfully.");
        navigate("/teacher-login");
      },
    });
  };

  // ── loading guard ─────────────────────────────────────────────────────────
  if (!teacher) return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar2 />
      <Layout>
        <Topbar />
        <Content style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
          <Spin size="large" tip="Loading profile..." />
        </Content>
      </Layout>
    </Layout>
  );

  const avatarSrc = previewUrl || (teacher.tprofile ? getImageUrl(teacher.tprofile) : null);
  const pwdStrength = (() => {
    const p = pwdForm.newPassword;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    const map: Record<number, { label: string; color: string }> = {
      1: { label: "Weak", color: "#ef4444" },
      2: { label: "Fair", color: "#f59e0b" },
      3: { label: "Good", color: "#3b82f6" },
      4: { label: "Strong", color: "#22c55e" },
    };
    return map[score] || null;
  })();

  return (
    <Layout style={{ minHeight: "100vh", background: "#f1f5f9" }}>
      <Sidebar2 />
      <Layout style={{ background: "#f1f5f9" }}>
        <Topbar />
        <Content style={{ padding: 0 }}>

          {/* ── HERO ──────────────────────────────────────────────────── */}
          <div style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 70%, #6366f1 100%)",
            padding: "36px 32px 96px", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 260, height: 260, borderRadius: "50%", background: "rgba(99,102,241,0.18)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: -40, left: 80, width: 180, height: 180, borderRadius: "50%", background: "rgba(139,92,246,0.15)", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
              <div>
                <button
                  onClick={() => navigate(-1)}
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 14px", color: "rgba(255,255,255,0.85)", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}
                >
                  <ArrowLeftOutlined /> Back
                </button>
                <h1 style={{ color: "#fff", margin: "0 0 4px", fontSize: 28, fontWeight: 800, letterSpacing: -0.5 }}>Settings</h1>
                <p style={{ color: "rgba(255,255,255,0.65)", margin: 0, fontSize: 14 }}>Manage your profile and security settings</p>
              </div>
              <button
                onClick={handleLogout}
                style={{ background: "rgba(239,68,68,0.2)", backdropFilter: "blur(10px)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, padding: "10px 22px", color: "#fca5a5", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* ── BODY ──────────────────────────────────────────────────── */}
          <div style={{ padding: "0 24px 56px", maxWidth: 960, margin: "0 auto" }}>
            <div style={{ marginTop: -56, position: "relative", zIndex: 2, display: "flex", flexDirection: "column", gap: 20 }}>

              {/* ══ PROFILE CARD ══════════════════════════════════════ */}
              <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.1)", overflow: "hidden" }}>

                {/* header strip */}
                <div style={{ background: "linear-gradient(135deg,#4338ca,#7c3aed)", height: 72, position: "relative" }}>
                  <div style={{ position: "absolute", top: 16, right: 24, display: "flex", gap: 10 }}>
                    {!editMode ? (
                      <button
                        onClick={() => setEditMode(true)}
                        style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 10, padding: "8px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <EditOutlined /> Edit Profile
                      </button>
                    ) : (
                      <button
                        onClick={() => { setEditMode(false); setErrors({}); setProfileImage(null); setPreviewUrl(null); resetForm(teacher); }}
                        style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10, padding: "8px 18px", color: "rgba(255,255,255,0.75)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                      >
                        ✕ Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* avatar + name */}
                <div style={{ padding: "0 28px 28px", marginTop: -36 }}>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 24 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ width: 88, height: 88, borderRadius: "50%", border: "4px solid #fff", boxShadow: "0 8px 24px rgba(67,56,202,0.25)", background: "linear-gradient(135deg,#4338ca,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 32, color: "#fff" }}>
                        {avatarSrc
                          ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <UserOutlined />
                        }
                      </div>
                      {editMode && (
                        <button
                          onClick={() => fileRef.current?.click()}
                          title="Change photo"
                          style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: "50%", background: "#4338ca", border: "2px solid #fff", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <CameraOutlined />
                        </button>
                      )}
                      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoChange} />
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111827" }}>{teacher.tname || "Teacher"}</h2>
                      <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
                        {teacher.tspecialization || "Subject Specialist"} · {[teacher.tcity, teacher.tstate].filter(Boolean).join(", ") || "Location not set"}
                      </p>
                      {editMode && (
                        <p style={{ margin: "6px 0 0", fontSize: 12, color: "#9ca3af" }}>
                          Click the camera icon to change your profile photo (max 2 MB)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ── VIEW MODE ── */}
                  {!editMode ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                      {[
                        { label: "Full Name",       value: teacher.tname },
                        { label: "Email",           value: teacher.temail },
                        { label: "Phone",           value: teacher.tphn },
                        { label: "Specialization",  value: teacher.tspecialization },
                        { label: "Experience",      value: teacher.texp != null ? `${teacher.texp} Year${teacher.texp === 1 ? "" : "s"}` : null },
                        { label: "City",            value: teacher.tcity },
                        { label: "State",           value: teacher.tstate },
                        { label: "Qualification",   value: teacher.tqualification },
                        { label: "Address",         value: teacher.taddress },
                      ].map(({ label, value }) => (
                        <div key={label} style={{ padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{label}</div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: value ? "#1f2937" : "#d1d5db", fontStyle: value ? "normal" : "italic" }}>
                            {value || "Not provided"}
                          </div>
                        </div>
                      ))}
                      <div style={{ gridColumn: "1 / -1", padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Bio / Description</div>
                        <div style={{ fontSize: 14, color: teacher.tdesc ? "#374151" : "#d1d5db", fontStyle: teacher.tdesc ? "normal" : "italic", lineHeight: 1.75 }}>
                          {teacher.tdesc || "No bio added yet. Click Edit Profile to add one."}
                        </div>
                      </div>
                    </div>
                  ) : (

                    /* ── EDIT FORM ── */
                    <form onSubmit={handleSave} noValidate>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 16, marginBottom: 16 }}>

                        <Field label="Full Name" required error={errors.tname}>
                          <input style={inputCss(!!errors.tname)} value={form.tname}
                            onChange={setF("tname")} placeholder="Your full name" disabled={loading} />
                        </Field>

                        <Field label="Email Address" required error={errors.temail}>
                          <input style={inputCss(!!errors.temail)} value={form.temail} type="email"
                            onChange={setF("temail")} placeholder="email@example.com" disabled={loading} />
                        </Field>

                        <Field label="Phone Number" error={errors.tphn}>
                          <input style={inputCss(!!errors.tphn)} value={form.tphn}
                            onChange={e => { setForm(p => ({ ...p, tphn: e.target.value.replace(/\D/g, "").slice(0, 10) })); setErrors(p => ({ ...p, tphn: "" })); }}
                            placeholder="10-digit number" disabled={loading} maxLength={10} />
                        </Field>

                        <Field label="Specialization" required error={errors.tspecialization}>
                          <select style={selectCss(!!errors.tspecialization)} value={form.tspecialization}
                            onChange={setF("tspecialization")} disabled={loading}>
                            <option value="">— Select specialization —</option>
                            {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>

                        <Field label="Teaching Experience" error={errors.texp}>
                          <select style={selectCss(!!errors.texp)} value={form.texp}
                            onChange={setF("texp")} disabled={loading}>
                            {EXP_OPTIONS.map(n => (
                              <option key={n} value={String(n)}>
                                {n === 0 ? "Less than 1 year" : `${n} year${n === 1 ? "" : "s"}`}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="City" required error={errors.tcity}>
                          <input style={inputCss(!!errors.tcity)} value={form.tcity}
                            onChange={setF("tcity")} placeholder="e.g. Mumbai" disabled={loading} />
                        </Field>

                        <Field label="State" required error={errors.tstate}>
                          <select style={selectCss(!!errors.tstate)} value={form.tstate}
                            onChange={setF("tstate")} disabled={loading}>
                            <option value="">— Select state —</option>
                            {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </Field>

                        <Field label="Qualification" error={errors.tqualification}>
                          <select style={selectCss(!!errors.tqualification)} value={form.tqualification}
                            onChange={setF("tqualification")} disabled={loading}>
                            <option value="">— Select qualification —</option>
                            {QUALIFICATIONS.map(q => <option key={q} value={q}>{q}</option>)}
                          </select>
                        </Field>

                        <Field label="Address" error={errors.taddress}>
                          <input style={inputCss(!!errors.taddress)} value={form.taddress}
                            onChange={setF("taddress")} placeholder="Full address" disabled={loading} />
                        </Field>

                      </div>

                      {/* ── Social Links ── */}
                      <div style={{ margin: "20px 0 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🔗</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Social Links</div>
                            <div style={{ fontSize: 11, color: "#9ca3af" }}>Optional — add your professional profiles</div>
                          </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 14 }}>

                          {/* GitHub */}
                          <Field label="GitHub Profile" error={errors.github}>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, lineHeight: 1 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#374151"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/></svg>
                              </span>
                              <input
                                style={{ ...inputCss(!!errors.github), paddingLeft: 38 }}
                                value={form.github}
                                onChange={e => { setForm(p => ({ ...p, github: e.target.value })); setErrors(p => ({ ...p, github: "" })); }}
                                placeholder="https://github.com/username"
                                disabled={loading}
                              />
                            </div>
                          </Field>

                          {/* LinkedIn */}
                          <Field label="LinkedIn Profile" error={errors.linkedin}>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, lineHeight: 1 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                              </span>
                              <input
                                style={{ ...inputCss(!!errors.linkedin), paddingLeft: 38 }}
                                value={form.linkedin}
                                onChange={e => { setForm(p => ({ ...p, linkedin: e.target.value })); setErrors(p => ({ ...p, linkedin: "" })); }}
                                placeholder="https://linkedin.com/in/username"
                                disabled={loading}
                              />
                            </div>
                          </Field>

                          {/* Twitter / X */}
                          <Field label="Twitter / X Profile" error={errors.twitter}>
                            <div style={{ position: "relative" }}>
                              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, lineHeight: 1 }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#1da1f2"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                              </span>
                              <input
                                style={{ ...inputCss(!!errors.twitter), paddingLeft: 38 }}
                                value={form.twitter}
                                onChange={e => { setForm(p => ({ ...p, twitter: e.target.value })); setErrors(p => ({ ...p, twitter: "" })); }}
                                placeholder="https://twitter.com/username"
                                disabled={loading}
                              />
                            </div>
                          </Field>

                        </div>
                      </div>

                      {/* bio spans full width */}
                      <Field label="Bio / Description" required error={errors.tdesc}>
                        <div style={{ position: "relative" }}>
                          <textarea
                            style={{ ...inputCss(!!errors.tdesc), minHeight: 110, resize: "vertical" }}
                            value={form.tdesc}
                            onChange={e => { setForm(p => ({ ...p, tdesc: e.target.value })); setErrors(p => ({ ...p, tdesc: "" })); }}
                            placeholder="Describe your teaching methodology, experience and expertise... (5–1000 characters)"
                            disabled={loading}
                            maxLength={1000}
                            rows={4}
                          />
                          <span style={{ position: "absolute", bottom: 8, right: 12, fontSize: 11, color: form.tdesc.length > 900 ? "#ef4444" : "#9ca3af" }}>
                            {form.tdesc.length}/1000
                          </span>
                        </div>
                      </Field>

                      {/* error summary */}
                      {Object.keys(errors).length > 0 && (
                        <div style={{ margin: "16px 0", padding: "12px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#991b1b" }}>
                          ⚠ Please fix {Object.keys(errors).length} error{Object.keys(errors).length > 1 ? "s" : ""} before saving.
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                        <button type="button" onClick={() => { setEditMode(false); setErrors({}); setProfileImage(null); setPreviewUrl(null); resetForm(teacher); }} disabled={loading}
                          style={{ flex: 1, padding: "13px", background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151" }}>
                          Cancel
                        </button>
                        <button type="submit" disabled={loading}
                          style={{ flex: 2, padding: "13px", background: "linear-gradient(135deg,#4338ca,#7c3aed)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 15px rgba(67,56,202,0.3)" }}>
                          <SaveOutlined /> {loading ? "Saving…" : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* ══ PASSWORD & SECURITY CARD ═══════════════════════════ */}
              <div style={{ background: "#fff", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.07)", overflow: "hidden" }}>

                {/* card header */}
                <div style={{ padding: "22px 28px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🔒</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111827" }}>Password & Security</h3>
                      <p style={{ margin: 0, fontSize: 12, color: "#9ca3af" }}>Keep your account secure with a strong password</p>
                    </div>
                  </div>
                  {!passwordMode && (
                    <button
                      onClick={() => setPasswordMode(true)}
                      style={{ background: "#fef3c7", border: "1.5px solid #fde68a", borderRadius: 10, padding: "9px 18px", color: "#d97706", fontWeight: 700, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <LockOutlined /> Change Password
                    </button>
                  )}
                </div>

                <div style={{ padding: "24px 28px" }}>
                  {!passwordMode ? (
                    <div style={{ padding: "16px 20px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, color: "#92400e", fontSize: 14, lineHeight: 1.6 }}>
                      💡 <strong>Security tip:</strong> Use a strong password that includes uppercase letters, lowercase letters, numbers, and special characters. Change it regularly.
                    </div>
                  ) : (
                    <form onSubmit={handleChangePwd} noValidate>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 440 }}>

                        {/* current password */}
                        <Field label="Current Password" required error={pwdErrors.currentPassword}>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showPwd.curr ? "text" : "password"}
                              style={{ ...inputCss(!!pwdErrors.currentPassword), paddingRight: 46 }}
                              value={pwdForm.currentPassword}
                              onChange={e => { setPwdForm(p => ({ ...p, currentPassword: e.target.value })); setPwdErrors(p => ({ ...p, currentPassword: "" })); }}
                              placeholder="Enter your current password"
                              disabled={pwdLoading}
                              autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowPwd(p => ({ ...p, curr: !p.curr }))}
                              style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, padding: 0 }}>
                              {showPwd.curr ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </button>
                          </div>
                        </Field>

                        {/* new password */}
                        <Field label="New Password" required error={pwdErrors.newPassword}>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showPwd.next ? "text" : "password"}
                              style={{ ...inputCss(!!pwdErrors.newPassword), paddingRight: 46 }}
                              value={pwdForm.newPassword}
                              onChange={e => { setPwdForm(p => ({ ...p, newPassword: e.target.value })); setPwdErrors(p => ({ ...p, newPassword: "" })); }}
                              placeholder="Min 8 chars, 1 uppercase, 1 number"
                              disabled={pwdLoading}
                              autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPwd(p => ({ ...p, next: !p.next }))}
                              style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, padding: 0 }}>
                              {showPwd.next ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </button>
                          </div>
                          {/* password strength bar */}
                          {pwdForm.newPassword && pwdStrength && (
                            <div style={{ marginTop: 6 }}>
                              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                                {[1,2,3,4].map(i => (
                                  <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= [1,2,3,4].filter(n => {
                                    if (n === 1) return pwdForm.newPassword.length >= 8;
                                    if (n === 2) return /[A-Z]/.test(pwdForm.newPassword);
                                    if (n === 3) return /[0-9]/.test(pwdForm.newPassword);
                                    if (n === 4) return /[^A-Za-z0-9]/.test(pwdForm.newPassword);
                                    return false;
                                  }).length ? pwdStrength.color : "#e5e7eb" }} />
                                ))}
                              </div>
                              <span style={{ fontSize: 11, color: pwdStrength.color, fontWeight: 600 }}>
                                Strength: {pwdStrength.label}
                              </span>
                            </div>
                          )}
                        </Field>

                        {/* confirm password */}
                        <Field label="Confirm New Password" required error={pwdErrors.confirmPassword}>
                          <div style={{ position: "relative" }}>
                            <input
                              type={showPwd.conf ? "text" : "password"}
                              style={{ ...inputCss(!!pwdErrors.confirmPassword), paddingRight: 46 }}
                              value={pwdForm.confirmPassword}
                              onChange={e => { setPwdForm(p => ({ ...p, confirmPassword: e.target.value })); setPwdErrors(p => ({ ...p, confirmPassword: "" })); }}
                              placeholder="Re-enter your new password"
                              disabled={pwdLoading}
                              autoComplete="new-password"
                            />
                            <button type="button" onClick={() => setShowPwd(p => ({ ...p, conf: !p.conf }))}
                              style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 16, padding: 0 }}>
                              {showPwd.conf ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </button>
                          </div>
                          {/* match indicator */}
                          {pwdForm.confirmPassword && pwdForm.newPassword && (
                            <span style={{ fontSize: 12, color: pwdForm.newPassword === pwdForm.confirmPassword ? "#22c55e" : "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                              {pwdForm.newPassword === pwdForm.confirmPassword
                                ? <><CheckCircleFilled /> Passwords match</>
                                : <><CloseCircleFilled /> Passwords do not match</>}
                            </span>
                          )}
                        </Field>

                      </div>

                      {/* requirements checklist */}
                      <div style={{ margin: "16px 0", padding: "14px 16px", background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" }}>
                        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: "#374151" }}>Password requirements:</p>
                        {[
                          { label: "At least 8 characters", ok: pwdForm.newPassword.length >= 8 },
                          { label: "At least 1 uppercase letter (A–Z)", ok: /[A-Z]/.test(pwdForm.newPassword) },
                          { label: "At least 1 number (0–9)", ok: /[0-9]/.test(pwdForm.newPassword) },
                          { label: "Special character recommended (!@#$…)", ok: /[^A-Za-z0-9]/.test(pwdForm.newPassword) },
                        ].map(({ label, ok }) => (
                          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: ok ? "#16a34a" : "#6b7280", marginBottom: 4 }}>
                            <span style={{ fontSize: 14 }}>{ok ? "✅" : "○"}</span> {label}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: 12, maxWidth: 440 }}>
                        <button type="button" onClick={() => { setPasswordMode(false); setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); setPwdErrors({}); }} disabled={pwdLoading}
                          style={{ flex: 1, padding: "13px", background: "#f3f4f6", border: "1.5px solid #e5e7eb", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", color: "#374151" }}>
                          Cancel
                        </button>
                        <button type="submit" disabled={pwdLoading}
                          style={{ flex: 2, padding: "13px", background: "linear-gradient(135deg,#d97706,#f59e0b)", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: pwdLoading ? "not-allowed" : "pointer", opacity: pwdLoading ? 0.65 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 15px rgba(217,119,6,0.3)" }}>
                          <LockOutlined /> {pwdLoading ? "Updating…" : "Update Password"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
