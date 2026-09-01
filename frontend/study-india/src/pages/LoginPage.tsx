import { FormEvent, useState } from "react";
import type { UserRole } from "@draa/shared";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  GraduationCap,
  Lock,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authApi } from "../lib/api";

const rolesConfig: Record<
  string,
  { role: UserRole; title: string; subtitle: string; icon: typeof GraduationCap; demoEmail: string; demoPass: string }
> = {
  student: {
    role: "STUDENT",
    title: "International Student Login",
    subtitle: "Access your applications, admission offers, messaging, and pre-departure hub.",
    icon: GraduationCap,
    demoEmail: "student@demo.draa.in",
    demoPass: "Student@123",
  },
  institute: {
    role: "INSTITUTE",
    title: "University Admissions Desk",
    subtitle: "Review overseas applicants, issue formal offer letters, and manage seat capacities.",
    icon: Building2,
    demoEmail: "institute@demo.draa.in",
    demoPass: "Institute@123",
  },
  admin: {
    role: "ADMIN",
    title: "National Operations Centre",
    subtitle: "DRAA & Study in India governance, accreditation verification, and fraud watchdog.",
    icon: ShieldCheck,
    demoEmail: "admin@demo.draa.in",
    demoPass: "Admin@123",
  },
};

export default function LoginPage() {
  const { role: roleSlug = "student" } = useParams();
  const [activeTab, setActiveTab] = useState<"student" | "institute" | "admin">(
    roleSlug === "institute" ? "institute" : roleSlug === "admin" ? "admin" : "student"
  );

  const current = rolesConfig[activeTab] || rolesConfig.student;
  const Icon = current.icon;

  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function handleQuickDemoFill(roleKey: "student" | "institute" | "admin") {
    setActiveTab(roleKey);
    const cfg = rolesConfig[roleKey];
    setEmail(cfg.demoEmail);
    setPassword(cfg.demoPass);
    setError("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await authApi.login(email.trim(), password, current.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please verify credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page" style={{ minHeight: "calc(100vh - 70px)", display: "grid", gridTemplateColumns: "1.05fr 0.95fr", background: "#f8faf9" }}>
      {/* Left Branding Side */}
      <div
        className="auth-aside"
        style={{
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          color: "#fff",
          background: "linear-gradient(135deg, #093f3c 0%, #153c40 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px 56px",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.14)", color: "#ffb07b", fontSize: "11.5px", fontWeight: "800", letterSpacing: "0.12em", marginBottom: "20px" }}>
            <Sparkles size={15} /> STUDY IN INDIA GLOBAL ACCESS
          </div>
          <h1 style={{ fontSize: "clamp(30px, 3.2vw, 42px)", lineHeight: "1.1", margin: "0 0 16px", color: "#fff", letterSpacing: "-0.03em" }}>
            Connecting Global Aspirations with <span style={{ color: "#ff813d" }}>Indian Excellence</span>.
          </h1>
          <p style={{ color: "#d2ece8", fontSize: "14.5px", lineHeight: "1.65", margin: 0, maxWidth: "480px" }}>
            Log in to manage your foreign admissions journey, download verified offer letters, consult university nodal officers, or monitor institutional pipelines.
          </p>
        </div>

        {/* Highlight features */}
        <div style={{ display: "grid", gap: "10px", margin: "32px 0" }}>
          {[
            { title: "Direct Provisional Offers", desc: "Download official visa-ready admission certificates in seconds." },
            { title: "Multi-Currency Tuition (USD Default)", desc: "Transparent global tuition with scholarship concessions." },
            { title: "Pre-Departure Orientation LMS", desc: "Visa, e-FRRO, health insurance, and banking preparation." },
          ].map((item, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", fontSize: "13px" }}>
              <CheckCircle2 size={16} color="#ff813d" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#fff" }}>{item.title}: </strong>
                <span style={{ color: "#c1deda" }}>{item.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stats banner */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: "18px" }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#ffb07b" }}>5,400+ International Students</div>
            <small style={{ color: "#b9d8d4", fontSize: "11.5px" }}>Across 500+ NAAC Accredited Indian Universities</small>
          </div>
          <Globe2 size={28} color="#77b8ae" />
        </div>
      </div>

      {/* Right Login Card */}
      <div className="auth-panel" style={{ display: "grid", placeItems: "center", padding: "40px 24px", background: "linear-gradient(135deg, #fbfaf8 0%, #f4f8f7 100%)" }}>
        <div className="auth-card" style={{ width: "min(460px, 100%)", padding: "34px 36px", borderRadius: "16px", background: "#fff", border: "1px solid var(--ws-border)", boxShadow: "0 20px 55px rgba(20,50,55,0.08)" }}>
          
          {/* Role selector tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", padding: "4px", borderRadius: "10px", background: "#f0f4f3", marginBottom: "20px" }}>
            {(["student", "institute", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setActiveTab(r); setError(""); }}
                style={{
                  padding: "7px 4px",
                  borderRadius: "7px",
                  border: 0,
                  background: activeTab === r ? "#fff" : "transparent",
                  color: activeTab === r ? "#0b655d" : "#5d7579",
                  fontWeight: "750",
                  fontSize: "12px",
                  boxShadow: activeTab === r ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  textTransform: "capitalize",
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span style={{ display: "grid", width: "38px", height: "38px", placeItems: "center", borderRadius: "10px", background: "#eef7f5", color: "#0b655d" }}>
              <Icon size={20} />
            </span>
            <div>
              <h2 style={{ fontSize: "20px", color: "#14383c", margin: 0 }}>{current.title}</h2>
              <small style={{ color: "#74888b", fontSize: "11.5px" }}>Secure sign-in for Study in India portal</small>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#fde8e8", color: "#9c1c1c", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px", margin: "14px 0" }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: "grid", gap: "14px", marginTop: "14px" }}>
            <label>
              Email address
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={current.demoEmail}
                />
              </div>
            </label>

            <label>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Password</span>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Please use the demo credentials below or contact support."); }} style={{ color: "#e87524", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>
              <div className="password-field">
                <LockKeyhole size={16} />
                <input
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#476166", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Keep me signed in for 30 days
            </label>

            <button
              className="auth-submit"
              disabled={busy}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                minHeight: "46px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "800",
                border: 0,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(11,101,93,0.25)",
              }}
            >
              {busy ? "Signing in…" : `Sign in to ${current.role === "STUDENT" ? "Student Account" : current.role === "INSTITUTE" ? "Admissions Desk" : "Admin Panel"}`}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick 1-Click Demo Fillers */}
          <div style={{ marginTop: "18px", padding: "12px", borderRadius: "10px", background: "#f5f9f8", border: "1px solid #dce8e5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#0b655d", fontSize: "11.5px", fontWeight: "800", marginBottom: "8px" }}>
              <Zap size={13} color="#e87524" /> Instant Demo Login (Click to Autofill):
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleQuickDemoFill("student")}
                style={{ padding: "4px 9px", borderRadius: "6px", border: "1px solid #bfe0d8", background: "#fff", color: "#0b655d", fontSize: "11px", fontWeight: "750", cursor: "pointer" }}
              >
                🎓 Student ({rolesConfig.student.demoPass})
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill("institute")}
                style={{ padding: "4px 9px", borderRadius: "6px", border: "1px solid #bfe0d8", background: "#fff", color: "#0b655d", fontSize: "11px", fontWeight: "750", cursor: "pointer" }}
              >
                🏛️ Institute ({rolesConfig.institute.demoPass})
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill("admin")}
                style={{ padding: "4px 9px", borderRadius: "6px", border: "1px solid #bfe0d8", background: "#fff", color: "#0b655d", fontSize: "11px", fontWeight: "750", cursor: "pointer" }}
              >
                🛡️ Admin ({rolesConfig.admin.demoPass})
              </button>
            </div>
          </div>

          {activeTab !== "admin" && (
            <p className="auth-register" style={{ textAlign: "center", fontSize: "13px", color: "#6a7f83", marginTop: "16px" }}>
              Don't have an account yet?{" "}
              <Link to={`/register/${activeTab}`} style={{ color: "#e87524", fontWeight: "800" }}>
                Create Free {activeTab === "student" ? "Student Profile" : "Institution Account"}
              </Link>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
