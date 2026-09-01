import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Globe2,
  GraduationCap,
  HelpCircle,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../lib/api";

const COUNTRIES = [
  { name: "Nepal", code: "+977", flag: "🇳🇵" },
  { name: "Bangladesh", code: "+880", flag: "🇧🇩" },
  { name: "Nigeria", code: "+234", flag: "🇳🇬" },
  { name: "United States", code: "+1", flag: "🇺🇸" },
  { name: "United Arab Emirates", code: "+971", flag: "🇦🇪" },
  { name: "Kenya", code: "+254", flag: "🇰🇪" },
  { name: "Sri Lanka", code: "+94", flag: "🇱🇰" },
  { name: "Bhutan", code: "+975", flag: "🇧🇹" },
  { name: "Tanzania", code: "+255", flag: "🇹🇿" },
  { name: "Indonesia", code: "+62", flag: "🇮🇩" },
  { name: "United Kingdom", code: "+44", flag: "🇬🇧" },
  { name: "Canada", code: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "+61", flag: "🇦🇺" },
  { name: "Ghana", code: "+233", flag: "🇬🇭" },
  { name: "Malaysia", code: "+60", flag: "🇲🇾" },
  { name: "Zimbabwe", code: "+263", flag: "🇿🇼" },
  { name: "India", code: "+91", flag: "🇮🇳" },
  { name: "Other / International", code: "+1", flag: "🌐" },
];

const DISCIPLINES = [
  "Artificial Intelligence & Data Science",
  "Computer Science & IT Engineering",
  "Mechanical & Civil Engineering",
  "Biotechnology & Health Sciences",
  "Business Administration & MBA",
  "Medicine, Pharmacy & Nursing",
  "Economics & Global Finance",
  "Design, Animation & Media Arts",
  "Law & International Relations",
  "Pure Sciences & Mathematics",
];

const INDIAN_STATES = [
  "Delhi NCR",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Telangana",
  "Punjab",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Kerala",
  "Rajasthan",
  "Madhya Pradesh",
  "Odisha",
  "Other State / UT",
];

