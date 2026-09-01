import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  Globe2,
  GraduationCap,
  Lock,
  Mail,
  MapPin,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
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
  "Artificial Intelligence & Computer Science",
  "Robotics & Mechanical Engineering",
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
    if (passwordStrength <= 1) return { label: "Weak", color: "#e11d48" };
    if (passwordStrength <= 3) return { label: "Medium", color: "#d97706" };
    return { label: "Strong & Secure", color: "#059669" };
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
      setMessage(result.message || "Registration successful! Redirecting to login...");
      setTimeout(() => {
        navigate(`/login/${activeRole}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please review your details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="world-grid-bg" style={{ minHeight: "calc(100vh - 72px)", padding: "48px 0 80px" }}>
      <div className="portal-shell" style={{ maxWidth: "1200px" }}>
        
        {/* Main Split Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: "48px", alignItems: "start" }}>
          
          {/* Left Column: Prestigious Government & International Showcase Canvas */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Government Authority Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "9999px", background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#065f46", fontSize: "12px", fontWeight: "750", width: "max-content" }}>
              <span className="live-beacon-dot" />
              <ShieldCheck size={14} color="#059669" /> Government of India · Official Admissions Portal
            </div>

            <div>
              <h1 style={{ fontSize: "clamp(34px, 3.6vw, 46px)", fontWeight: "800", lineHeight: "1.12", color: "#0f172a", letterSpacing: "-0.035em", margin: "0 0 16px" }}>
                {activeRole === "student" ? (
                  <>
                    Study at India’s Premier <span style={{ color: "#0b655d" }}>Ranked Universities</span>.
                  </>
                ) : (
                  <>
                    Centralized International <span style={{ color: "#0b655d" }}>Student Admissions</span>.
                  </>
                )}
              </h1>
              <p style={{ color: "#475569", fontSize: "15px", lineHeight: "1.65", margin: 0, maxWidth: "520px" }}>
                {activeRole === "student"
                  ? "Access top UGC & NAAC accredited degree programmes with transparent multi-currency tuition in USD, scholarship waivers up to 100%, and direct provisional admission offer letters."
                  : "Register your university on India's centralized global education corridor. Evaluate international credentials, issue automated offers, and manage overseas student quotas."}
              </p>
            </div>

            {/* Feature Highlights */}
            <div style={{ display: "grid", gap: "12px" }}>
              {[
                { icon: Zap, color: "#ea580c", title: "Direct Provisional Offer Letters", desc: "Download visa-ready admission certificates with embedded verification QR code." },
                { icon: Award, color: "#0b655d", title: "Study in India (SII) Scholarships", desc: "Merit fee waivers up to 100% full tuition for qualifying international students." },
                { icon: ShieldCheck, color: "#2563eb", title: "Embassy & FRRO Compliance", desc: "End-to-end guidance for Indian student visas and mandatory 14-day FRRO reporting." },
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                      padding: "14px 18px",
                      borderRadius: "12px",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
                    }}
                  >
                    <span style={{ display: "grid", width: "34px", height: "34px", placeItems: "center", borderRadius: "8px", background: item.color === "#ea580c" ? "#fff7ed" : item.color === "#0b655d" ? "#f0fdfa" : "#eff6ff", color: item.color, flexShrink: 0 }}>
                      <IconComp size={18} />
                    </span>
                    <div>
                      <strong style={{ fontSize: "13.5px", color: "#0f172a", display: "block" }}>{item.title}</strong>
                      <small style={{ color: "#64748b", fontSize: "12px" }}>{item.desc}</small>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Verified Student Social Proof Quote */}
            <div style={{ padding: "20px 22px", borderRadius: "14px", background: "linear-gradient(135deg, #093f3c 0%, #0f2c2e 100%)", color: "#ffffff", boxShadow: "0 10px 25px rgba(9, 63, 60, 0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#ffb07b", fontSize: "11.5px", fontWeight: "800", marginBottom: "8px" }}>
                <Star size={13} fill="#ffb07b" /> Verified International Scholar
              </div>
              <p style={{ margin: "0 0 12px", fontSize: "13.5px", lineHeight: "1.6", color: "#e6f4f1", fontStyle: "italic" }}>
                "The Study in India platform made securing my admission and 50% tuition waiver at NIT seamless. The offer letter was accepted by the embassy without hassle."
              </p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "10px" }}>
                <div style={{ fontSize: "12px" }}>
                  <strong style={{ color: "#ffffff" }}>Amina D. (Nigeria 🇳🇬)</strong>
                  <span style={{ color: "#99d1c7", display: "block" }}>B.Tech Computer Science & AI</span>
                </div>
                <span style={{ padding: "3px 9px", borderRadius: "9999px", background: "rgba(255,255,255,0.15)", fontSize: "11px", fontWeight: "750", color: "#ffb07b" }}>
                  50% Scholarship
                </span>
              </div>
            </div>

            {/* Live Stats Bar */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", padding: "16px 20px", borderRadius: "12px", background: "#ffffff", border: "1px solid #e2e8f0" }}>
              <div>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#0b655d" }}>5,400+</div>
                <small style={{ color: "#64748b", fontSize: "11.5px", fontWeight: "600" }}>Foreign Students</small>
              </div>
              <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: "14px" }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#ea580c" }}>80+</div>
                <small style={{ color: "#64748b", fontSize: "11.5px", fontWeight: "600" }}>Partner Nations</small>
              </div>
              <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: "14px" }}>
                <div style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>500+</div>
                <small style={{ color: "#64748b", fontSize: "11.5px", fontWeight: "600" }}>Accredited Inst.</small>
              </div>
            </div>
          </div>

          {/* Right Column: World-Class Clean Registration Card */}
          <div className="premium-form-card">
            
            {/* Segmented Role Tabs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", padding: "4px", borderRadius: "10px", background: "#f1f5f9", marginBottom: "24px" }}>
              <button
                type="button"
                onClick={() => { setActiveRole("student"); setError(""); setMessage(""); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: 0,
                  background: activeRole === "student" ? "#ffffff" : "transparent",
                  color: activeRole === "student" ? "#0b655d" : "#64748b",
                  fontWeight: "750",
                  fontSize: "13px",
                  boxShadow: activeRole === "student" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                <GraduationCap size={16} color={activeRole === "student" ? "#0b655d" : "#94a3b8"} />
                Student Account
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
                  borderRadius: "8px",
                  border: 0,
                  background: activeRole === "institute" ? "#ffffff" : "transparent",
                  color: activeRole === "institute" ? "#0b655d" : "#64748b",
                  fontWeight: "750",
                  fontSize: "13px",
                  boxShadow: activeRole === "institute" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                }}
              >
                <Building2 size={16} color={activeRole === "institute" ? "#0b655d" : "#94a3b8"} />
                University Portal
              </button>
            </div>

            {/* Header with Title and 1-Click Demo Fill */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
                  {activeRole === "student" ? "Student Registration" : "Institution Registration"}
                </h2>
                <small style={{ color: "#64748b", fontSize: "12.5px" }}>
                  {activeRole === "student" ? "Create your verified profile to apply and track offers" : "Register your university authority credentials"}
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
                  borderRadius: "6px",
                  border: "1px solid #fed7aa",
                  background: "#fff7ed",
                  color: "#c2410c",
                  fontSize: "12px",
                  fontWeight: "750",
                  cursor: "pointer",
                }}
                title="Autofill demonstration data for testing"
              >
                <Zap size={13} color="#ea580c" /> Autofill Demo
              </button>
            </div>

            {error && <div className="form-error" style={{ marginBottom: "16px" }}><AlertCircle size={16} />{error}</div>}
            {message && <div className="form-success" style={{ marginBottom: "16px" }}><CheckCircle2 size={16} />{message}</div>}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
              {activeRole === "student" ? (
                <>
                  {/* Name fields */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="premium-input-group">
                      <label>First Name <span style={{ color: "#ea580c" }}>*</span></label>
                      <input
                        className="premium-input"
                        placeholder="e.g. Amina"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        minLength={2}
                      />
                    </div>
                    <div className="premium-input-group">
                      <label>Last Name <span style={{ color: "#ea580c" }}>*</span></label>
                      <input
                        className="premium-input"
                        placeholder="e.g. Diallo"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        minLength={2}
                      />
                    </div>
                  </div>

                  {/* Country & Phone */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "14px" }}>
                    <div className="premium-input-group">
                      <label>Country of Citizenship <span style={{ color: "#ea580c" }}>*</span></label>
                      <select
                        className="premium-select"
                        value={selectedCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        required
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="premium-input-group">
                      <label>WhatsApp / Phone</label>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <span style={{ display: "grid", placeItems: "center", padding: "0 10px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "10px", fontSize: "12.5px", color: "#475569", fontWeight: "750" }}>
                          {phoneCode}
                        </span>
                        <input
                          className="premium-input"
                          placeholder="e.g. 8012345678"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Preferences */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="premium-input-group">
                      <label>Target Degree Level</label>
                      <select className="premium-select" value={preferredLevel} onChange={(e) => setPreferredLevel(e.target.value)}>
                        <option value="UNDERGRADUATE">Undergraduate (Bachelor's)</option>
                        <option value="POSTGRADUATE">Postgraduate (Master's / MBA)</option>
                        <option value="DOCTORAL">Doctoral (Ph.D / Research)</option>
                        <option value="DIPLOMA">Diploma & Certificate</option>
                      </select>
                    </div>

                    <div className="premium-input-group">
                      <label>Intended Intake</label>
                      <select className="premium-select" value={targetIntake} onChange={(e) => setTargetIntake(e.target.value)}>
                        <option value="Fall 2026">Fall Intake 2026 (August)</option>
                        <option value="Spring 2027">Spring Intake 2027 (January)</option>
                        <option value="Summer 2027">Summer Intensive 2027</option>
                      </select>
                    </div>
                  </div>

                  <div className="premium-input-group">
                    <label>Preferred Major / Discipline</label>
                    <select className="premium-select" value={preferredDiscipline} onChange={(e) => setPreferredDiscipline(e.target.value)}>
                      {DISCIPLINES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Passport / National ID */}
                  <div className="premium-input-group">
                    <label>Passport / National ID Number (Optional at registration)</label>
                    <input
                      className="premium-input"
                      placeholder="e.g. A12345678"
                      value={passportNumber}
                      onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Institute Fields */}
                  <div className="premium-input-group">
                    <label>Official Institution / University Name <span style={{ color: "#ea580c" }}>*</span></label>
                    <input
                      className="premium-input"
                      placeholder="e.g. Indian Institute of Technology & AI"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      required
                      minLength={3}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="premium-input-group">
                      <label>Nodal Officer Name <span style={{ color: "#ea580c" }}>*</span></label>
                      <input
                        className="premium-input"
                        placeholder="e.g. Prof. Arvind Rao"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="premium-input-group">
                      <label>Helpline Phone</label>
                      <input
                        className="premium-input"
                        placeholder="+91 11 2345 6789"
                        value={instPhone}
                        onChange={(e) => setInstPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                    <div className="premium-input-group">
                      <label>City in India <span style={{ color: "#ea580c" }}>*</span></label>
                      <input
                        className="premium-input"
                        placeholder="e.g. Bengaluru, New Delhi"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="premium-input-group">
                      <label>State / Territory <span style={{ color: "#ea580c" }}>*</span></label>
                      <select className="premium-select" value={state} onChange={(e) => setState(e.target.value)}>
                        {INDIAN_STATES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "14px" }}>
                    <div className="premium-input-group">
                      <label>Website URL</label>
                      <input
                        className="premium-input"
                        type="url"
                        placeholder="https://www.university.ac.in"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                      />
                    </div>
                    <div className="premium-input-group">
                      <label>NAAC Grade</label>
                      <select className="premium-select" value={naacGrade} onChange={(e) => setNaacGrade(e.target.value)}>
                        <option value="A++">A++ (Highest Tier)</option>
                        <option value="A+">A+ Grade</option>
                        <option value="A">A Grade</option>
                        <option value="AUTONOMOUS">Autonomous / CFTI</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Account Credentials */}
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "16px", marginTop: "4px", display: "grid", gap: "14px" }}>
                <div className="premium-input-group">
                  <label>
                    {activeRole === "student" ? "Email Address (Login ID)" : "Official Institutional Email (.edu / .ac.in)"}{" "}
                    <span style={{ color: "#ea580c" }}>*</span>
                  </label>
                  <input
                    className="premium-input"
                    type="email"
                    placeholder={activeRole === "student" ? "student@example.com" : "admissions@university.ac.in"}
                    value={activeRole === "student" ? email : instEmail}
                    onChange={(e) => (activeRole === "student" ? setEmail(e.target.value) : setInstEmail(e.target.value))}
                    required
                  />
                </div>

                <div className="premium-input-group">
                  <label>Create Password <span style={{ color: "#ea580c" }}>*</span></label>
                  <div className="password-field">
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
                    <div style={{ marginTop: "4px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: "4px", width: "130px" }}>
                        {[1, 2, 3, 4].map((bar) => (
                          <div
                            key={bar}
                            style={{
                              height: "4px",
                              flex: 1,
                              borderRadius: "2px",
                              background: passwordStrength >= bar ? getStrengthLabel().color : "#e2e8f0",
                              transition: "background 0.25s ease",
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: "11.5px", color: getStrengthLabel().color, fontWeight: "750" }}>
                        {getStrengthLabel().label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms Consent */}
              <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "12.5px", color: "#475569", cursor: "pointer", marginTop: "2px" }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                  style={{ marginTop: "3px" }}
                />
                <span>
                  I accept the <strong>Terms of Service</strong> & <strong>Privacy Policy</strong> and authorize Study in India to send official admission updates and provisional offer notices.
                </span>
              </label>

              {/* Submit CTA */}
              <button className="auth-submit" type="submit" disabled={busy || !agreed}>
                {busy ? "Creating Account…" : activeRole === "student" ? "Create Free Student Account" : "Submit Institution Registration"}
                <ArrowRight size={16} />
              </button>

              <div style={{ textAlign: "center", fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                Already registered? <Link to={`/login/${activeRole}`} style={{ color: "#0b655d", fontWeight: "800" }}>Log in here</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
