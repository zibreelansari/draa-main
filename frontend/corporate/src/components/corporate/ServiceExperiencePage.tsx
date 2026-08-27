import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  GraduationCap,
  Handshake,
  Lightbulb,
  Presentation,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import SEO from './SEO';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import type { ServiceDetail } from './serviceData';
import './ServiceExperiencePage.css';

type ExperienceSlug = 'professional-learning' | 'education-events' | 'academic-advisory';

type ExperienceProfile = {
  theme: 'training' | 'events' | 'advisory';
  label: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  summary: string;
  heroImage: string;
  heroAlt: string;
  heroNote: string;
  heroTag: string;
  proof: { icon: LucideIcon; title: string; text: string }[];
  priorityTitle: string;
  priorityLead: string;
  priorities: { icon: LucideIcon; title: string; text: string; points: string[] }[];
  spotlight: {
    eyebrow: string;
    title: string;
    text: string;
    image: string;
    imageAlt: string;
    points: string[];
  };
  deliveryTitle: string;
  deliveryLead: string;
  delivery: { icon: LucideIcon; title: string; text: string }[];
  outcomesTitle: string;
  outcomes: { title: string; text: string }[];
  related: { title: string; text: string; path: string; icon: LucideIcon }[];
};

const remoteImage = (id: string, width: number) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=88`;

const profiles: Record<ExperienceSlug, ExperienceProfile> = {
  'professional-learning': {
    theme: 'training',
    label: 'Academic & Professional Training',
    eyebrow: 'Capability that transfers to practice',
    headline: 'Build capability people',
    headlineAccent: 'can use with confidence',
    summary: 'Practical development programmes for educators, learners and teams—designed around the work people need to do next.',
    heroImage: remoteImage('photo-1695722099520-564bb36a3a6b', 1800),
    heroAlt: 'Historic college building in Dehradun, India',
    heroNote: 'Facilitation, practice and useful follow-through',
    heroTag: 'Live, hybrid or cohort-based',
    proof: [
      { icon: Users, title: 'Audience-aware', text: 'Built around a role, a context and a capability goal' },
      { icon: Lightbulb, title: 'Practice-led', text: 'Activities make new ideas easier to apply' },
      { icon: ShieldCheck, title: 'Reinforced', text: 'Resources and follow-up support sustained use' },
    ],
    priorityTitle: 'Start with the capability you want to strengthen',
    priorityLead: 'Choose a focused intervention or combine these pathways into a longer development programme.',
    priorities: [
      {
        icon: Presentation,
        title: 'Faculty & educator development',
        text: 'Give teaching teams practical methods, shared language and useful resources for stronger delivery.',
        points: ['Teaching and facilitation practice', 'Assessment and feedback', 'Digital teaching confidence'],
      },
      {
        icon: GraduationCap,
        title: 'Student skills & career readiness',
        text: 'Help learners move from academic knowledge to the communication, research and workplace skills employers value.',
        points: ['Employability and interview preparation', 'Research, communication and collaboration', 'Career transition support'],
      },
      {
        icon: Users,
        title: 'Leadership & team capability',
        text: 'Equip leaders and institutional teams to guide change, make decisions and build better ways of working.',
        points: ['Academic leadership', 'Team alignment and mentoring', 'Capability roadmaps'],
      },
    ],
    spotlight: {
      eyebrow: 'More than a workshop',
      title: 'Programmes that continue after the room clears',
      text: 'We design the whole learning experience: a clear brief, relevant activities, facilitator tools, practical resources and a plan for using the learning afterwards.',
      image: remoteImage('photo-1523240795612-9a054b0db644', 1200),
      imageAlt: 'Students participating in a collaborative learning session',
      points: ['A focused outcome for each group', 'Live practice, discussion and reflection', 'Follow-up resources for confident application'],
    },
    deliveryTitle: 'From capability gap to confident practice',
    deliveryLead: 'A light but accountable delivery model keeps the programme relevant at every stage.',
    delivery: [
      { icon: Search, title: 'Understand the need', text: 'Clarify the audience, roles, context and performance gap.' },
      { icon: BookOpen, title: 'Shape the programme', text: 'Create the pathway, session design, activities and supporting resources.' },
      { icon: Presentation, title: 'Facilitate actively', text: 'Use expert-led sessions built around dialogue, practice and feedback.' },
      { icon: Check, title: 'Reinforce the learning', text: 'Provide action tools, feedback and a practical route for follow-through.' },
    ],
    outcomesTitle: 'What your people take forward',
    outcomes: [
      { title: 'Clearer practice', text: 'People leave with techniques and tools they can use in real situations.' },
      { title: 'Stronger confidence', text: 'Facilitated practice makes new skills feel achievable, not abstract.' },
      { title: 'Shared standards', text: 'Teams gain a common approach that improves consistency across the institution.' },
      { title: 'Useful evidence', text: 'Feedback, participation and next-step actions make progress easier to see.' },
    ],
    related: [
      { icon: BookOpen, title: 'Educational Content Development', text: 'Resources that extend learning beyond the session', path: '/services/content-publishing' },
      { icon: CalendarDays, title: 'Educational Events & Conferences', text: 'Learning experiences at a larger scale', path: '/services/education-events' },
      { icon: Handshake, title: 'Educational Consultancy', text: 'A capability strategy aligned with wider priorities', path: '/services/academic-advisory' },
    ],
  },
  'education-events': {
    theme: 'events',
    label: 'Educational Events & Conferences',
    eyebrow: 'Knowledge shared with purpose',
    headline: 'Turn a gathering into',
    headlineAccent: 'a knowledge experience',
    summary: 'Conferences, forums, workshops and learning events that give audiences a clear reason to participate, contribute and stay connected.',
    heroImage: remoteImage('photo-1728230742186-99b38a37e7fc', 1800),
    heroAlt: 'Indian university building with arched walkways',
    heroNote: 'Purpose, programme and participant experience in one plan',
    heroTag: 'In-person, virtual or hybrid',
    proof: [
      { icon: Lightbulb, title: 'Curated', text: 'Themes and sessions built around an audience promise' },
      { icon: Users, title: 'Participant-first', text: 'Every touchpoint is planned for clarity and engagement' },
      { icon: ClipboardCheck, title: 'Well produced', text: 'Programme, operations and communication stay connected' },
    ],
    priorityTitle: 'Tell us the kind of experience you need to create',
    priorityLead: 'DRAA can lead a complete event or support the part of the journey where your team needs help most.',
    priorities: [
      {
        icon: Presentation,
        title: 'Conferences, summits & forums',
        text: 'Bring speakers, themes, partners and participants together around a clear knowledge agenda.',
        points: ['Theme and programme curation', 'Speaker and partner journeys', 'Registration and live experience'],
      },
      {
        icon: GraduationCap,
        title: 'Workshops, webinars & learning labs',
        text: 'Create high-participation formats where audiences learn, discuss and put ideas into action.',
        points: ['Interactive learning formats', 'Facilitator and resource design', 'Virtual and hybrid delivery'],
      },
      {
        icon: Users,
        title: 'Student events & education showcases',
        text: 'Design competitions, exhibitions and engagement programmes that create energy with an educational purpose.',
        points: ['Competitions and challenges', 'Showcases and fairs', 'Audience communication and recognition'],
      },
    ],
    spotlight: {
      eyebrow: 'Beyond event day',
      title: 'An event should keep creating value after it finishes',
      text: 'The strongest events extend their impact through useful session resources, participant communication, recorded learning and a clear post-event follow-up plan.',
      image: remoteImage('photo-1540575467063-178a50c2df87', 1200),
      imageAlt: 'Speakers and attendees connecting at a conference',
      points: ['Clear participant journeys before, during and after the event', 'Content and communication that make attendance worthwhile', 'Post-event resources that keep the conversation active'],
    },
    deliveryTitle: 'A calm, connected way to deliver a complex event',
    deliveryLead: 'We make the moving parts visible early so the team can focus on the experience, not last-minute coordination.',
    delivery: [
      { icon: Search, title: 'Frame the event', text: 'Define the audience, purpose, scope, measures and key moments.' },
      { icon: Lightbulb, title: 'Curate the experience', text: 'Shape the theme, format, sessions, speakers and audience flow.' },
      { icon: CalendarDays, title: 'Produce & communicate', text: 'Coordinate timelines, partners, promotion, registration and live delivery.' },
      { icon: BookOpen, title: 'Extend the value', text: 'Share resources, insights and next actions once the event is complete.' },
    ],
    outcomesTitle: 'What a well-designed event delivers',
    outcomes: [
      { title: 'A stronger reason to attend', text: 'The programme is easy to understand and relevant to the people you invite.' },
      { title: 'Meaningful participation', text: 'Formats invite audiences to contribute, not simply consume.' },
      { title: 'A professional experience', text: 'Clear coordination gives speakers, partners and participants confidence.' },
      { title: 'Content with a longer life', text: 'Learning assets and insights continue to create value after the event.' },
    ],
    related: [
      { icon: GraduationCap, title: 'Academic & Professional Training', text: 'Convert event themes into deeper learning programmes', path: '/services/professional-learning' },
      { icon: BookOpen, title: 'Educational Content Development', text: 'Create guides, workbooks and event learning assets', path: '/services/content-publishing' },
      { icon: Handshake, title: 'Educational Consultancy', text: 'Align the event with an institutional priority', path: '/services/academic-advisory' },
    ],
  },
  'academic-advisory': {
    theme: 'advisory',
    label: 'Educational Consultancy',
    eyebrow: 'Expert direction, practical implementation',
    headline: 'Make the next institutional',
    headlineAccent: 'decision easier to act on',
    summary: 'Evidence-informed advisory that helps institutions move from complex priorities to a shared, practical plan.',
    heroImage: remoteImage('photo-1680060731105-325991d05343', 1800),
    heroAlt: 'Contemporary university building in Sonepat, India',
    heroNote: 'Insight, co-design and implementation support',
    heroTag: 'For schools, colleges and universities',
    proof: [
      { icon: Search, title: 'Evidence-led', text: 'Decisions begin with context, data and stakeholder insight' },
      { icon: Handshake, title: 'Co-designed', text: 'The people who carry the change help shape the route' },
      { icon: Check, title: 'Actionable', text: 'Every recommendation is connected to a practical next step' },
    ],
    priorityTitle: 'Choose the institutional question you need to answer',
    priorityLead: 'Start with a focused diagnostic or connect multiple workstreams into a broader development programme.',
    priorities: [
      {
        icon: BookOpen,
        title: 'Curriculum & programme strategy',
        text: 'Make academic offers more coherent, relevant and aligned with the outcomes you want learners to achieve.',
        points: ['Programme and curriculum review', 'Outcome and assessment alignment', 'New programme architecture'],
      },
      {
        icon: ShieldCheck,
        title: 'Quality & institutional improvement',
        text: 'Create practical quality systems that help teams prioritise, act and review progress with confidence.',
        points: ['Institutional diagnostics', 'Quality frameworks and evidence plans', 'Improvement roadmaps'],
      },
      {
        icon: Users,
        title: 'Learner journeys & team capability',
        text: 'Strengthen the processes and people that shape the learner experience from first contact to progression.',
        points: ['Admissions and learner support', 'Team operating models', 'Training and capability strategy'],
      },
    ],
    spotlight: {
      eyebrow: 'A usable advisory process',
      title: 'Leave with a plan people can actually carry forward',
      text: 'Our work does not end at a recommendation. We turn insight into a shared roadmap with priorities, owners, measures and a realistic route to implementation.',
      image: remoteImage('photo-1573164713988-8665fc963095', 1200),
      imageAlt: 'Consultant presenting a strategic plan to an organisational team',
      points: ['A common view of the challenge and the evidence behind it', 'A prioritised roadmap rather than an unmanageable list', 'Support for communication, ownership and implementation'],
    },
    deliveryTitle: 'Structured enough to create clarity, flexible enough to fit your context',
    deliveryLead: 'Our advisory engagements are collaborative by design and move at a pace that keeps momentum realistic.',
    delivery: [
      { icon: Users, title: 'Listen to the system', text: 'Bring together stakeholder perspectives, current practice and context.' },
      { icon: Search, title: 'Assess what matters', text: 'Review evidence, patterns, dependencies and decision points.' },
      { icon: Lightbulb, title: 'Co-design the route', text: 'Create priorities, options, measures and a practical roadmap.' },
      { icon: Handshake, title: 'Enable implementation', text: 'Support teams as they communicate, act and improve the plan.' },
    ],
    outcomesTitle: 'What your institution gains',
    outcomes: [
      { title: 'Clearer priorities', text: 'Leadership and teams can see what to focus on now and what can wait.' },
      { title: 'Shared direction', text: 'Stakeholders understand the purpose of the change and their role in it.' },
      { title: 'Practical systems', text: 'Frameworks and tools make improvement more consistent and manageable.' },
      { title: 'Momentum to implement', text: 'A clear route turns insight into action, not another report on a shelf.' },
    ],
    related: [
      { icon: GraduationCap, title: 'Academic & Professional Training', text: 'Equip teams to implement new practices confidently', path: '/services/professional-learning' },
      { icon: BookOpen, title: 'Educational Content Development', text: 'Build the resources and academic products your plan needs', path: '/services/content-publishing' },
      { icon: CalendarDays, title: 'Educational Events & Conferences', text: 'Bring stakeholders together around shared knowledge', path: '/services/education-events' },
    ],
  },
};

export default function ServiceExperiencePage({ service }: { service: ServiceDetail }) {
  const profile = profiles[service.slug as ExperienceSlug];
  if (!profile) return null;
  const HeroIcon = service.slug === 'professional-learning' ? GraduationCap : service.slug === 'education-events' ? CalendarDays : Handshake;
  const subject = encodeURIComponent(profile.label);

  return (
    <div className={`draa-corp service-experience service-experience--${profile.theme}`}>
      <SEO title={profile.label} siteName="DRAA" description={profile.summary} keywords={`${profile.label}, DRAA education services, institutional development`} ogImage={profile.heroImage} />
      <DraaCorporateHeader />
      <main>
        <section className="service-experience-hero">
          <img className="service-experience-hero-background" src={profile.heroImage} alt={profile.heroAlt} />
          <div className="service-experience-hero-wash" aria-hidden="true" />
          <div className="draa-corp-shell service-experience-hero-inner">
            <div className="service-experience-hero-copy">
              <div className="service-experience-breadcrumb"><Link to="/capabilities">Services</Link><span>/</span>{profile.label}</div>
              <span className="service-experience-eyebrow"><HeroIcon size={16} />{profile.eyebrow}</span>
              <h1>{profile.headline}<em>{profile.headlineAccent}</em></h1>
              <p>{profile.summary}</p>
              <div className="service-experience-actions">
                <Link to={`/contact?subject=${subject}`}>Discuss your requirement <ArrowRight size={17} /></Link>
                <a href="#service-priorities">See how DRAA can help</a>
              </div>
              <div className="service-experience-hero-tag"><Check size={15} />{profile.heroTag}</div>
            </div>
            <aside className="service-experience-hero-visual" aria-label="The DRAA approach">
              <div className="service-experience-hero-panel"><span>THE DRAA APPROACH</span><strong>{profile.heroNote}</strong></div>
              <div className="service-experience-hero-orbit" aria-hidden="true" />
              <div className="service-experience-hero-signal" aria-hidden="true"><i /><i /><i /></div>
            </aside>
          </div>
          <div className="draa-corp-shell service-experience-proof-row">
            {profile.proof.map(({ icon: Icon, title, text }) => <div key={title}><span><Icon size={20} /></span><div><strong>{title}</strong><small>{text}</small></div></div>)}
          </div>
        </section>

        <nav className="service-experience-nav" aria-label={`${profile.label} page sections`}>
          <div className="draa-corp-shell"><span>Explore this service</span><div><a href="#service-priorities">What you need</a><a href="#service-approach">What we offer</a><a href="#service-delivery">How we work</a><a href="#service-value">The value</a></div></div>
        </nav>

        <section id="service-priorities" className="service-experience-section service-experience-priorities">
          <div className="draa-corp-shell">
            <div className="service-experience-heading"><span>Start with your requirement</span><h2>{profile.priorityTitle}</h2><p>{profile.priorityLead}</p></div>
            <div className="service-experience-priority-grid">
              {profile.priorities.map(({ icon: Icon, title, text, points }) => <article key={title}><span className="service-experience-icon"><Icon size={23} /></span><h3>{title}</h3><p>{text}</p><ul>{points.map((point) => <li key={point}><Check size={14} />{point}</li>)}</ul><Link to={`/contact?subject=${encodeURIComponent(`${profile.label} — ${title}`)}`}>Discuss this need <ArrowRight size={15} /></Link></article>)}
            </div>
          </div>
        </section>

        <section id="service-approach" className="service-experience-section service-experience-spotlight">
          <div className="draa-corp-shell service-experience-spotlight-grid">
            <figure><img src={profile.spotlight.image} alt={profile.spotlight.imageAlt} loading="lazy" /><div className="service-experience-image-note"><CheckCircleIcon /><span>Designed around the people who will use it</span></div></figure>
            <div className="service-experience-spotlight-copy"><span>{profile.spotlight.eyebrow}</span><h2>{profile.spotlight.title}</h2><p>{profile.spotlight.text}</p><ul>{profile.spotlight.points.map((point) => <li key={point}><Check size={16} />{point}</li>)}</ul><Link to={`/contact?subject=${subject}`}>Plan your engagement <ArrowRight size={17} /></Link></div>
          </div>
        </section>

        <section id="service-delivery" className="service-experience-section service-experience-delivery">
          <div className="draa-corp-shell">
            <div className="service-experience-heading service-experience-heading--light"><span>How we work</span><h2>{profile.deliveryTitle}</h2><p>{profile.deliveryLead}</p></div>
            <div className="service-experience-delivery-grid">
              {profile.delivery.map(({ icon: Icon, title, text }) => <article key={title}><span><Icon size={23} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}
            </div>
          </div>
        </section>

        <section id="service-value" className="service-experience-section service-experience-value">
          <div className="draa-corp-shell service-experience-value-grid">
            <div><span>What good looks like</span><h2>{profile.outcomesTitle}</h2><p>Each engagement is tailored, but the value should always be clear to the people leading and using the work.</p></div>
            <div className="service-experience-outcome-grid">{profile.outcomes.map((outcome) => <article key={outcome.title}><span><Check size={18} /></span><h3>{outcome.title}</h3><p>{outcome.text}</p></article>)}</div>
          </div>
        </section>

        <section className="service-experience-section service-experience-related">
          <div className="draa-corp-shell"><div className="service-experience-heading"><span>Build a connected solution</span><h2>Often more powerful when combined with</h2></div><div>{profile.related.map(({ icon: Icon, title, text, path }) => <Link key={title} to={path}><span><Icon size={21} /></span><div><strong>{title}</strong><small>{text}</small></div><ArrowRight size={17} /></Link>)}</div></div>
        </section>

        <section className="service-experience-final"><div className="draa-corp-shell"><div><span>Start with the challenge</span><h2>Let’s shape the right {profile.label.toLowerCase()} plan for your people and priorities</h2></div><Link to={`/contact?subject=${subject}`}>Start a conversation <ArrowRight size={17} /></Link></div></section>
      </main>
      <DraaCorporateFooter />
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}

function CheckCircleIcon() {
  return <ShieldCheck size={18} />;
}
