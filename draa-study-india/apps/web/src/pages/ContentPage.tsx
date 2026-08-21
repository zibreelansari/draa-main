import { ArrowRight, Check, Compass, GraduationCap, Landmark, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { guidancePages } from "../data/guidancePages";
import { useReveal } from "../hooks/useReveal";

const icons = [GraduationCap, Compass, Landmark, ShieldCheck];

export default function ContentPage() {
  useReveal();
  const { pathname } = useLocation();
  const page = guidancePages[pathname] || guidancePages["/about"];
  const ctaHref = page.ctaHref || "/register/student";
  const internalCta = ctaHref.startsWith("/");

  return <>
    <section className="guidance-hero">
      <div className="portal-shell guidance-hero-grid">
        <div data-reveal>
          <span>{page.eyebrow}</span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
        </div>
        <aside data-reveal>
          <strong>At a glance</strong>
          <p>{page.summary}</p>
        </aside>
      </div>
    </section>

    {page.highlights && <section className="guidance-highlights"><div className="portal-shell">
      {page.highlights.map((item) => <div key={item.label} data-reveal><strong>{item.value}</strong><span>{item.label}</span></div>)}
    </div></section>}

    {page.steps && <section className="guidance-section guidance-steps-section"><div className="portal-shell">
      <div className="guidance-heading" data-reveal><span>YOUR ROADMAP</span><h2>A clear sequence for the next decision.</h2></div>
      <div className="guidance-steps">{page.steps.map((step) => <article key={step.number} data-reveal><strong>{step.number}</strong><div><h3>{step.title}</h3><p>{step.body}</p></div></article>)}</div>
    </div></section>}

    <section className="guidance-section"><div className="portal-shell">
      <div className="guidance-heading" data-reveal><span>WHAT TO CONSIDER</span><h2>Make the decision with the full picture.</h2></div>
      <div className="guidance-sections">{page.sections.map((section, index) => {
        const Icon = icons[index % icons.length];
        return <article key={section.title} data-reveal><Icon size={25}/><h2>{section.title}</h2><p>{section.body}</p>{section.items && <ul>{section.items.map((item) => <li key={item}><Check size={14}/>{item}</li>)}</ul>}</article>;
      })}</div>
    </div></section>

    {page.programmes && <section className="guidance-section guidance-programmes"><div className="portal-shell">
      <div className="guidance-heading" data-reveal><span>EXPLORE THE LANDSCAPE</span><h2>Programmes, pathways and places.</h2></div>
      <div className="programme-list">{page.programmes.map((programme) => <article key={programme.title} data-reveal><span>{programme.tag}</span><h3>{programme.title}</h3><p>{programme.body}</p></article>)}</div>
    </div></section>}

    {page.note && <div className="portal-shell guidance-note" data-reveal><ShieldCheck size={22}/><p>{page.note}</p></div>}

    <section className="portal-shell inner-cta guidance-cta" data-reveal>
      <div><span>NEXT STEP</span><h2>Continue your DRAA study journey.</h2></div>
      {internalCta
        ? <Link to={ctaHref}>{page.ctaLabel || "Create a student account"} <ArrowRight size={15}/></Link>
        : <a href={ctaHref}>{page.ctaLabel || "Contact DRAA"} <ArrowRight size={15}/></a>}
    </section>
  </>;
}
