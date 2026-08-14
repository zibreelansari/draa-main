import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  Landmark,
  Laptop2,
  Lightbulb,
  Presentation,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import DraaCorporateHeader from './DraaCorporateHeader';
import SEO from './SEO';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import type { CorporatePageData } from './types';
import { corporatePages } from './corporatePages';
import './CorporateContentPage.css';

const icons: Record<string, typeof Sparkles> = {
  book: BookOpen,
  briefcase: BriefcaseBusiness,
  building: Building2,
  calendar: CalendarDays,
  check: CheckCircle2,
  clipboard: ClipboardCheck,
  graduation: GraduationCap,
  handshake: Handshake,
  landmark: Landmark,
  laptop: Laptop2,
  lightbulb: Lightbulb,
  presentation: Presentation,
  search: Search,
  shield: ShieldCheck,
  sparkles: Sparkles,
  users: Users,
};

const pageImages: Record<string, string> = {
  'about-draa': '/brand/corporate/education-workshop.png',
  capabilities: '/brand/corporate/education-workshop.png',
  events: '/brand/corporate/learning-event.png',
  'learning-programs': '/brand/corporate/education-workshop.png',
  'learning-events': '/brand/corporate/learning-event.png',
  resources: '/brand/corporate/content-studio.png',
  'who-we-support': '/brand/corporate/institutional-partners-v2.png',
};

const pageImageAlt: Record<string, string> = {
  'about-draa': 'Education professionals collaborating in a DRAA workshop setting',
  capabilities: 'Education specialists planning a learning programme together',
  events: 'A professionally produced education event for participants and speakers',
  'learning-programs': 'Learners participating in an expert-led development programme',
  'learning-events': 'Professional participants attending an education workshop',
  resources: 'Education specialists creating useful learning resources',
  'who-we-support': 'Institutional leaders and educators working together',
};

const heroAccents: Record<string, string> = {
  'about-draa': 'We exist to empower education and enrich futures.',
  capabilities: 'Outcomes that matter.',
  events: 'Impact tomorrow.',
  'learning-programs': 'for every ambition.',
  resources: 'drive impact.',
  'who-we-support': 'education ecosystem.',
};

function HeroTitle({ slug, title }: { slug: string; title: string }) {
  const accent = heroAccents[slug];
  if (!accent || !title.includes(accent)) return <>{title}</>;
  const lead = title.replace(accent, '').trim();
  return <>{lead}<span>{accent}</span></>;
}

const capabilityServiceLinks: Record<string, string> = {
  'Content & Publishing': '/services/content-publishing',
  'Professional Learning': '/services/professional-learning',
  'Education Events': '/services/education-events',
  'Academic Advisory': '/services/academic-advisory',
  'Digital Learning': '/services/digital-learning',
};

interface CorporateContentPageProps {
  slug: string;
}

