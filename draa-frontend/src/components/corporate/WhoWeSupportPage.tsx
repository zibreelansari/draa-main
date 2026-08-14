import { ArrowRight, BookOpen, BriefcaseBusiness, Building2, CheckCircle2, GraduationCap, Handshake, Landmark, Laptop2, School, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateFooter from './DraaCorporateFooter';
import DraaCorporateHeader from './DraaCorporateHeader';
import SEO from './SEO';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import './DraaCorporateHome.css';
import './EditorialPages.css';

const audiences = [
  [School,'Schools','K–12 schools and school networks','/brand/corporate/stock/classroom.jpg'],
  [Landmark,'Colleges & universities','Higher education institutions','/brand/corporate/stock/university-building.jpg'],
  [GraduationCap,'Training institutes','Professional training organisations','/brand/corporate/stock/team-learning.jpg'],
  [BriefcaseBusiness,'Corporates','Enterprises and L&D teams','/brand/corporate/stock/team-learning.jpg'],
  [BookOpen,'Publishers','Academic and trade publishers','/brand/corporate/stock/books-library.jpg'],
  [Laptop2,'EdTech brands','Digital learning companies','/brand/corporate/stock/digital-learning.jpg'],
  [Building2,'Government & NGOs','Public-sector and social-impact organisations','/brand/corporate/institutional-partners-v2.png'],
];

export default function WhoWeSupportPage(){
  return <div className="draa-corp editorial-page support-page">
    <SEO title="Who We Support" siteName="DRAA" description="Education solutions for schools, universities, training institutes, corporates, publishers, EdTech brands and public-sector organisations." ogImage="/brand/corporate/institutional-partners-v2.png"/>
    <DraaCorporateHeader/>
    <main>
      <section className="support-hero"><div className="draa-corp-shell support-hero-grid"><div><span className="editorial-kicker"><Users size={13}/> Who we support</span><h1>Solutions for every<span>education ecosystem.</span></h1><p>From classrooms to boardrooms, publishers to the public sector, we partner with organisations across the education value chain to design, deliver and scale impact.</p><Link to="/contact" className="editorial-button editorial-button-dark">Work with us <ArrowRight size={16}/></Link></div><div className="support-orbit" aria-label="Connected DRAA education ecosystem"><div className="support-orbit-ring"/><div className="support-coin"><img src="/brand/draa-mark.png" alt="DRAA"/><strong>DRAA</strong></div><span className="support-node node-a"><School size={18}/></span><span className="support-node node-b"><GraduationCap size={18}/></span><span className="support-node node-c"><BriefcaseBusiness size={18}/></span><span className="support-node node-d"><Users size={18}/></span></div></div></section>

      <section className="editorial-section support-audiences"><div className="draa-corp-shell"><span className="editorial-eyebrow">We work with</span><div>{audiences.map(([Icon,title,text,image])=>{const I=Icon as typeof School;return <article key={String(title)}><img src={String(image)} alt=""/><div><I size={21}/><h3>{String(title)}</h3><p>{String(text)}</p></div></article>})}</div></div></section>

      <section className="support-solutions"><div className="draa-corp-shell support-row"><div><span>Tailored solutions</span><h2>Built around your goals.</h2></div><div>{[[BookOpen,'Content & curriculum'],[GraduationCap,'Learning programmes'],[ShieldCheck,'Assessment & certification'],[Users,'Events & communities'],[Laptop2,'Digital experiences'],[Landmark,'Advisory solutions']].map(([Icon,text])=>{const I=Icon as typeof BookOpen;return <article key={String(text)}><I size={19}/><strong>{String(text)}</strong></article>})}</div></div></section>

      <section className="support-why editorial-section editorial-section-tint"><div className="draa-corp-shell support-row"><div><span>Why partner with DRAA?</span><h2>Expertise that moves with you.</h2></div><div>{[['Deep domain expertise','Strong research and academic foundations.'],['End-to-end capabilities','Concept to delivery and impact measurement.'],['Scalable & future-ready','Solutions that adapt to technology and learners.'],['Trusted by leaders','Built through long-term education partnerships.'],['Impact focused','Every solution is designed for measurable outcomes.']].map(([title,text])=><article key={title}><CheckCircle2 size={18}/><span><strong>{title}</strong><small>{text}</small></span></article>)}</div></div></section>

      <section className="editorial-section support-impact"><div className="draa-corp-shell"><div className="editorial-heading-row"><div><span className="editorial-eyebrow">Impact stories</span><h2>Real work. Useful outcomes.</h2></div><Link to="/contact">View all stories <ArrowRight size={14}/></Link></div><div>{[['Higher education','Enhancing employability at scale','/brand/corporate/stock/university-building.jpg'],['Corporate learning','Upskilling a future-ready workforce','/brand/corporate/stock/team-learning.jpg'],['School education','Transforming classrooms','/brand/corporate/stock/classroom.jpg']].map(([tag,title,image])=><article key={title}><img src={image} alt=""/><div><span>{tag}</span><h3>{title}</h3><p>Designed and delivered a focused learning solution with clear participation and progress measures.</p><Link to="/contact">Read case story <ArrowRight size={13}/></Link></div></article>)}</div></div></section>

      <section className="support-process"><div className="draa-corp-shell"><h2>Our collaboration model</h2><div>{['Discover','Design','Develop','Deliver','Measure'].map((step,index)=><article key={step}><strong>{String(index+1).padStart(2,'0')}</strong><span><b>{step}</b><small>{['Understand goals and challenges.','Co-create the solution blueprint.','Build content and experiences.','Implement with excellence.','Evaluate and continuously improve.'][index]}</small></span>{index<4&&<ArrowRight size={15}/>}</article>)}</div><aside><div><h2>Ready to create impact together?</h2><p>Let’s build solutions that empower learners and institutions.</p></div><Link to="/contact">Work with us <ArrowRight size={16}/></Link></aside></div></section>
    </main><DraaCorporateFooter/><ScrollToTop/><ScrollTop/>
  </div>
}
