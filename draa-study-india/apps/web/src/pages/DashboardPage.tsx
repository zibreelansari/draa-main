import { ArrowRight, Building2, GraduationCap, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminDashboard from "../dashboard/AdminDashboard";
import DashboardShell from "../dashboard/DashboardShell";
import InstituteDashboard from "../dashboard/InstituteDashboard";
import StudentDashboard from "../dashboard/StudentDashboard";
import type { DashboardWorkspace } from "../dashboard/types";
import { apiRequest } from "../lib/api";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardWorkspace>();
  const [activeSection, setActiveSection] = useState("overview");
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      const workspace = await apiRequest<DashboardWorkspace>("/api/dashboard");
      setData(workspace);
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Dashboard could not be loaded.");
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      const items = Array.from(document.querySelectorAll<HTMLElement>("[data-dashboard-reveal]"));
      items.forEach((item, index) => {
        item.classList.add("dashboard-reveal-ready");
        item.style.setProperty("--dashboard-delay", `${Math.min(index, 5) * 45}ms`);
        requestAnimationFrame(() => item.classList.add("dashboard-revealed"));
      });
    }, 20);
    return () => window.clearTimeout(timer);
  }, [activeSection, data?.role]);

  function navigateSection(section: string) {
    setActiveSection(section);
    document.getElementById("workspace-content")?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (error) return <main className="dashboard-access-state"><div><img src="/media/draa-mark.png" alt="DRAA" /><span>SECURE WORKSPACE</span><h1>Sign in to continue</h1><p>{error}</p><div><Link to="/login/student"><GraduationCap size={18} />Student login</Link><Link to="/login/institute"><Building2 size={18} />Institute login</Link><Link to="/login/admin"><ShieldCheck size={18} />Admin login</Link></div><Link className="dashboard-back-link" to="/">Return to public portal <ArrowRight size={15} /></Link></div></main>;
  if (!data) return <main className="dashboard-loading-state"><img src="/media/draa-mark.png" alt="" /><span>Preparing your workspace</span><i /></main>;

  return <DashboardShell user={data.user} activeSection={activeSection} onNavigate={navigateSection} notifications={data.notifications} onRefresh={loadDashboard}>
    {data.role === "STUDENT" && <StudentDashboard data={data} activeSection={activeSection} onNavigate={navigateSection} onRefresh={loadDashboard} />}
    {data.role === "INSTITUTE" && <InstituteDashboard data={data} activeSection={activeSection} onNavigate={navigateSection} onRefresh={loadDashboard} />}
    {data.role === "ADMIN" && <AdminDashboard data={data} activeSection={activeSection} onNavigate={navigateSection} onRefresh={loadDashboard} />}
  </DashboardShell>;
}
