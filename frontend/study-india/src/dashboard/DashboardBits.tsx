import { ArrowUpRight, LucideIcon } from "lucide-react";
import { ReactNode } from "react";

export function formatDate(value?: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "To be confirmed";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "To be confirmed" : date.toLocaleDateString("en-IN", options);
}

export function formatMoney(value?: number, currency: string = "USD") {
  if (value === undefined || value === null) return "Confirm fee";
  const curr = (currency || "USD").toUpperCase();
  try {
    const locale = curr === "INR" ? "en-IN" : "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency: curr, maximumFractionDigits: 0 }).format(value);
  } catch {
    return `${curr} ${value.toLocaleString()}`;
  }
}

export function titleCase(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter: string) => letter.toUpperCase());
}

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase().replace(/_/g, "-");
  return <span className={`workspace-status workspace-status-${normalized}`}><i />{titleCase(value)}</span>;
}

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <header className="workspace-page-heading" data-dashboard-reveal><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{actions && <div className="workspace-page-actions">{actions}</div>}</header>;
}

export function MetricCard({ icon: Icon, label, value, note, tone = "teal" }: { icon: LucideIcon; label: string; value: string | number; note: string; tone?: "teal" | "orange" | "blue" | "ink" }) {
  return <article className={`workspace-metric workspace-metric-${tone}`} data-dashboard-reveal><div><Icon size={19} /></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <header className="workspace-section-header"><div>{eyebrow && <span>{eyebrow}</span>}<h2>{title}</h2></div>{action}</header>;
}

export function EmptyState({ icon: Icon, title, text, action }: { icon: LucideIcon; title: string; text: string; action?: ReactNode }) {
  return <div className="workspace-empty"><span><Icon size={24} /></span><h3>{title}</h3><p>{text}</p>{action}</div>;
}

export function TextLink({ children }: { children: ReactNode }) {
  return <span className="workspace-text-link">{children}<ArrowUpRight size={15} /></span>;
}
