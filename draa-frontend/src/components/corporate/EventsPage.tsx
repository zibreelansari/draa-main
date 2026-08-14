import { ArrowRight, Award, BarChart3, CalendarDays, GraduationCap, Handshake, Laptop2, Megaphone, Mic2, Presentation, Sparkles, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import SEO from './SEO';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import './DraaCorporateHome.css';
import './EditorialPages.css';

const eventCards = [
  ['18–20 Jul 2026', 'Future of Learning Summit 2026', 'New Delhi, India', 'Exploring emerging paradigms in education, technology and skills.'],
  ['05–06 Sep 2026', 'Higher Education Leadership Forum', 'Bengaluru, India', 'Leadership conversations for resilient and future-ready institutions.'],
  ['21–22 Nov 2026', 'EdTech & Innovation Conclave', 'Mumbai, India', 'Where education meets innovation, research and measurable impact.'],
];

const categories = [
  [Presentation, 'Conferences', 'Large-scale knowledge convenings'], [Users, 'Workshops', 'Hands-on learning experiences'],
  [Laptop2, 'Webinars', 'Live access to experts'], [Mic2, 'Leadership forums', 'Strategic dialogue for leaders'],
  [GraduationCap, 'Faculty development', 'Programmes for educators'], [Award, 'Student events', 'Competitions and engagement'],
];

export default function EventsPage() {
  return (
    <div className="draa-corp editorial-page events-page">
      <SEO title="Events & Conferences" siteName="DRAA" description="Education conferences, workshops, webinars and leadership forums designed and delivered by DRAA." ogImage="/brand/corporate/stock/event-hero.jpg" />
      <DraaCorporateHeader />
      <main>
        <section className="events-hero">
          <img src="/brand/corporate/stock/event-hero.jpg" alt="Speaker presenting to a large conference audience" />
          <div className="events-hero-shade" />
          <div className="draa-corp-shell events-hero-inner">
            <div>
              <span className="editorial-kicker"><Sparkles size={13} /> Events &amp; conferences</span>
              <h1>Conversations today.<span>Impact tomorrow.</span></h1>
              <p>DRAA brings educators, leaders, innovators and change-makers together to exchange ideas, build capability and shape the future of learning.</p>
              <div className="editorial-actions"><a href="#upcoming" className="editorial-button editorial-button-gold">Register now <ArrowRight size={16} /></a><Link to="/contact?subject=Educational%20Events" className="editorial-button editorial-button-light">Host an event <ArrowRight size={16} /></Link></div>
            </div>
          </div>
        </section>

        <section id="upcoming" className="editorial-section events-overview">
          <div className="draa-corp-shell events-overview-grid">
            <div>
              <div className="editorial-heading-row"><h2>Upcoming events</h2><Link to="/contact?subject=Event%20Registration">View all events <ArrowRight size={14} /></Link></div>
              <div className="events-card-grid">
                {eventCards.map(([date,title,place,text], index) => <article key={title} style={{backgroundImage:`linear-gradient(180deg,rgba(15,12,9,.12),rgba(15,12,9,.93)),url(${index === 1 ? '/brand/corporate/stock/event-networking.jpg' : '/brand/corporate/stock/event-stage.jpg'})`}}><span><CalendarDays size={13} /> {date}</span><h3>{title}</h3><small>{place}</small><p>{text}</p><Link to="/contact?subject=Event%20Registration">Register now <ArrowRight size={14} /></Link></article>)}
              </div>
            </div>
            <aside className="events-categories">
              <h2>Event categories</h2>
              <div>{categories.map(([Icon,title,text]) => { const CategoryIcon = Icon as typeof Presentation; return <article key={String(title)}><CategoryIcon size={18} /><span><strong>{String(title)}</strong><small>{String(text)}</small></span></article>; })}</div>
              <Link to="/services/education-events">Explore all categories <ArrowRight size={14} /></Link>
            </aside>
          </div>
        </section>

        <section className="events-value editorial-section editorial-section-tint">
          <div className="draa-corp-shell events-value-grid">
            <div className="events-reasons"><span className="editorial-eyebrow">Why attend DRAA events?</span><h2>Ideas become useful when people connect.</h2>{[[GraduationCap,'Learn from global experts'],[Handshake,'Build a diverse professional network'],[BarChart3,'Discover actionable insight'],[Award,'Earn meaningful recognition']].map(([Icon,text])=>{const I=Icon as typeof GraduationCap;return <p key={String(text)}><I size={17}/>{String(text)}</p>})}</div>
            <div className="events-services"><span className="editorial-eyebrow">DRAA event services</span><h2>End-to-end delivery.</h2><div>{[[Megaphone,'Strategy & planning'],[Presentation,'Content & curation'],[Mic2,'Speaker management'],[Users,'Marketing & promotion'],[Laptop2,'Virtual experience'],[BarChart3,'Analytics & reporting']].map(([Icon,text])=>{const I=Icon as typeof Megaphone;return <article key={String(text)}><I size={19}/><strong>{String(text)}</strong></article>})}</div><Link to="/contact?subject=Educational%20Events">Host an event with DRAA <ArrowRight size={14}/></Link></div>
            <div className="events-gallery"><span className="editorial-eyebrow">Past events gallery</span><div><img src="/brand/corporate/stock/event-stage.jpg" alt="Conference stage and audience"/><img src="/brand/corporate/stock/event-networking.jpg" alt="Attendees networking at an event"/><img src="/brand/corporate/stock/team-learning.jpg" alt="Participants collaborating in a workshop"/></div></div>
          </div>
        </section>

        <section className="events-testimonials">
          <div className="draa-corp-shell"><span className="editorial-eyebrow">Voices from our attendees</span><div>{['A perfect blend of insight, inspiration and practical learning.','Excellent curation, seamless execution and unmatched learning opportunities.','A platform that connects ideas with action and people with purpose.'].map((quote,index)=><blockquote key={quote}><strong>“</strong><p>{quote}</p><footer>{['Dr. Ananya Sharma · Dean, Academic Affairs','Prof. Arvind Menon · Vice Chancellor','Riya Kapoor · EdTech Entrepreneur'][index]}</footer></blockquote>)}</div></div>
        </section>
      </main>
      <DraaCorporateFooter /><ScrollToTop/><ScrollTop/>
    </div>
  );
}
