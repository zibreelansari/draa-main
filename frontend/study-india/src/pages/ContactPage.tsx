import { useState, FormEvent } from "react";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Globe2,
  GraduationCap,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState("ADMISSIONS");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [targetDegree, setTargetDegree] = useState("Undergraduate");
  const [targetIntake, setTargetIntake] = useState("Fall 2026");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="world-grid-bg" style={{ minHeight: "calc(100vh - 72px)", paddingBottom: "70px" }}>
      {/* Top Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #093f3c 0%, #0f2c2e 100%)",
          color: "#fff",
          padding: "48px 20px 42px",
          textAlign: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 14px", borderRadius: "9999px", background: "rgba(255,255,255,0.12)", color: "#ffb07b", fontSize: "11.5px", fontWeight: "750", letterSpacing: "0.12em", marginBottom: "14px" }}>
            <span className="live-beacon-dot" />
            <Sparkles size={14} /> DEDICATED INTERNATIONAL ADVISORY
          </div>
          <h1 style={{ fontSize: "clamp(30px, 3.5vw, 42px)", fontWeight: "800", margin: "0 0 10px", color: "#fff", letterSpacing: "-0.03em" }}>
            Study in India Admissions Helpdesk
          </h1>
          <p style={{ color: "#d2ece8", fontSize: "14.5px", margin: 0, lineHeight: "1.6" }}>
            Get verified guidance on course eligibility, university provisional offer letters, fee waivers, and student visa compliance.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="portal-shell" style={{ maxWidth: "1180px", marginTop: "36px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: "28px" }}>
          
          {/* Left: Contact Info & Emergency Hotline */}
          <div style={{ display: "grid", gap: "16px", alignContent: "start" }}>
            <div style={{ background: "#fff", padding: "26px", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize: "17px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>Direct Admissions Support</h3>
              <p style={{ color: "#64748b", fontSize: "13px", lineHeight: "1.6", margin: "0 0 20px" }}>
                Our team of dedicated international student advisors assists foreign applicants across 80+ nations.
              </p>

              <div style={{ display: "grid", gap: "16px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#f0fdfa", color: "#0b655d", border: "1px solid #ccfbf1" }}>
                    <Mail size={17} />
                  </span>
                  <div>
                    <small style={{ color: "#64748b", fontSize: "11px", display: "block", fontWeight: "600" }}>Official Helpdesk</small>
                    <a href="mailto:admissions@studyinindia.gov.in" style={{ color: "#0f172a", fontWeight: "750", fontSize: "13px", textDecoration: "none" }}>
                      admissions@studyinindia.gov.in
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa" }}>
                    <Phone size={17} />
                  </span>
                  <div>
                    <small style={{ color: "#64748b", fontSize: "11px", display: "block", fontWeight: "600" }}>Toll-Free International Helpline</small>
                    <a href="tel:+911206565065" style={{ color: "#0f172a", fontWeight: "750", fontSize: "13px", textDecoration: "none" }}>
                      +91 120 6565065
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#f0fdfa", color: "#0b655d", border: "1px solid #ccfbf1" }}>
                    <MapPin size={17} />
                  </span>
                  <div>
                    <small style={{ color: "#64748b", fontSize: "11px", display: "block", fontWeight: "600" }}>Coordination Secretariat</small>
                    <span style={{ color: "#0f172a", fontWeight: "700", fontSize: "12.5px" }}>
                      Study in India Portal, New Delhi, India
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0" }}>
                    <Clock size={17} />
                  </span>
                  <div>
                    <small style={{ color: "#64748b", fontSize: "11px", display: "block", fontWeight: "600" }}>Operating Hours</small>
                    <span style={{ color: "#0f172a", fontWeight: "700", fontSize: "12.5px" }}>
                      Mon – Sat: 9:00 AM – 6:00 PM IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "18px 20px", borderRadius: "12px", background: "linear-gradient(135deg, #093f3c 0%, #0f2c2e 100%)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Sparkles size={16} color="#ffb07b" />
                <strong style={{ fontSize: "13.5px", color: "#ffb07b" }}>Priority WhatsApp Advising</strong>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#c1deda", lineHeight: 1.55 }}>
                Need urgent assistance for visa reporting or letter of acceptance verification? Connect directly with our on-duty counselor.
              </p>
            </div>
          </div>

          {/* Right: Rich Interactive Form */}
          <div className="premium-form-card" style={{ padding: "32px 36px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              Submit Admissions Consultation Request
            </h2>
            <p style={{ color: "#64748b", fontSize: "13px", margin: "0 0 20px" }}>
              Fill out your details and target programme. A university advisor will review your eligibility and respond within 24 hours.
            </p>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ display: "grid", width: "56px", height: "56px", placeItems: "center", borderRadius: "50%", background: "#f0fdf4", color: "#059669", margin: "0 auto 16px", border: "1px solid #bbf7d0" }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>Enquiry Received!</h3>
                <p style={{ color: "#475569", fontSize: "13.5px", maxWidth: "420px", margin: "0 auto 18px", lineHeight: 1.6 }}>
                  Thank you, <strong>{fullName || "Candidate"}</strong>. An official international admissions counselor has been assigned to your query and will contact you via email and phone.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="premium-button-primary"
                  style={{ minHeight: "42px", padding: "0 20px" }}
                >
                  Send Another Query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                {/* Inquiry Category Pills */}
                <div>
                  <label style={{ fontSize: "12.5px", fontWeight: "750", color: "#1e293b", display: "block", marginBottom: "8px" }}>
                    Select Topic of Inquiry
                  </label>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {[
                      { key: "ADMISSIONS", label: "University Admissions & Eligibility" },
                      { key: "SCHOLARSHIPS", label: "Study in India Scholarships (Fee Waivers)" },
                      { key: "VISA", label: "Student Visa & e-FRRO Documentation" },
                      { key: "FEES", label: "Tuition Currency & Living Costs" },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setInquiryType(tab.key)}
                        style={{
                          padding: "7px 12px",
                          borderRadius: "7px",
                          border: inquiryType === tab.key ? "1px solid #0b655d" : "1px solid #cbd5e1",
                          background: inquiryType === tab.key ? "#f0fdfa" : "#ffffff",
                          color: inquiryType === tab.key ? "#0b655d" : "#475569",
                          fontWeight: inquiryType === tab.key ? "800" : "600",
                          fontSize: "12px",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="premium-input-group">
                    <label>Full Name <span className="required-star">*</span></label>
                    <div className="input-with-icon">
                      <User size={15} />
                      <input
                        className="premium-input"
                        placeholder="e.g. Samuel Adebayo"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="premium-input-group">
                    <label>Email Address <span className="required-star">*</span></label>
                    <div className="input-with-icon">
                      <Mail size={15} />
                      <input
                        className="premium-input"
                        type="email"
                        placeholder="samuel@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="premium-input-group">
                    <label>Country of Residence <span className="required-star">*</span></label>
                    <div className="input-with-icon">
                      <Globe2 size={15} />
                      <input
                        className="premium-input"
                        placeholder="e.g. Nigeria, Nepal"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="premium-input-group">
                    <label>WhatsApp / Contact Number</label>
                    <div className="input-with-icon">
                      <Phone size={15} />
                      <input
                        className="premium-input"
                        placeholder="e.g. +234 80 1234 5678"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="premium-input-group">
                    <label>Target Degree Level</label>
                    <div className="input-with-icon">
                      <GraduationCap size={15} />
                      <select className="premium-select" value={targetDegree} onChange={(e) => setTargetDegree(e.target.value)}>
                        <option value="Undergraduate">Undergraduate (B.Tech, BBA, B.Sc, MBBS)</option>
                        <option value="Postgraduate">Postgraduate (M.Tech, MBA, M.Sc, MD)</option>
                        <option value="Doctoral">Doctoral (Ph.D / Fellowship)</option>
                        <option value="Diploma">Diploma / Certificate</option>
                      </select>
                    </div>
                  </div>
                  <div className="premium-input-group">
                    <label>Target Intake</label>
                    <div className="input-with-icon">
                      <Calendar size={15} />
                      <select className="premium-select" value={targetIntake} onChange={(e) => setTargetIntake(e.target.value)}>
                        <option value="Fall 2026">Fall Intake 2026 (August)</option>
                        <option value="Spring 2027">Spring Intake 2027 (January)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="premium-input-group">
                  <label>Your Question or Requirements <span className="required-star">*</span></label>
                  <textarea
                    rows={4}
                    required
                    className="premium-input"
                    style={{ minHeight: "100px", padding: "10px 14px" }}
                    placeholder="Provide details about your academic background, preferred universities or fields, and what questions you have..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-submit-orange"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    minHeight: "46px",
                    padding: "0 24px",
                    borderRadius: "10px",
                    border: 0,
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "14px",
                    cursor: "pointer",
                    justifySelf: "start",
                    transition: "all 0.18s ease",
                  }}
                >
                  Submit Consultation Request <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
