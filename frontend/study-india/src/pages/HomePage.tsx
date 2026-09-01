import { ArrowRight, BadgeIndianRupee, BookOpen, CheckCircle2, FileCheck2, GraduationCap, Landmark, Plane, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useReveal } from "../hooks/useReveal";
import { useLanguage } from "../context/LanguageContext";

const steps = [
  [Users, "Register and create your DRAA ID", "Create one student profile to organise your education journey."],
  [Search, "Explore courses", "Compare programmes across disciplines and institutions."],
  [FileCheck2, "Submit application", "Apply to selected programmes with your verified information."],
  [CheckCircle2, "Review offer letters", "Compare eligible offers and select the best academic fit."],
  [Plane, "Prepare visa and travel", "Use your offer information to organise official visa steps."],
  [ShieldCheck, "Complete arrival formalities", "Understand onboarding and applicable FRRO responsibilities."],
];

export default function HomePage() {
  useReveal();
  const { t } = useLanguage();

  return (
    <>
      <section className="reference-hero">
        <img src="/media/banner-students-wide.png" alt="International university students collaborating around a laptop" />
        <div className="reference-hero-shade" />
        <div className="portal-shell reference-hero-copy" data-reveal>
          <span>{t("hero.eyebrow", "DRAA STUDY IN INDIA")}</span>
          <h1>
            {t("hero.title", "Namaste, begin your educational journey in India")}
          </h1>
          <p style={{ color: "#d1e4e1", fontSize: "15px", margin: "10px 0 0", maxWidth: "680px", lineHeight: 1.6 }}>
            {t("hero.subtitle", "Access world-ranked universities, transparent tuition in USD, and scholarships up to 100%.")}
          </p>
        </div>
      </section>

      <section className="hero-actions-band">
        <div className="portal-shell">
          <div>
            <Link className="solid-button" to="/courses">
              {t("hero.explore", "Explore Courses")}
            </Link>
            <Link className="outline-button" to="/register/student">
              {t("hero.apply", "Apply Now")}
            </Link>
          </div>
          <div className="catalogue-stats">
            <span>
              <strong>1,200+</strong>
              <small>{t("stats.institutes", "Institutes in India*")}</small>
            </span>
            <span>
              <strong>24,270+</strong>
              <small>{t("stats.courses", "Course opportunities*")}</small>
            </span>
          </div>
          <small>*Public landscape indicators shown for portal demonstration; availability must be verified.</small>
        </div>
      </section>

      <section className="journey-section">
        <div className="portal-shell">
          <div className="reference-heading" data-reveal>
            <span>{t("roadmap.eyebrow", "YOUR ROADMAP")}</span>
            <h2>{t("roadmap.title", "Steps to study in India")}</h2>
          </div>
          <div className="reference-steps">
            {steps.map(([Icon, title, text], index) => {
              const I = Icon as typeof Users;
              return (
                <article key={String(title)} data-reveal>
                  <div>
                    <b>STEP {index + 1}</b>
                    <I size={25} />
                  </div>
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                  {index < steps.length - 1 && <ArrowRight className="step-arrow" size={17} />}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="why-reference">
        <div className="portal-shell">
          <div className="reference-heading light" data-reveal>
            <span>{t("why.eyebrow", "DISCOVER THE DIFFERENCE")}</span>
            <h2>{t("why.title", "Why Study in India?")}</h2>
          </div>
          <div className="why-reference-grid">
            {[
              [GraduationCap, "Quality Education", "Explore respected institutions, varied disciplines and globally relevant learning."],
              [Sparkles, "Rich Cultural Experience", "Experience India’s languages, communities, heritage and contemporary life."],
              [BadgeIndianRupee, "Cost-conscious Choices", "Compare tuition and living costs across institutions and study destinations."],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof GraduationCap;
              return (
                <article key={String(title)} data-reveal>
                  <I size={32} />
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="events-reference">
        <div className="portal-shell">
          <div className="reference-heading" data-reveal>
            <span>{t("events.eyebrow", "EVENTS & WEBINARS")}</span>
            <h2>{t("events.title", "Step into your academic future.")}</h2>
            <p>Meet institutions, learn about programmes and prepare questions for your international education journey.</p>
          </div>
          <article data-reveal>
            <div>
              <Landmark size={30} />
              <span>
                <strong>Events coming soon</strong>
                <small>DRAA education fairs and student guidance webinars will be published here.</small>
              </span>
            </div>
            <Link to="/register/student">
              {t("events.cta", "Register interest")} <ArrowRight size={15} />
            </Link>
          </article>
        </div>
      </section>

      <Link className="floating-apply" to="/register/student">
        <Plane size={17} /> {t("hero.apply", "Apply Now")}
      </Link>
    </>
  );
}
