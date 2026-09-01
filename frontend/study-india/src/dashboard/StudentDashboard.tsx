import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  BookOpenText,
  Calculator,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  DollarSign,
  Download,
  FileCheck,
  FileCheck2,
  FileText,
  Globe,
  GraduationCap,
  Heart,
  HelpCircle,
  LifeBuoy,
  MapPin,
  MessageSquare,
  MessageSquareText,
  Plus,
  QrCode,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { EmptyState, formatDate, formatMoney, MetricCard, PageHeading, SectionHeader, StatusBadge, titleCase } from "./DashboardBits";
import type { DashboardViewProps, OrientationModuleItem, StudentApplication, StudentWorkspace } from "./types";
import ApplicationWizardModal from "../components/ApplicationWizardModal";
import OfferLetterModal from "../components/OfferLetterModal";
import ApplicationChatDrawer from "../components/ApplicationChatDrawer";
import GpaCalculatorModal from "../components/GpaCalculatorModal";

type CourseOption = { id: string | number; title: string; instituteName: string; level: string; tuitionFee?: number; tuitionFeeInr?: number; currency?: string };

const journeySteps = [
  ["Profile", "Personal and contact information", "complete"],
  ["Documents", "Academic and identity records", "current"],
  ["Choices", "Compare and shortlist programmes", "complete"],
  ["Applications", "Submit and follow decisions", "current"],
  ["Arrival", "Offer, visa and pre-departure", "upcoming"],
] as const;