export default function RegisterPage() {
  const { role: initialRole = "student" } = useParams();
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState<"student" | "institute">(
    initialRole === "institute" ? "institute" : "student"
  );

  // Student Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("Nepal");
  const [phoneCode, setPhoneCode] = useState("+977");
  const [phone, setPhone] = useState("");
  const [passportNumber, setPassportNumber] = useState("");
  const [preferredLevel, setPreferredLevel] = useState("UNDERGRADUATE");
  const [preferredDiscipline, setPreferredDiscipline] = useState(DISCIPLINES[0]);
  const [targetIntake, setTargetIntake] = useState("Fall 2026");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Institute Form State
  const [instituteName, setInstituteName] = useState("");
  const [contactName, setContactName] = useState("");
  const [instEmail, setInstEmail] = useState("");
  const [instPhone, setInstPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Delhi NCR");
  const [website, setWebsite] = useState("");
  const [aisheCode, setAisheCode] = useState("");
  const [naacGrade, setNaacGrade] = useState("A++");

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleCountryChange(countryName: string) {
    setSelectedCountry(countryName);
    const found = COUNTRIES.find((c) => c.name === countryName);
    if (found) setPhoneCode(found.code);
  }

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  function getStrengthLabel() {
    if (passwordStrength <= 1) return { label: "Weak", color: "#f43f5e" };
    if (passwordStrength <= 3) return { label: "Medium", color: "#f59e0b" };
    return { label: "Strong & Secure", color: "#10b981" };
  }

  function handleDemoFill() {
    if (activeRole === "student") {
      setFirstName("Amina");
      setLastName("Diallo");
      setSelectedCountry("Nigeria");
      setPhoneCode("+234");
      setPhone("8012345678");
      setPassportNumber("A98765432");
      setPreferredLevel("UNDERGRADUATE");
      setPreferredDiscipline(DISCIPLINES[0]);
      setEmail(`student.${Date.now().toString(36)}@example.com`);
      setPassword("GlobalStudent@2026");
      setAgreed(true);
    } else {
      setInstituteName("National Institute of Technology & AI");
      setContactName("Dr. Rajesh Sharma");
      setInstEmail(`admissions.${Date.now().toString(36)}@nit.ac.in`);
      setInstPhone("+91 9876543210");
      setCity("Bengaluru");
      setState("Karnataka");
      setWebsite("https://www.nit-ai.edu.in");
      setAisheCode("C-12345");
      setNaacGrade("A++");
      setPassword("InstituteAdmin@2026");
      setAgreed(true);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agreed) {
      setError("Please accept the Terms of Service & Privacy Policy to proceed.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");

    const body =
      activeRole === "institute"
        ? {
            instituteName: instituteName.trim(),
            contactName: contactName.trim(),
            email: instEmail.trim(),
            password,
            city: city.trim(),
            state,
            website: website.trim(),
            aisheCode: aisheCode.trim(),
            phone: instPhone.trim(),
            naacGrade,
          }
        : {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            password,
            country: selectedCountry,
            phone: `${phoneCode} ${phone}`.trim(),
            preferredLevel,
            preferredDiscipline,
            targetIntake,
            passportNumber: passportNumber.trim().toUpperCase(),
          };

    try {
      const result = await apiRequest<{ message: string; user?: any }>(
        `/api/auth/register/${activeRole}`,
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      setMessage(result.message || "Registration successful! You can now log in to your account.");
      setTimeout(() => {
        navigate(`/login/${activeRole}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please review your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="registration-page"
      style={{
        position: "relative",
        minHeight: "calc(100vh - 70px)",
        background: "linear-gradient(135deg, #f3f8f7 0%, #fdf8f3 45%, #eff6f5 100%)",
        padding: "45px 0 70px",
        overflow: "hidden",
      }}
    >
      {/* iOS 27 Liquid Ambient Glowing Mesh Orbs */}
      <div className="glass-mesh-backdrop">
        <div className="glass-mesh-orb orb-1" />
        <div className="glass-mesh-orb orb-2" />
        <div className="glass-mesh-orb orb-3" />
      </div>

      <div className="portal-shell registration-grid" style={{ position: "relative", zIndex: 1, maxWidth: "1240px", gap: "48px" }}>
        
        {/* Left Side: Modern Visual Hero & Glass Badges */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", animation: "ios27Enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
          
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "999px", background: "rgba(255, 240, 228, 0.8)", backdropFilter: "blur(12px)", border: "1px solid rgba(232, 117, 36, 0.3)", color: "#e87524", fontSize: "11.5px", fontWeight: "800", letterSpacing: "0.12em", width: "max-content", marginBottom: "16px", boxShadow: "0 4px 15px rgba(232, 117, 36, 0.12)" }}>
            <span className="live-pulse-dot" />
            <Sparkles size={14} /> ADMISSIONS GATEWAY 2026–2027
          </div>

          <h1 style={{ fontSize: "clamp(34px, 3.8vw, 48px)", lineHeight: "1.06", color: "#113338", letterSpacing: "-0.035em", margin: "0 0 16px" }}>
            {activeRole === "student" ? (
              <>
                Your Global Passport to <span style={{ background: "linear-gradient(135deg, #e87524 0%, #f97316 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Higher Education</span> in India.
              </>
            ) : (
              <>
                Connect with Over <span style={{ background: "linear-gradient(135deg, #0b655d 0%, #14b8a6 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>5,000+ Overseas</span> Applicants.
              </>
            )}
          </h1>

          <p style={{ color: "#546e72", fontSize: "14.5px", lineHeight: "1.68", margin: "0 0 26px", maxWidth: "500px" }}>
            {activeRole === "student"
              ? "Join verified learners from 80+ countries. Compare accredited degrees in USD, unlock 100% tuition scholarships, and receive official offer letters."
              : "Onboard your university to India's unified international education portal. Manage quotas, review overseas credentials, and issue automated offer letters."}
          </p>

          {/* iOS 27 Frosted Value Cards */}
          <div style={{ display: "grid", gap: "12px", marginBottom: "28px" }}>
            {[
              { icon: Zap, color: "#e87524", title: "Provisional Offer Letters", desc: "Download visa-ready admission certificates in minutes." },
              { icon: Award, color: "#0b655d", title: "Study in India (SII) Scholarships", desc: "Merit fee waivers ranging from 25% to 100% full tuition." },
              { icon: ShieldCheck, color: "#2563eb", title: "National Compliance & FRRO Help", desc: "Pre-departure visa guidance and mandatory 14-day FRRO support." },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    padding: "13px 16px",
                    borderRadius: "14px",
                    background: "rgba(255, 255, 255, 0.65)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 10px 25px rgba(20, 50, 55, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <span
                    style={{
                      display: "grid",
                      width: "34px",
                      height: "34px",
                      placeItems: "center",
                      borderRadius: "10px",
                      background: `rgba(${item.color === "#e87524" ? "232,117,36" : item.color === "#0b655d" ? "11,101,93" : "37,99,235"}, 0.12)`,
                      color: item.color,
                      flexShrink: 0,
                    }}
                  >
                    <IconComp size={18} />
                  </span>
                  <div>
                    <strong style={{ fontSize: "13.5px", color: "#14373b", display: "block" }}>{item.title}</strong>
                    <small style={{ color: "#617b7f", fontSize: "12px" }}>{item.desc}</small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Liquid Glass Counter Strip */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, rgba(14, 46, 49, 0.92) 0%, rgba(20, 58, 62, 0.88) 100%)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "0 20px 40px rgba(10, 34, 38, 0.25)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: "19px", fontWeight: "800", color: "#ffb07b", display: "flex", alignItems: "center", gap: "6px" }}>
                <Flame size={18} color="#ff813d" /> 5,400+ Foreign Learners
              </div>
              <small style={{ color: "#c1deda", fontSize: "12px" }}>Representing 80+ Nations across 500+ Universities</small>
            </div>
            <Globe2 size={34} color="#77b8ae" />
          </div>
        </div>

        {/* Right Side: Ultra-Modern macOS/iOS 27 Glassmorphic Form Card */}
        <div className="ios27-glass-card" style={{ padding: "34px 38px" }}>
          
          {/* iOS Segmented Pill Role Switcher */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px",
              padding: "4px",
              borderRadius: "12px",
              background: "rgba(225, 235, 233, 0.7)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.8)",
              marginBottom: "24px",
            }}
          >
            <button
              type="button"
              onClick={() => { setActiveRole("student"); setError(""); setMessage(""); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: 0,
                background: activeRole === "student" ? "#fff" : "transparent",
                color: activeRole === "student" ? "#0b655d" : "#5d7579",
                fontWeight: "800",
                fontSize: "13px",
                boxShadow: activeRole === "student" ? "0 4px 15px rgba(0,0,0,0.06), inset 0 1px 1px #fff" : "none",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <GraduationCap size={17} color={activeRole === "student" ? "#0b655d" : "#7c9397"} />
              Student Registration
            </button>
            <button
              type="button"
              onClick={() => { setActiveRole("institute"); setError(""); setMessage(""); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "10px 14px",
                borderRadius: "10px",
                border: 0,
                background: activeRole === "institute" ? "#fff" : "transparent",
                color: activeRole === "institute" ? "#0b655d" : "#5d7579",
                fontWeight: "800",
                fontSize: "13px",
                boxShadow: activeRole === "institute" ? "0 4px 15px rgba(0,0,0,0.06), inset 0 1px 1px #fff" : "none",
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <Building2 size={17} color={activeRole === "institute" ? "#0b655d" : "#7c9397"} />
              Institution Portal
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
            <div>
              <h2 style={{ fontSize: "20px", color: "#13383c", margin: "0 0 3px", letterSpacing: "-0.02em" }}>
                {activeRole === "student" ? "Create Student Profile" : "Register Academic Institution"}
              </h2>
              <small style={{ color: "#74888b", fontSize: "12px" }}>
                {activeRole === "student" ? "Official Study in India admissions registration" : "Official nodal authority & AISHE university credentials"}
              </small>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(232, 117, 36, 0.3)",
                background: "rgba(255, 240, 228, 0.8)",
                color: "#c95d14",
                fontSize: "11.5px",
                fontWeight: "800",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              title="Autofill sample form data for instant testing"
            >
              <Zap size={13} color="#e87524" /> Autofill Demo
            </button>
          </div>

          {error && (
            <div style={{ padding: "11px 14px", borderRadius: "10px", background: "rgba(254, 226, 226, 0.9)", backdropFilter: "blur(10px)", color: "#991b1b", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", border: "1px solid #fca5a5" }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {message && (
            <div style={{ padding: "11px 14px", borderRadius: "10px", background: "rgba(209, 250, 229, 0.9)", backdropFilter: "blur(10px)", color: "#065f46", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", border: "1px solid #6ee7b7" }}>
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "15px" }}>
            {activeRole === "student" ? (
              <>
                {/* Name fields */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label>
                    First Name <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. Amina"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      minLength={2}
                      style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                    />
                  </label>
                  <label>
                    Last Name <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. Diallo"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      minLength={2}
                      style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                    />
                  </label>
                </div>

                {/* Country & Phone */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "14px" }}>
                  <label>
                    Country of Citizenship <span style={{ color: "#e87524" }}>*</span>
                    <select
                      value={selectedCountry}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      required
                      style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    WhatsApp / Contact Phone
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={{ display: "grid", placeItems: "center", padding: "0 10px", background: "#edf4f3", border: "1px solid var(--ws-border)", borderRadius: "10px", fontSize: "12.5px", color: "#546d71", fontWeight: "750" }}>
                        {phoneCode}
                      </span>
                      <input
                        placeholder="e.g. 8012345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ flex: 1, background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                      />
                    </div>
                  </label>
                </div>

                {/* Academic Preferences */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label>
                    Target Degree Level
                    <select value={preferredLevel} onChange={(e) => setPreferredLevel(e.target.value)} style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}>
                      <option value="UNDERGRADUATE">Undergraduate (Bachelor's)</option>
                      <option value="POSTGRADUATE">Postgraduate (Master's / MBA)</option>
                      <option value="DOCTORAL">Doctoral (Ph.D / Research)</option>
                      <option value="DIPLOMA">Diploma & Certificate</option>
                    </select>
                  </label>

                  <label>
                    Intended Intake Season
                    <select value={targetIntake} onChange={(e) => setTargetIntake(e.target.value)} style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}>
                      <option value="Fall 2026">Fall Intake 2026 (August)</option>
                      <option value="Spring 2027">Spring Intake 2027 (January)</option>
                      <option value="Summer 2027">Summer Intensive 2027</option>
                    </select>
                  </label>
                </div>

                <label>
                  Preferred Academic Field / Major
                  <select value={preferredDiscipline} onChange={(e) => setPreferredDiscipline(e.target.value)} style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}>
                    {DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Optional Passport */}
                <label>
                  Passport / National ID Number (Optional at signup)
                  <input
                    placeholder="e.g. A12345678"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                  />
                </label>
              </>
            ) : (
              <>
                {/* Institute Fields */}
                <label>
                  Official Institution / University Name <span style={{ color: "#e87524" }}>*</span>
                  <input
                    placeholder="e.g. Indian Institute of Technology & AI"
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    required
                    minLength={3}
                    style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                  />
                </label>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label>
                    Nodal Officer / Registrar Name <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. Prof. Arvind Rao"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                    />
                  </label>
                  <label>
                    Official Campus Helpline Phone
                    <input
                      placeholder="+91 11 2345 6789"
                      value={instPhone}
                      onChange={(e) => setInstPhone(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                    />
                  </label>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label>
                    City in India <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. New Delhi, Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                    />
                  </label>
                  <label>
                    State / Union Territory <span style={{ color: "#e87524" }}>*</span>
                    <select value={state} onChange={(e) => setState(e.target.value)} style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "14px" }}>
                  <label>
                    Official Website URL
                    <input
                      type="url"
                      placeholder="https://www.university.ac.in"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                    />
                  </label>
                  <label>
                    NAAC Accreditation Grade
                    <select value={naacGrade} onChange={(e) => setNaacGrade(e.target.value)} style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}>
                      <option value="A++">A++ (Highest Tier)</option>
                      <option value="A+">A+ Grade</option>
                      <option value="A">A Grade</option>
                      <option value="AUTONOMOUS">Autonomous / CFTI</option>
                    </select>
                  </label>
                </div>
              </>
            )}

            {/* Common Account Credentials */}
            <div style={{ borderTop: "1px solid rgba(20,50,55,0.1)", paddingTop: "16px", marginTop: "4px", display: "grid", gap: "14px" }}>
              <label>
                {activeRole === "student" ? "Email Address (Login ID)" : "Official Institutional Email (.edu / .ac.in)"}{" "}
                <span style={{ color: "#e87524" }}>*</span>
                <input
                  type="email"
                  placeholder={activeRole === "student" ? "student@example.com" : "admissions@university.ac.in"}
                  value={activeRole === "student" ? email : instEmail}
                  onChange={(e) => (activeRole === "student" ? setEmail(e.target.value) : setInstEmail(e.target.value))}
                  required
                  style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}
                />
              </label>

              <label>
                Create Account Password <span style={{ color: "#e87524" }}>*</span>
                <div className="password-field" style={{ background: "rgba(255,255,255,0.85)", borderRadius: "10px" }}>
                  <Lock size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Minimum 8 characters with letters & numbers"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {password && (
                  <div style={{ marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "4px", width: "130px" }}>
                      {[1, 2, 3, 4].map((bar) => (
                        <div
                          key={bar}
                          style={{
                            height: "4px",
                            flex: 1,
                            borderRadius: "2px",
                            background: passwordStrength >= bar ? getStrengthLabel().color : "#e2ece9",
                            transition: "background 0.3s ease",
                          }}
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: "11px", color: getStrengthLabel().color, fontWeight: "800" }}>
                      {getStrengthLabel().label}
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Terms Consent */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12px", color: "#455e63", cursor: "pointer", marginTop: "2px" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
                style={{ marginTop: "2px" }}
              />
              <span>
                I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>. I consent to receive official admissions updates and scholarship notices from Study in India.
              </span>
            </label>

            {/* Submit Button */}
            <button
              className="auth-submit"
              disabled={busy || !agreed}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                minHeight: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #e87524 0%, #c95d14 100%)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "800",
                border: 0,
                cursor: "pointer",
                boxShadow: "0 10px 25px rgba(232,117,36,0.3), inset 0 1px 1px rgba(255,255,255,0.4)",
                transition: "all 0.25s ease",
              }}
            >
              {busy ? "Creating your account…" : activeRole === "student" ? "Create Free Student Account" : "Submit Institution Registration"}
              <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: "center", fontSize: "13px", color: "#6a7f83", marginTop: "4px" }}>
              Already registered? <Link to={`/login/${activeRole}`} style={{ color: "#0b655d", fontWeight: "800" }}>Log in here</Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
