import {
  AlertCircle,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  Heart,
  IndianRupee,
  LifeBuoy,
  MapPin,
  MessageSquareText,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { EmptyState, formatDate, formatMoney, MetricCard, PageHeading, SectionHeader, StatusBadge, titleCase } from "./DashboardBits";
import type { DashboardViewProps, StudentWorkspace } from "./types";

type CourseOption = { id: number; title: string; instituteName: string; level: string };

const journeySteps = [
  ["Profile", "Personal and contact information", "complete"],
  ["Documents", "Academic and identity records", "current"],
  ["Choices", "Compare and shortlist programmes", "complete"],
  ["Applications", "Submit and follow decisions", "current"],
  ["Arrival", "Offer, visa and pre-departure", "upcoming"],
] as const;

export default function StudentDashboard({ data, activeSection, onNavigate, onRefresh }: DashboardViewProps<StudentWorkspace>) {
  const [applyOpen, setApplyOpen] = useState(false);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [supportSent, setSupportSent] = useState(false);

  useEffect(() => {
    if (!applyOpen || courses.length) return;
    apiRequest<{ courses: CourseOption[] }>("/api/catalog/courses").then((result) => setCourses(result.courses)).catch((error) => setActionError(error.message));
  }, [applyOpen, courses.length]);

  const profileCompletion = useMemo(() => {
    const fields = [data.profile.firstName, data.profile.lastName, data.profile.country, data.profile.dateOfBirth, data.profile.passportNumber];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  }, [data.profile]);
  const documentAction = data.documents.find((document) => ["MISSING", "ACTION_REQUIRED"].includes(document.status));
  const offer = data.applications.find((application) => application.status === "OFFERED");

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setActionError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/api/student/applications", { method: "POST", body: JSON.stringify({ courseId: Number(form.get("courseId")), statement: form.get("statement") }) });
      setApplyOpen(false);
      await onRefresh();
    } catch (error) { setActionError(error instanceof Error ? error.message : "Application could not be submitted."); }
    finally { setBusy(false); }
  }

  async function removeSaved(courseId: number) {
    await apiRequest(`/api/student/saved-courses/${courseId}`, { method: "DELETE" });
    await onRefresh();
  }

  async function submitSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setActionError("");
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/api/dashboard/support", { method: "POST", body: JSON.stringify({ subject: form.get("subject"), category: form.get("category") }) });
      event.currentTarget.reset(); setSupportSent(true); await onRefresh();
    } catch (error) { setActionError(error instanceof Error ? error.message : "Support request could not be sent."); }
    finally { setBusy(false); }
  }

  if (activeSection === "applications") return <>
    <PageHeading eyebrow="Application centre" title="Your applications" description="Start an application, follow each institution's review and keep the next action visible." actions={<><Link className="workspace-button secondary" to="/courses"><Search size={17} />Browse programmes</Link><button className="workspace-button primary" type="button" onClick={() => setApplyOpen(true)}><Send size={17} />New application</button></>} />
    <section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Current cycle" title={`${data.applications.length} active application${data.applications.length === 1 ? "" : "s"}`} />
      {data.applications.length ? <div className="student-application-list">{data.applications.map((application) => <article key={application.id}>
        <div className="student-application-logo"><GraduationCap size={21} /></div>
        <div className="student-application-main"><span>{application.instituteName}</span><h3>{application.title}</h3><p><MapPin size={13} />{application.city}, {application.state}<i />{titleCase(application.level)}</p></div>
        <div className="student-application-status"><StatusBadge value={application.status} /><small>Updated {formatDate(application.updatedAt, { day: "numeric", month: "short" })}</small></div>
        <div className="student-application-note"><strong>Latest update</strong><p>{application.decisionNote || "Your application has been received. The institution will post its next update here."}</p></div>
        <Link to={`/courses/${application.slug}`}>View programme <ArrowRight size={15} /></Link>
      </article>)}</div> : <EmptyState icon={FileCheck2} title="No applications yet" text="Compare programmes and start when you have checked the eligibility and required documents." action={<button className="workspace-button primary" type="button" onClick={() => setApplyOpen(true)}>Start an application</button>} />}
    </section>
    {applyOpen && <div className="workspace-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setApplyOpen(false); }}><div className="workspace-modal" role="dialog" aria-modal="true" aria-labelledby="application-modal-title"><header><div><span>NEW APPLICATION</span><h2 id="application-modal-title">Choose a programme</h2><p>Submit one clear statement for institutional review. You can follow the outcome from this dashboard.</p></div><button type="button" onClick={() => setApplyOpen(false)} aria-label="Close"><X size={20} /></button></header><form onSubmit={submitApplication}><label>Programme<select name="courseId" required defaultValue=""><option value="" disabled>Select a programme</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title} — {course.instituteName}</option>)}</select></label><label>Why are you interested in this programme?<textarea name="statement" required minLength={50} maxLength={4000} rows={6} placeholder="Describe your preparation, goals and reason for choosing this programme." /><small>Minimum 50 characters. Keep your statement specific and honest.</small></label>{actionError && <p className="workspace-form-error">{actionError}</p>}<footer><button className="workspace-button secondary" type="button" onClick={() => setApplyOpen(false)}>Cancel</button><button className="workspace-button primary" disabled={busy}>{busy ? "Submitting…" : "Submit application"}<Send size={16} /></button></footer></form></div></div>}
  </>;

  if (activeSection === "saved") return <>
    <PageHeading eyebrow="Programme shortlist" title="Saved programmes" description="Keep promising options together, compare them carefully and remove anything that no longer fits." actions={<Link className="workspace-button primary" to="/courses"><Search size={17} />Find programmes</Link>} />
    {data.savedCourses.length ? <div className="saved-programme-grid">{data.savedCourses.map((course) => <article key={course.id} data-dashboard-reveal><header><span>{titleCase(course.level)}</span><button type="button" onClick={() => removeSaved(course.id)} aria-label={`Remove ${course.title} from saved programmes`}><Trash2 size={17} /></button></header><h2>{course.title}</h2><p>{course.instituteName}</p><dl><div><dt><MapPin size={14} />Location</dt><dd>{course.city}</dd></div><div><dt><CalendarDays size={14} />Indicative start</dt><dd>{formatDate(course.startDate, { month: "short", year: "numeric" })}</dd></div><div><dt><IndianRupee size={14} />Tuition</dt><dd>{formatMoney(course.tuitionFeeInr)}</dd></div></dl><Link to={`/courses/${course.slug}`}>View full details <ArrowRight size={15} /></Link></article>)}</div> : <section className="workspace-panel"><EmptyState icon={Heart} title="Your shortlist is empty" text="Save programmes while browsing so you can compare them here before applying." action={<Link className="workspace-button primary" to="/courses">Explore programmes</Link>} /></section>}
  </>;

  if (activeSection === "documents") return <>
    <PageHeading eyebrow="Document centre" title="Application documents" description="See what is ready, what institutions are reviewing and what still needs your attention." />
    <div className="document-summary" data-dashboard-reveal><div><FileCheck2 size={24} /><span><strong>{data.metrics.documentsReady} of {data.documents.length}</strong><small>documents verified</small></span></div><div className="workspace-progress"><span style={{ width: `${data.documents.length ? (data.metrics.documentsReady / data.documents.length) * 100 : 0}%` }} /></div><p>Files are reviewed by the relevant institution. A verified label is not an admission or visa decision.</p></div>
    <section className="workspace-panel" data-dashboard-reveal><SectionHeader title="Your checklist" eyebrow="Required records" />
      <div className="document-list">{data.documents.map((document) => <article key={document.id}><span className={`document-icon ${document.status.toLowerCase().replaceAll("_", "-")}`}><FileText size={20} /></span><div><h3>{document.documentType}</h3><p>{document.fileName || "No file supplied"}</p></div><StatusBadge value={document.status} /><small>Updated {formatDate(document.updatedAt)}</small></article>)}</div>
    </section>
    <aside className="workspace-info-banner"><AlertCircle size={21} /><div><strong>Secure upload integration</strong><p>This dashboard tracks each required record. Production file uploads should be connected to encrypted object storage with malware scanning before accepting real identity documents.</p></div></aside>
  </>;

  if (activeSection === "support") return <>
    <PageHeading eyebrow="Help centre" title="Get the right support" description="Send a focused request and keep application, programme and account questions in one place." />
    <div className="support-layout"><section className="workspace-panel" data-dashboard-reveal><SectionHeader title="Create a support request" eyebrow="DRAA support" /><form className="support-form" onSubmit={submitSupport}><label>Topic<select name="category"><option>Application</option><option>Programme information</option><option>Account access</option><option>Technical issue</option><option>Other</option></select></label><label>How can we help?<textarea name="subject" required minLength={8} maxLength={180} rows={5} placeholder="Explain the question and include the programme or application name where relevant." /></label>{actionError && <p className="workspace-form-error">{actionError}</p>}{supportSent && <p className="workspace-form-success"><CheckCircle2 size={16} />Your request has been created.</p>}<button className="workspace-button primary" disabled={busy}>{busy ? "Sending…" : "Send request"}<MessageSquareText size={16} /></button></form></section><aside className="support-guidance" data-dashboard-reveal><span><LifeBuoy size={25} /></span><h2>Before you send</h2><ul><li><Check />Check the programme's published eligibility.</li><li><Check />Do not email passwords or full payment-card details.</li><li><Check />Visa decisions belong to the relevant authorities.</li></ul><Link to="/faq">Read common questions <ArrowRight size={15} /></Link></aside></div>
  </>;

  return <>
    <PageHeading eyebrow={`Hello, ${data.profile.firstName || data.user.displayName.split(" ")[0]}`} title="Your study journey, clearly organised." description="See what needs attention now, track every application and keep your next decision grounded in the right information." actions={<><Link className="workspace-button secondary" to="/courses"><Search size={17} />Explore programmes</Link><button className="workspace-button primary" type="button" onClick={() => setApplyOpen(true)}><Send size={17} />Start application</button></>} />
    <div className="workspace-metric-grid student-metrics"><MetricCard icon={FileCheck2} label="Applications" value={data.metrics.applications} note={data.metrics.applications ? "Across this admission cycle" : "Start from your shortlist"} tone="teal" /><MetricCard icon={Heart} label="Saved programmes" value={data.metrics.saved} note="Ready to compare" tone="orange" /><MetricCard icon={FileText} label="Verified documents" value={`${data.metrics.documentsReady}/${data.documents.length}`} note="Institution-checked records" tone="blue" /><MetricCard icon={BookOpenText} label="Available programmes" value={data.metrics.totalCourses} note="In the DRAA catalogue" tone="ink" /></div>
    {documentAction && <button className="student-attention-banner" type="button" onClick={() => onNavigate("documents")} data-dashboard-reveal><span><AlertCircle size={22} /></span><div><strong>{documentAction.documentType} needs attention</strong><p>{documentAction.status === "MISSING" ? "This document has not been supplied yet." : "The current file needs an update before review can continue."}</p></div><ArrowRight size={19} /></button>}
    <div className="student-overview-grid"><section className="workspace-panel journey-panel" data-dashboard-reveal><SectionHeader eyebrow="Your roadmap" title="Journey progress" action={<strong>{profileCompletion}% profile ready</strong>} /><div className="student-journey">{journeySteps.map(([title, description, state], index) => <article key={title} className={state}><span>{state === "complete" ? <Check size={16} /> : index + 1}</span><div><h3>{title}</h3><p>{description}</p></div></article>)}</div></section><aside className="workspace-panel student-next-panel" data-dashboard-reveal><SectionHeader eyebrow="Next best action" title={offer ? "Review your offer" : "Complete your documents"} /><div className="student-next-icon">{offer ? <Sparkles size={25} /> : <FileText size={25} />}</div><p>{offer ? `${offer.instituteName} has recorded an offer for ${offer.title}. Read the conditions before responding.` : "Resolve any missing or action-required records so institutions can complete their review."}</p><button className="workspace-button primary" type="button" onClick={() => onNavigate(offer ? "applications" : "documents")}>{offer ? "View offer" : "Open document centre"}<ArrowRight size={16} /></button></aside></div>
    <div className="student-lower-grid"><section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Application activity" title="Latest applications" action={<button className="workspace-link-button" onClick={() => onNavigate("applications")}>View all <ArrowRight size={14} /></button>} />{data.applications.length ? <div className="compact-application-list">{data.applications.slice(0, 3).map((application) => <article key={application.id}><span><GraduationCap size={18} /></span><div><strong>{application.title}</strong><small>{application.instituteName}</small></div><StatusBadge value={application.status} /></article>)}</div> : <EmptyState icon={FileCheck2} title="No active applications" text="Use your shortlist to begin." />}</section><section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Dates to watch" title="Upcoming milestones" /><div className="deadline-list">{data.applications.filter((application) => application.startDate).slice(0, 3).map((application) => <article key={application.id}><span><strong>{formatDate(application.startDate, { day: "2-digit" })}</strong><small>{formatDate(application.startDate, { month: "short" })}</small></span><div><strong>{application.title}</strong><small>Indicative programme start</small></div></article>)}{!data.applications.some((application) => application.startDate) && <p className="workspace-empty-small">No programme dates have been confirmed.</p>}</div></section></div>
    {applyOpen && <div className="workspace-modal-backdrop"><div className="workspace-modal"><header><div><span>NEW APPLICATION</span><h2>Choose a programme</h2><p>Start from the programme that best matches your preparation and goals.</p></div><button type="button" onClick={() => setApplyOpen(false)} aria-label="Close"><X size={20} /></button></header><form onSubmit={submitApplication}><label>Programme<select name="courseId" required defaultValue=""><option value="" disabled>Select a programme</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title} — {course.instituteName}</option>)}</select></label><label>Statement<textarea name="statement" required minLength={50} maxLength={4000} rows={6} placeholder="Describe your preparation, goals and reason for choosing this programme." /></label>{actionError && <p className="workspace-form-error">{actionError}</p>}<footer><button className="workspace-button secondary" type="button" onClick={() => setApplyOpen(false)}>Cancel</button><button className="workspace-button primary" disabled={busy}>Submit application <Send size={16} /></button></footer></form></div></div>}
  </>;
}