export default function StudentDashboard({ data, activeSection, onNavigate, onRefresh }: DashboardViewProps<StudentWorkspace>) {
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedCourseForWizard, setSelectedCourseForWizard] = useState<CourseOption | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState("");
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [supportSent, setSupportSent] = useState(false);

  // Modals state
  const [viewingOfferApp, setViewingOfferApp] = useState<StudentApplication | null>(null);
  const [chatApp, setChatApp] = useState<StudentApplication | null>(null);
  const [gpaModalOpen, setGpaModalOpen] = useState(false);

  // LMS Orientation Hub State
  const [orientationModules, setOrientationModules] = useState<OrientationModuleItem[]>([]);
  const [activeModule, setActiveModule] = useState<OrientationModuleItem | null>(null);
  const [orientationLoading, setOrientationLoading] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: data.profile.firstName || "",
    lastName: data.profile.lastName || "",
    country: data.profile.country || "",
    passportNumber: data.profile.passportNumber || "",
    dateOfBirth: data.profile.dateOfBirth || "",
  });

  useEffect(() => {
    apiRequest<{ courses: CourseOption[] }>("/api/catalog/courses")
      .then((res) => setCourses(res.courses))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (activeSection === "orientation" || activeSection === "overview") {
      setOrientationLoading(true);
      apiRequest<{ modules: OrientationModuleItem[] }>("/api/student/orientation")
        .then((res) => {
          setOrientationModules(res.modules || []);
          if (res.modules?.length && !activeModule) {
            setActiveModule(res.modules[0]);
          }
        })
        .catch(() => {})
        .finally(() => setOrientationLoading(false));
    }
  }, [activeSection]);

  const activeApps = useMemo(
    () => data.applications.filter((a) => ["SUBMITTED", "UNDER_REVIEW", "OFFERED", "OFFER_ACCEPTED"].includes(a.status)),
    [data.applications]
  );
  const offersReceived = useMemo(
    () => data.applications.filter((a) => a.status === "OFFERED" || a.status === "OFFER_ACCEPTED"),
    [data.applications]
  );

  async function withdrawApp(appId: string | number) {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    setBusy(true);
    setActionError("");
    setActionSuccess("");
    try {
      await apiRequest(`/api/student/applications/${appId}/withdraw`, { method: "PATCH" });
      setActionSuccess("Application withdrawn successfully.");
      await onRefresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not withdraw application.");
    } finally {
      setBusy(false);
    }
  }

  async function unsaveCourse(courseId: string | number) {
    try {
      await apiRequest(`/api/student/saved-courses/${courseId}`, { method: "DELETE" });
      await onRefresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not remove saved course.");
    }
  }

  async function handleProfileSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setActionError("");
    setActionSuccess("");
    try {
      await apiRequest("/api/student/profile", {
        method: "PUT",
        body: JSON.stringify(profileForm),
      });
      setActionSuccess("Profile updated successfully.");
      await onRefresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Profile update failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDocUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setActionError("");
    setActionSuccess("");
    const form = new FormData(event.currentTarget);
    const file = form.get("file") as File | null;
    const docType = form.get("documentType") as string;

    try {
      await apiRequest("/api/student/documents", {
        method: "POST",
        body: JSON.stringify({
          documentType: docType,
          fileName: file?.name || `${docType.toLowerCase().replace(/\s+/g, "_")}.pdf`,
        }),
      });
      setUploadOpen(false);
      setActionSuccess(`${docType} recorded successfully.`);
      await onRefresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function deleteDoc(docId: string | number) {
    if (!confirm("Are you sure you want to remove this document record?")) return;
    try {
      await apiRequest(`/api/student/documents/${docId}`, { method: "DELETE" });
      await onRefresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Could not delete document.");
    }
  }

  async function handleToggleChecklist(moduleKey: string, item: string) {
    const mod = orientationModules.find((m) => m.moduleKey === moduleKey);
    if (!mod) return;

    const exists = mod.checklistCompleted.includes(item);
    const updated = exists ? mod.checklistCompleted.filter((i) => i !== item) : [...mod.checklistCompleted, item];
    const isNowComplete = updated.length === mod.checklist.length;

    // Optimistic UI update
    setOrientationModules((prev) =>
      prev.map((m) => (m.moduleKey === moduleKey ? { ...m, checklistCompleted: updated, completed: isNowComplete } : m))
    );
    if (activeModule?.moduleKey === moduleKey) {
      setActiveModule((prev) => (prev ? { ...prev, checklistCompleted: updated, completed: isNowComplete } : null));
    }

    try {
      await apiRequest("/api/student/orientation/progress", {
        method: "POST",
        body: JSON.stringify({
          moduleKey,
          checklistCompleted: updated,
          completed: isNowComplete,
        }),
      });
    } catch {
      // Revert if error
    }
  }

  // ── Pre-Departure LMS Orientation Hub View ─────────────────────────────────
  if (activeSection === "orientation") {
    const totalModules = orientationModules.length || 4;
    const completedModules = orientationModules.filter((m) => m.completed).length;
    const progressPercent = Math.round((completedModules / totalModules) * 100);

    return (
      <>
        <PageHeading
          eyebrow="Pre-Departure LMS Learning Hub"
          title="Student Orientation & Pre-Arrival Hub"
          description="Complete essential preparation modules for Indian visa compliance, FRRO registration, healthcare, banking, and academic readiness."
          actions={
            <button className="workspace-button secondary" type="button" onClick={() => setGpaModalOpen(true)}>
              <Calculator size={15} /> GPA / Eligibility Tool
            </button>
          }
        />

        {/* Orientation Progress Banner */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "16px", alignItems: "center", padding: "18px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #0b655d 0%, #174246 100%)", color: "#fff", marginBottom: "20px" }}>
          <span style={{ display: "grid", width: "48px", height: "48px", placeItems: "center", borderRadius: "12px", background: "rgba(255,255,255,0.18)", color: "#ffb07b" }}>
            <Compass size={24} />
          </span>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <strong style={{ fontSize: "16px" }}>Pre-Departure Readiness Progress</strong>
              <span style={{ padding: "3px 9px", borderRadius: "999px", background: "rgba(255,255,255,0.2)", fontSize: "11px", fontWeight: "800" }}>
                {completedModules} of {totalModules} Modules Complete ({progressPercent}%)
              </span>
            </div>
            <div style={{ height: "7px", borderRadius: "999px", background: "rgba(255,255,255,0.25)", overflow: "hidden", marginTop: "8px", maxWidth: "450px" }}>
              <div style={{ width: `${progressPercent}%`, height: "100%", background: "#e87524", borderRadius: "inherit", transition: "width 0.4s ease" }} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ color: "#ffb07b", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>Arrival Status</span>
            <div style={{ fontSize: "14px", fontWeight: "800" }}>
              {progressPercent === 100 ? "Ready for Departure! 🎉" : "Preparation in Progress"}
            </div>
          </div>
        </div>

        {/* Learning Modules Grid & Detail */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "18px" }}>
          {/* Module Selector List */}
          <aside style={{ display: "grid", gap: "10px", alignContent: "start" }}>
            {orientationModules.map((mod) => {
              const isSelected = activeModule?.moduleKey === mod.moduleKey;
              return (
                <article
                  key={mod.moduleKey}
                  onClick={() => setActiveModule(mod)}
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    border: isSelected ? "2px solid #0b655d" : "1px solid var(--ws-border)",
                    background: isSelected ? "#edf7f5" : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span style={{ fontSize: "11px", color: mod.completed ? "#148a79" : "#e87524", fontWeight: "800" }}>
                      MODULE {mod.order} · {mod.estimatedMinutes} MIN
                    </span>
                    {mod.completed ? <CheckCircle2 size={16} color="#148a79" /> : <Clock3 size={15} color="#8a9c9f" />}
                  </div>
                  <h3 style={{ margin: "4px 0", fontSize: "14px", color: isSelected ? "#0b655d" : "#183236" }}>{mod.title}</h3>
                  <div style={{ fontSize: "11.5px", color: "#6a7f83" }}>
                    {mod.checklistCompleted.length} of {mod.checklist.length} checklist items verified
                  </div>
                </article>
              );
            })}
          </aside>

          {/* Active Module Content */}
          {activeModule && (
            <main className="workspace-panel" data-dashboard-reveal>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid var(--ws-border)", paddingBottom: "16px", marginBottom: "18px" }}>
                <div>
                  <span style={{ color: "#e87524", fontSize: "11px", fontWeight: "800", letterSpacing: "0.12em" }}>
                    MODULE {activeModule.order} · {activeModule.category.replace(/_/g, " ")}
                  </span>
                  <h2 style={{ margin: "4px 0 6px", fontSize: "20px", color: "#14393d" }}>{activeModule.title}</h2>
                  <p style={{ margin: 0, color: "#63787c", fontSize: "13px" }}>{activeModule.description}</p>
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 12px", borderRadius: "8px", background: activeModule.completed ? "#e5f5f1" : "#fbf0e6", color: activeModule.completed ? "#0b655d" : "#c95d14", fontSize: "12px", fontWeight: "800" }}>
                  <Award size={15} /> {activeModule.badgeName}
                </span>
              </div>

              {/* Topics Breakdown */}
              <div style={{ display: "grid", gap: "16px", marginBottom: "22px" }}>
                {activeModule.topics.map((topic, i) => (
                  <div key={i} style={{ padding: "16px", borderRadius: "10px", background: "#f8faf9", border: "1px solid #e2ece9" }}>
                    <h4 style={{ margin: "0 0 8px", fontSize: "14.5px", color: "#0b655d" }}>{topic.title}</h4>
                    <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#385257", lineHeight: 1.6 }}>{topic.content}</p>
                    <div style={{ padding: "8px 12px", borderRadius: "6px", background: "#fff", borderLeft: "3px solid #e87524", fontSize: "12px", color: "#694a32" }}>
                      <strong>Key Requirement:</strong> {topic.keyTakeaway}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Checklist */}
              <div style={{ borderTop: "1px solid var(--ws-border)", paddingTop: "18px" }}>
                <h4 style={{ margin: "0 0 12px", fontSize: "14px", color: "#14393d" }}>
                  Interactive Compliance Checklist ({activeModule.checklistCompleted.length}/{activeModule.checklist.length})
                </h4>
                <div style={{ display: "grid", gap: "9px" }}>
                  {activeModule.checklist.map((item, idx) => {
                    const isChecked = activeModule.checklistCompleted.includes(item);
                    return (
                      <label
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          border: isChecked ? "1px solid #bce1d8" : "1px solid var(--ws-border)",
                          background: isChecked ? "#f0f8f6" : "#fff",
                          cursor: "pointer",
                          fontSize: "13px",
                          color: isChecked ? "#0b655d" : "#2f4b50",
                          fontWeight: isChecked ? "700" : "500",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleChecklist(activeModule.moduleKey, item)}
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </main>
          )}
        </div>
      </>
    );
  }

  // ── Applications View ──────────────────────────────────────────────────────
  if (activeSection === "applications")
    return (
      <>
        <PageHeading
          eyebrow="Admissions Portal"
          title="Your applications & formal offers"
          description="Track review status, download official admission certificates, chat with admissions officers, and accept provisional offers."
          actions={
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="workspace-button secondary" type="button" onClick={() => setGpaModalOpen(true)}>
                <Calculator size={15} /> Convert GPA
              </button>
              <button
                className="workspace-button primary"
                type="button"
                onClick={() => {
                  setSelectedCourseForWizard(courses[0] || null);
                  setWizardOpen(true);
                }}
              >
                <Plus size={16} /> New Application Wizard
              </button>
            </div>
          }
        />
        {actionSuccess && (
          <p className="workspace-toast success">
            <CheckCircle2 size={17} />
            {actionSuccess}
          </p>
        )}
        {actionError && (
          <p className="workspace-toast error">
            <AlertCircle size={17} />
            {actionError}
          </p>
        )}
        <section className="workspace-panel" data-dashboard-reveal>
          <SectionHeader eyebrow="Current cycle" title={`${data.applications.length} total applications`} />
          {data.applications.length ? (
            <div className="student-application-list">
              {data.applications.map((application) => (
                <article key={application.id}>
                  <div className="student-application-logo">
                    <GraduationCap size={21} />
                  </div>
                  <div className="student-application-main">
                    <span>{application.instituteName}</span>
                    <h3>{application.title}</h3>
                    <p>
                      <MapPin size={13} />
                      {application.city}, {application.state}
                      <i />
                      {titleCase(application.level)}
                    </p>
                  </div>
                  <div className="student-application-status">
                    <StatusBadge value={application.status} />
                    <small>Updated {formatDate(application.updatedAt, { day: "numeric", month: "short" })}</small>
                  </div>
                  <div className="student-application-note">
                    <strong>
                      {application.status === "OFFERED"
                        ? "🎉 Formal Offer Issued!"
                        : application.status === "OFFER_ACCEPTED"
                        ? "✅ Offer Accepted"
                        : "Admissions Status"}
                    </strong>
                    <p>
                      {application.status === "OFFERED"
                        ? `Tuition: ${application.currency || "USD"} ${application.offerDetails?.finalTuitionFee || application.tuitionFee || "Applicable"}. Download official offer certificate to accept.`
                        : application.decisionNote || "Application under review by institutional admissions team."}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                    {(application.status === "OFFERED" || application.status === "OFFER_ACCEPTED") && (
                      <button
                        className="workspace-row-action"
                        type="button"
                        style={{ color: "#0b655d", fontWeight: "800", background: "#eef7f5" }}
                        onClick={() => setViewingOfferApp(application)}
                      >
                        <FileCheck size={14} /> View Official Offer
                      </button>
                    )}
                    <button
                      className="workspace-row-action"
                      type="button"
                      onClick={() => setChatApp(application)}
                      title="Direct Admissions Consultation"
                    >
                      <MessageSquare size={14} /> Admissions Chat
                    </button>
                    <Link to={`/courses/${application.slug}`} className="workspace-link-button">
                      Details
                    </Link>
                    {["SUBMITTED", "UNDER_REVIEW"].includes(application.status) && (
                      <button
                        type="button"
                        style={{ background: "none", border: "none", color: "#dc2626", fontSize: "12px", cursor: "pointer", padding: "4px 8px" }}
                        onClick={() => withdrawApp(application.id)}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileCheck2}
              title="No applications yet"
              text="Select an accredited degree programme and complete the 5-step admissions wizard."
              action={
                <button
                  className="workspace-button primary"
                  type="button"
                  onClick={() => {
                    setSelectedCourseForWizard(courses[0] || null);
                    setWizardOpen(true);
                  }}
                >
                  Start Admissions Wizard
                </button>
              }
            />
          )}
        </section>
      </>
    );

  // ── Saved Programmes View ──────────────────────────────────────────────────
  if (activeSection === "saved")
    return (
      <>
        <PageHeading
          eyebrow="Programme shortlist"
          title="Saved programmes"
          description="Keep promising options together, compare them carefully and remove anything that no longer fits."
          actions={
            <Link className="workspace-button primary" to="/courses">
              <Search size={17} />
              Find programmes
            </Link>
          }
        />
        <section className="workspace-panel" data-dashboard-reveal>
          <SectionHeader eyebrow="Personal shortlist" title={`${data.savedCourses.length} saved course${data.savedCourses.length === 1 ? "" : "s"}`} />
          {data.savedCourses.length ? (
            <div className="saved-programme-grid">
              {data.savedCourses.map((course) => (
                <article key={course.id}>
                  <header>
                    <span>{course.discipline}</span>
                    <button type="button" onClick={() => unsaveCourse(course.id)} aria-label="Remove saved course">
                      <Trash2 size={16} />
                    </button>
                  </header>
                  <h2>{course.title}</h2>
                  <p>{course.instituteName}</p>
                  <dl>
                    <div>
                      <dt>Level</dt>
                      <dd>{titleCase(course.level)}</dd>
                    </div>
                    <div>
                      <dt>Location</dt>
                      <dd>{course.city}</dd>
                    </div>
                    <div>
                      <dt>Tuition</dt>
                      <dd style={{ color: "#0b655d" }}>{formatMoney(course.tuitionFee || course.tuitionFeeInr, course.currency || "USD")}</dd>
                    </div>
                  </dl>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #edf2f0" }}>
                    <Link to={`/courses/${course.slug}`}>View details</Link>
                    <button
                      className="workspace-button primary compact"
                      type="button"
                      onClick={() => {
                        setSelectedCourseForWizard({
                          id: course.id,
                          title: course.title,
                          instituteName: course.instituteName,
                          level: course.level,
                          tuitionFee: course.tuitionFee,
                          tuitionFeeInr: course.tuitionFeeInr,
                          currency: course.currency,
                        });
                        setWizardOpen(true);
                      }}
                    >
                      Apply <Send size={13} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="No saved courses"
              text="Explore the catalogue and shortlist courses that match your academic goals."
              action={
                <Link className="workspace-button primary" to="/courses">
                  Browse catalogue
                </Link>
              }
            />
          )}
        </section>
      </>
    );

  // ── Documents View ─────────────────────────────────────────────────────────
  if (activeSection === "documents")
    return (
      <>
        <PageHeading
          eyebrow="Candidate verification"
          title="Documents & ID"
          description="Keep academic transcripts and passport records ready for fast verification by admissions officers."
          actions={
            <button className="workspace-button primary" type="button" onClick={() => setUploadOpen(true)}>
              <Upload size={16} />
              Add document
            </button>
          }
        />
        {actionSuccess && (
          <p className="workspace-toast success">
            <CheckCircle2 size={17} />
            {actionSuccess}
          </p>
        )}
        {actionError && (
          <p className="workspace-toast error">
            <AlertCircle size={17} />
            {actionError}
          </p>
        )}
        <section className="workspace-panel" data-dashboard-reveal>
          <div className="document-summary">
            <div>
              <Award size={28} />
              <span>
                <strong>Document Readiness</strong>
                <small>{data.metrics.documentsReady} verified records</small>
              </span>
            </div>
            <div className="workspace-progress">
              <span style={{ width: `${Math.min(100, (data.documents.filter((d) => d.status === "VERIFIED").length / 4) * 100)}%` }} />
            </div>
            <p>Institutional reviewers use verified records for immediate admission decisions.</p>
          </div>
          <div className="document-list">
            {["Passport", "Academic Transcript", "Degree Certificate", "English Test Score"].map((docType) => {
              const uploaded = data.documents.find((d) => d.documentType.toLowerCase() === docType.toLowerCase());
              return (
                <article key={docType}>
                  <div className={`document-icon ${uploaded?.status === "VERIFIED" ? "verified" : uploaded ? "uploaded" : "missing"}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3>{docType}</h3>
                    <p>{uploaded?.fileName || "Not uploaded yet"}</p>
                  </div>
                  <StatusBadge value={uploaded?.status || "MISSING"} />
                  <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                    {uploaded ? (
                      <button
                        type="button"
                        style={{ color: "#dc2626", background: "none", border: 0, cursor: "pointer", fontSize: "12px" }}
                        onClick={() => deleteDoc(uploaded.id)}
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        className="workspace-button secondary compact"
                        type="button"
                        onClick={() => {
                          setSelectedDocType(docType);
                          setUploadOpen(true);
                        }}
                      >
                        Upload
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {uploadOpen && (
          <div className="workspace-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setUploadOpen(false); }}>
            <div className="workspace-modal" role="dialog" aria-modal="true">
              <header>
                <div>
                  <span>DOCUMENT RECORD</span>
                  <h2>Add student record</h2>
                  <p>Select the document category and filename.</p>
                </div>
                <button type="button" onClick={() => setUploadOpen(false)}><X size={20} /></button>
              </header>
              <form onSubmit={handleDocUpload}>
                <label>Document Category
                  <select name="documentType" defaultValue={selectedDocType || "Passport"} required>
                    <option value="Passport">Passport (Identity)</option>
                    <option value="Academic Transcript">Academic Transcript</option>
                    <option value="Degree Certificate">Degree Certificate</option>
                    <option value="English Test Score">English Test Score (IELTS / TOEFL)</option>
                  </select>
                </label>
                <label>File attachment
                  <input name="file" type="file" required />
                </label>
                <footer>
                  <button className="workspace-button secondary" type="button" onClick={() => setUploadOpen(false)}>Cancel</button>
                  <button className="workspace-button primary" disabled={busy}>{busy ? "Uploading…" : "Save Record"}</button>
                </footer>
              </form>
            </div>
          </div>
        )}
      </>
    );

  // ── Support View ───────────────────────────────────────────────────────────
  if (activeSection === "support")
    return (
      <>
        <PageHeading
          eyebrow="Help & Guidance"
          title="Student Support Desk"
          description="Have questions about admissions, student visas, FRRO registration, or campus life? Open a support ticket."
        />
        {supportSent && (
          <p className="workspace-toast success">
            <CheckCircle2 size={17} />
            Support ticket submitted! An advisor will respond shortly.
          </p>
        )}
        <div className="support-layout">
          <section className="workspace-panel">
            <SectionHeader eyebrow="Contact advisor" title="Raise a query" />
            <form
              className="support-form"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                const form = new FormData(e.currentTarget);
                try {
                  await apiRequest("/api/support/tickets", {
                    method: "POST",
                    body: JSON.stringify({
                      subject: form.get("subject"),
                      category: form.get("category"),
                      message: form.get("message"),
                    }),
                  });
                  setSupportSent(true);
                  (e.target as HTMLFormElement).reset();
                } catch {
                  // handle
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>Subject
                <input name="subject" required placeholder="e.g. Visa assistance letter inquiry" />
              </label>
              <label>Category
                <select name="category">
                  <option value="ADMISSIONS">Admissions & Eligibility</option>
                  <option value="VISA">Student Visa & FRRO</option>
                  <option value="SCHOLARSHIP">Scholarships & Fee Concessions</option>
                  <option value="HOSTEL">Hostel & Accommodation</option>
                  <option value="GENERAL">General Query</option>
                </select>
              </label>
              <label>Message details
                <textarea name="message" rows={5} required placeholder="Describe your question in detail..." />
              </label>
              <button className="workspace-button primary" disabled={busy}>
                {busy ? "Sending…" : "Submit Support Request"}
              </button>
            </form>
          </section>

          <aside className="support-guidance">
            <span><LifeBuoy size={24} /></span>
            <h2>International Student Helpline</h2>
            <ul>
              <li><CheckCircle2 size={15} /> 24/7 Toll-Free Email Support</li>
              <li><CheckCircle2 size={15} /> Official AIU / UGC Recognized Assistance</li>
              <li><CheckCircle2 size={15} /> Direct Embassy Liaison Support</li>
            </ul>
            <p style={{ fontSize: "12px", color: "#c1dcd7", lineHeight: 1.5 }}>
              For urgent admission status inquiries, you can also message the university admissions team directly via the Admissions Chat tab in your application card.
            </p>
          </aside>
        </div>
      </>
    );

  // ── Default Overview View ──────────────────────────────────────────────────
  return (
    <>
      <PageHeading
        eyebrow="Study in India Learner Centre"
        title={`Welcome, ${data.user.displayName || "International Student"}`}
        description="Search accredited Indian universities, build complete admission applications, accept provisional offers, and complete pre-departure modules."
        actions={
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="workspace-button secondary" type="button" onClick={() => setGpaModalOpen(true)}>
              <Calculator size={15} /> GPA / Eligibility
            </button>
            <button
              className="workspace-button primary"
              type="button"
              onClick={() => {
                setSelectedCourseForWizard(courses[0] || null);
                setWizardOpen(true);
              }}
            >
              <Plus size={16} /> New Application
            </button>
          </div>
        }
      />

      {offersReceived.length > 0 && (
        <div className="student-attention-banner" data-dashboard-reveal>
          <span><Award size={20} /></span>
          <div>
            <strong>🎉 Formal Admission Offer Issued!</strong>
            <p>
              You have received an official provisional admission offer for {offersReceived[0].title}. Download your certificate to accept.
            </p>
          </div>
          <button
            className="workspace-button primary compact"
            type="button"
            onClick={() => setViewingOfferApp(offersReceived[0])}
            style={{ background: "#e87524", color: "#fff" }}
          >
            Review Offer Letter <ArrowRight size={14} />
          </button>
        </div>
      )}

      <div className="workspace-metric-grid">
        <MetricCard icon={FileCheck2} label="Applications" value={data.applications.length} note={`${activeApps.length} active in review`} tone="teal" />
        <MetricCard icon={Award} label="Formal Offers" value={offersReceived.length} note="Official admission offers" tone="orange" />
        <MetricCard icon={Heart} label="Saved Programmes" value={data.savedCourses.length} note="Shortlisted degrees" tone="blue" />
        <MetricCard icon={Compass} label="Pre-Departure LMS" value={`${orientationModules.filter((m) => m.completed).length}/${orientationModules.length || 4}`} note="Orientation modules ready" tone="ink" />
      </div>

      <div className="student-overview-grid">
        <section className="workspace-panel journey-panel" data-dashboard-reveal>
          <SectionHeader eyebrow="Admissions Journey" title="Your Study in India Pathway" />
          <div className="student-journey">
            {journeySteps.map(([stepTitle, stepDesc, stepClass], index) => (
              <article key={stepTitle} className={stepClass}>
                <span>{index + 1}</span>
                <h3>{stepTitle}</h3>
                <p>{stepDesc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workspace-panel student-next-panel" data-dashboard-reveal>
          <SectionHeader eyebrow="Next Priority" title="Pre-Departure Prep" />
          <div className="student-next-icon">
            <Compass size={24} />
          </div>
          <p>
            Learn about Visa & e-FRRO registration, health insurance, student bank accounts, and campus life before traveling to India.
          </p>
          <button className="workspace-button" type="button" onClick={() => onNavigate("orientation")} style={{ marginTop: "auto" }}>
            Open Pre-Departure LMS <ArrowRight size={14} />
          </button>
        </section>
      </div>

      <div className="student-lower-grid">
        <section className="workspace-panel" data-dashboard-reveal>
          <SectionHeader
            eyebrow="Active Pipeline"
            title="Recent Applications"
            action={
              <button className="workspace-link-button" onClick={() => onNavigate("applications")}>
                View all ({data.applications.length}) <ArrowRight size={13} />
              </button>
            }
          />
          {data.applications.length ? (
            <div className="compact-application-list">
              {data.applications.slice(0, 4).map((app) => (
                <article key={app.id}>
                  <span><GraduationCap size={17} /></span>
                  <div>
                    <strong>{app.title}</strong>
                    <small>{app.instituteName} · {titleCase(app.level)}</small>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <StatusBadge value={app.status} />
                    {(app.status === "OFFERED" || app.status === "OFFER_ACCEPTED") && (
                      <button className="workspace-row-action" type="button" onClick={() => setViewingOfferApp(app)}>
                        Offer Letter
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileCheck2}
              title="No applications started"
              text="Browse top accredited programmes and apply directly."
              action={
                <button
                  className="workspace-button primary compact"
                  type="button"
                  onClick={() => {
                    setSelectedCourseForWizard(courses[0] || null);
                    setWizardOpen(true);
                  }}
                >
                  Apply Now
                </button>
              }
            />
          )}
        </section>

        <section className="workspace-panel" data-dashboard-reveal>
          <SectionHeader
            eyebrow="Shortlist"
            title="Saved Programmes"
            action={
              <button className="workspace-link-button" onClick={() => onNavigate("saved")}>
                View all <ArrowRight size={13} />
              </button>
            }
          />
          {data.savedCourses.length ? (
            <div className="deadline-list">
              {data.savedCourses.slice(0, 3).map((course) => (
                <article key={course.id}>
                  <span>
                    <strong>{course.title.slice(0, 2).toUpperCase()}</strong>
                    <small>{course.level.slice(0, 3)}</small>
                  </span>
                  <div>
                    <strong>{course.title}</strong>
                    <small>{course.instituteName} · {formatMoney(course.tuitionFee || course.tuitionFeeInr, course.currency || "USD")}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Heart}
              title="No saved courses"
              text="Save courses from the catalogue to compare."
              action={
                <Link className="workspace-button secondary compact" to="/courses">
                  Browse
                </Link>
              }
            />
          )}
        </section>
      </div>

      {/* 5-Step Application Wizard Modal */}
      {wizardOpen && selectedCourseForWizard && (
        <ApplicationWizardModal
          course={selectedCourseForWizard}
          initialProfile={data.profile}
          onClose={() => setWizardOpen(false)}
          onSuccess={async () => {
            setWizardOpen(false);
            setActionSuccess("Application submitted successfully!");
            await onRefresh();
            onNavigate("applications");
          }}
        />
      )}

      {/* Official Offer Letter Modal */}
      {viewingOfferApp && (
        <OfferLetterModal
          application={viewingOfferApp}
          studentName={data.user.displayName || "Applicant"}
          isStudentViewer={true}
          onClose={() => setViewingOfferApp(null)}
          onRefresh={async () => {
            await onRefresh();
            setViewingOfferApp(null);
          }}
        />
      )}

      {/* Admissions Chat Drawer */}
      {chatApp && (
        <ApplicationChatDrawer
          applicationId={chatApp.id}
          programmeTitle={chatApp.title}
          recipientName={chatApp.instituteName}
          userRole="STUDENT"
          onClose={() => setChatApp(null)}
        />
      )}

      {/* GPA Calculator Modal */}
      {gpaModalOpen && <GpaCalculatorModal onClose={() => setGpaModalOpen(false)} />}
    </>
  );
}
