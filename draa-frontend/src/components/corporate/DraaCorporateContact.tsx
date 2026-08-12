import { FormEvent, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, GraduationCap, Handshake, MapPin, Send } from 'lucide-react';
import DraaCorporateHeader from './DraaCorporateHeader';
import SEO from './SEO';
import ScrollToTop from './ScrollToTop';
import ScrollTop from './ScrollTop';
import './DraaCorporateHome.css';

type FormStatus = { type: 'idle' | 'success'; message?: string };

export default function DraaCorporateContact() {
  const [searchParams] = useSearchParams();
  const requestedSubject = useMemo(() => searchParams.get('subject') || '', [searchParams]);
  const [status, setStatus] = useState<FormStatus>({ type: 'idle' });

  const submitEnquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const organisation = String(data.get('organisation') || '').trim();
    const message = String(data.get('message') || '').trim();

    const subject = String(data.get('subject') || 'DRAA website enquiry');
    const body = [
      `Name: ${String(data.get('name') || '')}`,
      `Organisation: ${organisation || 'Not provided'}`,
      `Email: ${String(data.get('email') || '')}`,
      `Phone: ${String(data.get('phone') || '')}`,
      '',
      message,
    ].join('\n');
    window.location.href = `mailto:admin@draa.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus({ type: 'success', message: 'Your email application has opened with the enquiry details prepared.' });
  };

  return (
    <div className="draa-corp draa-corp-contact-page">
      <SEO
        title="Contact DRAA"
        siteName="DRAA"
        description="Connect with DRAA for educational content, professional learning, events, institutional advisory, digital learning and Study in India guidance."
        keywords="contact DRAA, education partnership, institutional training, Study in India guidance"
        ogImage="/brand/draa-mark.png"
      />
      <DraaCorporateHeader />

      <main>
        <section className="draa-contact-hero">
          <div className="draa-corp-shell draa-contact-hero-inner">
            <div>
              <span className="draa-corp-section-label">Connect with DRAA</span>
              <h1>Let’s create meaningful educational outcomes together.</h1>
            </div>
            <p>Tell us what you are trying to achieve. Our team will help shape the right content, programme, event, advisory engagement or learner-support pathway.</p>
          </div>
        </section>

        <section className="draa-contact-main">
          <div className="draa-corp-shell draa-contact-layout">
            <div className="draa-contact-context">
              <span className="draa-corp-section-label">How we can help</span>
              <h2>Start with your requirement—not a predefined package.</h2>
              <p>Choose the area closest to your need. We will review the context and connect you with the appropriate DRAA team.</p>

              <div className="draa-contact-paths">
                <article><Building2 size={21} /><span><strong>Institutional Solutions</strong>Content, academic advisory and digital learning projects.</span></article>
                <article><GraduationCap size={21} /><span><strong>Training &amp; Events</strong>Workshops, professional programmes and education events.</span></article>
                <article><Handshake size={21} /><span><strong>Partnerships</strong>Collaborations with institutions, experts and organisations.</span></article>
                <article><MapPin size={21} /><span><strong>Study in India Guidance</strong>Programme discovery and admission-readiness support.</span></article>
              </div>

              <div className="draa-contact-office">
                <MapPin size={20} />
                <div><strong>New Delhi Office</strong><p>Building No. 1, 3rd Floor, D Block, East of Kailash, New Delhi, Delhi 110065</p></div>
              </div>
            </div>

            <div className="draa-contact-form-card">
              <div className="draa-contact-form-heading">
                <span>Partnership &amp; service enquiry</span>
                <h2>Tell us how we can support you.</h2>
              </div>

              {status.type === 'success' ? (
                <div className="draa-contact-success" role="status">
                  <CheckCircle2 size={38} />
                  <h3>Enquiry received</h3>
                  <p>{status.message}</p>
                  <button type="button" onClick={() => setStatus({ type: 'idle' })}>Send another enquiry</button>
                </div>
              ) : (
                <form onSubmit={submitEnquiry} className="draa-contact-form">
                  <div className="draa-contact-form-row">
                    <label>Full name<input name="name" type="text" placeholder="Your name" required maxLength={100} /></label>
                    <label>Organisation<input name="organisation" type="text" placeholder="Institution or company" maxLength={120} /></label>
                  </div>
                  <div className="draa-contact-form-row">
                    <label>Email address<input name="email" type="email" placeholder="name@example.com" required /></label>
                    <label>Phone number<input name="phone" type="tel" placeholder="+91 9876543210" required pattern="\+?[1-9][0-9]{1,14}" /></label>
                  </div>
                  <label>Area of interest
                    <select name="subject" required defaultValue={requestedSubject} key={requestedSubject}>
                      <option value="" disabled>Select an enquiry type</option>
                      <option value="Educational Content & Publishing">Educational Content &amp; Publishing</option>
                      <option value="Professional Learning & Training">Professional Learning &amp; Training</option>
                      <option value="Educational Events">Educational Events</option>
                      <option value="Institutional Advisory">Institutional Advisory</option>
                      <option value="Digital Learning Solutions">Digital Learning Solutions</option>
                      <option value="Study in India Guidance">Study in India Guidance</option>
                      <option value="Partnership Opportunity">Partnership Opportunity</option>
                      <option value="General Enquiry">General Enquiry</option>
                    </select>
                  </label>
                  <label>Your requirement<textarea name="message" rows={6} placeholder="Briefly describe your objective, audience and expected outcome." required maxLength={1800} /></label>
                  <button type="submit" className="draa-contact-submit">
                    Prepare email <Send size={17} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className="draa-contact-next-step">
          <div className="draa-corp-shell">
            <span>What happens next?</span>
            <div><strong>01</strong><p>We review your requirement.</p></div>
            <ArrowRight size={19} />
            <div><strong>02</strong><p>The right DRAA team connects with you.</p></div>
            <ArrowRight size={19} />
            <div><strong>03</strong><p>We define the most suitable next step.</p></div>
          </div>
        </section>
      </main>

      <footer className="draa-corp-footer draa-contact-footer">
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
