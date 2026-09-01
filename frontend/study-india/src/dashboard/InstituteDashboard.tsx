import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  BookOpenText,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  DollarSign,
  Edit2,
  ExternalLink,
  FileCheck,
  FileCheck2,
  FileText,
  Globe,
  Globe2,
  GraduationCap,
  IndianRupee,
  MapPin,
  MessageSquare,
  MessageSquareText,
  Plus,
  QrCode,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { EmptyState, formatDate, formatMoney, MetricCard, PageHeading, SectionHeader, StatusBadge, titleCase } from "./DashboardBits";
import type { DashboardViewProps, InstituteApplicant, InstituteProgramme, InstituteWorkspace } from "./types";
import ApplicationChatDrawer from "../components/ApplicationChatDrawer";

export default function InstituteDashboard({ data, activeSection, onNavigate, onRefresh }: DashboardViewProps<InstituteWorkspace>) {
  const [programmeOpen, setProgrammeOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] = useState<InstituteProgramme | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<InstituteApplicant | null>(null);
  const [selectedAppIds, setSelectedAppIds] = useState<Array<string | number>>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("ALL");
  const [applicantSearch, setApplicantSearch] = useState("");

  // Modals
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [chatApplicant, setChatApplicant] = useState<InstituteApplicant | null>(null);

  // Offer Letter Form State
  const [offerFee, setOfferFee] = useState("5000");
  const [offerCurrency, setOfferCurrency] = useState("USD");
  const [offerWaiver, setOfferWaiver] = useState("0");
  const [offerDate, setOfferDate] = useState("2026-08-01");
  const [offerConditions, setOfferConditions] = useState("Subject to verification of original transcripts and valid passport upon campus registration.");

  // Scoring Form State
  const [academicScore, setAcademicScore] = useState("8");
  const [sopScore, setSopScore] = useState("8");
  const [languageScore, setLanguageScore] = useState("8");
  const [reviewerNotes, setReviewerNotes] = useState("");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    instituteName: data.profile.instituteName || "",
    contactName: data.profile.contactName || "",
    city: data.profile.city || "",
    website: data.profile.website || "",
    description: data.institute?.description || "",
  });

  const filteredApplicants = useMemo(() => {
    let list = applicationFilter === "ALL" ? data.applicants : data.applicants.filter((applicant) => applicant.status === applicationFilter);
    if (applicantSearch.trim()) {
      const q = applicantSearch.toLowerCase();
      list = list.filter((a) => a.studentName.toLowerCase().includes(q) || a.courseTitle.toLowerCase().includes(q) || (a.country && a.country.toLowerCase().includes(q)));
    }
    return list;
  }, [data.applicants, applicationFilter, applicantSearch]);

  async function updateApplication(status: string) {
    if (!selectedApplicant) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await apiRequest(`/api/institute/applications/${selectedApplicant.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setMessage(`Application status updated to ${titleCase(status)}.`);
      setSelectedApplicant(null);
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Status update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleIssueOfferSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedApplicant) return;
    setBusy(true);
    setMessage("");
    setError("");

    try {
      await apiRequest(`/api/institute/applications/${selectedApplicant.id}/offer`, {
        method: "POST",
        body: JSON.stringify({
          tuitionFee: Number(offerFee),
          currency: offerCurrency,
          scholarshipWaiverPercent: Number(offerWaiver),
          reportingDate: offerDate,
          conditions: offerConditions,
        }),
      });
      setMessage(`Formal admission offer letter issued to ${selectedApplicant.studentName}!`);
      setOfferModalOpen(false);
      setSelectedApplicant(null);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue offer letter.");
    } finally {
      setBusy(false);
    }
  }

  async function handleScoreSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedApplicant) return;
    setBusy(true);
    setMessage("");
    setError("");

    try {
      await apiRequest(`/api/institute/applications/${selectedApplicant.id}/score`, {
        method: "POST",
        body: JSON.stringify({
          academicScore: Number(academicScore),
          sopScore: Number(sopScore),
          languageScore: Number(languageScore),
          reviewerNotes,
        }),
      });
      setMessage(`Candidate evaluation scored successfully for ${selectedApplicant.studentName}.`);
      setScoreModalOpen(false);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record scoring.");
    } finally {
      setBusy(false);
    }
  }

  async function handleBulkAction(status: string) {
    if (!selectedAppIds.length) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await apiRequest("/api/institute/applications/bulk", {
        method: "PATCH",
        body: JSON.stringify({ applicationIds: selectedAppIds, status }),
      });
      setMessage(`${selectedAppIds.length} applications updated to ${titleCase(status)}.`);
      setSelectedAppIds([]);
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Bulk update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveProgramme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    const fee = Number(form.get("tuitionFee"));
    const payload = {
      title: form.get("title"),
      discipline: form.get("discipline"),
      level: form.get("level"),
      mode: form.get("mode"),
      startDate: form.get("startDate"),
      durationMonths: Number(form.get("durationMonths")),
      tuitionFee: Number.isNaN(fee) ? undefined : fee,
      tuitionFeeInr: Number.isNaN(fee) ? undefined : fee,
      currency: form.get("currency") || "USD",
    };

    try {
      if (editingProgramme) {
        await apiRequest(`/api/institute/programmes/${editingProgramme.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setMessage("Programme updated successfully.");
      } else {
        await apiRequest("/api/institute/programmes", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Programme created and published.");
      }
      setProgrammeOpen(false);
      setEditingProgramme(null);
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not save programme.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      await apiRequest("/api/institute/profile", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });
      setMessage("Institution profile updated successfully.");
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Profile update failed.");
    } finally {
      setBusy(false);
    }
  }

  const approvalStatus = data.profile.approvalStatus || "PENDING";
  const isApproved = approvalStatus === "APPROVED";

  // ── Applications View ──────────────────────────────────────────────────────
  if (activeSection === "applications")
    return (
      <>
        <PageHeading
          eyebrow="Admissions Review"
          title="Candidate Applications"
          description="Evaluate international applicants, review transcripts, score candidates, message applicants, and issue formal admission offer letters."
        />
        {message && (
          <p className="workspace-toast success">
            <CheckCircle2 size={17} />
            {message}
          </p>
        )}
        {error && (
          <p className="workspace-toast error">
            <AlertCircle size={17} />
            {error}
          </p>
        )}
        <section className="workspace-panel" data-dashboard-reveal>
          <div className="application-toolbar">
            <div className="workspace-filter-tabs" role="group">
              {["ALL", "SUBMITTED", "UNDER_REVIEW", "OFFERED", "OFFER_ACCEPTED", "DECLINED"].map((status) => (
                <button key={status} className={applicationFilter === status ? "is-active" : ""} onClick={() => setApplicationFilter(status)}>
                  {status === "ALL" ? "All applicants" : titleCase(status)}
                </button>
              ))}
            </div>
            <label className="workspace-table-search">
              <Search size={16} />
              <input
                placeholder="Search by student, country, programme"
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
              />
            </label>
          </div>

          {selectedAppIds.length > 0 && (
            <div className="admin-alert-strip" style={{ marginBottom: "14px", background: "#f0f8f6", borderColor: "#c4e2db" }}>
              <span style={{ background: "#0b655d" }}><FileCheck size={18} /></span>
              <div>
                <strong>{selectedAppIds.length} applicants selected</strong>
                <p>Apply batch status decision</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" onClick={() => handleBulkAction("UNDER_REVIEW")} style={{ color: "#0b655d" }}>
                  Mark Under Review
                </button>
                <button type="button" onClick={() => handleBulkAction("DECLINED")} style={{ color: "#a5443b" }}>
                  Decline Selected
                </button>
              </div>
            </div>
          )}

          {filteredApplicants.length ? (
            <div className="workspace-table-wrap">
              <table className="workspace-table">
                <thead>
                  <tr>
                    <th style={{ width: "36px" }}>
                      <input
                        type="checkbox"
                        checked={selectedAppIds.length === filteredApplicants.length && filteredApplicants.length > 0}
                        onChange={(e) => setSelectedAppIds(e.target.checked ? filteredApplicants.map((a) => a.id) : [])}
                        aria-label="Select all"
                      />
                    </th>
                    <th>Applicant & Nationality</th>
                    <th>Programme</th>
                    <th>Evaluation Score</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplicants.map((applicant) => (
                    <tr key={applicant.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedAppIds.includes(applicant.id)}
                          onChange={(e) => {
                            setSelectedAppIds(
                              e.target.checked ? [...selectedAppIds, applicant.id] : selectedAppIds.filter((id) => id !== applicant.id)
                            );
                          }}
                          aria-label={`Select ${applicant.studentName}`}
                        />
                      </td>
                      <td>
                        <div className="table-person">
                          <span>{applicant.studentName.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                          <div>
                            <strong>{applicant.studentName}</strong>
                            <small>{applicant.passportDetails?.nationality || applicant.country || "International"} · {applicant.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{applicant.courseTitle}</strong>
                        <small>{titleCase(applicant.level)}</small>
                      </td>
                      <td>
                        {applicant.evaluation?.totalScore !== undefined ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#0b655d", fontWeight: "800" }}>
                            <Star size={14} color="#e87524" fill="#e87524" />
                            {applicant.evaluation.totalScore} / 10
                          </div>
                        ) : (
                          <span style={{ color: "#8a9c9f", fontSize: "11.5px" }}>Unscored</span>
                        )}
                      </td>
                      <td><StatusBadge value={applicant.status} /></td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          <button className="workspace-row-action" type="button" onClick={() => setSelectedApplicant(applicant)}>
                            Review Profile <ArrowRight size={14} />
                          </button>
                          <button
                            className="workspace-row-action"
                            type="button"
                            onClick={() => setChatApplicant(applicant)}
                            title="Direct Message Candidate"
                          >
                            <MessageSquare size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={Users} title="No applications in this view" text="Change the status filter or search query to see other applicants." />
          )}
        </section>

        {/* Detailed Applicant Review Modal */}
        {selectedApplicant && (
          <div
            className="workspace-modal-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setSelectedApplicant(null);
            }}
          >
            <div className="workspace-modal applicant-modal" style={{ maxWidth: "700px" }} role="dialog" aria-modal="true">
              <header style={{ background: "#f8faf9", borderBottom: "1px solid var(--ws-border)" }}>
                <div>
                  <span style={{ color: "#e87524", fontSize: "11px", fontWeight: "800" }}>CANDIDATE ADMISSION PROFILE #{selectedApplicant.id}</span>
                  <h2>{selectedApplicant.studentName}</h2>
                  <p>{selectedApplicant.courseTitle} · {selectedApplicant.email}</p>
                </div>
                <button type="button" onClick={() => setSelectedApplicant(null)}><X size={20} /></button>
              </header>

              {/* Candidate Metadata Summary */}
              <div className="applicant-review-summary">
                <div><span>Nationality</span><strong>{selectedApplicant.passportDetails?.nationality || selectedApplicant.country || "International"}</strong></div>
                <div><span>Passport #</span><strong>{selectedApplicant.passportDetails?.passportNumber || "Recorded"}</strong></div>
                <div><span>Prior Qualification</span><strong>{selectedApplicant.academicHistory?.degreeAttained || "High School (12th)"}</strong></div>
                <div><span>Prior Score / GPA</span><strong>{selectedApplicant.academicHistory?.gpaOrPercentage || "Verified"}</strong></div>
                <div><span>English Level</span><strong>{selectedApplicant.englishProficiency?.testType || "IELTS"} ({selectedApplicant.englishProficiency?.score || "Verified"})</strong></div>
                <div><span>Scholarship Request</span><strong>{selectedApplicant.scholarshipRequested ? "Yes (Merit Waiver)" : "Standard Rate"}</strong></div>
              </div>

              {/* Statement of Purpose */}
              <div style={{ padding: "0 22px 16px" }}>
                <h4 style={{ margin: "0 0 6px", fontSize: "13.5px", color: "#14393d" }}>Statement of Purpose (SOP)</h4>
                <div style={{ padding: "12px 14px", borderRadius: "8px", background: "#f5f9f8", border: "1px solid #dce8e5", fontSize: "12.5px", color: "#365056", lineHeight: 1.6 }}>
                  {selectedApplicant.sop?.text || selectedApplicant.statement || "No statement submitted."}
                </div>
              </div>

              {/* Evaluation score summary */}
              {selectedApplicant.evaluation?.totalScore !== undefined && (
                <div style={{ margin: "0 22px 16px", padding: "12px 14px", borderRadius: "8px", background: "#fffbf5", border: "1px solid #f2dfcc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ color: "#8a4f1e", fontSize: "13px" }}>Recorded Evaluator Rating: {selectedApplicant.evaluation.totalScore}/10</strong>
                    <p style={{ margin: "2px 0 0", color: "#826b5c", fontSize: "11.5px" }}>
                      Academic: {selectedApplicant.evaluation.academicScore}/10 · SOP: {selectedApplicant.evaluation.sopScore}/10 · Language: {selectedApplicant.evaluation.languageScore}/10
                    </p>
                  </div>
                  <span style={{ fontSize: "12px", color: "#8a4f1e", fontWeight: "700" }}>By {selectedApplicant.evaluation.evaluatedBy}</span>
                </div>
              )}

              {/* Actions Footer */}
              <footer className="applicant-actions" style={{ padding: "16px 22px", background: "#f8faf9", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="workspace-button secondary compact" type="button" onClick={() => setScoreModalOpen(true)}>
                    <Star size={14} color="#e87524" /> Score Candidate
                  </button>
                  <button className="workspace-button secondary compact" type="button" onClick={() => setChatApplicant(selectedApplicant)}>
                    <MessageSquare size={14} /> Message
                  </button>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="workspace-button secondary danger compact" type="button" disabled={busy} onClick={() => updateApplication("DECLINED")}>
                    <XCircle size={14} /> Decline
                  </button>
                  <button className="workspace-button secondary compact" type="button" disabled={busy} onClick={() => updateApplication("UNDER_REVIEW")}>
                    <Clock3 size={14} /> Under Review
                  </button>
                  <button
                    className="workspace-button primary compact"
                    type="button"
                    style={{ background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)", color: "#fff" }}
                    onClick={() => {
                      setOfferFee("5000");
                      setOfferModalOpen(true);
                    }}
                  >
                    <Award size={14} /> Issue Formal Offer
                  </button>
                </div>
              </footer>
            </div>
          </div>
        )}

        {/* Issue Formal Offer Letter Modal */}
        {offerModalOpen && selectedApplicant && (
          <div className="workspace-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setOfferModalOpen(false); }}>
            <div className="workspace-modal" style={{ maxWidth: "560px" }} role="dialog" aria-modal="true">
              <header style={{ background: "linear-gradient(135deg, #0b655d 0%, #153c40 100%)", color: "#fff" }}>
                <div>
                  <span style={{ color: "#ffb07b" }}>FORMAL OFFER LETTER GENERATOR</span>
                  <h2 style={{ color: "#fff", margin: "2px 0 0" }}>Issue Admission Offer</h2>
                  <p style={{ color: "#d2ece8" }}>To: {selectedApplicant.studentName} ({selectedApplicant.courseTitle})</p>
                </div>
                <button type="button" onClick={() => setOfferModalOpen(false)} style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: 0 }}><X size={18} /></button>
              </header>
              <form onSubmit={handleIssueOfferSubmit} style={{ padding: "20px 22px", display: "grid", gap: "13px" }}>
                <div className="workspace-form-row">
                  <label>Base Annual Tuition Fee Amount
                    <input type="number" min="0" value={offerFee} onChange={(e) => setOfferFee(e.target.value)} required />
                  </label>
                  <label>Currency Option (USD Default)
                    <select value={offerCurrency} onChange={(e) => setOfferCurrency(e.target.value)}>
                      <option value="USD">USD ($) - Default Global</option>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                    </select>
                  </label>
                </div>
                <div className="workspace-form-row">
                  <label>Scholarship Fee Waiver (%)
                    <select value={offerWaiver} onChange={(e) => setOfferWaiver(e.target.value)}>
                      <option value="0">0% (Standard International Fee)</option>
                      <option value="25">25% Tuition Fee Waiver</option>
                      <option value="50">50% Tuition Fee Waiver</option>
                      <option value="100">100% Full Tuition Scholarship</option>
                    </select>
                  </label>
                  <label>Campus Reporting Date
                    <input type="date" value={offerDate} onChange={(e) => setOfferDate(e.target.value)} />
                  </label>
                </div>
                <label>Admission Conditions & Visa Notes
                  <textarea rows={3} value={offerConditions} onChange={(e) => setOfferConditions(e.target.value)} />
                </label>
                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#f2f9f7", border: "1px solid #cbe4dd", fontSize: "12.5px" }}>
                  <strong>Net Annual Fee Payable: </strong>
                  <span style={{ color: "#0b655d", fontWeight: "800" }}>
                    {offerCurrency} {Math.round(Number(offerFee) * (1 - Number(offerWaiver) / 100))}
                  </span>
                </div>
                <footer>
                  <button className="workspace-button secondary" type="button" onClick={() => setOfferModalOpen(false)}>Cancel</button>
                  <button className="workspace-button primary" type="submit" disabled={busy}>
                    {busy ? "Generating Offer…" : "Issue Formal Offer Certificate"} <Send size={15} />
                  </button>
                </footer>
              </form>
            </div>
          </div>
        )}

        {/* Candidate Evaluation Scoring Modal */}
        {scoreModalOpen && selectedApplicant && (
          <div className="workspace-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setScoreModalOpen(false); }}>
            <div className="workspace-modal" style={{ maxWidth: "520px" }} role="dialog" aria-modal="true">
              <header>
                <div>
                  <span>EVALUATION MATRIX</span>
                  <h2>Score Candidate {selectedApplicant.studentName}</h2>
                  <p>Weighted admissions scoring criteria (1 to 10 scale).</p>
                </div>
                <button type="button" onClick={() => setScoreModalOpen(false)}><X size={18} /></button>
              </header>
              <form onSubmit={handleScoreSubmit} style={{ padding: "20px 22px", display: "grid", gap: "13px" }}>
                <div className="workspace-form-row">
                  <label>Academic Merit (40% weight)
                    <select value={academicScore} onChange={(e) => setAcademicScore(e.target.value)}>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} / 10 {n >= 9 ? "(Outstanding)" : n >= 7 ? "(Strong)" : "(Average)"}</option>
                      ))}
                    </select>
                  </label>
                  <label>Statement of Purpose (30% weight)
                    <select value={sopScore} onChange={(e) => setSopScore(e.target.value)}>
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                        <option key={n} value={n}>{n} / 10</option>
                      ))}
                    </select>
                  </label>
                </div>
                <label>English / Language Capability (30% weight)
                  <select value={languageScore} onChange={(e) => setLanguageScore(e.target.value)}>
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} / 10</option>
                    ))}
                  </select>
                </label>
                <label>Internal Reviewer Notes
                  <textarea rows={3} placeholder="Notes on interview performance or document authenticity..." value={reviewerNotes} onChange={(e) => setReviewerNotes(e.target.value)} />
                </label>
                <footer>
                  <button className="workspace-button secondary" type="button" onClick={() => setScoreModalOpen(false)}>Cancel</button>
                  <button className="workspace-button primary" type="submit" disabled={busy}>
                    {busy ? "Saving Score…" : "Save Evaluation Score"}
                  </button>
                </footer>
              </form>
            </div>
          </div>
        )}

        {/* Admissions Chat Drawer */}
        {chatApplicant && (
          <ApplicationChatDrawer
            applicationId={chatApplicant.id}
            programmeTitle={chatApplicant.courseTitle}
            recipientName={chatApplicant.studentName}
            userRole="INSTITUTE"
            onClose={() => setChatApplicant(null)}
          />
        )}
      </>
    );

  // ── Programmes View ────────────────────────────────────────────────────────
  if (activeSection === "programmes")
    return (
      <>
        <PageHeading
          eyebrow="Academic Offerings"
          title="Degree Programmes & Multi-Currency Fees"
          description="Maintain international programme listings, set tuition fees with USD default, and configure study modes for international students."
          actions={
            <button className="workspace-button primary" type="button" onClick={() => { setEditingProgramme(null); setProgrammeOpen(true); }}>
              <Plus size={16} /> Add Programme
            </button>
          }
        />
        {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}
        {error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
        <section className="workspace-panel" data-dashboard-reveal>
          <SectionHeader eyebrow="Current catalogue" title={`${data.programmes.length} published programmes`} />
          <div className="workspace-table-wrap">
            <table className="workspace-table programme-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Level & Mode</th>
                  <th>Intake</th>
                  <th>Tuition Fee & Currency</th>
                  <th>Applications</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.programmes.map((prog) => (
                  <tr key={prog.id}>
                    <td>
                      <strong>{prog.title}</strong>
                      <small>{prog.discipline}</small>
                    </td>
                    <td>
                      {titleCase(prog.level)}
                      <small>{titleCase(prog.mode)}</small>
                    </td>
                    <td>{prog.startDate ? formatDate(prog.startDate, { day: "numeric", month: "short", year: "numeric" }) : "Fall 2026"}</td>
                    <td>
                      <strong style={{ color: "#0b655d" }}>{formatMoney(prog.tuitionFee || prog.tuitionFeeInr, prog.currency || "USD")}</strong>
                      <small style={{ color: "#e87524", fontWeight: "700" }}>{prog.currency || "USD"} (Default)</small>
                    </td>
                    <td>
                      <button className="workspace-link-button" type="button" onClick={() => onNavigate("applications")}>
                        {prog.applications} candidates
                      </button>
                    </td>
                    <td><StatusBadge value={prog.status} /></td>
                    <td>
                      <button
                        className="workspace-row-action"
                        type="button"
                        onClick={() => {
                          setEditingProgramme(prog);
                          setProgrammeOpen(true);
                        }}
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {programmeOpen && (
          <div className="workspace-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setProgrammeOpen(false); }}>
            <div className="workspace-modal" role="dialog" aria-modal="true">
              <header>
                <div>
                  <span>PROGRAMME DETAILS</span>
                  <h2>{editingProgramme ? "Edit programme" : "Add degree programme"}</h2>
                  <p>Set international academic specifications and tuition currency (USD default).</p>
                </div>
                <button type="button" onClick={() => setProgrammeOpen(false)}><X size={20} /></button>
              </header>
              <form onSubmit={handleSaveProgramme}>
                <div className="workspace-form-row">
                  <label>Programme Title
                    <input name="title" defaultValue={editingProgramme?.title || ""} required />
                  </label>
                  <label>Discipline
                    <input name="discipline" defaultValue={editingProgramme?.discipline || ""} required />
                  </label>
                </div>
                <div className="workspace-form-row">
                  <label>Level
                    <select name="level" defaultValue={editingProgramme?.level || "UNDERGRADUATE"}>
                      <option value="UNDERGRADUATE">Undergraduate</option>
                      <option value="POSTGRADUATE">Postgraduate</option>
                      <option value="DOCTORAL">Doctoral</option>
                      <option value="CERTIFICATE">Certificate</option>
                    </select>
                  </label>
                  <label>Study Mode
                    <select name="mode" defaultValue={editingProgramme?.mode || "OFFLINE"}>
                      <option value="OFFLINE">On Campus (Offline)</option>
                      <option value="BLENDED">Blended</option>
                      <option value="ONLINE">Online</option>
                    </select>
                  </label>
                </div>
                <div className="workspace-form-row">
                  <label>Duration (Months)
                    <input name="durationMonths" type="number" defaultValue="12" required />
                  </label>
                  <label>Currency Option (USD as default)
                    <select name="currency" defaultValue={editingProgramme?.currency || "USD"}>
                      <option value="USD">USD ($) - Default Global</option>
                      <option value="INR">INR (₹) - Indian Rupee</option>
                      <option value="EUR">EUR (€) - Euro</option>
                      <option value="GBP">GBP (£) - British Pound</option>
                      <option value="AED">AED (د.إ) - UAE Dirham</option>
                    </select>
                  </label>
                </div>
                <div className="workspace-form-row">
                  <label>Tuition Fee Amount
                    <input name="tuitionFee" type="number" min="0" step="10" defaultValue={editingProgramme?.tuitionFee || editingProgramme?.tuitionFeeInr || ""} placeholder="e.g. 5000" />
                  </label>
                  <label>Start Date
                    <input name="startDate" type="date" defaultValue={editingProgramme?.startDate || ""} />
                  </label>
                </div>
                <footer>
                  <button className="workspace-button secondary" type="button" onClick={() => setProgrammeOpen(false)}>Cancel</button>
                  <button className="workspace-button primary" disabled={busy}>
                    {busy ? "Saving…" : "Save Programme"}
                  </button>
                </footer>
              </form>
            </div>
          </div>
        )}
      </>
    );

  // ── Profile View ───────────────────────────────────────────────────────────
  if (activeSection === "profile")
    return (
      <>
        <PageHeading
          eyebrow="Institution Profile"
          title="Campus details & Accreditation"
          description="Keep your institution contact, website, and public descriptions up to date for prospective international students."
        />
        {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}
        {error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
        <section className="workspace-panel" data-dashboard-reveal>
          <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: "16px", maxWidth: "680px" }}>
            <div className="workspace-form-row">
              <label>Institution Name
                <input value={profileForm.instituteName} onChange={(e) => setProfileForm({ ...profileForm, instituteName: e.target.value })} required />
              </label>
              <label>Nodal Contact Person
                <input value={profileForm.contactName} onChange={(e) => setProfileForm({ ...profileForm, contactName: e.target.value })} required />
              </label>
            </div>
            <div className="workspace-form-row">
              <label>City
                <input value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} required />
              </label>
              <label>Official Website
                <input value={profileForm.website} onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })} placeholder="https://..." />
              </label>
            </div>
            <label>Institution Overview & International Facilities
              <textarea rows={4} value={profileForm.description} onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })} />
            </label>
            <button className="workspace-button primary" style={{ justifySelf: "start" }} disabled={busy}>
              {busy ? "Saving…" : "Save Profile Changes"}
            </button>
          </form>
        </section>
      </>
    );

  // ── Default Overview View ──────────────────────────────────────────────────
  return (
    <>
      <PageHeading
        eyebrow="Institution Admissions Hub"
        title={data.profile.instituteName || "University Admissions Desk"}
        description="Monitor international application pipelines, evaluate academic merit, issue formal offers, and consult with applicants."
        actions={
          <button className="workspace-button primary" type="button" onClick={() => onNavigate("applications")}>
            <Users size={16} /> Review Pipeline
          </button>
        }
      />

      <div className="workspace-metric-grid">
        <MetricCard icon={Users} label="Total Applicants" value={data.applicants.length} note="Foreign student candidates" tone="teal" />
        <MetricCard icon={Clock3} label="Awaiting Review" value={data.applicants.filter((a) => a.status === "SUBMITTED").length} note="Requires decision" tone="orange" />
        <MetricCard icon={Award} label="Offers Issued" value={data.applicants.filter((a) => a.status === "OFFERED" || a.status === "OFFER_ACCEPTED").length} note="Provisional certificates" tone="blue" />
        <MetricCard icon={BookOpenText} label="Programmes" value={data.programmes.length} note="Active in catalogue" tone="ink" />
      </div>

      <div className="institute-overview-grid">
        <section className="workspace-panel" data-dashboard-reveal>
          <SectionHeader
            eyebrow="Demand movement"
            title="Recent Candidate Submissions"
            action={
              <button className="workspace-link-button" onClick={() => onNavigate("applications")}>
                View all ({data.applicants.length}) <ArrowRight size={13} />
              </button>
            }
          />
          {data.applicants.length ? (
            <div className="compact-applicant-list">
              {data.applicants.slice(0, 5).map((app) => (
                <article key={app.id}>
                  <div className="table-person">
                    <span>{app.studentName.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                    <div>
                      <strong>{app.studentName}</strong>
                      <small>{app.passportDetails?.nationality || app.country || "International"}</small>
                    </div>
                  </div>
                  <div>
                    <strong>{app.courseTitle}</strong>
                    <small>{formatDate(app.submittedAt)}</small>
                  </div>
                  <StatusBadge value={app.status} />
                  <button type="button" onClick={() => { setSelectedApplicant(app); onNavigate("applications"); }}>
                    Review <ArrowRight size={12} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={Users} title="No applicants yet" text="Publish programmes to receive applications from international students." />
          )}
        </section>

        <section className="workspace-panel" data-dashboard-reveal>
          <SectionHeader eyebrow="Institutional readiness" title="Verification status" />
          <div style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", borderRadius: "8px", background: isApproved ? "#e5f5f1" : "#fff3da" }}>
              {isApproved ? <CheckCircle2 color="#0b655d" /> : <Clock3 color="#8f5a18" />}
              <div>
                <strong style={{ display: "block", fontSize: "13px" }}>
                  {isApproved ? "Accreditation Approved" : "Registration Pending Approval"}
                </strong>
                <small style={{ color: "#6a7f83" }}>
                  {isApproved ? "Programmes are live in Study in India catalogue" : "Admin team is reviewing documents"}
                </small>
              </div>
            </div>

            <div style={{ display: "grid", gap: "6px", fontSize: "12.5px", color: "#4f686c" }}>
              <div><strong>Nodal Contact:</strong> {data.profile.contactName || "Admissions Officer"}</div>
              <div><strong>City:</strong> {data.profile.city || "India"}</div>
              <div><strong>Published Degrees:</strong> {data.programmes.length} active</div>
            </div>

            <button className="workspace-button secondary" type="button" onClick={() => onNavigate("programmes")} style={{ marginTop: "8px" }}>
              <BookOpenText size={15} /> Manage Degree Catalogue
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
