import { FormEvent, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Calculator, Check, CheckCircle2, ClipboardCheck, ExternalLink, FileCheck2, GraduationCap, Landmark, MapPin, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import DraaCorporateHeader from './DraaCorporateHeader';
import SEO from './SEO';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import './StudyInIndiaHub.css';

type Tool = 'explore' | 'eligibility' | 'budget' | 'checklist';

const pathways = [
  { field: 'Engineering & Technology', levels: ['Undergraduate', 'Postgraduate', 'Doctoral'], examples: 'Computer Science, AI, Electronics, Mechanical and Civil Engineering' },
  { field: 'Business & Management', levels: ['Undergraduate', 'Postgraduate', 'Doctoral'], examples: 'Business Administration, Finance, Marketing and Entrepreneurship' },
  { field: 'Science & Research', levels: ['Undergraduate', 'Postgraduate', 'Doctoral'], examples: 'Physics, Chemistry, Mathematics, Biotechnology and Environmental Science' },
  { field: 'Arts, Design & Humanities', levels: ['Undergraduate', 'Postgraduate', 'Certificate'], examples: 'Design, Languages, History, Philosophy, Music and Cultural Studies' },
  { field: 'Allied Health & Life Sciences', levels: ['Undergraduate', 'Postgraduate'], examples: 'Pharmacy, Nursing, Physiotherapy, Public Health and Laboratory Technology' },
  { field: 'Law & Public Policy', levels: ['Undergraduate', 'Postgraduate', 'Doctoral'], examples: 'Law, Governance, Public Administration and International Relations' },
  { field: 'Yoga, Buddhist Studies & Indian Knowledge', levels: ['Undergraduate', 'Postgraduate', 'Certificate'], examples: 'Yoga, Buddhist Studies, Indian Music and traditional knowledge systems' },
];

const steps = [
  ['Create your official SII account', 'Register on the Government of India portal and obtain the mandatory SII ID.'],
  ['Explore programmes', 'Compare disciplines, levels, locations, eligibility and institution quality indicators.'],
  ['Prepare and submit applications', 'Complete your profile, documents and programme choices on the official portal.'],
  ['Review offer letters', 'Compare the academic fit, total cost, conditions and deadline before accepting one offer.'],
  ['Apply for a student visa', 'Use your SII ID and accepted offer letter on the official Indian visa service.'],
  ['Complete FRRO formalities', 'After arrival, complete registration within the applicable government timeline.'],
];

const checklistItems = [
  'Valid passport',
  'Academic transcripts and certificates',
  'English-language evidence, if required',
  'Statement of purpose or research proposal',
  'Financial-support evidence',
  'Offer letter and official SII ID',
];

export default function StudyInIndiaHub() {
  const [tool, setTool] = useState<Tool>('explore');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('All levels');
  const [eligibilityResult, setEligibilityResult] = useState('');
  const [annualTuition, setAnnualTuition] = useState(3500);
  const [monthlyLiving, setMonthlyLiving] = useState(400);
  const [otherCosts, setOtherCosts] = useState(750);
  const [checked, setChecked] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('draa-study-india-checklist') || '[]'); } catch { return []; }
  });

  const filteredPathways = useMemo(() => pathways.filter((pathway) => {
    const matchesQuery = `${pathway.field} ${pathway.examples}`.toLowerCase().includes(query.toLowerCase());
    const matchesLevel = level === 'All levels' || pathway.levels.includes(level);
    return matchesQuery && matchesLevel;
  }), [query, level]);

  const assessEligibility = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const score = Number(data.get('score'));
    const english = data.get('english');
    if (score >= 60 && english === 'yes') {
      setEligibilityResult('Your profile appears ready for programme-level review. Exact eligibility is decided by each institution, so the next step is to shortlist programmes and verify their published requirements.');
    } else {
      setEligibilityResult('You may still have suitable options, but your profile needs an individual review. Entry requirements vary by institution and programme; DRAA can help identify realistic pathways.');
    }
  };

  const toggleChecklist = (item: string) => {
    const next = checked.includes(item) ? checked.filter((entry) => entry !== item) : [...checked, item];
    setChecked(next);
    localStorage.setItem('draa-study-india-checklist', JSON.stringify(next));
  };

  const annualEstimate = annualTuition + (monthlyLiving * 12) + otherCosts;

  return (
    <div className="draa-corp sii-page">
      <SEO
        title="Study in India Guidance"
        siteName="DRAA"
        description="Independent Study in India guidance from DRAA: explore academic pathways, assess readiness, estimate costs and prepare for the official application process."
        keywords="study in India guidance, international students India, Indian universities, student visa India, SII ID"
        ogImage="/brand/draa-mark.png"
      />
      <DraaCorporateHeader />

      <main>
        <section className="sii-hero">
          <div className="draa-corp-shell sii-hero-grid">
            <div className="sii-hero-copy">
              <span className="sii-kicker"><MapPin size={15} /> Independent guidance for international students</span>
              <h1>Plan your education journey in India with clarity.</h1>
              <p>Explore academic pathways, understand requirements, estimate your budget and prepare the documents needed for a confident application.</p>
              <div className="sii-actions">
                <a href="#planning-tools" className="sii-button sii-button-dark">Start planning <ArrowRight size={17} /></a>
                <Link to="/contact?subject=Study%20in%20India%20Guidance" className="sii-button sii-button-light">Request guidance <ArrowRight size={17} /></Link>
              </div>
              <div className="sii-trust-row">
                <span><ShieldCheck size={17} /> Independent advice</span>
                <span><FileCheck2 size={17} /> Official-process aligned</span>
                <span><GraduationCap size={17} /> Student-centred</span>
              </div>
            </div>

            <div className="sii-journey-card" aria-label="Study in India planning journey">
              <span className="sii-card-label">Your planning workspace</span>
              <div className="sii-orbit-mark"><img src="/brand/draa-mark.png" alt="DRAA" /></div>
              <div className="sii-mini-grid">
                <span><Search size={18} /> Discover</span>
                <span><ClipboardCheck size={18} /> Prepare</span>
                <span><Landmark size={18} /> Apply</span>
                <span><CheckCircle2 size={18} /> Progress</span>
              </div>
              <p>DRAA helps you prepare. Applications, SII IDs, visas and FRRO decisions remain with the relevant institutions and Government of India services.</p>
            </div>
          </div>
        </section>

        <section className="sii-official-note">
          <div className="draa-corp-shell">
            <ShieldCheck size={22} />
            <p><strong>Important:</strong> DRAA is an independent education-services company. It is not the Government of India’s Study in India programme and cannot issue an SII ID, admission offer or visa.</p>
            <a href="https://studyinindia.gov.in/" target="_blank" rel="noreferrer">Open official portal <ExternalLink size={15} /></a>
          </div>
        </section>

        <section className="sii-section" id="planning-tools">
          <div className="draa-corp-shell">
            <div className="sii-heading">
              <span>Interactive planning tools</span>
              <h2>Make informed decisions before you apply.</h2>
              <p>Use these tools to organise your thinking. Results are guidance, not an admission or visa decision.</p>
            </div>

            <div className="sii-tool-shell">
              <div className="sii-tool-tabs" role="tablist" aria-label="Study planning tools">
                <button className={tool === 'explore' ? 'active' : ''} onClick={() => setTool('explore')}><Search size={17} /> Explore pathways</button>
                <button className={tool === 'eligibility' ? 'active' : ''} onClick={() => setTool('eligibility')}><ClipboardCheck size={17} /> Check readiness</button>
                <button className={tool === 'budget' ? 'active' : ''} onClick={() => setTool('budget')}><Calculator size={17} /> Estimate budget</button>
                <button className={tool === 'checklist' ? 'active' : ''} onClick={() => setTool('checklist')}><FileCheck2 size={17} /> Document checklist</button>
              </div>

              <div className="sii-tool-content">
                {tool === 'explore' && (
                  <div>
                    <div className="sii-filters">
                      <label><span>Field or subject</span><div><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try computer science or business" /></div></label>
                      <label><span>Programme level</span><select value={level} onChange={(event) => setLevel(event.target.value)}><option>All levels</option><option>Undergraduate</option><option>Postgraduate</option><option>Doctoral</option><option>Certificate</option></select></label>
                    </div>
                    <div className="sii-pathway-grid">
                      {filteredPathways.map((pathway) => (
                        <article key={pathway.field}>
                          <BookOpen size={20} />
                          <h3>{pathway.field}</h3>
                          <p>{pathway.examples}</p>
                          <div>{pathway.levels.map((item) => <span key={item}>{item}</span>)}</div>
                        </article>
                      ))}
                    </div>
                    <a className="sii-official-link" href="https://studyinindia.gov.in/admission/studentsearch/index" target="_blank" rel="noreferrer">Search current institutions and programmes on the official portal <ExternalLink size={16} /></a>
                  </div>
                )}

                {tool === 'eligibility' && (
                  <form className="sii-assessment" onSubmit={assessEligibility}>
                    <div><span>1</span><label>Intended study level<select name="studyLevel" required><option value="">Select a level</option><option>Undergraduate</option><option>Postgraduate</option><option>Doctoral</option><option>Certificate</option></select></label></div>
                    <div><span>2</span><label>Most recent overall score (%)<input name="score" type="number" min="0" max="100" required placeholder="For example, 72" /></label></div>
                    <div><span>3</span><label>Can you provide English-language evidence if requested?<select name="english" required><option value="">Select an answer</option><option value="yes">Yes</option><option value="no">Not yet</option></select></label></div>
                    <button type="submit" className="sii-button sii-button-dark">Review my readiness <ArrowRight size={17} /></button>
                    {eligibilityResult && <div className="sii-result"><CheckCircle2 size={22} /><p>{eligibilityResult}</p></div>}
                  </form>
                )}

                {tool === 'budget' && (
                  <div className="sii-budget">
                    <div className="sii-budget-inputs">
                      <label>Estimated annual tuition (USD)<input type="number" min="0" value={annualTuition} onChange={(event) => setAnnualTuition(Number(event.target.value))} /></label>
                      <label>Monthly living cost (USD)<input type="number" min="0" value={monthlyLiving} onChange={(event) => setMonthlyLiving(Number(event.target.value))} /></label>
                      <label>Travel, insurance and setup (USD)<input type="number" min="0" value={otherCosts} onChange={(event) => setOtherCosts(Number(event.target.value))} /></label>
                    </div>
                    <div className="sii-budget-total"><span>Indicative first-year budget</span><strong>${annualEstimate.toLocaleString()}</strong><p>Tuition and living costs vary by institution, programme and city. The official portal currently gives an indicative average living cost of about USD 400 per month.</p></div>
                  </div>
                )}

                {tool === 'checklist' && (
                  <div className="sii-checklist">
                    <div className="sii-progress"><span>Preparation progress</span><strong>{checked.length}/{checklistItems.length}</strong><div><i style={{ width: `${(checked.length / checklistItems.length) * 100}%` }} /></div></div>
                    {checklistItems.map((item) => <button key={item} onClick={() => toggleChecklist(item)} className={checked.includes(item) ? 'checked' : ''}><span>{checked.includes(item) && <Check size={15} />}</span>{item}</button>)}
                    <p>Your checklist is saved only on this device.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="sii-section sii-steps-section">
          <div className="draa-corp-shell">
            <div className="sii-heading"><span>Official application journey</span><h2>Six stages from registration to arrival.</h2><p>DRAA can help you understand and prepare for each stage; formal actions must be completed with the responsible authority.</p></div>
            <div className="sii-steps">{steps.map(([title, description], index) => <article key={title}><strong>{String(index + 1).padStart(2, '0')}</strong><div><h3>{title}</h3><p>{description}</p></div></article>)}</div>
          </div>
        </section>

        <section className="sii-guidance-cta">
          <div className="draa-corp-shell">
            <div><span>Need personal guidance?</span><h2>Turn your interests into a realistic India study plan.</h2><p>Share your academic background, preferred subject and budget. DRAA will help you identify the next sensible step.</p></div>
            <div><Link to="/contact?subject=Study%20in%20India%20Guidance" className="sii-button sii-button-light">Request guidance <ArrowRight size={17} /></Link></div>
          </div>
        </section>
      </main>

      <footer className="draa-corp-footer"><div className="draa-corp-shell draa-corp-footer-bottom"><span>© {new Date().getFullYear()} DRAA (OPC) Private Limited</span><span>Independent Study in India guidance · Official decisions remain with the relevant authorities</span></div></footer>
      <ScrollToTop />
      <ScrollTop />
    </div>
  );
}
