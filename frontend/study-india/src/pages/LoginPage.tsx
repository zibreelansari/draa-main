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
  Star,
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
    subtitle: "Sign in to access your admission applications, offer letters, and orientation hub.",
    icon: GraduationCap,
    demoEmail: "student@demo.draa.in",
    demoPass: "Student@123",
  },
  institute: {
    role: "INSTITUTE",
    title: "University Admissions Desk",
    subtitle: "Sign in to review foreign applications, score candidates, and issue offer letters.",
    icon: Building2,
    demoEmail: "institute@demo.draa.in",
    demoPass: "Institute@123",
  },
  admin: {
    role: "ADMIN",
    title: "National Operations Centre",
    subtitle: "DRAA & Study in India governance, accreditation compliance, and security watchdog.",
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
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="world-grid-bg" style={{ minHeight: "calc(100vh - 72px)", padding: "48px 0 80px" }}>
      <div className="portal-shell" style={{ maxWidth: "1120px" }}>
        
        {/* Main Split Screen */}
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: "40px", alignItems: "start" }}>
          
          {/* Left Column: Showcase & Trust Canvas */}
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            
            {/* Government Shield Tag */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "9999px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#065f46", fontSize: "12px", fontWeight: "750", width: "max-content" }}>
              <span className="live-beacon-dot" />
              <ShieldCheck size={14} color="#059669" /> Secure Authentication Gateway · 256-Bit SSL
            </div>

            <div>
              <h1 style={{ fontSize: "clamp(32px, 3.4vw, 44px)", fontWeight: "800", lineHeight: "1.12", color: "#0f172a", letterSpacing: "-0.035em", margin: "0 0 14px" }}>
                Welcome to Study in India <span style={{ color: "#0b655d" }}>Learner Gateway</span>.
              </h1>
              <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.65", margin: 0, maxWidth: "480px" }}>
                Log in to follow your admissions timeline, accept provisional offer letters, chat with university nodal officers, or complete pre-departure modules.
              </p>
            </div>

            {/* Key Benefits */}
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { title: "Direct Provisional Offer Letters", desc: "Download official admission certificates with verification QR codes." },
                { title: "Multi-Currency Tuition in USD", desc: "Transparent global tuition with Study in India fee concessions." },
                { title: "Pre-Departure Orientation LMS", desc: "Visa, e-FRRO, health insurance, and banking readiness." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "13px 16px",
                    borderRadius: "12px",
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                >
                  <CheckCircle2 size={16} color="#0b655d" style={{ flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: "#0f172a" }}>{item.title}: </strong>
                    <span style={{ color: "#64748b" }}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom stats banner */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderRadius: "12px", background: "linear-gradient(135deg, #093f3c 0%, #0f2c2e 100%)", color: "#fff" }}>
              <div>
                <div style={{ fontSize: "16.5px", fontWeight: "800", color: "#ffb07b" }}>5,400+ International Students</div>
                <small style={{ color: "#c1deda", fontSize: "11.5px" }}>Across 500+ NAAC Accredited Indian Universities</small>
              </div>
              <Globe2 size={28} color="#77b8ae" />
            </div>
          </div>

          {/* Right Column: World-Class Login Card */}
          <div className="premium-form-card" style={{ padding: "34px 38px" }}>
            
            {/* Segmented Role Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", padding: "4px", borderRadius: "10px", background: "#f1f5f9", marginBottom: "22px" }}>
              {(["student", "institute", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setActiveTab(r); setError(""); }}
                  style={{
                    padding: "8px 6px",
                    borderRadius: "7px",
                    border: 0,
                    background: activeTab === r ? "#ffffff" : "transparent",
                    color: activeTab === r ? "#0b655d" : "#64748b",
                    fontWeight: "750",
                    fontSize: "12.5px",
                    boxShadow: activeTab === r ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    textTransform: "capitalize",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px" }}>
              <span style={{ display: "grid", width: "40px", height: "40px", placeItems: "center", borderRadius: "10px", background: "#f0fdfa", color: "#0b655d", border: "1px solid #ccfbf1" }}>
                <Icon size={20} />
              </span>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>{current.title}</h2>
                <small style={{ color: "#64748b", fontSize: "12px" }}>Enter your registered account credentials</small>
              </div>
            </div>

            {error && <div className="form-error" style={{ marginBottom: "16px" }}><AlertCircle size={16} />{error}</div>}

            <form onSubmit={submit} style={{ display: "grid", gap: "16px" }}>
              <div className="premium-input-group">
                <label>Email Address</label>
                <input
                  className="premium-input"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={current.demoEmail}
                />
              </div>

              <div className="premium-input-group">
                <label>
                  <span>Password</span>
                  <a
                    href="#forgot"
                    onClick={(e) => { e.preventDefault(); alert("Please use the demo credentials below or contact support."); }}
                    style={{ color: "#ea580c", fontSize: "12px", fontWeight: "700", textDecoration: "none" }}
                  >
                    Forgot password?
                  </a>
                </label>
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
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#475569", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Keep me signed in for 30 days
              </label>

              <button className="auth-submit" type="submit" disabled={busy}>
                {busy ? "Signing in…" : `Sign in to ${current.role === "STUDENT" ? "Student Workspace" : current.role === "INSTITUTE" ? "Admissions Desk" : "Admin Panel"}`}
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick 1-Click Demo Fillers */}
            <div style={{ marginTop: "20px", padding: "12px 14px", borderRadius: "10px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#0b655d", fontSize: "12px", fontWeight: "750", marginBottom: "8px" }}>
                <Zap size={13} color="#ea580c" /> Instant Demo Login (Click to Autofill):
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill("student")}
                  style={{ padding: "5px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontSize: "11.5px", fontWeight: "700", cursor: "pointer" }}
                >
                  🎓 Student ({rolesConfig.student.demoPass})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill("institute")}
                  style={{ padding: "5px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontSize: "11.5px", fontWeight: "700", cursor: "pointer" }}
                >
                  🏛️ Institute ({rolesConfig.institute.demoPass})
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill("admin")}
                  style={{ padding: "5px 9px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", fontSize: "11.5px", fontWeight: "700", cursor: "pointer" }}
                >
                  🛡️ Admin ({rolesConfig.admin.demoPass})
                </button>
              </div>
            </div>

            {activeTab !== "admin" && (
              <p style={{ textAlign: "center", fontSize: "13px", color: "#64748b", marginTop: "18px", marginBottom: 0 }}>
                Don't have an account yet?{" "}
                <Link to={`/register/${activeTab}`} style={{ color: "#0b655d", fontWeight: "800", textDecoration: "none" }}>
                  Create Free {activeTab === "student" ? "Student Account" : "Institution Portal"}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
