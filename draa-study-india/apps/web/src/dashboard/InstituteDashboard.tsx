import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpenText,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleHelp,
  Clock3,
  ExternalLink,
  FileCheck2,
  Globe2,
  GraduationCap,
  IndianRupee,
  MapPin,
  MessageSquareText,
  Plus,
  Search,
  Send,
  Sparkles,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../lib/api";
import { EmptyState, formatDate, formatMoney, MetricCard, PageHeading, SectionHeader, StatusBadge, titleCase } from "./DashboardBits";
import type { DashboardViewProps, InstituteApplicant, InstituteWorkspace } from "./types";

export default function InstituteDashboard({ data, activeSection, onNavigate, onRefresh }: DashboardViewProps<InstituteWorkspace>) {
  const [programmeOpen, setProgrammeOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<InstituteApplicant | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("ALL");

  const filteredApplicants = useMemo(() => applicationFilter === "ALL" ? data.applicants : data.applicants.filter((applicant) => applicant.status === applicationFilter), [applicationFilter, data.applicants]);
  const profileItems = [data.profile.instituteName, data.profile.contactName, data.profile.city, data.profile.website, data.institute?.description];
  const profileCompletion = Math.round((profileItems.filter(Boolean).length / profileItems.length) * 100);

  async function updateApplication(status: string) {
    if (!selectedApplicant) return;
    setBusy(true); setError(""); setMessage("");
    try {
      await apiRequest(`/api/institute/applications/${selectedApplicant.id}`, { method: "PATCH", body: JSON.stringify({ status, note: status === "OFFERED" ? "A conditional offer has been issued. Please review the programme conditions and response deadline." : status === "DECLINED" ? "The application did not meet the current programme requirements." : "The academic and identity documents are under institutional review." }) });
      setMessage(`Application moved to ${titleCase(status)}.`); setSelectedApplicant(null); await onRefresh();
    } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Application could not be updated."); }
    finally { setBusy(false); }
  }

  async function createProgramme(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/api/institute/programmes", { method: "POST", body: JSON.stringify({ title: form.get("title"), discipline: form.get("discipline"), level: form.get("level"), mode: form.get("mode"), durationMonths: Number(form.get("durationMonths")), tuitionFeeInr: Number(form.get("tuitionFeeInr")) || undefined, startDate: form.get("startDate") }) });
      setProgrammeOpen(false); setMessage("Programme draft created."); await onRefresh();
    } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Programme could not be created."); }
    finally { setBusy(false); }
  }

  async function changeProgrammeStatus(id: number, status: string) {
    setBusy(true); setError("");
    try { await apiRequest(`/api/institute/programmes/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); await onRefresh(); }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Programme could not be updated."); }
    finally { setBusy(false); }
  }

  async function submitSupport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try { await apiRequest("/api/dashboard/support", { method: "POST", body: JSON.stringify({ subject: form.get("subject"), category: form.get("category") }) }); event.currentTarget.reset(); setMessage("Support request created."); await onRefresh(); }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Support request could not be created."); }
    finally { setBusy(false); }
  }

  if (activeSection === "applications") return <>
    <PageHeading eyebrow="Admissions workspace" title="Application review" description="Prioritise new applicants, record clear decisions and keep institutional updates visible to students." />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}{error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal><div className="application-toolbar"><div className="workspace-filter-tabs" role="group" aria-label="Filter applications">{["ALL", "SUBMITTED", "UNDER_REVIEW", "OFFERED", "DECLINED"].map((status) => <button key={status} type="button" className={applicationFilter === status ? "is-active" : ""} onClick={() => setApplicationFilter(status)}>{status === "ALL" ? "All" : titleCase(status)}<span>{status === "ALL" ? data.applicants.length : data.applicants.filter((applicant) => applicant.status === status).length}</span></button>)}</div><label className="workspace-table-search"><Search size={16} /><input placeholder="Search applicants" aria-label="Search applicants" /></label></div>
      {filteredApplicants.length ? <div className="workspace-table-wrap"><table className="workspace-table"><thead><tr><th>Applicant</th><th>Programme</th><th>Submitted</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredApplicants.map((applicant) => <tr key={applicant.id}><td><div className="table-person"><span>{applicant.studentName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{applicant.studentName}</strong><small>{applicant.country || "Country not supplied"} · {applicant.email}</small></div></div></td><td><strong>{applicant.courseTitle}</strong><small>{titleCase(applicant.level)}</small></td><td>{formatDate(applicant.submittedAt)}</td><td><StatusBadge value={applicant.status} /></td><td><button className="workspace-row-action" type="button" onClick={() => setSelectedApplicant(applicant)}>Review <ArrowRight size={15} /></button></td></tr>)}</tbody></table></div> : <EmptyState icon={Users} title="No applications in this view" text="Change the status filter to see other applicants." />}
    </section>
    {selectedApplicant && <div className="workspace-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedApplicant(null); }}><div className="workspace-modal applicant-modal" role="dialog" aria-modal="true"><header><div><span>APPLICATION #{selectedApplicant.id}</span><h2>{selectedApplicant.studentName}</h2><p>{selectedApplicant.courseTitle}</p></div><button type="button" onClick={() => setSelectedApplicant(null)} aria-label="Close"><X size={20} /></button></header><div className="applicant-review-summary"><div><span>Country</span><strong>{selectedApplicant.country || "Not supplied"}</strong></div><div><span>Submitted</span><strong>{formatDate(selectedApplicant.submittedAt)}</strong></div><div><span>Current status</span><StatusBadge value={selectedApplicant.status} /></div></div><section><h3>Review checklist</h3><ul><li><Check size={16} />Identity details available</li><li><Check size={16} />Academic information supplied</li><li><Clock3 size={16} />Institution must verify original documents</li></ul></section><footer className="applicant-actions"><button className="workspace-button secondary danger" type="button" disabled={busy} onClick={() => updateApplication("DECLINED")}><XCircle size={16} />Decline</button><button className="workspace-button secondary" type="button" disabled={busy} onClick={() => updateApplication("UNDER_REVIEW")}><Clock3 size={16} />Reviewing</button><button className="workspace-button primary" type="button" disabled={busy} onClick={() => updateApplication("OFFERED")}><UserCheck size={16} />Issue offer</button></footer></div></div>}
  </>;

  if (activeSection === "programmes") return <>
    <PageHeading eyebrow="Programme catalogue" title="Manage programmes" description="Keep course information current so applicants can compare requirements, fees and intake dates with confidence." actions={<button className="workspace-button primary" type="button" onClick={() => setProgrammeOpen(true)}><Plus size={17} />Add programme</button>} />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}{error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Current catalogue" title={`${data.programmes.length} programmes`} /><div className="workspace-table-wrap"><table className="workspace-table programme-table"><thead><tr><th>Programme</th><th>Level & mode</th><th>Intake</th><th>Applications</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{data.programmes.map((programme) => <tr key={programme.id}><td><strong>{programme.title}</strong><small>{programme.discipline}</small></td><td>{titleCase(programme.level)}<small>{titleCase(programme.mode)}</small></td><td>{formatDate(programme.startDate, { month: "short", year: "numeric" })}<small>{formatMoney(programme.tuitionFeeInr)}</small></td><td><strong>{programme.applications}</strong><small>received</small></td><td><StatusBadge value={programme.status} /></td><td>{programme.status === "PUBLISHED" ? <button className="workspace-row-action" type="button" disabled={busy} onClick={() => changeProgrammeStatus(programme.id, "DRAFT")}>Unpublish</button> : <button className="workspace-row-action" type="button" disabled={busy} onClick={() => changeProgrammeStatus(programme.id, "PUBLISHED")}>Publish</button>}</td></tr>)}</tbody></table></div></section>
    <aside className="workspace-info-banner"><AlertCircle size={21} /><div><strong>Publishing responsibility</strong><p>Only publish verified course details. Intake dates, fees, eligibility and recognition information should be reviewed by an authorised institutional officer.</p></div></aside>
    {programmeOpen && <div className="workspace-modal-backdrop"><div className="workspace-modal" role="dialog" aria-modal="true"><header><div><span>NEW PROGRAMME</span><h2>Create a programme draft</h2><p>Begin with the essential discovery information. The programme stays in draft until you publish it.</p></div><button type="button" onClick={() => setProgrammeOpen(false)} aria-label="Close"><X size={20} /></button></header><form onSubmit={createProgramme}><div className="workspace-form-row"><label>Programme title<input name="title" required minLength={5} placeholder="e.g. Master of Sustainable Design" /></label><label>Discipline<input name="discipline" required minLength={3} placeholder="e.g. Design" /></label></div><div className="workspace-form-row"><label>Level<select name="level"><option value="UNDERGRADUATE">Undergraduate</option><option value="POSTGRADUATE">Postgraduate</option><option value="DOCTORAL">Doctoral</option><option value="CERTIFICATE">Certificate</option></select></label><label>Study mode<select name="mode"><option value="OFFLINE">On campus</option><option value="BLENDED">Blended</option><option value="ONLINE">Online</option></select></label></div><div className="workspace-form-row"><label>Duration in months<input name="durationMonths" type="number" min="1" max="96" required /></label><label>Indicative tuition (INR)<input name="tuitionFeeInr" type="number" min="0" step="1000" /></label></div><label>Indicative start date<input name="startDate" type="date" /></label>{error && <p className="workspace-form-error">{error}</p>}<footer><button className="workspace-button secondary" type="button" onClick={() => setProgrammeOpen(false)}>Cancel</button><button className="workspace-button primary" disabled={busy}>{busy ? "Creating…" : "Create draft"}<Plus size={16} /></button></footer></form></div></div>}
  </>;

  if (activeSection === "profile") return <>
    <PageHeading eyebrow="Institution identity" title="Institute profile" description="Maintain the verified identity and public information students rely on when comparing institutions." actions={data.profile.website ? <a className="workspace-button secondary" href={data.profile.website} target="_blank" rel="noreferrer">Open website <ExternalLink size={16} /></a> : undefined} />
    <div className="profile-layout"><section className="workspace-panel institution-profile-card" data-dashboard-reveal><div className="institution-mark"><Building2 size={27} /></div><div><span>Institution profile</span><h2>{data.profile.instituteName || data.user.displayName}</h2><p>{data.institute?.description || "Add a concise institution description for prospective learners."}</p><dl><div><dt><MapPin size={15} />Location</dt><dd>{data.institute?.city || data.profile.city || "Not supplied"}{data.institute?.state ? `, ${data.institute.state}` : ""}</dd></div><div><dt><GraduationCap size={15} />Institution type</dt><dd>{data.institute?.type || "Not supplied"}</dd></div><div><dt><Globe2 size={15} />Website</dt><dd>{data.profile.website || "Not supplied"}</dd></div><div><dt><UserCheck size={15} />Primary contact</dt><dd>{data.profile.contactName || "Not supplied"}</dd></div></dl></div></section><aside className="workspace-panel profile-readiness" data-dashboard-reveal><SectionHeader eyebrow="Readiness" title={`${profileCompletion}% complete`} /><div className="profile-progress-ring" style={{ "--progress": `${profileCompletion * 3.6}deg` } as React.CSSProperties}><span>{profileCompletion}%</span></div><ul><li className="done"><Check />Core institute details</li><li className="done"><Check />Nodal contact information</li><li className={data.institute?.description ? "done" : ""}>{data.institute?.description ? <Check /> : <AlertCircle />}Public description</li><li className={data.profile.website ? "done" : ""}>{data.profile.website ? <Check /> : <AlertCircle />}Website and contact routes</li></ul></aside></div>
    <section className="workspace-panel compliance-panel" data-dashboard-reveal><SectionHeader eyebrow="DRAA verification" title="Account and catalogue status" /><div><article><span><ShieldStatusIcon approved={data.profile.approvalStatus === "APPROVED"} /></span><div><h3>Institute onboarding</h3><p>Your institution account is {titleCase(data.profile.approvalStatus || "PENDING")}.</p></div><StatusBadge value={data.profile.approvalStatus || "PENDING"} /></article><article><span><BookOpenText size={21} /></span><div><h3>Published catalogue</h3><p>{data.programmes.filter((programme) => programme.status === "PUBLISHED").length} programmes are visible to students.</p></div><StatusBadge value={data.institute?.status || "DRAFT"} /></article></div></section>
  </>;

  if (activeSection === "support") return <>
    <PageHeading eyebrow="Partner support" title="Institution support" description="Request help with onboarding, catalogue data, application workflows or technical access." />
    <div className="support-layout"><section className="workspace-panel"><SectionHeader eyebrow="Create a request" title="Contact DRAA operations" /><form className="support-form" onSubmit={submitSupport}><label>Area<select name="category"><option>Institute onboarding</option><option>Programme catalogue</option><option>Application management</option><option>Account access</option><option>Technical issue</option></select></label><label>Request<textarea name="subject" required minLength={8} maxLength={180} rows={5} placeholder="Describe the issue, affected programme or application, and the outcome you need." /></label>{error && <p className="workspace-form-error">{error}</p>}{message && <p className="workspace-form-success"><CheckCircle2 size={16} />{message}</p>}<button className="workspace-button primary" disabled={busy}>Create request <MessageSquareText size={16} /></button></form></section><aside className="support-guidance"><span><CircleHelp size={25} /></span><h2>Operations guidance</h2><ul><li><Check />Use authorised staff contact details.</li><li><Check />Do not include passwords in a ticket.</li><li><Check />Reference an application ID when relevant.</li></ul><Link to="/contact">View DRAA contact details <ArrowRight size={15} /></Link></aside></div>
  </>;

  return <>
    <PageHeading eyebrow={data.profile.approvalStatus === "APPROVED" ? "Verified institute workspace" : "Institute onboarding"} title={`Welcome, ${data.profile.instituteName || data.user.displayName}.`} description="Review applicant demand, keep programmes current and move each admission decision forward with a clear audit trail." actions={<><button className="workspace-button secondary" type="button" onClick={() => onNavigate("applications")}><Users size={17} />Review applicants</button><button className="workspace-button primary" type="button" onClick={() => setProgrammeOpen(true)}><Plus size={17} />Add programme</button></>} />
    <div className="workspace-metric-grid"><MetricCard icon={Users} label="All applicants" value={data.metrics.applicants} note="Across your programmes" tone="teal" /><MetricCard icon={Clock3} label="Awaiting review" value={data.metrics.awaitingReview} note="Action recommended" tone="orange" /><MetricCard icon={UserCheck} label="Offers issued" value={data.metrics.offers} note="Current admission cycle" tone="blue" /><MetricCard icon={BookOpenText} label="Programmes" value={data.metrics.programmes} note={`${data.programmes.filter((programme) => programme.status === "PUBLISHED").length} published`} tone="ink" /></div>
    {data.metrics.awaitingReview > 0 && <button className="student-attention-banner institute-attention" type="button" onClick={() => onNavigate("applications")} data-dashboard-reveal><span><Clock3 size={22} /></span><div><strong>{data.metrics.awaitingReview} application{data.metrics.awaitingReview === 1 ? "" : "s"} need an institutional update</strong><p>Review academic information and record a clear next status for the applicant.</p></div><ArrowRight size={19} /></button>}
    <div className="institute-overview-grid"><section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Admissions pipeline" title="Application status" action={<button className="workspace-link-button" onClick={() => onNavigate("applications")}>Open applications <ArrowRight size={14} /></button>} /><div className="pipeline-bars">{["SUBMITTED", "UNDER_REVIEW", "OFFERED", "DECLINED"].map((status) => { const count = Number(data.applicationCounts.find((item) => item.status === status)?.count || 0); const max = Math.max(data.metrics.applicants, 1); return <article key={status}><div><span>{titleCase(status)}</span><strong>{count}</strong></div><div><span style={{ width: `${(count / max) * 100}%` }} /></div></article>; })}</div></section><aside className="workspace-panel profile-readiness compact" data-dashboard-reveal><SectionHeader eyebrow="Public profile" title="Profile readiness" /><div className="profile-readiness-inline"><div className="profile-progress-ring" style={{ "--progress": `${profileCompletion * 3.6}deg` } as React.CSSProperties}><span>{profileCompletion}%</span></div><div><p>Complete profiles help students make better-informed comparisons.</p><button className="workspace-link-button" onClick={() => onNavigate("profile")}>Review profile <ArrowRight size={14} /></button></div></div></aside></div>
    <section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Priority queue" title="Applicants needing attention" action={<button className="workspace-link-button" onClick={() => onNavigate("applications")}>View full queue <ArrowRight size={14} /></button>} />{data.applicants.length ? <div className="compact-applicant-list">{data.applicants.slice(0, 4).map((applicant) => <article key={applicant.id}><div className="table-person"><span>{applicant.studentName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{applicant.studentName}</strong><small>{applicant.country || "Country not supplied"}</small></div></div><div><strong>{applicant.courseTitle}</strong><small>Submitted {formatDate(applicant.submittedAt)}</small></div><StatusBadge value={applicant.status} /><button type="button" onClick={() => { setSelectedApplicant(applicant); onNavigate("applications"); }}>Review <ArrowRight size={14} /></button></article>)}</div> : <EmptyState icon={Users} title="No applicants yet" text="Applications will appear here when students submit to your published programmes." />}</section>
    {programmeOpen && <div className="workspace-modal-backdrop"><div className="workspace-modal"><header><div><span>NEW PROGRAMME</span><h2>Create a programme draft</h2><p>Add essential discovery information now, then verify it before publishing.</p></div><button type="button" onClick={() => setProgrammeOpen(false)}><X size={20} /></button></header><form onSubmit={createProgramme}><div className="workspace-form-row"><label>Programme title<input name="title" required minLength={5} /></label><label>Discipline<input name="discipline" required minLength={3} /></label></div><div className="workspace-form-row"><label>Level<select name="level"><option value="UNDERGRADUATE">Undergraduate</option><option value="POSTGRADUATE">Postgraduate</option><option value="DOCTORAL">Doctoral</option><option value="CERTIFICATE">Certificate</option></select></label><label>Mode<select name="mode"><option value="OFFLINE">On campus</option><option value="BLENDED">Blended</option><option value="ONLINE">Online</option></select></label></div><div className="workspace-form-row"><label>Duration (months)<input name="durationMonths" type="number" min="1" max="96" required /></label><label>Tuition fee (INR)<input name="tuitionFeeInr" type="number" min="0" /></label></div><label>Start date<input name="startDate" type="date" /></label>{error && <p className="workspace-form-error">{error}</p>}<footer><button className="workspace-button secondary" type="button" onClick={() => setProgrammeOpen(false)}>Cancel</button><button className="workspace-button primary" disabled={busy}>Create draft <Plus size={16} /></button></footer></form></div></div>}
  </>;
}

function ShieldStatusIcon({ approved }: { approved: boolean }) {
  return approved ? <CheckCircle2 size={21} /> : <AlertCircle size={21} />;
}
