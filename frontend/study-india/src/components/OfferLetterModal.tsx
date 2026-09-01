import {
  Award,
  Building2,
  CheckCircle2,
  Download,
  FileCheck,
  Globe,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { apiRequest } from "../lib/api";
import { formatMoney } from "../dashboard/DashboardBits";
import type { StudentApplication } from "../dashboard/types";

type Props = {
  application: StudentApplication;
  studentName: string;
  isStudentViewer?: boolean;
  onClose: () => void;
  onRefresh?: () => Promise<void>;
};

export default function OfferLetterModal({ application, studentName, isStudentViewer = true, onClose, onRefresh }: Props) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const offer = application.offerDetails || {};
  const baseFee = offer.tuitionFee || application.tuitionFee || application.tuitionFeeInr || 5000;
  const currency = offer.currency || application.currency || "USD";
  const waiverPercent = offer.scholarshipWaiverPercent || 0;
  const finalFee = offer.finalTuitionFee !== undefined ? offer.finalTuitionFee : Math.round(baseFee * (1 - waiverPercent / 100));

  async function handleDecision(decision: "ACCEPT" | "DECLINE") {
    if (decision === "DECLINE" && !window.confirm("Are you sure you want to decline this admission offer?")) return;
    setBusy(true);
    setError("");
    setMessage("");

    try {
      await apiRequest(`/api/student/applications/${application.id}/offer-response`, {
        method: "POST",
        body: JSON.stringify({ decision }),
      });
      setMessage(decision === "ACCEPT" ? "Congratulations! Offer accepted successfully." : "Offer declined.");
      if (onRefresh) await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record response.");
    } finally {
      setBusy(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="workspace-modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="workspace-modal"
        style={{ maxWidth: "780px", background: "#fff", border: "1px solid #cddbd8" }}
        role="dialog"
        aria-modal="true"
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid var(--ws-border)",
            background: "#f7faf9",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ display: "grid", width: "36px", height: "36px", placeItems: "center", borderRadius: "8px", background: "#e6f4f1", color: "#0b655d" }}>
              <Award size={20} />
            </span>
            <div>
              <strong style={{ fontSize: "15px", color: "#183639" }}>Official Provisional Admission Letter</strong>
              <small style={{ display: "block", color: "#6b7f83", fontSize: "11px" }}>
                DRAA / Study in India Document Verification · Ref #{application.id}
              </small>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="workspace-button secondary compact" type="button" onClick={handlePrint} title="Print / Save as PDF">
              <Printer size={15} /> Print / PDF
            </button>
            <button className="workspace-button secondary compact" type="button" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </header>

        {message && <p className="workspace-toast success" style={{ margin: "14px 24px 0" }}><CheckCircle2 size={16} />{message}</p>}
        {error && <p className="workspace-toast error" style={{ margin: "14px 24px 0" }}><XCircle size={16} />{error}</p>}

        {/* Printable Official Document Body */}
        <div style={{ padding: "28px 32px", color: "#1a3236", fontFamily: "'Manrope', serif", lineHeight: 1.6 }}>
          {/* Institution Header Band */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #0b655d", paddingBottom: "18px" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "10px", background: "#0b655d", color: "#fff", display: "grid", placeItems: "center", fontWeight: "800", fontSize: "20px" }}>
                {application.instituteName.charAt(0)}
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: "20px", color: "#0b655d", letterSpacing: "-0.02em" }}>{application.instituteName}</h1>
                <p style={{ margin: "2px 0 0", color: "#64777b", fontSize: "12px" }}>
                  {application.city}, {application.state || "India"} · Recognized by UGC / Ministry of Education, Govt. of India
                </p>
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "11.5px", color: "#6a7d81" }}>
              <div><strong>Date:</strong> {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
              <div><strong>Application Ref:</strong> SII-IN-{application.id}</div>
            </div>
          </div>

          {/* Salutation & Offer Statement */}
          <div style={{ margin: "22px 0" }}>
            <p style={{ fontSize: "14px", margin: "0 0 10px" }}>
              To: <strong>{studentName || "Applicant"}</strong>
              {application.passportDetails?.passportNumber && (
                <span> (Passport: {application.passportDetails.passportNumber}, Citizenship: {application.passportDetails.nationality || "International"})</span>
              )}
            </p>
            <h2 style={{ fontSize: "16px", color: "#0b655d", margin: "14px 0 8px" }}>
              SUB: PROVISIONAL OFFER OF ADMISSION FOR ACADEMIC INTAKE 2026-2027
            </h2>
            <p style={{ fontSize: "13px", color: "#364e54", margin: 0 }}>
              We take great pleasure in congratulating you on your selection for admission to the following academic programme at <strong>{application.instituteName}</strong> under the Study in India international student scheme:
            </p>
          </div>

          {/* Programme & Tuition Fee Card */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", padding: "16px", borderRadius: "10px", background: "#f5f9f8", border: "1px solid #d5e5e2", margin: "18px 0" }}>
            <div>
              <small style={{ color: "#74888b", textTransform: "uppercase", fontSize: "10.5px", fontWeight: "800" }}>Programme Enrolled</small>
              <strong style={{ display: "block", fontSize: "14px", color: "#14393d", marginTop: "2px" }}>{application.title}</strong>
              <span style={{ fontSize: "12px", color: "#546e73" }}>{application.level} · {application.discipline}</span>
            </div>
            <div>
              <small style={{ color: "#74888b", textTransform: "uppercase", fontSize: "10.5px", fontWeight: "800" }}>Indicative Reporting Date</small>
              <strong style={{ display: "block", fontSize: "14px", color: "#14393d", marginTop: "2px" }}>{offer.reportingDate || "August 1, 2026"}</strong>
              <span style={{ fontSize: "12px", color: "#546e73" }}>Fall Semester Campus Orientation</span>
            </div>
            <div>
              <small style={{ color: "#74888b", textTransform: "uppercase", fontSize: "10.5px", fontWeight: "800" }}>Base Annual Tuition</small>
              <div style={{ fontSize: "13.5px", color: "#4f676b", marginTop: "2px" }}>{formatMoney(baseFee, currency)}</div>
            </div>
            <div>
              <small style={{ color: "#e87524", textTransform: "uppercase", fontSize: "10.5px", fontWeight: "800" }}>Scholarship / Concession</small>
              <div style={{ fontSize: "13.5px", color: "#c95d14", fontWeight: "700", marginTop: "2px" }}>
                {waiverPercent > 0 ? `${waiverPercent}% Tuition Fee Waiver` : "Standard International Rate"}
              </div>
            </div>
            <div style={{ gridColumn: "1 / -1", paddingTop: "10px", borderTop: "1px solid #dbe8e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "800", color: "#14393d", fontSize: "13.5px" }}>Net Annual Tuition Fee Payable:</span>
              <span style={{ fontSize: "18px", fontWeight: "800", color: "#0b655d" }}>{formatMoney(finalFee, currency)}</span>
            </div>
          </div>

          {/* Terms & Visa Support Notice */}
          <div style={{ fontSize: "12px", color: "#576d72", lineHeight: 1.6, margin: "16px 0" }}>
            <p style={{ margin: "0 0 6px" }}>
              <strong>Conditions of Admission:</strong> {offer.conditions || "Admission is provisional pending verification of original academic diplomas, transcript equivalency, and valid passport during in-person registration."}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Student Visa Support:</strong> This letter may be presented at the Indian Embassy / High Commission or Indian Visa Application Centre (IVAC) as proof of institutional sponsorship for your Student Visa (S-Visa) application.
            </p>
          </div>

          {/* Validation & Stamp Footer */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "28px", paddingTop: "18px", borderTop: "1px solid #dce8e5" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <QrCode size={48} color="#0b655d" />
              <div style={{ fontSize: "11px", color: "#74888b" }}>
                <strong style={{ color: "#164448", display: "block" }}>Digitally Verified Letter</strong>
                <span>DRAA-SII Secure Hash ID: {String(application.id).slice(0, 10)}</span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#0b655d" }}>Office of International Admissions</div>
              <div style={{ fontSize: "11.5px", color: "#6a7e82" }}>{application.instituteName}</div>
              <div style={{ fontSize: "10.5px", color: "#8da0a4" }}>Government of India Education Corridor</div>
            </div>
          </div>
        </div>

        {/* Student Decision Actions */}
        {isStudentViewer && (
          <footer
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 24px",
              borderTop: "1px solid var(--ws-border)",
              background: "#f7faf9",
            }}
          >
            <div style={{ fontSize: "12.5px" }}>
              <strong>Current Status: </strong>
              <span style={{ color: application.status === "OFFER_ACCEPTED" ? "#148a79" : application.status === "OFFER_DECLINED" ? "#c45c50" : "#e87524", fontWeight: "750" }}>
                {application.status === "OFFER_ACCEPTED" ? "Offer Accepted" : application.status === "OFFER_DECLINED" ? "Offer Declined" : "Awaiting Your Decision"}
              </span>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {application.status === "OFFERED" && (
                <>
                  <button
                    className="workspace-button secondary"
                    type="button"
                    disabled={busy}
                    onClick={() => handleDecision("DECLINE")}
                    style={{ color: "#a5443b" }}
                  >
                    <XCircle size={15} /> Decline Offer
                  </button>
                  <button
                    className="workspace-button primary"
                    type="button"
                    disabled={busy}
                    onClick={() => handleDecision("ACCEPT")}
                    style={{ background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)", color: "#fff" }}
                  >
                    <CheckCircle2 size={16} /> Accept Admission Offer
                  </button>
                </>
              )}
              {application.status === "OFFER_ACCEPTED" && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#148a79", fontWeight: "750", fontSize: "13px" }}>
                  <ShieldCheck size={18} /> Offer Accepted · Proceed to Pre-Departure Hub
                </div>
              )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
