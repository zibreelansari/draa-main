import {
  AlertCircle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { apiRequest } from "../lib/api";

type Props = {
  course: {
    id: string | number;
    title: string;
    level?: string;
    discipline?: string;
    instituteName?: string;
    tuitionFee?: number;
    tuitionFeeInr?: number;
    currency?: string;
  };
  initialProfile?: {
    firstName?: string;
    lastName?: string;
    country?: string;
    passportNumber?: string;
  };
  onClose: () => void;
  onSuccess: () => void;
};

export default function ApplicationWizardModal({ course, initialProfile, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<number>(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [passportNumber, setPassportNumber] = useState(initialProfile?.passportNumber || "");
  const [nationality, setNationality] = useState(initialProfile?.country || "");
  const [dob, setDob] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Academic
  const [previousSchool, setPreviousSchool] = useState("");
  const [degreeAttained, setDegreeAttained] = useState("High School / Secondary (12th Grade)");
  const [gpaOrPercentage, setGpaOrPercentage] = useState("");
  const [graduationYear, setGraduationYear] = useState(new Date().getFullYear().toString());

  // English Proficiency
  const [testType, setTestType] = useState("IELTS");
  const [testScore, setTestScore] = useState("");
  const [exemptReason, setExemptReason] = useState("");

  // SOP
  const [sopText, setSopText] = useState("");
  const [careerGoals, setCareerGoals] = useState("");

  // Scholarship & Declaration
  const [scholarshipRequested, setScholarshipRequested] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const steps = [
    { num: 1, label: "Identity & Passport", icon: User },
    { num: 2, label: "Academics", icon: GraduationCap },
    { num: 3, label: "Language", icon: Globe },
    { num: 4, label: "Statement of Purpose", icon: FileText },
    { num: 5, label: "Scholarship & Submit", icon: Award },
  ];

  function validateStep(currentStep: number): boolean {
    setError("");
    if (currentStep === 1) {
      if (!passportNumber.trim() || passportNumber.trim().length < 5) {
        setError("Please enter a valid passport number (min 5 characters).");
        return false;
      }
      if (!nationality.trim()) {
        setError("Please select or enter your nationality / country of citizenship.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!previousSchool.trim()) {
        setError("Please enter your previous school or university name.");
        return false;
      }
      if (!gpaOrPercentage.trim()) {
        setError("Please provide your previous GPA or percentage score.");
        return false;
      }
    }
    if (currentStep === 4) {
      if (!sopText.trim() || sopText.trim().length < 40) {
        setError("Please provide a Statement of Purpose of at least 40 characters.");
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  }

  function handlePrev() {
    setError("");
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(5)) return;
    if (!agreedToTerms) {
      setError("Please confirm the accuracy declaration before submitting your application.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      await apiRequest("/api/student/applications/wizard", {
        method: "POST",
        body: JSON.stringify({
          courseId: String(course.id),
          statement: sopText,
          passportDetails: {
            passportNumber: passportNumber.trim().toUpperCase(),
            nationality: nationality.trim(),
            expiryDate: "",
          },
          academicHistory: {
            previousSchool: previousSchool.trim(),
            degreeAttained,
            gpaOrPercentage: gpaOrPercentage.trim(),
            graduationYear: Number(graduationYear) || 2026,
          },
          englishProficiency: {
            testType,
            score: testScore.trim(),
            exemptReason: testType === "EXEMPT_MOI" ? exemptReason : undefined,
          },
          sop: {
            text: sopText.trim(),
            careerGoals: careerGoals.trim(),
          },
          scholarshipRequested,
        }),
      });

      onSuccess();
    } catch (submitErr) {
      setError(submitErr instanceof Error ? submitErr.message : "Failed to submit application.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="workspace-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="workspace-modal" style={{ maxWidth: "720px" }} role="dialog" aria-modal="true">
        <header style={{ background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)", color: "#fff" }}>
          <div>
            <span style={{ color: "#ffb07b" }}>INTERNATIONAL ADMISSIONS WIZARD</span>
            <h2 style={{ color: "#fff", margin: "4px 0" }}>Apply for {course.title}</h2>
            <p style={{ color: "#d2e8e4" }}>
              {course.instituteName || "Indian University"} · Indicative Fee: {course.currency || "USD"} {course.tuitionFee || course.tuitionFeeInr || "Tuition Applicable"}
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "0" }}>
            <X size={20} />
          </button>
        </header>

        {/* Multi-step progress tracker */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "14px 22px",
            background: "#f7faf9",
            borderBottom: "1px solid var(--ws-border)",
          }}
        >
          {steps.map((s) => {
            const Icon = s.icon;
            const isDone = step > s.num;
            const isCurr = step === s.num;
            return (
              <div
                key={s.num}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  color: isCurr ? "#0b655d" : isDone ? "#148a79" : "#7f9397",
                  fontWeight: isCurr ? "800" : "600",
                  fontSize: "12px",
                }}
              >
                <span
                  style={{
                    display: "grid",
                    width: "26px",
                    height: "26px",
                    placeItems: "center",
                    borderRadius: "50%",
                    color: isDone || isCurr ? "#fff" : "#7f9397",
                    background: isDone ? "#148a79" : isCurr ? "#e87524" : "#e0e8e6",
                    fontSize: "11px",
                    fontWeight: "800",
                  }}
                >
                  {isDone ? <Check size={14} /> : s.num}
                </span>
                <span className="hide-mobile">{s.label}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div style={{ margin: "14px 22px 0", padding: "10px 14px", borderRadius: "8px", background: "#fde8e8", color: "#9c1c1c", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: "20px 22px" }}>
          {/* STEP 1: IDENTITY & PASSPORT */}
          {step === 1 && (
            <div style={{ display: "grid", gap: "14px" }}>
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#eff7f5", color: "#165952", fontSize: "12.5px" }}>
                <strong>International Travel & Visa Identity:</strong> Ensure your passport name and number match your physical travel document exactly.
              </div>
              <div className="workspace-form-row">
                <label>
                  Passport Number <span style={{ color: "#e87524" }}>*</span>
                  <input
                    placeholder="e.g. A12345678"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                    required
                  />
                </label>
                <label>
                  Country of Citizenship <span style={{ color: "#e87524" }}>*</span>
                  <input
                    placeholder="e.g. Nepal, Bangladesh, Nigeria, USA"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    required
                  />
                </label>
              </div>
              <div className="workspace-form-row">
                <label>
                  Date of Birth
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </label>
                <label>
                  Emergency Contact Phone (with country code)
                  <input placeholder="+1 555 0192" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: ACADEMIC QUALIFICATIONS */}
          {step === 2 && (
            <div style={{ display: "grid", gap: "14px" }}>
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#eff7f5", color: "#165952", fontSize: "12.5px" }}>
                <strong>Prior Educational Background:</strong> Enter the highest completed qualification required for this programme level.
              </div>
              <label>
                Previous School / College / University <span style={{ color: "#e87524" }}>*</span>
                <input
                  placeholder="e.g. Kathmandu Model College, DPS Dhaka, Cambridge Academy"
                  value={previousSchool}
                  onChange={(e) => setPreviousSchool(e.target.value)}
                  required
                />
              </label>
              <div className="workspace-form-row">
                <label>
                  Highest Degree Attained <span style={{ color: "#e87524" }}>*</span>
                  <select value={degreeAttained} onChange={(e) => setDegreeAttained(e.target.value)}>
                    <option value="High School / 12th Grade / A-Levels">High School / 12th Grade / A-Levels</option>
                    <option value="Bachelor's Degree">Bachelor's Degree</option>
                    <option value="Master's Degree">Master's Degree</option>
                    <option value="Diploma / Polytechnic Certificate">Diploma / Polytechnic Certificate</option>
                  </select>
                </label>
                <label>
                  GPA / Cumulative Score / Percentage <span style={{ color: "#e87524" }}>*</span>
                  <input
                    placeholder="e.g. 3.8/4.0 GPA or 85% or Grade A"
                    value={gpaOrPercentage}
                    onChange={(e) => setGpaOrPercentage(e.target.value)}
                    required
                  />
                </label>
              </div>
              <label>
                Year of Graduation
                <input
                  type="number"
                  min="1990"
                  max="2028"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                />
              </label>
            </div>
          )}

          {/* STEP 3: LANGUAGE & TEST SCORES */}
          {step === 3 && (
            <div style={{ display: "grid", gap: "14px" }}>
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#eff7f5", color: "#165952", fontSize: "12.5px" }}>
                <strong>English Proficiency Assessment:</strong> All courses in Indian universities are conducted in English.
              </div>
              <label>
                English Evaluation Pathway
                <select value={testType} onChange={(e) => setTestType(e.target.value)}>
                  <option value="IELTS">IELTS (Academic)</option>
                  <option value="TOEFL">TOEFL iBT</option>
                  <option value="DUOLINGO">Duolingo English Test (DET)</option>
                  <option value="PTE">PTE Academic</option>
                  <option value="EXEMPT_MOI">Medium of Instruction (MOI was 100% English)</option>
                </select>
              </label>
              {testType !== "EXEMPT_MOI" ? (
                <label>
                  Overall Test Band / Score
                  <input
                    placeholder="e.g. 7.0 Band (IELTS) or 105 (TOEFL) or 125 (Duolingo)"
                    value={testScore}
                    onChange={(e) => setTestScore(e.target.value)}
                  />
                </label>
              ) : (
                <label>
                  Reason for English Exemption / Certificate Issuer
                  <input
                    placeholder="e.g. High school completed in English medium from certified board"
                    value={exemptReason}
                    onChange={(e) => setExemptReason(e.target.value)}
                  />
                </label>
              )}
            </div>
          )}

          {/* STEP 4: STATEMENT OF PURPOSE */}
          {step === 4 && (
            <div style={{ display: "grid", gap: "14px" }}>
              <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#eff7f5", color: "#165952", fontSize: "12.5px" }}>
                <strong>Personal Statement (SOP):</strong> Share your motivation for studying this discipline in India and your long-term career ambition.
              </div>
              <label>
                Why do you want to pursue this course in India? <span style={{ color: "#e87524" }}>*</span>
                <textarea
                  rows={4}
                  placeholder="Explain why this programme fits your intellectual curiosity and future goals..."
                  value={sopText}
                  onChange={(e) => setSopText(e.target.value)}
                  required
                />
              </label>
              <label>
                Career Objectives upon Graduation
                <textarea
                  rows={2}
                  placeholder="e.g. Intend to work in AI Research / Software Development in multinational technology ecosystems..."
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                />
              </label>
            </div>
          )}

          {/* STEP 5: SCHOLARSHIP & SUBMIT */}
          {step === 5 && (
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ padding: "14px 16px", borderRadius: "10px", border: "1px solid #c9dfd9", background: "#f3f9f8", display: "grid", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0b655d", fontWeight: "800" }}>
                  <Sparkles size={18} color="#e87524" />
                  Study in India & Institute Scholarship Consideration
                </div>
                <p style={{ margin: 0, fontSize: "12.5px", color: "#466367" }}>
                  Eligible foreign applicants may receive up to <strong>100% or 50% tuition fee concessions</strong> based on academic merit and country quota.
                </p>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", cursor: "pointer", marginTop: "4px" }}>
                  <input
                    type="checkbox"
                    checked={scholarshipRequested}
                    onChange={(e) => setScholarshipRequested(e.target.checked)}
                  />
                  Consider my application for Study in India (SII) & Institute Merit Scholarships
                </label>
              </div>

              {/* Summary recap */}
              <div style={{ padding: "12px 14px", borderRadius: "8px", background: "#fbfaf8", border: "1px solid var(--ws-border)", fontSize: "12px", display: "grid", gap: "5px" }}>
                <div><strong>Selected Course:</strong> {course.title}</div>
                <div><strong>Institution:</strong> {course.instituteName || "Indian University"}</div>
                <div><strong>Candidate Passport:</strong> {passportNumber || "Not entered"} ({nationality})</div>
                <div><strong>Prior Degree & Score:</strong> {degreeAttained} — {gpaOrPercentage}</div>
                <div><strong>Tuition Standard:</strong> {course.currency || "USD"} {course.tuitionFee || course.tuitionFeeInr || "Applicable"}</div>
              </div>

              <label style={{ display: "flex", alignItems: "flex-start", gap: "8px", fontSize: "12.5px", color: "#344f56", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  required
                />
                I declare that all submitted academic and passport information is genuine and authentic. I understand false declarations will lead to application cancellation.
              </label>
            </div>
          )}

          {/* Footer Controls */}
          <footer style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--ws-border)" }}>
            {step > 1 ? (
              <button className="workspace-button secondary" type="button" onClick={handlePrev}>
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <button className="workspace-button secondary" type="button" onClick={onClose}>
                Cancel
              </button>
            )}

            {step < 5 ? (
              <button className="workspace-button primary" type="button" onClick={handleNext}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="workspace-button primary" type="submit" disabled={busy || !agreedToTerms} style={{ background: "linear-gradient(135deg, #e87524 0%, #c95d14 100%)", color: "#fff" }}>
                {busy ? "Submitting Application…" : "Submit Formal Application"} <Send size={15} />
              </button>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
}
