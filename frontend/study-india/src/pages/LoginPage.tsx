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
  Flame,
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
    <section
      className="auth-page"
      style={{
        position: "relative",
        minHeight: "calc(100vh - 70px)",
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        background: "linear-gradient(135deg, #f4f8f7 0%, #faf6f1 50%, #eff5f4 100%)",
        overflow: "hidden",
      }}
    >
      {/* iOS 27 Ambient Liquid Mesh Orbs */}
      <div className="glass-mesh-backdrop">
        <div className="glass-mesh-orb orb-1" />
        <div className="glass-mesh-orb orb-2" />
        <div className="glass-mesh-orb orb-3" />
      </div>

      {/* Left Branding Side */}
      <div
        className="auth-aside"
        style={{
          position: "relative",
          zIndex: 1,
          isolation: "isolate",
          overflow: "hidden",
          color: "#fff",
          background: "linear-gradient(135deg, rgba(9, 63, 60, 0.94) 0%, rgba(21, 60, 64, 0.94) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "50px 56px",
          borderRight: "1px solid rgba(255, 255, 255, 0.12)",
          animation: "ios27Enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "5px 13px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", color: "#ffb07b", fontSize: "11.5px", fontWeight: "800", letterSpacing: "0.12em", marginBottom: "20px" }}>
            <span className="live-pulse-dot" />
            <Sparkles size={14} /> STUDY IN INDIA SECURE GATEWAY
          </div>
          <h1 style={{ fontSize: "clamp(30px, 3.2vw, 44px)", lineHeight: "1.08", margin: "0 0 16px", color: "#fff", letterSpacing: "-0.035em" }}>
            Empowering Global Ambitions with <span style={{ background: "linear-gradient(135deg, #ff813d 0%, #ffb07b 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Indian Excellence</span>.
          </h1>
          <p style={{ color: "#d2ece8", fontSize: "14.5px", lineHeight: "1.68", margin: 0, maxWidth: "490px" }}>
            Sign in to track your admissions progress, download provisional offer letters, consult university nodal officers, or manage institutional quotas.
          </p>
        </div>

        {/* Highlight features with frosted glass */}
        <div style={{ display: "grid", gap: "10px", margin: "32px 0" }}>
          {[
            { title: "Provisional Offer Letters", desc: "Download official admission certificates with verification QR codes." },
            { title: "Multi-Currency Tuition in USD", desc: "Transparent global tuition with Study in India fee concessions." },
            { title: "Pre-Departure Orientation LMS", desc: "Visa, e-FRRO, health insurance, and banking readiness." },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 15px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.09)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.14)",
                fontSize: "13px",
              }}
            >
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
            <div style={{ fontSize: "16.5px", fontWeight: "800", color: "#ffb07b" }}>5,400+ International Students</div>
            <small style={{ color: "#b9d8d4", fontSize: "11.5px" }}>Across 500+ NAAC Accredited Indian Universities</small>
          </div>
          <Globe2 size={30} color="#77b8ae" />
        </div>
      </div>

      {/* Right Login Card with iOS 27 Glassmorphism */}
      <div className="auth-panel" style={{ position: "relative", zIndex: 1, display: "grid", placeItems: "center", padding: "40px 24px" }}>
        <div className="ios27-glass-card" style={{ width: "min(470px, 100%)", padding: "34px 38px" }}>
          
          {/* iOS Segmented Pill Role Switcher */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "4px",
              padding: "4px",
              borderRadius: "12px",
              background: "rgba(225, 235, 233, 0.7)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              marginBottom: "22px",
            }}
          >
            {(["student", "institute", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setActiveTab(r); setError(""); }}
                style={{
                  padding: "8px 4px",
                  borderRadius: "9px",
                  border: 0,
                  background: activeTab === r ? "#fff" : "transparent",
                  color: activeTab === r ? "#0b655d" : "#5d7579",
                  fontWeight: "800",
                  fontSize: "12.5px",
                  boxShadow: activeTab === r ? "0 3px 12px rgba(0,0,0,0.06), inset 0 1px 1px #fff" : "none",
                  cursor: "pointer",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  textTransform: "capitalize",
                }}
              >
                {r}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <span
              style={{
                display: "grid",
                width: "42px",
                height: "42px",
                placeItems: "center",
                borderRadius: "12px",
                background: "rgba(11, 101, 93, 0.12)",
                color: "#0b655d",
                boxShadow: "inset 0 1px 1px rgba(255,255,255,0.8)",
              }}
            >
              <Icon size={22} />
            </span>
            <div>
              <h2 style={{ fontSize: "21px", color: "#14383c", margin: 0, letterSpacing: "-0.02em" }}>{current.title}</h2>
              <small style={{ color: "#74888b", fontSize: "12px" }}>Sign in to access your admissions workspace</small>
            </div>
          </div>

          {error && (
            <div style={{ padding: "11px 14px", borderRadius: "10px", background: "rgba(254, 226, 226, 0.9)", backdropFilter: "blur(10px)", color: "#991b1b", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px", margin: "16px 0", border: "1px solid #fca5a5" }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: "grid", gap: "15px", marginTop: "14px" }}>
            <label>
              Email Address
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={current.demoEmail}
                style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
              />
            </label>

            <label>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Password</span>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); alert("Please use the demo credentials below or contact support."); }}
                  style={{ color: "#e87524", fontSize: "12px", fontWeight: "750", textDecoration: "none" }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="password-field" style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}>
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
                minHeight: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "800",
                border: 0,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(11,101,93,0.28), inset 0 1px 1px rgba(255,255,255,0.3)",
                transition: "all 0.25s ease",
              }}
            >
              {busy ? "Signing in…" : `Sign in to ${current.role === "STUDENT" ? "Student Account" : current.role === "INSTITUTE" ? "Admissions Desk" : "Admin Panel"}`}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick 1-Click Demo Fillers */}
          <div
            style={{
              marginTop: "20px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(235, 246, 243, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(11, 101, 93, 0.15)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#0b655d", fontSize: "12px", fontWeight: "800", marginBottom: "9px" }}>
              <Zap size={14} color="#e87524" /> Instant Demo Login (Click to Autofill):
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => handleQuickDemoFill("student")}
                style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid rgba(11,101,93,0.2)", background: "#fff", color: "#0b655d", fontSize: "11.5px", fontWeight: "750", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}
              >
                🎓 Student ({rolesConfig.student.demoPass})
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill("institute")}
                style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid rgba(11,101,93,0.2)", background: "#fff", color: "#0b655d", fontSize: "11.5px", fontWeight: "750", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}
              >
                🏛️ Institute ({rolesConfig.institute.demoPass})
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoFill("admin")}
                style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid rgba(11,101,93,0.2)", background: "#fff", color: "#0b655d", fontSize: "11.5px", fontWeight: "750", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}
              >
                🛡️ Admin ({rolesConfig.admin.demoPass})
              </button>
            </div>
          </div>

          {activeTab !== "admin" && (
            <p className="auth-register" style={{ textAlign: "center", fontSize: "13px", color: "#6a7f83", marginTop: "18px" }}>
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
