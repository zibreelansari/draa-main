import { ArrowRight, Check, ChevronRight, Compass, GraduationCap, Landmark, ShieldCheck, Sparkles } from "lucide-react";
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

  return (
    <div className="content-page">

      {/* ═══════════ HERO BANNER ═══════════ */}
      <section className="content-hero">
        {page.heroImage && (
          <img
            className="content-hero-bg"
            src={page.heroImage}
            alt=""
            loading="eager"
          />
        )}
        <div className="content-hero-overlay" />

        <div className="portal-shell content-hero-inner" data-reveal>
          {/* Breadcrumb */}
          <nav className="content-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <span>{page.eyebrow}</span>
          </nav>

          {/* Eyebrow */}
          <div className="content-hero-eyebrow">
            <Sparkles size={13} />
            {page.eyebrow}
          </div>

          {/* Title */}
          <h1 className="content-hero-title">{page.title}</h1>

          {/* Intro */}
          <p className="content-hero-intro">{page.intro}</p>
        </div>
      </section>

      {/* ═══════════ AT-A-GLANCE STRIP ═══════════ */}
      <section className="content-glance-strip">
        <div className="portal-shell content-glance-inner" data-reveal>
          <div className="content-glance-card">
            <ShieldCheck size={20} />
            <div>
              <strong>At a Glance</strong>
              <p>{page.summary}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ HIGHLIGHTS COUNTER ═══════════ */}
      {page.highlights && (
        <section className="content-highlights">
          <div className="portal-shell content-highlights-grid">
            {page.highlights.map((item) => (
              <div key={item.label} className="content-highlight-card" data-reveal>
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ ROADMAP STEPS ═══════════ */}
      {page.steps && (
        <section className="content-steps-section">
          <div className="portal-shell">
            <div className="content-section-heading" data-reveal>
              <span className="content-section-eyebrow">YOUR ROADMAP</span>
              <h2>A clear sequence for the next decision.</h2>
            </div>
            <div className="content-steps-grid">
              {page.steps.map((step, i) => (
                <article key={step.number} className="content-step-card" data-reveal style={{ animationDelay: `${i * 80}ms` }}>
                  <div className="content-step-number">{step.number}</div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ MAIN SECTIONS ═══════════ */}
      <section className="content-sections">
        <div className="portal-shell">
          <div className="content-section-heading" data-reveal>
            <span className="content-section-eyebrow">WHAT TO CONSIDER</span>
            <h2>Make the decision with the full picture.</h2>
          </div>
          <div className="content-sections-grid">
            {page.sections.map((section, index) => {
              const Icon = icons[index % icons.length];
              return (
                <article key={section.title} className="content-section-card" data-reveal style={{ animationDelay: `${index * 80}ms` }}>
                  <div className="content-section-card-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                  {section.items && (
                    <ul className="content-section-card-list">
                      {section.items.map((item) => (
                        <li key={item}>
                          <Check size={14} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ PROGRAMMES ═══════════ */}
      {page.programmes && (
        <section className="content-programmes-section">
          <div className="portal-shell">
            <div className="content-section-heading" data-reveal>
              <span className="content-section-eyebrow">EXPLORE THE LANDSCAPE</span>
              <h2>Programmes, pathways and places.</h2>
            </div>
            <div className="content-programmes-grid">
              {page.programmes.map((programme, i) => (
                <article key={programme.title} className="content-programme-card" data-reveal style={{ animationDelay: `${i * 80}ms` }}>
                  <span className="content-programme-tag">{programme.tag}</span>
                  <h3>{programme.title}</h3>
                  <p>{programme.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ NOTE ═══════════ */}
      {page.note && (
        <div className="portal-shell content-note" data-reveal>
          <ShieldCheck size={22} />
          <p>{page.note}</p>
        </div>
      )}

      {/* ═══════════ BOTTOM CTA ═══════════ */}
      <section className="content-bottom-cta" data-reveal>
        <div className="portal-shell content-bottom-cta-inner">
          <div>
            <span className="content-section-eyebrow">NEXT STEP</span>
            <h2>Continue your DRAA study journey.</h2>
          </div>
          {internalCta
            ? <Link to={ctaHref} className="content-cta-button">{page.ctaLabel || "Create a student account"} <ArrowRight size={16} /></Link>
            : <a href={ctaHref} className="content-cta-button">{page.ctaLabel || "Contact DRAA"} <ArrowRight size={16} /></a>}
        </div>
      </section>
    </div>
  );
}
