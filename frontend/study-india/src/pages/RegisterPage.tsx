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
    if (passwordStrength <= 1) return { label: "Weak", color: "#e53e3e" };
    if (passwordStrength <= 3) return { label: "Medium", color: "#dd6b20" };
    return { label: "Strong & Secure", color: "#148a79" };
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
    <section className="registration-page" style={{ minHeight: "calc(100vh - 70px)", background: "linear-gradient(135deg, #f7faf9 0%, #fdf9f4 50%, #f4f8f7 100%)", padding: "40px 0 60px" }}>
      <div className="portal-shell registration-grid" style={{ maxWidth: "1220px", gap: "45px" }}>
        
        {/* Left Side: Modern Visual Hero & Trust Authority */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "5px 12px", borderRadius: "999px", background: "#fff0e4", color: "#e87524", fontSize: "11.5px", fontWeight: "800", letterSpacing: "0.12em", width: "max-content", marginBottom: "14px" }}>
            <Sparkles size={15} /> OFFICIAL ADMISSIONS PORTAL 2026-2027
          </div>

          <h1 style={{ fontSize: "clamp(32px, 3.4vw, 46px)", lineHeight: "1.08", color: "#143338", letterSpacing: "-0.03em", margin: "0 0 14px" }}>
            {activeRole === "student" ? (
              <>
                Unlock Your Academic Journey in <span style={{ color: "#e87524" }}>India</span>.
              </>
            ) : (
              <>
                Join India's Global <span style={{ color: "#0b655d" }}>University Network</span>.
              </>
            )}
          </h1>

          <p style={{ color: "#5d7377", fontSize: "14px", lineHeight: "1.65", margin: "0 0 24px", maxWidth: "480px" }}>
            {activeRole === "student"
              ? "Join 5,400+ international students from over 80 countries. Access accredited degree programmes, fee waivers up to 100%, and fast-track student visa support."
              : "Register your institution on India's centralized international education corridor. Connect with verified overseas applicants and streamline admissions."}
          </p>

          {/* Value proposition badges */}
          <div style={{ display: "grid", gap: "12px", marginBottom: "26px" }}>
            {[
              { icon: Zap, title: "1-Click Direct Admissions", desc: "Interactive application wizard with instant status tracking." },
              { icon: Award, title: "Study in India (SII) Scholarships", desc: "Merit fee concessions up to 100% full tuition waiver." },
              { icon: ShieldCheck, title: "Official Govt. Recognition", desc: "UGC, AICTE & Association of Indian Universities compliance." },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.85)", border: "1px solid rgba(20,50,55,0.08)", boxShadow: "0 4px 15px rgba(20,50,55,0.03)" }}>
                  <span style={{ display: "grid", width: "32px", height: "32px", placeItems: "center", borderRadius: "8px", background: "#eef7f5", color: "#0b655d", flexShrink: 0 }}>
                    <IconComp size={17} />
                  </span>
                  <div>
                    <strong style={{ fontSize: "13px", color: "#16383c", display: "block" }}>{item.title}</strong>
                    <small style={{ color: "#6a7f83", fontSize: "11.5px" }}>{item.desc}</small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Proof Counter */}
          <div style={{ padding: "14px 18px", borderRadius: "12px", background: "#153d3f", color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "18px", fontWeight: "800", color: "#ffb07b" }}>5,400+ International Learners</div>
              <small style={{ color: "#c1dcd7", fontSize: "11.5px" }}>Representing 80+ Countries across 500+ Universities</small>
            </div>
            <Globe2 size={32} color="#77b8ae" />
          </div>
        </div>

        {/* Right Side: Ultra-Modern Registration Card */}
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid var(--ws-border)", boxShadow: "0 20px 60px rgba(18,48,51,0.08)", padding: "32px 36px", overflow: "hidden" }}>
          
          {/* Role Switcher Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", padding: "4px", borderRadius: "10px", background: "#f0f4f3", marginBottom: "22px" }}>
            <button
              type="button"
              onClick={() => { setActiveRole("student"); setError(""); setMessage(""); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                padding: "9px 14px",
                borderRadius: "8px",
                border: 0,
                background: activeRole === "student" ? "#fff" : "transparent",
                color: activeRole === "student" ? "#0b655d" : "#5d7579",
                fontWeight: "750",
                fontSize: "13px",
                boxShadow: activeRole === "student" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <GraduationCap size={16} color={activeRole === "student" ? "#0b655d" : "#7c9397"} />
              Student Registration
            </button>
            <button
              type="button"
              onClick={() => { setActiveRole("institute"); setError(""); setMessage(""); }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                padding: "9px 14px",
                borderRadius: "8px",
                border: 0,
                background: activeRole === "institute" ? "#fff" : "transparent",
                color: activeRole === "institute" ? "#0b655d" : "#5d7579",
                fontWeight: "750",
                fontSize: "13px",
                boxShadow: activeRole === "institute" ? "0 2px 8px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Building2 size={16} color={activeRole === "institute" ? "#0b655d" : "#7c9397"} />
              Institution Portal
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "19px", color: "#14383c", margin: "0 0 2px" }}>
                {activeRole === "student" ? "Create Student Account" : "Register Educational Institution"}
              </h2>
              <small style={{ color: "#74888b", fontSize: "12px" }}>
                {activeRole === "student" ? "Fill your identity & academic preferences below" : "Enter your nodal authority & accreditation credentials"}
              </small>
            </div>
            <button
              type="button"
              onClick={handleDemoFill}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "5px 10px", borderRadius: "6px", border: "1px solid #d5e8e3", background: "#f2f9f7", color: "#0b655d", fontSize: "11.5px", fontWeight: "750", cursor: "pointer" }}
              title="Autofill sample form data for testing"
            >
              <Zap size={12} color="#e87524" /> Autofill Demo
            </button>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#fde8e8", color: "#9c1c1c", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {message && (
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#e5f5f1", color: "#0b655d", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <CheckCircle2 size={16} />
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
            {activeRole === "student" ? (
              <>
                {/* Name fields */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label>
                    First Name <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. Amina"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      minLength={2}
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
                    />
                  </label>
                </div>

                {/* Country & Phone */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "12px" }}>
                  <label>
                    Country of Citizenship <span style={{ color: "#e87524" }}>*</span>
                    <select
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
                  </label>

                  <label>
                    WhatsApp / Mobile Phone
                    <div style={{ display: "flex", gap: "6px" }}>
                      <span style={{ display: "grid", placeItems: "center", padding: "0 10px", background: "#f2f5f4", border: "1px solid var(--ws-border)", borderRadius: "7px", fontSize: "12.5px", color: "#546d71", fontWeight: "700" }}>
                        {phoneCode}
                      </span>
                      <input
                        placeholder="e.g. 8012345678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        style={{ flex: 1 }}
                      />
                    </div>
                  </label>
                </div>

                {/* Academic Preferences */}
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label>
                    Target Degree Level
                    <select value={preferredLevel} onChange={(e) => setPreferredLevel(e.target.value)}>
                      <option value="UNDERGRADUATE">Undergraduate (Bachelor's)</option>
                      <option value="POSTGRADUATE">Postgraduate (Master's / MBA)</option>
                      <option value="DOCTORAL">Doctoral (Ph.D / Research)</option>
                      <option value="DIPLOMA">Diploma & Certificate</option>
                    </select>
                  </label>

                  <label>
                    Target Intake Season
                    <select value={targetIntake} onChange={(e) => setTargetIntake(e.target.value)}>
                      <option value="Fall 2026">Fall Intake 2026 (August)</option>
                      <option value="Spring 2027">Spring Intake 2027 (January)</option>
                      <option value="Summer 2027">Summer Intensive 2027</option>
                    </select>
                  </label>
                </div>

                <label>
                  Preferred Academic Field / Major
                  <select value={preferredDiscipline} onChange={(e) => setPreferredDiscipline(e.target.value)}>
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
                  />
                </label>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label>
                    Nodal Officer / Registrar Name <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. Prof. Arvind Rao"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    Official Campus Helpline Phone
                    <input
                      placeholder="+91 11 2345 6789"
                      value={instPhone}
                      onChange={(e) => setInstPhone(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <label>
                    City in India <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. New Delhi, Bengaluru"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </label>
                  <label>
                    State / Union Territory <span style={{ color: "#e87524" }}>*</span>
                    <select value={state} onChange={(e) => setState(e.target.value)}>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "12px" }}>
                  <label>
                    Official Website URL
                    <input
                      type="url"
                      placeholder="https://www.university.ac.in"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </label>
                  <label>
                    NAAC Accreditation Grade
                    <select value={naacGrade} onChange={(e) => setNaacGrade(e.target.value)}>
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
            <div style={{ borderTop: "1px solid var(--ws-border)", paddingTop: "14px", marginTop: "4px", display: "grid", gap: "14px" }}>
              <label>
                {activeRole === "student" ? "Email Address (Login ID)" : "Official Institutional Email (.edu / .ac.in)"}{" "}
                <span style={{ color: "#e87524" }}>*</span>
                <input
                  type="email"
                  placeholder={activeRole === "student" ? "student@example.com" : "admissions@university.ac.in"}
                  value={activeRole === "student" ? email : instEmail}
                  onChange={(e) => (activeRole === "student" ? setEmail(e.target.value) : setInstEmail(e.target.value))}
                  required
                />
              </label>

              <label>
                Create Account Password <span style={{ color: "#e87524" }}>*</span>
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
                  <div style={{ marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: "4px", width: "120px" }}>
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
                    <span style={{ fontSize: "11px", color: getStrengthLabel().color, fontWeight: "700" }}>
                      {getStrengthLabel().label}
                    </span>
                  </div>
                )}
              </label>
            </div>

            {/* Terms Consent */}
            <label style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "12px", color: "#455e63", cursor: "pointer", marginTop: "2px" }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                required
              />
              <span>
                I agree to the <strong>Terms of Service</strong> and <strong>Privacy Policy</strong>. I consent to receive official admissions updates from verified Indian institutions.
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
                minHeight: "46px",
                borderRadius: "9px",
                background: "linear-gradient(135deg, #e87524 0%, #c95d14 100%)",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "800",
                border: 0,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(232,117,36,0.25)",
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
