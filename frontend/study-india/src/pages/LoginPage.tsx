import { FormEvent, useEffect, useState } from "react";
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

  useEffect(() => {
    if (roleSlug === "institute") {
      setActiveTab("institute");
    } else if (roleSlug === "admin") {
      setActiveTab("admin");
    } else {
      setActiveTab("student");
    }
    setError("");
  }, [roleSlug]);

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
        <div className="auth-split-layout">
          
          {/* Left Column: Showcase & Trust Canvas */}
          <div className="auth-showcase-column" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            
            {/* Government Shield Tag */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "9999px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#065f46", fontSize: "12px", fontWeight: "750", maxWidth: "100%", width: "fit-content" }}>
              <span className="live-beacon-dot" />
              <ShieldCheck size={14} color="#059669" /> Secure Authentication Gateway · 256-Bit SSL
            </div>

            <div>
              <h1 style={{ fontSize: "clamp(26px, 3.4vw, 40px)", fontWeight: "800", lineHeight: "1.14", color: "#0f172a", letterSpacing: "-0.035em", margin: "0 0 14px" }}>
                Welcome to Study in India <span style={{ color: "#0b655d" }}>Learner Gateway</span>.
              </h1>
              <p style={{ color: "#475569", fontSize: "14.5px", lineHeight: "1.65", margin: 0, maxWidth: "480px" }}>
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

            {/* Visual Campus Showcase Card */}
            <div style={{ position: "relative", borderRadius: "14px", overflow: "hidden", minHeight: "130px", border: "1px solid rgba(11, 101, 93, 0.2)", boxShadow: "0 10px 25px rgba(0,0,0,0.08)", isolation: "isolate" }}>
              <img src="/media/login-side.jpg" alt="Indian university campus" className="content-hero-bg" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0, zIndex: -2 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(9, 63, 60, 0.9) 0%, rgba(15, 44, 46, 0.78) 100%)", zIndex: -1 }} />
              <div style={{ padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
                <div>
                  <div style={{ fontSize: "16.5px", fontWeight: "800", color: "#ffb07b" }}>5,400+ International Students</div>
                  <small style={{ color: "#d2ece8", fontSize: "12px", display: "block", marginTop: "2px" }}>Across 500+ NAAC Accredited Indian Universities</small>
                </div>
                <Globe2 size={32} color="#77b8ae" />
              </div>
            </div>
          </div>

          {/* Right Column: World-Class Login Card */}
          <div className="auth-form-column premium-form-card">
            
            {/* Segmented Role Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px", padding: "4px", borderRadius: "10px", background: "#f1f5f9", marginBottom: "22px" }}>
              {(["student", "institute", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setActiveTab(r);
                    setError("");
                    navigate(`/login/${r}`, { replace: true });
                  }}
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

            {activeTab !== "admin" && (
              <p style={{ textAlign: "center", fontSize: "13px", color: "#64748b", marginTop: "18px", marginBottom: 0 }}>
                Don't have an account yet?{" "}
                <Link to={`/register/${activeTab}`} style={{ color: "#0b655d", fontWeight: "800", textDecoration: "none" }}>
                  Create Free {activeTab === "student" ? "Student Account" : "Institute Account"}
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
