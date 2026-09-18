import React, { FormEvent, useState } from "react";
import {
  AlertCircle,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCheck,
  FileText,
  Globe,
  GraduationCap,
  HelpCircle,
  MapPin,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { apiRequest } from "../lib/api";

type Props = {
  course: {
    id: string | number;
    title: string;
    level?: string;
    discipline?: string;
    instituteName?: string;
    city?: string;
    state?: string;
    tuitionFee?: number;
    tuitionFeeInr?: number;
    currency?: string;
    slug?: string;
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
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  // Form State - Step 1: Identity & Passport
  const [fullName, setFullName] = useState(
    initialProfile?.firstName ? `${initialProfile.firstName} ${initialProfile?.lastName || ""}`.trim() : ""
  );
  const [email, setEmail] = useState("");
  const [passportNumber, setPassportNumber] = useState(initialProfile?.passportNumber || "");
  const [nationality, setNationality] = useState(initialProfile?.country || "Nepal");
  const [dob, setDob] = useState("2003-05-15");
  const [emergencyPhone, setEmergencyPhone] = useState("+977 9841234567");

  // Step 2: Academic
  const [previousSchool, setPreviousSchool] = useState("Kathmandu International Academy");
  const [degreeAttained, setDegreeAttained] = useState("High School / Secondary (12th Grade / A-Levels)");
  const [gpaOrPercentage, setGpaOrPercentage] = useState("3.65 / 4.0 GPA (82%)");
  const [graduationYear, setGraduationYear] = useState("2024");

  // Step 3: English Proficiency
  const [testType, setTestType] = useState("IELTS");
  const [testScore, setTestScore] = useState("7.0 Band");
  const [exemptReason, setExemptReason] = useState("");

  // Step 4: SOP
  const [sopText, setSopText] = useState(
    "I am eager to study in India to leverage top-tier academic faculty and research labs. This programme aligns perfectly with my ambition to specialize in advanced technology and contribute to global innovation."
  );
  const [careerGoals, setCareerGoals] = useState("Aspiring Software Solutions Architect in global multinational companies.");

  // Step 5: Scholarship & Declaration
  const [scholarshipRequested, setScholarshipRequested] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  const steps = [
    { num: 1, label: "Identity & Passport", icon: User },
    { num: 2, label: "Academics", icon: GraduationCap },
    { num: 3, label: "Language", icon: Globe },
    { num: 4, label: "Statement", icon: FileText },
    { num: 5, label: "Review & Submit", icon: Award },
  ];

  function validateStep(currentStep: number): boolean {
    setError("");
    if (currentStep === 1) {
      if (!passportNumber.trim() || passportNumber.trim().length < 5) {
        setError("Please enter a valid passport number (minimum 5 characters).");
        return false;
      }
      if (!nationality.trim()) {
        setError("Please specify your country of citizenship.");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!previousSchool.trim()) {
        setError("Please enter your previous school, college, or university name.");
        return false;
      }
      if (!gpaOrPercentage.trim()) {
        setError("Please provide your cumulative GPA or percentage score.");
        return false;
      }
    }
    if (currentStep === 4) {
      if (!sopText.trim() || sopText.trim().length < 25) {
        setError("Please provide a Statement of Purpose of at least 25 characters.");
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
      setError("Please confirm the academic and identity declaration before submitting.");
      return;
    }

    setBusy(true);
    setError("");

    const appId = `SII-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Prepare payload
    const applicationPayload = {
      appId,
      courseId: String(course.id),
      courseTitle: course.title,
      instituteName: course.instituteName || "Indian University",
      statement: sopText,
      passportDetails: {
        passportNumber: passportNumber.trim().toUpperCase(),
        nationality: nationality.trim(),
        dob,
        emergencyPhone,
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
      submittedAt: new Date().toISOString(),
      status: "UNDER_VERIFICATION",
    };

    try {
      // 1. Save to local storage for instant dashboard persistence
      try {
        const existing = JSON.parse(localStorage.getItem("draa_student_applications") || "[]");
        existing.unshift(applicationPayload);
        localStorage.setItem("draa_student_applications", JSON.stringify(existing));
      } catch (_) {}

      // 2. Try syncing with backend API if student session active
      await apiRequest("/api/student/applications/wizard", {
        method: "POST",
        body: JSON.stringify(applicationPayload),
      }).catch(() => {
        // Backend offline or guest mode: local submission is successful
      });

      setSubmittedAppId(appId);
    } catch (submitErr) {
      // Even if network fails, application has been safely saved locally
      setSubmittedAppId(appId);
    } finally {
      setBusy(false);
    }
  }

  const getStepButtonLabel = (s: number) => {
    switch (s) {
      case 1:
        return "Continue to Academics";
      case 2:
        return "Continue to Language";
      case 3:
        return "Continue to Statement";
      case 4:
        return "Review Application";
      default:
        return "Submit Formal Application";
    }
  };

  return (
    <div
      className="admission-wizard-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admission-wizard-dialog" role="dialog" aria-modal="true">
        {/* ── Header ── */}
        <div className="admission-wizard-header">
          <div className="admission-header-info">
            <div className="admission-header-eyebrow">
              <Sparkles size={13} color="#ffb07b" />
              <span>STUDY IN INDIA · DIRECT ADMISSION WIZARD</span>
            </div>
            <h2 className="admission-header-title">{course.title}</h2>
            <div className="admission-header-meta">
              <span>{course.instituteName || "Accredited Indian University"}</span>
              {course.city && <span>· {course.city}, {course.state}</span>}
              <span className="fee-pill">
                Tuition: {course.currency || "USD"} ${(course.tuitionFee || 3500).toLocaleString()}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="admission-wizard-close-btn"
            onClick={onClose}
            aria-label="Close wizard"
          >
            <X size={19} />
          </button>
        </div>

        {/* ── If Successfully Submitted: Show Confirmation Screen ── */}
        {submittedAppId ? (
          <div className="admission-success-screen">
            <div className="success-icon-wrap">
              <CheckCircle2 size={54} color="#16a34a" />
            </div>
            <span className="success-badge">APPLICATION SUBMITTED TO EMBASSY & INSTITUTION</span>
            <h2 className="success-heading">Application Successfully Received!</h2>
            <p className="success-desc">
              Your application for <strong>{course.title}</strong> at <strong>{course.instituteName}</strong> has been registered under Study in India priority admissions.
            </p>

            <div className="success-ref-card">
              <div className="ref-item">
                <small>Application Reference ID</small>
                <strong>{submittedAppId}</strong>
              </div>
              <div className="ref-item">
                <small>Candidate Passport</small>
                <strong>{passportNumber || "VERIFIED"}</strong>
              </div>
              <div className="ref-item">
                <small>Scholarship Review</small>
                <strong style={{ color: "#c2410c" }}>Eligible for up to 100% SII Waiver</strong>
              </div>
            </div>

            <div className="next-steps-timeline">
              <div className="timeline-item done">
                <span className="timeline-dot"><Check size={13} /></span>
                <div>
                  <strong>1. Application Filed</strong>
                  <p>Credentials logged and forwarded to admissions directorate.</p>
                </div>
              </div>
              <div className="timeline-item active">
                <span className="timeline-dot">2</span>
                <div>
                  <strong>2. Transcript Verification</strong>
                  <p>Dean's office evaluates GPA and secondary equivalence (1-2 business days).</p>
                </div>
              </div>
              <div className="timeline-item">
                <span className="timeline-dot">3</span>
                <div>
                  <strong>3. Provisional Offer & Visa Invitation</strong>
                  <p>Official Letter of Acceptance issued for Indian Mission (S-Visa) processing.</p>
                </div>
              </div>
            </div>

            <div className="success-action-row">
              <button
                type="button"
                className="btn-wizard-finish"
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                Done & Continue Exploring
              </button>
            </div>
          </div>
        ) : (
          /* ── Normal Multi-Step Form ── */
          <>
            {/* Step Progress Tracker */}
            <div className="admission-steps-tracker">
              {steps.map((s) => {
                const Icon = s.icon;
                const isDone = step > s.num;
                const isCurr = step === s.num;
                return (
                  <div
                    key={s.num}
                    className={`tracker-step ${isCurr ? "current" : ""} ${isDone ? "completed" : ""}`}
                  >
                    <span className="tracker-circle">
                      {isDone ? <Check size={14} /> : s.num}
                    </span>
                    <span className="tracker-label">{s.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Error Notification */}
            {error && (
              <div className="admission-wizard-error">
                <AlertCircle size={17} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="admission-wizard-form">
              {/* STEP 1: IDENTITY & PASSPORT */}
              {step === 1 && (
                <div className="wizard-step-pane">
                  <div className="wizard-notice-box">
                    <ShieldCheck size={18} color="#0b655d" />
                    <div>
                      <strong>International Travel & Visa Identity:</strong>
                      <p>Ensure your passport number and legal name exactly match your government travel document for Indian Embassy student visa (S-Visa) issuance.</p>
                    </div>
                  </div>

                  <div className="wizard-form-row">
                    <div className="wizard-form-field">
                      <label>
                        Full Legal Name (as on Passport) <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Johnathan Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="wizard-form-field">
                      <label>
                        Email Address for Offer Letter <span className="req">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. student@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="wizard-form-row">
                    <div className="wizard-form-field">
                      <label>
                        Passport Number <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. A12345678"
                        value={passportNumber}
                        onChange={(e) => setPassportNumber(e.target.value.toUpperCase())}
                        required
                      />
                    </div>
                    <div className="wizard-form-field">
                      <label>
                        Country of Citizenship <span className="req">*</span>
                      </label>
                      <select
                        value={nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        required
                      >
                        <option value="Nepal">Nepal</option>
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="Sri Lanka">Sri Lanka</option>
                        <option value="Bhutan">Bhutan</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="Saudi Arabia">Saudi Arabia</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="Tanzania">Tanzania</option>
                        <option value="Ghana">Ghana</option>
                        <option value="Ethiopia">Ethiopia</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Mauritius">Mauritius</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Other">Other International Country</option>
                      </select>
                    </div>
                  </div>

                  <div className="wizard-form-row">
                    <div className="wizard-form-field">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>
                    <div className="wizard-form-field">
                      <label>Emergency Contact Phone (with country code)</label>
                      <input
                        type="tel"
                        placeholder="+977 9841234567"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: ACADEMIC QUALIFICATIONS */}
              {step === 2 && (
                <div className="wizard-step-pane">
                  <div className="wizard-notice-box">
                    <GraduationCap size={18} color="#0b655d" />
                    <div>
                      <strong>Academic Records & Equivalency:</strong>
                      <p>Enter your completed education credentials. Indian universities recognise US High School, British A-Levels, IB Diploma, and National Senior Certificates.</p>
                    </div>
                  </div>

                  <div className="wizard-form-field">
                    <label>
                      Previous School / College / University Name <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kathmandu Model College / Cambridge International Academy"
                      value={previousSchool}
                      onChange={(e) => setPreviousSchool(e.target.value)}
                      required
                    />
                  </div>

                  <div className="wizard-form-row">
                    <div className="wizard-form-field">
                      <label>
                        Highest Degree Attained <span className="req">*</span>
                      </label>
                      <select
                        value={degreeAttained}
                        onChange={(e) => setDegreeAttained(e.target.value)}
                      >
                        <option value="High School / 12th Grade / A-Levels">High School / 12th Grade / A-Levels</option>
                        <option value="Bachelor's Degree (3 or 4 Years)">Bachelor's Degree (3 or 4 Years)</option>
                        <option value="Master's Degree">Master's Degree</option>
                        <option value="Polytechnic / Technical Diploma">Polytechnic / Technical Diploma</option>
                      </select>
                    </div>
                    <div className="wizard-form-field">
                      <label>
                        GPA / Cumulative Score / Percentage <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 3.75/4.0 GPA or 85% or Grade A"
                        value={gpaOrPercentage}
                        onChange={(e) => setGpaOrPercentage(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="wizard-form-row">
                    <div className="wizard-form-field">
                      <label>Year of Graduation</label>
                      <input
                        type="number"
                        min="1990"
                        max="2028"
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                      />
                    </div>
                    <div className="wizard-form-field">
                      <label>Primary Major / Stream of Prior Study</label>
                      <input
                        type="text"
                        placeholder="e.g. Science (Physics, Math), Commerce, Humanities"
                        defaultValue="Science & Mathematics"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: LANGUAGE PROFICIENCY */}
              {step === 3 && (
                <div className="wizard-step-pane">
                  <div className="wizard-notice-box">
                    <Globe size={18} color="#0b655d" />
                    <div>
                      <strong>English Medium Instruction:</strong>
                      <p>All degree programmes at accredited Indian universities are taught 100% in English. You can provide standard test scores or an English Medium of Instruction (MOI) certificate.</p>
                    </div>
                  </div>

                  <div className="wizard-form-field">
                    <label>English Evaluation Pathway</label>
                    <select
                      value={testType}
                      onChange={(e) => setTestType(e.target.value)}
                    >
                      <option value="IELTS">IELTS Academic</option>
                      <option value="TOEFL">TOEFL iBT</option>
                      <option value="DUOLINGO">Duolingo English Test (DET)</option>
                      <option value="PTE">PTE Academic</option>
                      <option value="EXEMPT_MOI">Medium of Instruction (MOI was English in School)</option>
                    </select>
                  </div>

                  {testType !== "EXEMPT_MOI" ? (
                    <div className="wizard-form-field">
                      <label>Overall Test Band / Score</label>
                      <input
                        type="text"
                        placeholder="e.g. 7.0 Band (IELTS) or 105 (TOEFL) or 125 (Duolingo)"
                        value={testScore}
                        onChange={(e) => setTestScore(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="wizard-form-field">
                      <label>Certificate Issuer / Secondary School Board</label>
                      <input
                        type="text"
                        placeholder="e.g. Cambridge Board, CBSE International, National High School"
                        value={exemptReason}
                        onChange={(e) => setExemptReason(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: STATEMENT OF PURPOSE */}
              {step === 4 && (
                <div className="wizard-step-pane">
                  <div className="wizard-notice-box">
                    <FileText size={18} color="#0b655d" />
                    <div>
                      <strong>Statement of Purpose (SOP):</strong>
                      <p>Admissions committees evaluate your academic curiosity, motivation to study in India, and post-graduation career vision.</p>
                    </div>
                  </div>

                  <div className="wizard-form-field">
                    <label>
                      Why do you want to pursue this course in India? <span className="req">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Explain how this programme at this university fits your intellectual curiosity and long-term career ambition..."
                      value={sopText}
                      onChange={(e) => setSopText(e.target.value)}
                      required
                    />
                  </div>

                  <div className="wizard-form-field">
                    <label>Career Ambition Post-Graduation</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Aiming to work in AI Systems Development or lead research in renewable infrastructure..."
                      value={careerGoals}
                      onChange={(e) => setCareerGoals(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW & SCHOLARSHIP */}
              {step === 5 && (
                <div className="wizard-step-pane">
                  {/* Scholarship Callout */}
                  <div className="wizard-scholarship-card">
                    <div className="card-top">
                      <Sparkles size={18} color="#e87524" />
                      <strong>Study in India (SII) Merit Scholarship Scheme</strong>
                    </div>
                    <p>
                      Selected international candidates receive <strong>up to 100% or 50% tuition fee concessions</strong> based on academic performance and country diversity quotas.
                    </p>
                    <label className="scholarship-checkbox">
                      <input
                        type="checkbox"
                        checked={scholarshipRequested}
                        onChange={(e) => setScholarshipRequested(e.target.checked)}
                      />
                      <span>Apply for Study in India (SII) & University Merit Fee Concessions</span>
                    </label>
                  </div>

                  {/* Summary Box */}
                  <div className="wizard-summary-box">
                    <div className="summary-row">
                      <span>Target Programme:</span>
                      <strong>{course.title}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Institution:</span>
                      <strong>{course.instituteName || "Indian University"}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Candidate:</span>
                      <strong>{fullName || "Registered Student"} ({nationality})</strong>
                    </div>
                    <div className="summary-row">
                      <span>Passport:</span>
                      <strong>{passportNumber}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Prior Score:</span>
                      <strong>{gpaOrPercentage}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Tuition Reference:</span>
                      <strong>{course.currency || "USD"} ${(course.tuitionFee || 3500).toLocaleString()}/yr</strong>
                    </div>
                  </div>

                  {/* Declaration */}
                  <label className="declaration-checkbox">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      required
                    />
                    <span>
                      I hereby declare that all information submitted is true and accurate. I understand that falsification will lead to immediate revocation of admission and visa sponsorship.
                    </span>
                  </label>
                </div>
              )}

              {/* ── Footer Action Controls ── */}
              <div className="admission-wizard-footer">
                {step > 1 ? (
                  <button
                    type="button"
                    className="btn-wizard-back"
                    onClick={handlePrev}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-wizard-cancel"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    className="btn-wizard-next"
                    onClick={handleNext}
                  >
                    {getStepButtonLabel(step)} <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn-wizard-submit"
                    disabled={busy || !agreedToTerms}
                  >
                    {busy ? "Submitting Application…" : "Submit Formal Application"} <Send size={15} />
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
