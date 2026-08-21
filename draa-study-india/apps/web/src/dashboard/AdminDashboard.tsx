import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  BookOpenText,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileCheck2,
  Filter,
  LifeBuoy,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { EmptyState, formatDate, MetricCard, PageHeading, SectionHeader, StatusBadge, titleCase } from "./DashboardBits";
import type { AdminWorkspace, DashboardViewProps } from "./types";

export default function AdminDashboard({ data, activeSection, onNavigate, onRefresh }: DashboardViewProps<AdminWorkspace>) {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userFilter, setUserFilter] = useState("ALL");
  const filteredUsers = useMemo(() => userFilter === "ALL" ? data.recentUsers : data.recentUsers.filter((user) => user.role === userFilter), [data.recentUsers, userFilter]);

  async function decideInstitute(userId: number, status: "APPROVED" | "REJECTED") {
    setBusyId(userId); setMessage(""); setError("");
    try { await apiRequest(`/api/admin/institutes/${userId}/approval`, { method: "PATCH", body: JSON.stringify({ status }) }); setMessage(`Institute ${status === "APPROVED" ? "approved" : "rejected"}.`); await onRefresh(); }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Approval could not be recorded."); }
    finally { setBusyId(null); }
  }

  async function updateTicket(id: number, status: string) {
    setBusyId(id); setMessage(""); setError("");
    try { await apiRequest(`/api/admin/support/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); setMessage("Support request updated."); await onRefresh(); }
    catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Support request could not be updated."); }
    finally { setBusyId(null); }
  }

  const alerts = [
    data.metrics.pendingInstitutes > 0 ? `${data.metrics.pendingInstitutes} institute registration${data.metrics.pendingInstitutes === 1 ? " is" : "s are"} waiting for review.` : null,
    data.metrics.openTickets > 0 ? `${data.metrics.openTickets} support request${data.metrics.openTickets === 1 ? " is" : "s are"} open.` : null,
  ].filter(Boolean);

  if (activeSection === "institutes") return <>
    <PageHeading eyebrow="Partner governance" title="Institute approvals" description="Review onboarding evidence, record a clear decision and keep access aligned with each institution's approval status." actions={<button className="workspace-button secondary" type="button" onClick={onRefresh}><RefreshCw size={16} />Refresh</button>} />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}{error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Registration queue" title={`${data.instituteApprovals.length} institute account${data.instituteApprovals.length === 1 ? "" : "s"}`} />
      <div className="institute-approval-list">{data.instituteApprovals.map((institute) => <article key={institute.userId} className={institute.approvalStatus === "PENDING" ? "needs-review" : ""}><div className="approval-mark"><Building2 size={22} /></div><div className="approval-main"><span>{institute.city}</span><h3>{institute.instituteName}</h3><p>{institute.contactName} · {institute.email}</p>{institute.website && <a href={institute.website} target="_blank" rel="noreferrer">{institute.website}</a>}</div><div className="approval-meta"><StatusBadge value={institute.approvalStatus} /><small>Registered {formatDate(institute.createdAt)}</small></div><div className="approval-actions">{institute.approvalStatus === "PENDING" ? <><button className="workspace-button secondary danger compact" disabled={busyId === institute.userId} onClick={() => decideInstitute(institute.userId, "REJECTED")}><XCircle size={15} />Reject</button><button className="workspace-button primary compact" disabled={busyId === institute.userId} onClick={() => decideInstitute(institute.userId, "APPROVED")}><UserCheck size={15} />Approve</button></> : <button className="workspace-row-action" type="button">View record <ArrowRight size={14} /></button>}</div></article>)}</div>
    </section><aside className="workspace-info-banner"><ShieldCheck size={21} /><div><strong>Approval principle</strong><p>Approval should follow documented institutional checks. DRAA portal access does not replace statutory recognition or programme-specific regulatory verification.</p></div></aside>
  </>;

  if (activeSection === "applications") return <>
    <PageHeading eyebrow="Platform oversight" title="Application activity" description="Monitor movement across institutions, identify stalled reviews and preserve institutional responsibility for decisions." actions={<button className="workspace-button secondary" type="button"><Download size={16} />Export view</button>} />
    <section className="workspace-panel" data-dashboard-reveal><div className="application-toolbar"><div><strong>{data.applications.length} recent records</strong><small>Latest activity across the portal</small></div><label className="workspace-table-search"><Search size={16} /><input placeholder="Search applications" aria-label="Search applications" /></label></div><div className="workspace-table-wrap"><table className="workspace-table"><thead><tr><th>Applicant</th><th>Programme</th><th>Institution</th><th>Status</th><th>Updated</th></tr></thead><tbody>{data.applications.map((application) => <tr key={application.id}><td><strong>{application.studentName}</strong><small>{application.country || "Country not supplied"}</small></td><td><strong>{application.courseTitle}</strong><small>Application #{application.id}</small></td><td>{application.instituteName}</td><td><StatusBadge value={application.status} /></td><td>{formatDate(application.updatedAt)}</td></tr>)}</tbody></table></div></section>
  </>;

  if (activeSection === "users") return <>
    <PageHeading eyebrow="Identity & access" title="Users and access" description="Review account roles and status. Authentication and permissions remain enforced by the server for every protected action." />
    <section className="workspace-panel" data-dashboard-reveal><div className="application-toolbar"><div className="workspace-filter-tabs" role="group">{["ALL", "STUDENT", "INSTITUTE", "ADMIN"].map((role) => <button key={role} className={userFilter === role ? "is-active" : ""} onClick={() => setUserFilter(role)}>{role === "ALL" ? "All users" : titleCase(role)}</button>)}</div><label className="workspace-table-search"><Search size={16} /><input placeholder="Search users" /></label></div><div className="workspace-table-wrap"><table className="workspace-table"><thead><tr><th>User</th><th>Role</th><th>Account status</th><th>Created</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{filteredUsers.map((user) => <tr key={user.id}><td><div className="table-person"><span>{user.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{user.displayName}</strong><small>{user.email}</small></div></div></td><td>{titleCase(user.role)}</td><td><StatusBadge value={user.status} /></td><td>{formatDate(user.createdAt)}</td><td><button className="workspace-row-action" type="button">View access <ArrowRight size={14} /></button></td></tr>)}</tbody></table></div></section>
  </>;

  if (activeSection === "support") return <>
    <PageHeading eyebrow="Service operations" title="Support queue" description="Prioritise learner and institution requests, move ownership clearly and close issues with an auditable status." />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}{error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Open work" title={`${data.metrics.openTickets} unresolved request${data.metrics.openTickets === 1 ? "" : "s"}`} />{data.tickets.length ? <div className="support-ticket-list">{data.tickets.map((ticket) => <article key={ticket.id}><span className={`support-priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span><div><h3>{ticket.subject}</h3><p>{ticket.category} · Raised by {ticket.raisedBy} ({titleCase(ticket.role)})</p></div><StatusBadge value={ticket.status} /><small>{formatDate(ticket.createdAt)}</small><select aria-label={`Update ${ticket.subject} status`} value={ticket.status} disabled={busyId === ticket.id} onChange={(event) => updateTicket(ticket.id, event.target.value)}><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option></select></article>)}</div> : <EmptyState icon={LifeBuoy} title="Support queue is clear" text="New requests from students and institutions will appear here." />}</section>
  </>;

  if (activeSection === "audit") return <>
    <PageHeading eyebrow="Governance" title="Audit activity" description="A concise record of administrator and system actions affecting approvals, support and managed portal records." actions={<button className="workspace-button secondary" type="button"><Download size={16} />Export log</button>} />
    <section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Most recent" title="Platform audit trail" /><div className="audit-timeline">{data.audit.map((item) => <article key={item.id}><span><Activity size={17} /></span><div><strong>{titleCase(item.action)}</strong><p>{titleCase(item.entityType)}{item.entityId ? ` · ${item.entityId}` : ""}</p></div><small><strong>{item.actor || "System"}</strong>{formatDate(item.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small></article>)}</div></section>
  </>;

  return <>
    <PageHeading eyebrow="DRAA operations centre" title="Platform overview" description="Monitor admissions activity, institution readiness and service operations from one accountable workspace." actions={<button className="workspace-button secondary" type="button" onClick={onRefresh}><RefreshCw size={16} />Refresh data</button>} />
    <div className="admin-metric-grid"><MetricCard icon={Users} label="Students" value={data.metrics.students} note="Registered learner accounts" tone="teal" /><MetricCard icon={Building2} label="Institutions" value={data.metrics.institutes} note={`${data.metrics.pendingInstitutes} awaiting approval`} tone="orange" /><MetricCard icon={FileCheck2} label="Applications" value={data.metrics.applications} note="Across all statuses" tone="blue" /><MetricCard icon={BookOpenText} label="Published programmes" value={data.metrics.publishedCourses} note="Visible in catalogue" tone="ink" /><MetricCard icon={LifeBuoy} label="Open support" value={data.metrics.openTickets} note="Requests needing ownership" tone="orange" /></div>
    {alerts.length > 0 && <div className="admin-alert-strip" data-dashboard-reveal><span><AlertCircle size={20} /></span><div><strong>Operations need attention</strong><p>{alerts.join(" ")}</p></div><button type="button" onClick={() => onNavigate(data.metrics.pendingInstitutes ? "institutes" : "support")}>Open priority queue <ArrowRight size={15} /></button></div>}
    <div className="admin-overview-grid"><section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Admissions movement" title="Application pipeline" action={<button className="workspace-link-button" onClick={() => onNavigate("applications")}>View applications <ArrowRight size={14} /></button>} /><div className="admin-pipeline">{["SUBMITTED", "UNDER_REVIEW", "OFFERED", "DECLINED"].map((status) => { const count = data.applications.filter((application) => application.status === status).length; return <article key={status}><span><i className={status.toLowerCase().replaceAll("_", "-")} /></span><div><strong>{count}</strong><small>{titleCase(status)}</small></div></article>; })}</div><div className="admin-pipeline-visual" aria-label="Application pipeline visualisation">{["SUBMITTED", "UNDER_REVIEW", "OFFERED", "DECLINED"].map((status) => { const count = data.applications.filter((application) => application.status === status).length; const max = Math.max(data.applications.length, 1); return <span key={status} className={status.toLowerCase().replaceAll("_", "-")} style={{ width: `${Math.max(7, (count / max) * 100)}%` }} title={`${titleCase(status)}: ${count}`} />; })}</div></section><aside className="workspace-panel admin-health" data-dashboard-reveal><SectionHeader eyebrow="Portal health" title="Operational checks" /><ul><li><CheckCircle2 /><span><strong>Authentication service</strong><small>Role permissions active</small></span><em>Healthy</em></li><li><CheckCircle2 /><span><strong>Catalogue</strong><small>{data.metrics.publishedCourses} programmes published</small></span><em>Healthy</em></li><li className={data.metrics.openTickets ? "attention" : ""}>{data.metrics.openTickets ? <AlertCircle /> : <CheckCircle2 />}<span><strong>Support queue</strong><small>{data.metrics.openTickets} unresolved</small></span><em>{data.metrics.openTickets ? "Review" : "Healthy"}</em></li></ul></aside></div>
    <div className="admin-lower-grid"><section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Institution onboarding" title="Approval queue" action={<button className="workspace-link-button" onClick={() => onNavigate("institutes")}>Manage institutes <ArrowRight size={14} /></button>} />{data.instituteApprovals.filter((item) => item.approvalStatus === "PENDING").length ? <div className="compact-approval-list">{data.instituteApprovals.filter((item) => item.approvalStatus === "PENDING").slice(0, 4).map((institute) => <article key={institute.userId}><span><Building2 size={18} /></span><div><strong>{institute.instituteName}</strong><small>{institute.city} · {institute.contactName}</small></div><button type="button" onClick={() => onNavigate("institutes")}>Review <ArrowRight size={14} /></button></article>)}</div> : <EmptyState icon={UserCheck} title="No pending institutes" text="All current institute registrations have a recorded decision." />}</section><section className="workspace-panel" data-dashboard-reveal><SectionHeader eyebrow="Latest identities" title="Recent users" action={<button className="workspace-link-button" onClick={() => onNavigate("users")}>View access <ArrowRight size={14} /></button>} /><div className="compact-user-list">{data.recentUsers.slice(0, 5).map((user) => <article key={user.id}><span>{user.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><strong>{user.displayName}</strong><small>{titleCase(user.role)} · {user.email}</small></div><StatusBadge value={user.status} /></article>)}</div></section></div>
  </>;
}
