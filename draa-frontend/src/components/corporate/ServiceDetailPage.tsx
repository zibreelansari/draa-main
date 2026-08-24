import { useEffect } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  Laptop2,
  Lightbulb,
  Presentation,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import DraaCorporateHeader from './DraaCorporateHeader';
import SEO from './SEO';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import { services, servicesBySlug, type ServiceIcon } from './serviceData';
import ServiceExperiencePage from './ServiceExperiencePage';
import './ServiceDetailPage.css';

const iconMap: Record<ServiceIcon, typeof BookOpen> = {
  book: BookOpen,
  calendar: CalendarDays,
  check: CheckCircle2,
  clipboard: ClipboardCheck,
  graduation: GraduationCap,
  handshake: Handshake,
  laptop: Laptop2,
  lightbulb: Lightbulb,
  presentation: Presentation,
  search: Search,
  shield: ShieldCheck,
  users: Users,
};

export default function ServiceDetailPage() {
  const { serviceSlug = '' } = useParams();
  const service = servicesBySlug[serviceSlug];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [serviceSlug]);

  if (!service) return <Navigate to="/capabilities" replace />;
  if (service.slug === 'professional-learning' || service.slug === 'education-events' || service.slug === 'academic-advisory') {
    return <ServiceExperiencePage service={service} />;
  }

  const HeroIcon = iconMap[service.icon];
  const relatedServices = services.filter((item) => item.slug !== service.slug).slice(0, 3);
  const contactSubjects: Record<string, string> = {
    'content-publishing': 'Educational Content Development',
    'professional-learning': 'Academic & Professional Training',
    'education-events': 'Educational Events & Conferences',
    'academic-advisory': 'Educational Consultancy',
    'digital-learning': 'Digital Learning Solutions',
  };
  const contactSubject = contactSubjects[service.slug] || service.shortTitle;

  return (
    <div className={`draa-corp service-detail service-detail--${service.slug}`}>
      <SEO
        title={service.title}
        siteName="DRAA"
        description={service.summary}
        keywords={`${service.shortTitle}, DRAA education services, ${service.eyebrow}`}
        ogImage={service.image}
      />
      <DraaCorporateHeader />

      <main>
        <section className="service-hero">
          <div className="service-hero-grid" aria-hidden="true" />
          <div className="draa-corp-shell service-hero-inner">
            <div className="service-hero-copy">
              <div className="service-breadcrumb"><Link to="/capabilities">Capabilities</Link><span>/</span>{service.shortTitle}</div>
              <span className="draa-corp-section-label"><HeroIcon size={15} /> {service.eyebrow}</span>
              <p className="service-number">DRAA SERVICE</p>
              <h1>{service.slug === 'content-publishing' ? <>Rigorous content<span>Real impact</span></> : service.title}</h1>
              <p className="service-hero-summary">{service.summary}</p>
              <div className="service-hero-actions">
                <Link className="service-button service-button-dark" to={`/contact?subject=${encodeURIComponent(contactSubject)}`}>Discuss your requirement <ArrowRight size={17} /></Link>
                <a className="service-button service-button-light" href="#service-deliverables">Explore deliverables</a>
              </div>
            </div>

            <div className="service-hero-visual">
              <figure><img src={service.image} alt={service.imageAlt} /></figure>
              <div className="service-image-caption"><strong>{service.shortTitle}</strong><small>Designed around your outcome</small></div>
            </div>
          </div>
          <div className="draa-corp-shell service-proof-row">
            {service.proof.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}
          </div>
        </section>

        <nav className="service-family-nav" aria-label="DRAA services">
          <div className="draa-corp-shell">
            <strong>Explore services</strong>
            <div>{services.map((item) => {
              const Icon = iconMap[item.icon];
              return <Link className={item.slug === service.slug ? 'active' : ''} key={item.slug} to={`/services/${item.slug}`}><Icon size={15} />{item.shortTitle}</Link>;
            })}</div>
          </div>
        </nav>

        <section className="service-section service-intro-section">
          <div className="draa-corp-shell service-intro-grid">
            <div>
              <span className="draa-corp-section-label">The service</span>
              <h2>A complete solution, not an isolated activity</h2>
            </div>
            <div className="service-intro-copy">
              <p>{service.intro}</p>
              <div className="service-audience-line"><strong>Designed for</strong>{service.audiences.map((audience) => <span key={audience}>{audience}</span>)}</div>
            </div>
          </div>
        </section>

        <section className="service-section service-challenge-section">
          <div className="draa-corp-shell">
            <div className="service-heading">
              <span className="draa-corp-section-label">Where we add value</span>
              <h2>From a common challenge to a connected response</h2>
              <p>Each part of the engagement is designed to remove friction and strengthen the final learning outcome.</p>
            </div>
            <div className="service-outcome-map">
              <div className="service-outcome-center"><span><HeroIcon size={28} /></span><strong>{service.shortTitle}</strong><small>One connected plan</small></div>
              {service.challenges.map((item, index) => {
                const Icon = iconMap[item.icon];
                return <article key={item.title} className={`service-challenge service-challenge-${index + 1}`}><span><Icon size={21} /></span><div><strong>{item.title}</strong><p>{item.description}</p></div></article>;
              })}
            </div>
          </div>
        </section>

        <section id="service-deliverables" className="service-section service-deliverables-section">
          <div className="draa-corp-shell">
            <div className="service-heading service-heading-light">
              <span className="draa-corp-section-label">What we can deliver</span>
              <h2>Support shaped to the scope you need</h2>
              <p>Commission one focused deliverable or combine several into an end-to-end programme.</p>
            </div>
            <div className="service-deliverable-grid">
              {service.deliverables.map((item) => {
                const Icon = iconMap[item.icon];
                return <article key={item.title}><div><Icon size={22} /></div><h3>{item.title}</h3><p>{item.description}</p></article>;
              })}
            </div>
          </div>
        </section>

        <section className="service-section service-process-section">
          <div className="draa-corp-shell">
            <div className="service-heading">
              <span className="draa-corp-section-label">How we work</span>
              <h2>A clear route from requirement to result</h2>
            </div>
            <div className="service-process" aria-label={`${service.shortTitle} delivery process`}>
              {service.process.map((step, index) => <div key={step.title}><strong>{step.title}</strong><p>{step.description}</p>{index < service.process.length - 1 && <i aria-hidden="true"><ArrowRight size={18} /></i>}</div>)}
            </div>
          </div>
        </section>

        <section className="service-section service-results-section">
          <div className="draa-corp-shell service-results-grid">
            <div>
              <span className="draa-corp-section-label">The value created</span>
              <h2>Outcomes your team can see and use</h2>
              <p>Success measures are agreed for the context and scope of each engagement.</p>
            </div>
            <div className="service-results-list">{service.outcomes.map((outcome) => <div key={outcome}><span><Check size={17} /></span><strong>{outcome}</strong></div>)}</div>
          </div>
        </section>

        <section className="service-section service-related-section">
          <div className="draa-corp-shell">
            <div className="service-heading"><span className="draa-corp-section-label">Build a connected solution</span><h2>Often combined with</h2></div>
            <div className="service-related-grid">{relatedServices.map((item) => {
              const Icon = iconMap[item.icon];
              return <Link key={item.slug} to={`/services/${item.slug}`}><span><Icon size={20} /></span><div><small>DRAA SERVICE</small><strong>{item.shortTitle}</strong></div><ArrowRight size={17} /></Link>;
            })}</div>
          </div>
        </section>

        <section className="service-final-cta">
          <div className="draa-corp-shell"><div><span>Start with your requirement</span><h2>Let’s design the right {service.shortTitle.toLowerCase()} solution</h2><p>Share the audience, the challenge and the outcome you want to create.</p></div><Link to={`/contact?subject=${encodeURIComponent(contactSubject)}`}>Start a conversation <ArrowRight size={18} /></Link></div>
        </section>
      </main>

      <footer className="draa-corp-footer corporate-page-footer">
        <div className="draa-corp-shell draa-corp-footer-bottom"><span>© {new Date().getFullYear()} DRAA (OPC) Private Limited</span><span>Education Services &amp; Knowledge Management</span></div>
      </footer>
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