export default function CorporateContentPage({ slug }: CorporateContentPageProps) {
  const page: CorporatePageData | undefined = corporatePages[slug];

  return (
    <div className={`draa-corp corporate-content-page corporate-content-page--${slug}`}>
      <SEO
        title={page?.seo?.title || page?.navigationLabel || 'DRAA'}
        siteName="DRAA"
        description={page?.seo?.description || page?.summary || 'DRAA Education Services & Knowledge Management'}
        ogImage="/brand/draa-mark.png"
      />
      <DraaCorporateHeader />

      <main>
        {!page && (
          <section className="corporate-page-error">
            <div className="draa-corp-shell">
              <span>Page unavailable</span>
              <h1>We could not load this content.</h1>
              <p>The requested DRAA page does not exist.</p>
              <a href="/">Return to the homepage <ArrowRight size={17} /></a>
            </div>
          </section>
        )}

        {page && (
          <>
            <section className="corporate-page-hero">
              <div className="corporate-page-grid" aria-hidden="true" />
              <div className="draa-corp-shell corporate-page-hero-inner">
                <div>
                  <span className="draa-corp-section-label">{page.eyebrow || page.navigationLabel}</span>
                  <h1><HeroTitle slug={slug} title={page.title} /></h1>
                  <p>{page.summary}</p>
                </div>
                {pageImages[slug] ? (
                  <figure className={`corporate-page-hero-photo corporate-page-hero-photo--${slug}`}>
                    <img src={pageImages[slug]} alt={pageImageAlt[slug]} />
                    <figcaption><span>DRAA</span><strong>{page.navigationLabel}</strong></figcaption>
                  </figure>
                ) : (
                  <div className="corporate-page-hero-mark" aria-hidden="true">
                    <span className="corporate-page-ring corporate-page-ring-one" />
                    <span className="corporate-page-ring corporate-page-ring-two" />
                    <img src="/brand/draa-mark.png" alt="" />
                    <strong>{page.navigationLabel}</strong>
                  </div>
                )}
              </div>
            </section>

            <nav className="corporate-page-jump" aria-label="On this page">
              <div className="draa-corp-shell">
                <strong>On this page</strong>
                <div>
                  {page.sections.map((section) => <a key={section.key} href={`#section-${section.key}`}>{section.eyebrow || section.title}</a>)}
                </div>
                <a className="corporate-page-jump-help" href="/contact?subject=General%20Enquiry">Not sure where to start? <ArrowRight size={14} /></a>
              </div>
            </nav>

            {page.sections.map((section, sectionIndex) => (
              <section
                key={section.key}
                id={`section-${section.key}`}
                className={`corporate-page-section corporate-page-section--${section.layout || 'feature-grid'} ${sectionIndex % 2 ? 'corporate-page-section--tint' : ''}`}
              >
                <div className="draa-corp-shell">
                  <div className="corporate-page-heading">
                    {section.eyebrow && <span className="draa-corp-section-label">{section.eyebrow}</span>}
                    <h2>{section.title}</h2>
                    {section.description && <p>{section.description}</p>}
                  </div>

                  {!!section.items?.length && (
                    <div className={`corporate-page-items corporate-page-items--${section.layout || 'feature-grid'}`}>
                      {section.items.map((item, index) => {
                        const Icon = icons[item.icon || 'sparkles'] || Sparkles;
                        const itemLink = slug === 'capabilities' ? capabilityServiceLinks[item.title] || item.link : item.link;
                        return (
                          <article key={`${section.key}-${item.title}`}>
                            <span className="corporate-page-item-number">{String(index + 1).padStart(2, '0')}</span>
                            {sectionIndex === 0 && index === 0 && itemLink && <span className="corporate-page-useful"><Sparkles size={12} /> Popular starting point</span>}
                            <span className="corporate-page-item-icon"><Icon size={23} /></span>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                            {itemLink && <a className="corporate-page-item-link" href={itemLink}>Explore this service <ArrowRight size={15} /></a>}
                          </article>
                        );
                      })}
                    </div>
                  )}

                  {section.callToAction?.href && section.callToAction?.label && (
                    <a className="corporate-page-cta" href={section.callToAction.href} target={section.callToAction.href.startsWith('http') ? '_blank' : undefined} rel={section.callToAction.href.startsWith('http') ? 'noreferrer' : undefined}>
                      {section.callToAction.label} <ArrowRight size={17} />
                    </a>
                  )}
                </div>
              </section>
            ))}

            <section className="corporate-page-partner">
              <div className="draa-corp-shell">
                <div><span>Work with DRAA</span><h2>Let’s shape the right educational solution.</h2></div>
                <a href="/contact">Start a conversation <ArrowRight size={18} /></a>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="draa-corp-footer corporate-page-footer">
        <div className="draa-corp-shell draa-corp-footer-bottom">
          <span>© {new Date().getFullYear()} DRAA (OPC) Private Limited</span>
          <span>Education Services &amp; Knowledge Management</span>
        </div>
      </footer>
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
