import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  Check,
  Compass,
  GraduationCap,
  Handshake,
  Laptop2,
  MessageCircle,
  Search,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import SEO from './SEO';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import './ServicesOverviewPage.css';

type ServiceGroup = 'Content & Learning' | 'Events & Advisory' | 'Digital Platforms';

const serviceGroups: Array<'All Services' | ServiceGroup> = [
  'All Services',
  'Content & Learning',
  'Events & Advisory',
  'Digital Platforms',
];

const services = [
  {
    id: 'content-curriculum',
    group: 'Content & Learning' as ServiceGroup,
    icon: BookOpenCheck,
    title: 'Educational Content Development',
    promise: 'Turn subject expertise into structured, accurate and audience-ready learning resources',
    description: 'DRAA connects research, curriculum architecture, instructional design, editing and production in one dependable content workflow',
    capabilities: ['Curriculum and content mapping', 'Books, courseware and study resources', 'Assessments and multimedia learning assets'],
    bestFor: 'Schools, universities, publishers, training providers and education brands',
    image: '/brand/corporate/stock/writing-content.jpg',
    href: '/services/content-publishing',
  },
  {
    id: 'training-capacity',
    group: 'Content & Learning' as ServiceGroup,
    icon: GraduationCap,
    title: 'Academic & Professional Training',
    promise: 'Build practical capability that participants can carry into real academic and professional work',
    description: 'From faculty development to career readiness, every programme combines expert facilitation, applied practice and useful follow-through',
    capabilities: ['Faculty and educator development', 'Student skills and career readiness', 'Leadership and institutional capability'],
    bestFor: 'Educators, students, academic leaders and organisational teams',
    image: '/brand/corporate/stock/team-learning.jpg',
    href: '/services/professional-learning',
  },
  {
    id: 'events-conferences',
    group: 'Events & Advisory' as ServiceGroup,
    icon: CalendarDays,
    title: 'Educational Events & Conferences',
    promise: 'Create purposeful knowledge experiences that people understand, participate in and remember',
    description: 'We bring programme strategy, curation, speakers, participant communication and live delivery together under one event plan',
    capabilities: ['Conferences, summits and forums', 'Workshops, webinars and student events', 'Speaker, partner and participant management'],
    bestFor: 'Institutions, associations, education brands and knowledge partners',
    image: '/brand/corporate/stock/event-stage.jpg',
    href: '/services/education-events',
  },
  {
    id: 'advisory-institutional',
    group: 'Events & Advisory' as ServiceGroup,
    icon: Handshake,
    title: 'Educational Consultancy',
    promise: 'Move from a complex academic challenge to a clear, practical and measurable plan',
    description: 'Our advisory work combines evidence, stakeholder insight, co-design and implementation support instead of stopping at recommendations',
    capabilities: ['Curriculum and programme strategy', 'Institutional quality and development', 'Admissions, learner journeys and training strategy'],
    bestFor: 'Schools, colleges, universities and education-sector organisations',
    image: '/brand/corporate/stock/classroom.jpg',
    href: '/services/academic-advisory',
  },
  {
    id: 'digital-platforms',
    group: 'Digital Platforms' as ServiceGroup,
    icon: Laptop2,
    title: 'Digital Learning Solutions',
    promise: 'Build useful digital products around real learners, teams and operational workflows',
    description: 'DRAA plans and develops connected web, app and learning experiences with accessible journeys, clear implementation and long-term support in mind',
    capabilities: ['Websites, apps and institutional portals', 'LMS, online courses and virtual classrooms', 'Digital assessment, UX and implementation support'],
    bestFor: 'Institutions, education businesses, academies and growing organisations',
    image: '/brand/corporate/stock/digital-learning.jpg',
    href: '/services/digital-learning',
  },
];

const needPaths = [
  [BookOpenCheck, 'I need stronger learning content', 'content-curriculum'],
  [GraduationCap, 'I want to build people capability', 'training-capacity'],
  [CalendarDays, 'I need an event delivered', 'events-conferences'],
  [Building2, 'I need institutional guidance', 'advisory-institutional'],
  [Laptop2, 'I need a digital product or platform', 'digital-platforms'],
] as const;

