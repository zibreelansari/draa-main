import { useState, FormEvent } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
} from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [inquiryType, setInquiryType] = useState("ADMISSIONS");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [targetDegree, setTargetDegree] = useState("Undergraduate");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ background: "#f8faf9", minHeight: "calc(100vh - 70px)", paddingBottom: "60px" }}>
      {/* Top Banner */}
      <section
        style={{
          background: "linear-gradient(135deg, #093f3c 0%, #153c40 100%)",
          color: "#fff",
          padding: "50px 20px 45px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.15)", color: "#ffb07b", fontSize: "11px", fontWeight: "800", letterSpacing: "0.14em", marginBottom: "12px" }}>
            <Sparkles size={14} /> DEDICATED INTERNATIONAL ADVISORY
          </div>
          <h1 style={{ fontSize: "clamp(28px, 3.5vw, 40px)", margin: "0 0 10px", color: "#fff", letterSpacing: "-0.03em" }}>
            Study in India Admissions Helpdesk
          </h1>
          <p style={{ color: "#c8e6e1", fontSize: "14px", margin: 0 }}>
            Get verified guidance on course eligibility, university provisional offer letters, fee waivers, and student visa compliance.
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div style={{ maxWidth: "1180px", margin: "-25px auto 0", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 380px) 1fr", gap: "24px" }}>
          
          {/* Left: Contact Info & Emergency Hotline */}
          <div style={{ display: "grid", gap: "16px", alignContent: "start" }}>
            <div style={{ background: "#fff", padding: "26px", borderRadius: "14px", border: "1px solid var(--ws-border)", boxShadow: "0 10px 30px rgba(15,40,43,0.04)" }}>
              <h3 style={{ fontSize: "17px", color: "#14383c", margin: "0 0 8px" }}>Direct Admissions Support</h3>
              <p style={{ color: "#6a7f83", fontSize: "12.5px", lineHeight: "1.6", margin: "0 0 18px" }}>
                Our team of dedicated international student advisors assists foreign applicants across 80+ nations.
              </p>

              <div style={{ display: "grid", gap: "14px" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#eef7f5", color: "#0b655d" }}>
                    <Mail size={17} />
                  </span>
                  <div>
                    <small style={{ color: "#798f93", fontSize: "11px", display: "block" }}>Official Helpdesk</small>
                    <a href="mailto:admissions@studyinindia.gov.in" style={{ color: "#14383c", fontWeight: "750", fontSize: "13px", textDecoration: "none" }}>
                      admissions@studyinindia.gov.in
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#fff0e4", color: "#e87524" }}>
                    <Phone size={17} />
                  </span>
                  <div>
                    <small style={{ color: "#798f93", fontSize: "11px", display: "block" }}>Toll-Free International Helpline</small>
                    <a href="tel:+911206565065" style={{ color: "#14383c", fontWeight: "750", fontSize: "13px", textDecoration: "none" }}>
                      +91 120 6565065
                    </a>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#eef7f5", color: "#0b655d" }}>
                    <MapPin size={17} />
                  </span>
                  <div>
                    <small style={{ color: "#798f93", fontSize: "11px", display: "block" }}>Coordination Secretariat</small>
                    <span style={{ color: "#14383c", fontWeight: "700", fontSize: "12.5px" }}>
                      Study in India Portal, New Delhi, India
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#f2f5f4", color: "#546d71" }}>
                    <Clock size={17} />
                  </span>
                  <div>
                    <small style={{ color: "#798f93", fontSize: "11px", display: "block" }}>Operating Hours</small>
                    <span style={{ color: "#14383c", fontWeight: "700", fontSize: "12.5px" }}>
                      Monday – Saturday: 9:00 AM – 6:00 PM IST
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "18px 20px", borderRadius: "12px", background: "#153d3f", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <Sparkles size={16} color="#ffb07b" />
                <strong style={{ fontSize: "13.5px", color: "#ffb07b" }}>Priority WhatsApp Advising</strong>
              </div>
              <p style={{ margin: 0, fontSize: "12px", color: "#c1deda", lineHeight: 1.5 }}>
                Need urgent assistance for visa reporting or letter of acceptance verification? Connect directly with our on-duty counselor.
              </p>
            </div>
          </div>

          {/* Right: Rich Interactive Form */}
          <div style={{ background: "#fff", padding: "32px", borderRadius: "14px", border: "1px solid var(--ws-border)", boxShadow: "0 10px 30px rgba(15,40,43,0.04)" }}>
            <h2 style={{ fontSize: "20px", color: "#14383c", margin: "0 0 6px" }}>Submit Admissions Consultation Request</h2>
            <p style={{ color: "#6a7f83", fontSize: "13px", margin: "0 0 20px" }}>
              Fill out your details and target programme. A university advisor will review your eligibility and respond within 24 hours.
            </p>

            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ display: "grid", width: "56px", height: "56px", placeItems: "center", borderRadius: "50%", background: "#e5f5f1", color: "#0b655d", margin: "0 auto 16px" }}>
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: "20px", color: "#14383c", margin: "0 0 8px" }}>Enquiry Received!</h3>
                <p style={{ color: "#59757a", fontSize: "13.5px", maxWidth: "420px", margin: "0 auto 18px", lineHeight: 1.6 }}>
                  Thank you, <strong>{fullName || "Candidate"}</strong>. An official international admissions counselor has been assigned to your query and will contact you via email and phone.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  style={{ padding: "8px 18px", borderRadius: "8px", background: "#0b655d", color: "#fff", border: 0, fontWeight: "750", fontSize: "13px", cursor: "pointer" }}
                >
                  Send Another Query
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "grid", gap: "16px" }}>
                {/* Inquiry Category Pills */}
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "750", color: "#365054", display: "block", marginBottom: "8px" }}>
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
                          border: inquiryType === tab.key ? "1px solid #0b655d" : "1px solid var(--ws-border)",
                          background: inquiryType === tab.key ? "#eef7f5" : "#fdfefe",
                          color: inquiryType === tab.key ? "#0b655d" : "#5a7276",
                          fontWeight: inquiryType === tab.key ? "800" : "600",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label>
                    Full Name <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. Samuel Adebayo"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </label>
                  <label>
                    Email Address <span style={{ color: "#e87524" }}>*</span>
                    <input
                      type="email"
                      placeholder="samuel@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label>
                    Country of Residence <span style={{ color: "#e87524" }}>*</span>
                    <input
                      placeholder="e.g. Nigeria, Bangladesh, Nepal"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </label>
                  <label>
                    WhatsApp / Contact Number
                    <input
                      placeholder="e.g. +234 80 1234 5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </label>
                </div>

                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <label>
                    Target Degree Level
                    <select value={targetDegree} onChange={(e) => setTargetDegree(e.target.value)}>
                      <option value="Undergraduate">Undergraduate (B.Tech, BBA, B.Sc, MBBS)</option>
                      <option value="Postgraduate">Postgraduate (M.Tech, MBA, M.Sc, MD)</option>
                      <option value="Doctoral">Doctoral (Ph.D / Fellowship)</option>
                      <option value="Diploma">Diploma / Certificate</option>
                    </select>
                  </label>
                  <label>
                    Target Intake
                    <select>
                      <option>Fall Intake 2026</option>
                      <option>Spring Intake 2027</option>
                    </select>
                  </label>
                </div>

                <label>
                  Your Question or Requirements <span style={{ color: "#e87524" }}>*</span>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide any details about your academic background, preferred universities or fields, and what questions you have..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "9px",
                    border: 0,
                    background: "linear-gradient(135deg, #e87524 0%, #c95d14 100%)",
                    color: "#fff",
                    fontWeight: "800",
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(232,117,36,0.25)",
                    justifySelf: "start",
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
