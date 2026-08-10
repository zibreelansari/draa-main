import { FormEvent, useEffect, useState } from 'react';
import { ArrowRight, Check, ClipboardCheck, ExternalLink, FileText, LogOut, Save, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DraaCorporateHeader from '../homes/home/DraaCorporateHeader';
import SEO from '../common/SEO';
import url from '../../url';
import './StudyIndiaDashboard.css';

const documentOptions = ['Valid passport', 'Academic transcripts and certificates', 'English-language evidence, if required', 'Statement of purpose or research proposal', 'Financial-support evidence', 'Offer letter and official SII ID'];

type Profile = {
  nationality: string; intendedLevel: string; fieldOfStudy: string; preferredIntake: string;
  annualBudgetUsd: number; currentStage: string; checklist: string[]; notes: string;
};

const emptyProfile: Profile = { nationality: '', intendedLevel: '', fieldOfStudy: '', preferredIntake: '', annualBudgetUsd: 0, currentStage: 'exploring', checklist: [], notes: '' };

export default function StudyIndiaDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [status, setStatus] = useState('Loading your plan…');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let stored: any;
    try { stored = JSON.parse(localStorage.getItem('edudocs') || 'null'); } catch { stored = null; }
    if (!stored?.token) { navigate('/login', { replace: true }); return; }
    setUser(stored);
    fetch(`${url}/corporate/study-india/profile`, { headers: { Authorization: `Bearer ${stored.token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to load your plan.');
        setProfile({ ...emptyProfile, ...result.data });
        setStatus('');
      })
      .catch((error) => setStatus(error.message));
  }, [navigate]);

  const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.token) return;
    try {
      setSaving(true); setStatus('');
      const response = await fetch(`${url}/corporate/study-india/profile`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }, body: JSON.stringify(profile),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Unable to save your plan.');
      setProfile({ ...emptyProfile, ...result.data });
      setStatus('Your study plan has been saved.');
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Unable to save your plan.'); }
    finally { setSaving(false); }
  };

  const toggleDocument = (item: string) => setProfile((current) => ({ ...current, checklist: current.checklist.includes(item) ? current.checklist.filter((entry) => entry !== item) : [...current.checklist, item] }));
  const logout = () => { localStorage.removeItem('edudocs'); window.dispatchEvent(new Event('auth-updated')); navigate('/'); };

  return (
    <div className="draa-corp study-dashboard-page">
      <SEO title="My Study in India Plan" siteName="DRAA" description="Manage your DRAA Study in India guidance plan." keywords="DRAA Study in India dashboard" ogImage="/brand/draa-mark.png" />
      <DraaCorporateHeader />
      <main>
        <section className="study-dashboard-hero"><div className="draa-corp-shell"><div><span>DRAA student workspace</span><h1>Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1><p>Build and save a clear planning profile before taking formal action on the official Study in India portal.</p></div><button onClick={logout}><LogOut size={16} /> Sign out</button></div></section>
        <section className="study-dashboard-main"><div className="draa-corp-shell study-dashboard-grid">
          <form className="study-plan-card" onSubmit={saveProfile}>
            <div className="study-card-heading"><UserRound size={21} /><div><span>Your planning profile</span><h2>Tell us what you are working towards.</h2></div></div>
            <div className="study-form-grid">
              <label>Nationality<input value={profile.nationality} onChange={(event) => setProfile({ ...profile, nationality: event.target.value })} placeholder="Your country of citizenship" /></label>
              <label>Intended level<select value={profile.intendedLevel} onChange={(event) => setProfile({ ...profile, intendedLevel: event.target.value })}><option value="">Select level</option><option>Undergraduate</option><option>Postgraduate</option><option>Doctoral</option><option>Certificate</option></select></label>
              <label>Preferred field<input value={profile.fieldOfStudy} onChange={(event) => setProfile({ ...profile, fieldOfStudy: event.target.value })} placeholder="For example, Computer Science" /></label>
              <label>Preferred intake<input value={profile.preferredIntake} onChange={(event) => setProfile({ ...profile, preferredIntake: event.target.value })} placeholder="For example, 2027" /></label>
              <label>Annual budget (USD)<input type="number" min="0" value={profile.annualBudgetUsd || ''} onChange={(event) => setProfile({ ...profile, annualBudgetUsd: Number(event.target.value) })} /></label>
              <label>Current stage<select value={profile.currentStage} onChange={(event) => setProfile({ ...profile, currentStage: event.target.value })}><option value="exploring">Exploring options</option><option value="shortlisting">Shortlisting programmes</option><option value="preparing">Preparing documents</option><option value="applied">Applications submitted</option><option value="offer-received">Offer received</option><option value="visa-frro">Visa / FRRO stage</option></select></label>
            </div>
            <label className="study-notes">Notes<textarea rows={4} value={profile.notes} onChange={(event) => setProfile({ ...profile, notes: event.target.value })} placeholder="Questions, priorities or important information for your DRAA guidance conversation." /></label>
            {status && <p className="study-save-status" role="status">{status}</p>}
            <button className="study-save" disabled={saving}><Save size={16} /> {saving ? 'Saving…' : 'Save my plan'}</button>
          </form>

          <aside className="study-dashboard-side">
            <section className="study-checklist-card"><div className="study-card-heading"><ClipboardCheck size={21} /><div><span>Preparation</span><h2>Document checklist</h2></div></div><div className="study-doc-progress"><i style={{ width: `${(profile.checklist.length / documentOptions.length) * 100}%` }} /></div>{documentOptions.map((item) => <button type="button" key={item} onClick={() => toggleDocument(item)} className={profile.checklist.includes(item) ? 'done' : ''}><span>{profile.checklist.includes(item) && <Check size={13} />}</span>{item}</button>)}</section>
            <section className="study-official-card"><FileText size={22} /><h3>Ready for the formal process?</h3><p>Use the official Government of India portal to obtain an SII ID, search live programmes and submit formal applications.</p><a href="https://studyinindia.gov.in/" target="_blank" rel="noreferrer">Open official portal <ExternalLink size={15} /></a></section>
            <Link className="study-guidance-link" to="/contact">Request DRAA guidance <ArrowRight size={16} /></Link>
          </aside>
        </div></section>
      </main>
    </div>
  );
}