export default function ServicesOverviewPage() {
  const [activeGroup, setActiveGroup] = useState<(typeof serviceGroups)[number]>('All Services');
  const visibleServices = useMemo(
    () => activeGroup === 'All Services' ? services : services.filter((service) => service.group === activeGroup),
    [activeGroup],
  );

  const jumpToService = (id: string) => {
    setActiveGroup('All Services');
    window.requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  return (
    <div className="draa-corp services-overview-page">
      <SEO
        title="Education Services"
        siteName="DRAA"
        description="Explore DRAA services in content and curriculum, training, events, institutional advisory and digital platforms"
        ogImage="https://images.unsplash.com/photo-1599634875158-597d3f647df6?auto=format&fit=crop&w=1600&q=90"
      />
      <DraaCorporateHeader />
      <main>
        <section className="services-overview-hero">
          <img
            className="services-overview-hero-image"
            src="https://images.unsplash.com/photo-1599634875158-597d3f647df6?auto=format&fit=crop&w=2200&q=90"
            alt="A stately Indian college building with a domed entrance and green lawns"
          />
          <div className="services-overview-hero-wash" aria-hidden="true" />
          <div className="draa-corp-shell services-overview-hero-grid">
            <div className="services-overview-hero-copy">
              <span className="services-overview-kicker"><Sparkles size={14} /> Our capabilities</span>
              <h1>Education services that create <em>outcomes that endure</em></h1>
              <p>Engage DRAA for one specialist requirement or bring together content, capability building, events, advisory and technology in a connected programme with a clear purpose</p>
              <div className="services-overview-actions">
                <a href="#service-finder">Explore all services <ArrowRight size={17} /></a>
                <Link to="/contact?subject=General%20Enquiry">Discuss your requirement <MessageCircle size={17} /></Link>
              </div>
              <dl className="services-overview-proof">
                <div><dt>Connected</dt><dd>Education services</dd></div>
                <div><dt>One</dt><dd>Accountable partner</dd></div>
                <div><dt>Custom</dt><dd>Scope and delivery</dd></div>
              </dl>
            </div>

            <aside className="services-hero-panel" aria-label="DRAA delivery approach">
              <span className="services-hero-panel-eyebrow">One accountable partner</span>
              <strong>From the first brief to meaningful impact</strong>
              <p>Practical expertise across every part of the education journey</p>
              <div>
                <span>Content</span><span>Capability</span><span>Technology</span>
              </div>
              <i aria-hidden="true" />
            </aside>
          </div>
        </section>

        <section className="services-need-strip" aria-labelledby="services-need-title">
          <div className="draa-corp-shell">
            <div><span>Not sure where to begin?</span><h2 id="services-need-title">Start with what you need</h2></div>
            <div className="services-need-grid">
              {needPaths.map(([Icon, label, id]) => (
                <button type="button" key={id} onClick={() => jumpToService(id)}>
                  <Icon size={19} /><span>{label}</span><ArrowRight size={15} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="service-finder" className="services-catalogue">
          <div className="draa-corp-shell">
            <div className="services-catalogue-heading">
              <div><span>Explore our services</span><h2>Clear capabilities for real education needs</h2></div>
              <p>Filter by area, compare the scope and open any service for a more detailed view of deliverables, process and outcomes</p>
            </div>
            <div className="services-filter" role="group" aria-label="Filter DRAA services">
              {serviceGroups.map((group) => (
                <button key={group} type="button" className={activeGroup === group ? 'is-active' : ''} aria-pressed={activeGroup === group} onClick={() => setActiveGroup(group)}>
                  {group}
                </button>
              ))}
            </div>

            <div className="services-card-list">
              {visibleServices.map(({ id, group, icon: Icon, title, promise, description, capabilities, bestFor, image, href }) => (
                <article id={id} className="services-overview-card" key={id}>
                  <div className="services-overview-card-media">
                    <img src={image} alt={`${title} team at work`} loading="lazy" />
                  </div>
                  <div className="services-overview-card-body">
                    <div className="services-overview-card-title"><span><Icon size={22} /></span><div><small>{group}</small><h3>{title}</h3></div></div>
                    <strong>{promise}</strong>
                    <p>{description}</p>
                    <ul>{capabilities.map((capability) => <li key={capability}><Check size={15} />{capability}</li>)}</ul>
                  </div>
                  <aside className="services-overview-card-action">
                    <span>Best for</span><p>{bestFor}</p>
                    <Link to={href}>View service details <ArrowRight size={16} /></Link>
                    <Link to={`/contact?subject=${encodeURIComponent(title)}`}>Request a conversation</Link>
                  </aside>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="services-model">
          <div className="draa-corp-shell services-model-grid">
            <div className="services-model-intro">
              <span>One delivery model</span>
              <h2>A clear route from requirement to measurable value</h2>
              <p>You do not need a finished brief before speaking with DRAA We can help define the need, connect the right services and create a practical delivery plan</p>
              <Link to="/contact?subject=Project%20Brief">Share your starting point <ArrowRight size={16} /></Link>
            </div>
            <div className="services-model-steps">
              {[
                [Search, 'Discover', 'Clarify the audience, context and outcome'],
                [Compass, 'Design', 'Shape the right service mix and delivery plan'],
                [Users, 'Deliver', 'Coordinate specialists, production and support'],
                [Target, 'Improve', 'Review evidence and strengthen the next cycle'],
              ].map(([Icon, title, text]) => {
                const StepIcon = Icon as typeof Search;
                return <article key={String(title)}><span><StepIcon size={20} /></span><div><h3>{String(title)}</h3><p>{String(text)}</p></div></article>;
              })}
            </div>
          </div>
        </section>

        <section className="services-final-cta">
          <div className="draa-corp-shell">
            <div><span>Need more than one service?</span><h2>Build one connected programme with DRAA</h2><p>Combine content, training, events, advisory and digital delivery under one accountable plan</p></div>
            <Link to="/contact?subject=Connected%20Education%20Programme">Plan a connected programme <ArrowRight size={17} /></Link>
          </div>
        </section>
      </main>
      <DraaCorporateFooter />
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
