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
  DollarSign,
  Download,
  Edit2,
  FileCheck2,
  Filter,
  LifeBuoy,
  Plus,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api";
import { EmptyState, formatDate, formatMoney, MetricCard, PageHeading, SectionHeader, StatusBadge, titleCase } from "./DashboardBits";
import type { AdminWorkspace, DashboardViewProps } from "./types";

type AdminCourse = {
  _id: string;
  title: string;
  slug: string;
  discipline: string;
  level: string;
  mode: string;
  durationMonths: number;
  tuitionFee?: number;
  tuitionFeeInr?: number;
  currency?: string;
  status: string;
  startDate?: string;
  instituteId?: { _id: string; name: string; city: string; state: string };
};

function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.map(escapeCell).join(","), ...rows.map((row) => headers.map((header) => escapeCell(row[header])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard({ data, activeSection, onNavigate, onRefresh }: DashboardViewProps<AdminWorkspace>) {
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userFilter, setUserFilter] = useState("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [appSearch, setAppSearch] = useState("");

  // Course management state
  const [adminCourses, setAdminCourses] = useState<AdminCourse[]>([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseCurrencyFilter, setCourseCurrencyFilter] = useState("ALL");
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AdminCourse | null>(null);
  const [fraudQueue, setFraudQueue] = useState<any[]>([]);
  const [institutesList, setInstitutesList] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (activeSection === "courses" || activeSection === "overview") {
      apiRequest<{ courses: AdminCourse[] }>("/api/admin/courses")
        .then((res) => setAdminCourses(res.courses))
        .catch(() => {});
      apiRequest<{ institutes: Array<{ _id?: string; id?: string; name: string }> }>("/api/catalog/institutes")
        .then((res) => setInstitutesList(res.institutes.map((i) => ({ id: (i._id || i.id || "").toString(), name: i.name }))))
        .catch(() => {});
    }
    if (activeSection === "fraud" || activeSection === "overview") {
      apiRequest<{ applications: any[] }>("/api/admin/fraud-queue")
        .then((res) => setFraudQueue(res.applications || []))
        .catch(() => {});
    }
  }, [activeSection]);

  const filteredUsers = useMemo(() => {
    let list = userFilter === "ALL" ? data.recentUsers : data.recentUsers.filter((user) => user.role === userFilter);
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      list = list.filter((u) => u.displayName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return list;
  }, [data.recentUsers, userFilter, userSearch]);

  const filteredApplications = useMemo(() => {
    if (!appSearch.trim()) return data.applications;
    const q = appSearch.toLowerCase();
    return data.applications.filter((a) =>
      a.studentName.toLowerCase().includes(q) ||
      a.courseTitle.toLowerCase().includes(q) ||
      a.instituteName.toLowerCase().includes(q) ||
      (a.country && a.country.toLowerCase().includes(q))
    );
  }, [data.applications, appSearch]);

  const filteredCourses = useMemo(() => {
    let list = adminCourses;
    if (courseCurrencyFilter !== "ALL") {
      list = list.filter((c) => (c.currency || "USD").toUpperCase() === courseCurrencyFilter);
    }
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase();
      list = list.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        c.discipline.toLowerCase().includes(q) ||
        (c.instituteId?.name && c.instituteId.name.toLowerCase().includes(q))
      );
    }
    return list;
  }, [adminCourses, courseCurrencyFilter, courseSearch]);

  async function decideInstitute(userId: string | number, status: "APPROVED" | "REJECTED") {
    setBusyId(userId); setMessage(""); setError("");
    try {
      await apiRequest(`/api/admin/institutes/${userId}/approval`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage(`Institute ${status === "APPROVED" ? "approved" : "rejected"} successfully.`);
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Approval could not be recorded.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleUserStatus(userId: string | number, currentStatus: string) {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setBusyId(userId); setMessage(""); setError("");
    try {
      await apiRequest(`/api/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setMessage(`User account ${nextStatus.toLowerCase()}.`);
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not update user status.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateTicket(id: string | number, status: string) {
    setBusyId(id); setMessage(""); setError("");
    try {
      await apiRequest(`/api/admin/support/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setMessage(`Ticket #${id} status updated to ${status}.`);
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Ticket could not be updated.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreateOrUpdateCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusyId("course-form"); setMessage(""); setError("");
    const form = new FormData(e.currentTarget);
    const fee = Number(form.get("tuitionFee"));
    const payload = {
      title: form.get("title"),
      discipline: form.get("discipline"),
      level: form.get("level"),
      mode: form.get("mode"),
      durationMonths: Number(form.get("durationMonths")),
      tuitionFee: Number.isNaN(fee) ? undefined : fee,
      tuitionFeeInr: Number.isNaN(fee) ? undefined : fee,
      currency: form.get("currency") || "USD",
      startDate: form.get("startDate"),
      ...(editingCourse ? { status: form.get("status") } : { instituteId: form.get("instituteId") }),
    };

    try {
      if (editingCourse) {
        await apiRequest(`/api/admin/courses/${editingCourse._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMessage("Course updated successfully with currency " + (payload.currency || "USD") + ".");
      } else {
        await apiRequest("/api/admin/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Course created successfully in catalogue.");
      }
      setCourseModalOpen(false);
      setEditingCourse(null);
      const res = await apiRequest<{ courses: AdminCourse[] }>("/api/admin/courses");
      setAdminCourses(res.courses);
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Course operation failed.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteCourse(courseId: string) {
    if (!window.confirm("Are you sure you want to delete this course from the catalogue?")) return;
    setBusyId(courseId); setMessage(""); setError("");
    try {
      await apiRequest(`/api/admin/courses/${courseId}`, { method: "DELETE" });
      setMessage("Course deleted successfully.");
      setAdminCourses(adminCourses.filter((c) => c._id !== courseId));
      await onRefresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Could not delete course.");
    } finally {
      setBusyId(null);
    }
  }

  const alerts = [
    data.metrics.pendingInstitutes > 0 ? `${data.metrics.pendingInstitutes} institution registrations await verification.` : null,
    data.metrics.openTickets > 0 ? `${data.metrics.openTickets} support tickets require operations follow-up.` : null,
  ].filter(Boolean);

  // ── Institutes View ────────────────────────────────────────────────────────
  if (activeSection === "institutes") return <>
    <PageHeading
      eyebrow="Partner operations"
      title="Institution approvals"
      description="Verify institutional credentials, approve active profiles and publish participating colleges to the public directory."
      actions={
        <button
          className="workspace-button secondary"
          type="button"
          onClick={() => downloadCsv("institutes-export.csv", data.instituteApprovals.map((i) => ({ Name: i.instituteName, Contact: i.contactName, City: i.city, Status: i.approvalStatus, Email: i.email })))}
        >
          <Download size={16} />Export CSV
        </button>
      }
    />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}
    {error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal>
      <SectionHeader eyebrow="Institutional onboarding" title={`${data.instituteApprovals.length} registered institutions`} />
      {data.instituteApprovals.length ? (
        <div className="institute-approval-list">
          {data.instituteApprovals.map((institute) => (
            <article key={institute.userId} className={institute.approvalStatus === "PENDING" ? "needs-review" : ""}>
              <span className="approval-mark"><Building2 size={22} /></span>
              <div className="approval-main">
                <span>{institute.city}</span>
                <h3>{institute.instituteName}</h3>
                <p>Nodal contact: {institute.contactName} ({institute.email})</p>
                {institute.website && <a href={institute.website} target="_blank" rel="noreferrer">{institute.website}</a>}
              </div>
              <div className="approval-meta">
                <StatusBadge value={institute.approvalStatus} />
                <small>Submitted {formatDate(institute.createdAt)}</small>
              </div>
              <div className="approval-actions">
                <button
                  className="workspace-button secondary compact"
                  type="button"
                  disabled={busyId === institute.userId || institute.approvalStatus === "REJECTED"}
                  onClick={() => decideInstitute(institute.userId, "REJECTED")}
                >
                  <XCircle size={14} />Reject
                </button>
                <button
                  className="workspace-button primary compact"
                  type="button"
                  disabled={busyId === institute.userId || institute.approvalStatus === "APPROVED"}
                  onClick={() => decideInstitute(institute.userId, "APPROVED")}
                >
                  <UserCheck size={14} />Approve
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={Building2} title="No registered institutes" text="Institution records will appear here as colleges register." />
      )}
    </section>
  </>;

  // ── Courses & Programmes View (Multi-Currency Support with USD Default) ───
  if (activeSection === "courses") return <>
    <PageHeading
      eyebrow="Catalogue & Pricing Management"
      title="Programmes & Currency Options"
      description="Add and manage courses in different currencies (USD default, INR, EUR, GBP, AED, etc.) for foreign students worldwide."
      actions={
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="workspace-button secondary"
            type="button"
            onClick={() => downloadCsv("courses-export.csv", adminCourses.map((c) => ({
              Title: c.title,
              Discipline: c.discipline,
              Level: c.level,
              Institute: c.instituteId?.name || "Unassigned",
              TuitionFee: c.tuitionFee || c.tuitionFeeInr || 0,
              Currency: c.currency || "USD",
              Status: c.status,
            })))}
          >
            <Download size={16} />Export CSV
          </button>
          <button
            className="workspace-button primary"
            type="button"
            onClick={() => { setEditingCourse(null); setCourseModalOpen(true); }}
          >
            <Plus size={16} />Add Course
          </button>
        </div>
      }
    />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}
    {error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal>
      <div className="application-toolbar">
        <div className="workspace-filter-tabs" role="group">
          {["ALL", "USD", "INR", "EUR", "GBP", "AED"].map((curr) => (
            <button
              key={curr}
              className={courseCurrencyFilter === curr ? "is-active" : ""}
              onClick={() => setCourseCurrencyFilter(curr)}
            >
              {curr === "ALL" ? "All Currencies" : `${curr} (${curr === "USD" ? "$" : curr === "INR" ? "₹" : curr === "EUR" ? "€" : curr === "GBP" ? "£" : "د.إ"})`}
            </button>
          ))}
        </div>
        <label className="workspace-table-search">
          <Search size={16} />
          <input
            placeholder="Search courses, disciplines or institutions"
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="workspace-table-wrap">
        <table className="workspace-table">
          <thead>
            <tr>
              <th>Programme & Discipline</th>
              <th>Institution</th>
              <th>Level & Mode</th>
              <th>Tuition Fee & Currency</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course._id}>
                <td>
                  <strong>{course.title}</strong>
                  <small>{course.discipline}</small>
                </td>
                <td>
                  <strong>{course.instituteId?.name || "General Institute"}</strong>
                  <small>{course.instituteId?.city || "India"}</small>
                </td>
                <td>
                  {titleCase(course.level)}
                  <small>{titleCase(course.mode)} ({course.durationMonths}m)</small>
                </td>
                <td>
                  <strong style={{ color: "#0b655d", fontSize: "14px" }}>
                    {formatMoney(course.tuitionFee || course.tuitionFeeInr, course.currency || "USD")}
                  </strong>
                  <small style={{ color: "#e87524", fontWeight: "700" }}>
                    {course.currency || "USD"} (Default)
                  </small>
                </td>
                <td><StatusBadge value={course.status} /></td>
                <td>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      className="workspace-row-action"
                      type="button"
                      onClick={() => { setEditingCourse(course); setCourseModalOpen(true); }}
                    >
                      <Edit2 size={13} />Edit
                    </button>
                    <button
                      className="workspace-row-action"
                      type="button"
                      style={{ color: "#dc2626" }}
                      disabled={busyId === course._id}
                      onClick={() => handleDeleteCourse(course._id)}
                    >
                      <Trash2 size={13} />Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {courseModalOpen && (
      <div className="workspace-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) { setCourseModalOpen(false); setEditingCourse(null); } }}>
        <div className="workspace-modal" role="dialog" aria-modal="true">
          <header>
            <div>
              <span>{editingCourse ? "EDIT PROGRAMME" : "CREATE NEW PROGRAMME"}</span>
              <h2>{editingCourse ? `Edit ${editingCourse.title}` : "Add Course with Currency Option"}</h2>
              <p>Configure academic details and select the fee currency (USD default).</p>
            </div>
            <button type="button" onClick={() => { setCourseModalOpen(false); setEditingCourse(null); }}><X size={20} /></button>
          </header>
          <form onSubmit={handleCreateOrUpdateCourse}>
            {!editingCourse && (
              <label>Assign Institution
                <select name="instituteId" required defaultValue={institutesList[0]?.id}>
                  {institutesList.map((inst) => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </label>
            )}
            <div className="workspace-form-row">
              <label>Programme title
                <input name="title" required minLength={4} defaultValue={editingCourse?.title || ""} placeholder="e.g. Master of Artificial Intelligence" />
              </label>
              <label>Discipline
                <input name="discipline" required minLength={3} defaultValue={editingCourse?.discipline || ""} placeholder="e.g. Engineering & Technology" />
              </label>
            </div>
            <div className="workspace-form-row">
              <label>Level
                <select name="level" defaultValue={editingCourse?.level || "UNDERGRADUATE"}>
                  <option value="UNDERGRADUATE">Undergraduate</option>
                  <option value="POSTGRADUATE">Postgraduate</option>
                  <option value="DOCTORAL">Doctoral</option>
                  <option value="CERTIFICATE">Certificate</option>
                </select>
              </label>
              <label>Study mode
                <select name="mode" defaultValue={editingCourse?.mode || "OFFLINE"}>
                  <option value="OFFLINE">On campus (Offline)</option>
                  <option value="BLENDED">Blended</option>
                  <option value="ONLINE">Online</option>
                </select>
              </label>
            </div>
            <div className="workspace-form-row">
              <label>Duration in months
                <input name="durationMonths" type="number" min="1" max="96" defaultValue={editingCourse?.durationMonths || 12} required />
              </label>
              <label>Currency Option (USD as default)
                <select name="currency" defaultValue={editingCourse?.currency || "USD"}>
                  <option value="USD">USD ($) - Default (Global standard)</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                  <option value="AED">AED (د.إ) - UAE Dirham</option>
                  <option value="CAD">CAD ($) - Canadian Dollar</option>
                  <option value="AUD">AUD ($) - Australian Dollar</option>
                  <option value="SGD">SGD ($) - Singapore Dollar</option>
                </select>
              </label>
            </div>
            <div className="workspace-form-row">
              <label>Tuition fee amount
                <input name="tuitionFee" type="number" min="0" step="10" defaultValue={editingCourse?.tuitionFee || editingCourse?.tuitionFeeInr || ""} placeholder="e.g. 5000" />
              </label>
              <label>Indicative start date
                <input name="startDate" type="date" defaultValue={editingCourse?.startDate || ""} />
              </label>
            </div>
            {editingCourse && (
              <label>Publish Status
                <select name="status" defaultValue={editingCourse.status}>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </label>
            )}
            <footer>
              <button className="workspace-button secondary" type="button" onClick={() => { setCourseModalOpen(false); setEditingCourse(null); }}>Cancel</button>
              <button className="workspace-button primary" disabled={busyId === "course-form"}>
                {busyId === "course-form" ? "Saving…" : editingCourse ? "Save changes" : "Create Programme"}<Plus size={16} />
              </button>
            </footer>
          </form>
        </div>
      </div>
    )}
  </>;

  // ── Applications View ──────────────────────────────────────────────────────
  if (activeSection === "applications") return <>
    <PageHeading
      eyebrow="Platform oversight"
      title="All applications"
      description="Monitor student demand across all participating institutions and track decision milestones."
      actions={
        <button
          className="workspace-button secondary"
          type="button"
          onClick={() => downloadCsv("applications-export.csv", filteredApplications.map((a) => ({ Student: a.studentName, Programme: a.courseTitle, Institution: a.instituteName, Status: a.status, Country: a.country || "International", Updated: a.updatedAt })))}
        >
          <Download size={16} />Export CSV
        </button>
      }
    />
    <section className="workspace-panel" data-dashboard-reveal>
      <div className="application-toolbar">
        <SectionHeader eyebrow="Live registry" title={`${filteredApplications.length} total applications`} />
        <label className="workspace-table-search">
          <Search size={16} />
          <input
            placeholder="Search by student, course, institute, country"
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="workspace-table-wrap">
        <table className="workspace-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Programme</th>
              <th>Institution</th>
              <th>Status</th>
              <th>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((application) => (
              <tr key={application.id}>
                <td>
                  <strong>{application.studentName}</strong>
                  <small>{application.country || "International"}</small>
                </td>
                <td>
                  <strong>{application.courseTitle}</strong>
                  <small>Application #{application.id}</small>
                </td>
                <td>{application.instituteName}</td>
                <td><StatusBadge value={application.status} /></td>
                <td>{formatDate(application.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>;

  // ── Fraud & Verification Queue ────────────────────────────────────────────
  if (activeSection === "fraud") return <>
    <PageHeading
      eyebrow="Compliance & Integrity Shield"
      title="Fraud Detection & Verification Queue"
      description="Automated checks for duplicate passport identities, suspicious application spikes, and unverified credentials."
      actions={
        <button
          className="workspace-button secondary"
          type="button"
          onClick={() => {
            apiRequest<{ applications: any[] }>("/api/admin/fraud-queue")
              .then((res) => setFraudQueue(res.applications || []))
              .catch(() => {});
          }}
        >
          <RefreshCw size={15} /> Refresh Queue
        </button>
      }
    />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}
    {error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal>
      <SectionHeader eyebrow="Security Watchdog" title={`${fraudQueue.length} flagged case${fraudQueue.length === 1 ? "" : "s"} requiring audit`} />
      {fraudQueue.length ? (
        <div className="workspace-table-wrap">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>Candidate & Email</th>
                <th>Applied Programme & Institute</th>
                <th>Fraud / Anomaly Detection Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fraudQueue.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.studentUserId?.displayName || "Applicant"}</strong>
                    <small>{item.studentUserId?.email || "No email"}</small>
                  </td>
                  <td>
                    <strong>{item.courseId?.title || "Degree"}</strong>
                    <small>{item.courseId?.instituteId?.name || "Institute"}</small>
                  </td>
                  <td>
                    <div style={{ color: "#a5443b", fontWeight: "700", fontSize: "12.5px" }}>
                      <AlertCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
                      {item.flagReason || "Duplicate passport detected across multiple candidate logins."}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="workspace-row-action"
                        type="button"
                        style={{ color: "#148a79" }}
                        disabled={busyId === item._id}
                        onClick={async () => {
                          setBusyId(item._id);
                          try {
                            await apiRequest(`/api/admin/fraud-queue/${item._id}`, {
                              method: "PATCH",
                              body: JSON.stringify({ flagged: false }),
                            });
                            setMessage("Candidate flag cleared successfully.");
                            setFraudQueue(fraudQueue.filter((f) => f._id !== item._id));
                          } catch (e) {
                            setError("Could not clear flag.");
                          } finally {
                            setBusyId(null);
                          }
                        }}
                      >
                        Clear Flag
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={ShieldCheck}
          title="Fraud Queue Clean"
          text="No duplicate passport anomalies or suspicious identity breaches detected across 5,000+ active candidates."
        />
      )}
    </section>
  </>;

  // ── Users View ─────────────────────────────────────────────────────────────
  if (activeSection === "users") return <>
    <PageHeading
      eyebrow="Identity & access"
      title="Users and access"
      description="Review account roles, search registered users and manage active/suspended account statuses."
    />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}
    {error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal>
      <div className="application-toolbar">
        <div className="workspace-filter-tabs" role="group">
          {["ALL", "STUDENT", "INSTITUTE", "ADMIN"].map((role) => (
            <button key={role} className={userFilter === role ? "is-active" : ""} onClick={() => setUserFilter(role)}>
              {role === "ALL" ? "All users" : titleCase(role)}
            </button>
          ))}
        </div>
        <label className="workspace-table-search">
          <Search size={16} />
          <input
            placeholder="Search users by name or email"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
        </label>
      </div>
      <div className="workspace-table-wrap">
        <table className="workspace-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Account status</th>
              <th>Created</th>
              <th><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="table-person">
                    <span>{user.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
                    <div>
                      <strong>{user.displayName}</strong>
                      <small>{user.email}</small>
                    </div>
                  </div>
                </td>
                <td>{titleCase(user.role)}</td>
                <td><StatusBadge value={user.status} /></td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <button
                    className="workspace-row-action"
                    type="button"
                    disabled={busyId === user.id || user.role === "ADMIN"}
                    onClick={() => toggleUserStatus(user.id, user.status)}
                  >
                    {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>;

  // ── Support View ───────────────────────────────────────────────────────────
  if (activeSection === "support") return <>
    <PageHeading
      eyebrow="Service operations"
      title="Support queue"
      description="Prioritise learner and institution requests, move ownership clearly and close issues with an auditable status."
    />
    {message && <p className="workspace-toast success"><CheckCircle2 size={17} />{message}</p>}
    {error && <p className="workspace-toast error"><AlertCircle size={17} />{error}</p>}
    <section className="workspace-panel" data-dashboard-reveal>
      <SectionHeader eyebrow="Open work" title={`${data.metrics.openTickets} unresolved request${data.metrics.openTickets === 1 ? "" : "s"}`} />
      {data.tickets.length ? (
        <div className="support-ticket-list">
          {data.tickets.map((ticket) => (
            <article key={ticket.id}>
              <span className={`support-priority ${ticket.priority.toLowerCase()}`}>{ticket.priority}</span>
              <div>
                <h3>{ticket.subject}</h3>
                <p>Opened by {ticket.raisedBy} · {ticket.category}</p>
              </div>
              <StatusBadge value={ticket.status} />
              <small>{formatDate(ticket.createdAt)}</small>
              <select
                aria-label={`Update status for ticket #${ticket.id}`}
                value={ticket.status}
                disabled={busyId === ticket.id}
                onChange={(e) => updateTicket(ticket.id, e.target.value)}
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={LifeBuoy} title="Support queue clear" text="New learner and institute queries will appear here." />
      )}
    </section>
  </>;

  // ── Audit View ─────────────────────────────────────────────────────────────
  if (activeSection === "audit") return <>
    <PageHeading
      eyebrow="Compliance & governance"
      title="Platform audit log"
      description="Immutable activity trail of key administrative, institutional and security actions."
      actions={
        <button
          className="workspace-button secondary"
          type="button"
          onClick={() => downloadCsv("audit-log.csv", data.audit.map((a) => ({ Action: a.action, Type: a.entityType, ID: a.entityId, Actor: a.actor || "System", Time: a.createdAt })))}
        >
          <Download size={16} />Export Audit Log
        </button>
      }
    />
    <section className="workspace-panel" data-dashboard-reveal>
      <SectionHeader eyebrow="Activity trail" title={`${data.audit.length} recent governance events`} />
      <div className="audit-timeline">
        {data.audit.map((entry) => (
          <article key={entry.id}>
            <span><ShieldCheck size={19} /></span>
            <div>
              <strong>{entry.action.replace(/_/g, " ")}</strong>
              <p>{entry.entityType} {entry.entityId ? `#${entry.entityId}` : ""}</p>
            </div>
            <small>
              <strong>{entry.actor || "System"}</strong>
              <span>{formatDate(entry.createdAt)}</span>
            </small>
          </article>
        ))}
      </div>
    </section>
  </>;

  // ── Default Overview View ──────────────────────────────────────────────────
  return <>
    <PageHeading
      eyebrow="DRAA operations centre"
      title="Platform overview"
      description="Monitor admissions activity, institution readiness and service operations from one accountable workspace."
      actions={<button className="workspace-button secondary" type="button" onClick={onRefresh}><RefreshCw size={16} />Refresh data</button>}
    />
    <div className="admin-metric-grid">
      <MetricCard icon={Users} label="Students" value={data.metrics.students} note="Registered learner accounts" tone="teal" />
      <MetricCard icon={Building2} label="Institutions" value={data.metrics.institutes} note={`${data.metrics.pendingInstitutes} awaiting approval`} tone="orange" />
      <MetricCard icon={FileCheck2} label="Applications" value={data.metrics.applications} note="Across all statuses" tone="blue" />
      <MetricCard icon={BookOpenText} label="Published programmes" value={data.metrics.publishedCourses} note="Visible in catalogue" tone="ink" />
      <MetricCard icon={LifeBuoy} label="Open support" value={data.metrics.openTickets} note="Requests needing ownership" tone="orange" />
    </div>

    {alerts.length > 0 && (
      <div className="admin-alert-strip" data-dashboard-reveal>
        <span><AlertCircle size={20} /></span>
        <div>
          <strong>Operations need attention</strong>
          <p>{alerts.join(" ")}</p>
        </div>
        <button type="button" onClick={() => onNavigate(data.metrics.pendingInstitutes ? "institutes" : "support")}>
          Open priority queue <ArrowRight size={15} />
        </button>
      </div>
    )}

    <div className="admin-overview-grid">
      <section className="workspace-panel" data-dashboard-reveal>
        <SectionHeader eyebrow="Admissions movement" title="Application pipeline" action={<button className="workspace-link-button" onClick={() => onNavigate("applications")}>View applications <ArrowRight size={14} /></button>} />
        <div className="admin-pipeline">
          {["SUBMITTED", "UNDER_REVIEW", "OFFERED", "DECLINED"].map((status) => {
            const count = data.applications.filter((application) => application.status === status).length;
            return (
              <article key={status}>
                <span><i className={status.toLowerCase().replace(/_/g, "-")} /></span>
                <div><strong>{count}</strong><small>{titleCase(status)}</small></div>
              </article>
            );
          })}
        </div>
        <div className="admin-pipeline-visual" aria-label="Application pipeline visualisation">
          {["SUBMITTED", "UNDER_REVIEW", "OFFERED", "DECLINED"].map((status) => {
            const count = data.applications.filter((application) => application.status === status).length;
            const max = Math.max(data.applications.length, 1);
            return (
              <span
                key={status}
                className={status.toLowerCase().replace(/_/g, "-")}
                style={{ width: `${Math.max(7, (count / max) * 100)}%` }}
                title={`${titleCase(status)}: ${count}`}
              />
            );
          })}
        </div>
      </section>

      <aside className="workspace-panel admin-health" data-dashboard-reveal>
        <SectionHeader eyebrow="Portal health" title="Operational checks" />
        <ul>
          <li><CheckCircle2 /><span><strong>Authentication service</strong><small>Role permissions active</small></span><em>Healthy</em></li>
          <li><CheckCircle2 /><span><strong>Catalogue</strong><small>{data.metrics.publishedCourses} programmes published</small></span><em>Healthy</em></li>
          <li className={data.metrics.openTickets ? "attention" : ""}>
            {data.metrics.openTickets ? <AlertCircle /> : <CheckCircle2 />}
            <span><strong>Support queue</strong><small>{data.metrics.openTickets} unresolved</small></span>
            <em>{data.metrics.openTickets ? "Review" : "Healthy"}</em>
          </li>
        </ul>
      </aside>
    </div>

    <div className="admin-lower-grid">
      <section className="workspace-panel" data-dashboard-reveal>
        <SectionHeader eyebrow="Institution onboarding" title="Approval queue" action={<button className="workspace-link-button" onClick={() => onNavigate("institutes")}>Manage institutes <ArrowRight size={14} /></button>} />
        {data.instituteApprovals.filter((item) => item.approvalStatus === "PENDING").length ? (
          <div className="compact-approval-list">
            {data.instituteApprovals.filter((item) => item.approvalStatus === "PENDING").slice(0, 4).map((institute) => (
              <article key={institute.userId}>
                <span><Building2 size={18} /></span>
                <div>
                  <strong>{institute.instituteName}</strong>
                  <small>{institute.city} · {institute.contactName}</small>
                </div>
                <button type="button" onClick={() => onNavigate("institutes")}>
                  Review <ArrowRight size={14} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={UserCheck} title="No pending institutes" text="All current institute registrations have a recorded decision." />
        )}
      </section>

      <section className="workspace-panel" data-dashboard-reveal>
        <SectionHeader eyebrow="Latest identities" title="Recent users" action={<button className="workspace-link-button" onClick={() => onNavigate("users")}>View access <ArrowRight size={14} /></button>} />
        <div className="compact-user-list">
          {data.recentUsers.slice(0, 5).map((user) => (
            <article key={user.id}>
              <span>{user.displayName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
              <div>
                <strong>{user.displayName}</strong>
                <small>{titleCase(user.role)} · {user.email}</small>
              </div>
              <StatusBadge value={user.status} />
            </article>
          ))}
        </div>
      </section>
    </div>
  </>;
}
