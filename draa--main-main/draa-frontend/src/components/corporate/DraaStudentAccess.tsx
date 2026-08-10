import { FormEvent, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import DraaCorporateHeader from '../homes/home/DraaCorporateHeader';
import SEO from '../common/SEO';
import url from '../../url';
import './DraaStudentAccess.css';

type Mode = 'login' | 'register';
type Step = 'details' | 'otp';

export default function DraaStudentAccess() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [step, setStep] = useState<Step>('details');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');

  const saveUser = (user: any) => {
    localStorage.setItem('edudocs', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      phn: user.phn,
      token: user.token,
      role: 'student',
      createdAt: user.createdAt,
    }));
    window.dispatchEvent(new Event('auth-updated'));
    navigate('/study-in-india/dashboard');
  };

  const submitDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    const data = new FormData(event.currentTarget);
    const submittedEmail = String(data.get('email') || '').trim().toLowerCase();
    try {
      setLoading(true);
      if (mode === 'login') {
        const response = await fetch(`${url}/users/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: submittedEmail, password: data.get('password') }),
        });
        const result = await response.json();
        if (!response.ok || result.step !== 'OTP_REQUIRED') throw new Error(result.message || 'Unable to sign in.');
        setEmail(submittedEmail);
        setUserId(result.userId);
        setStep('otp');
        setMessage('A six-digit security code has been sent to your email.');
      } else {
        const response = await fetch(`${url}/users/send-registration-otp`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: data.get('name'), email: submittedEmail, phn: data.get('phone'), password: data.get('password') }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Unable to create your account.');
        setEmail(submittedEmail);
        setStep('otp');
        setMessage('A six-digit verification code has been sent to your email.');
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
    } finally { setLoading(false); }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      setLoading(true);
      const endpoint = mode === 'login' ? 'verify-otp' : 'verify-registration-otp';
      const payload = mode === 'login' ? { userId, otp: data.get('otp') } : { email, otp: data.get('otp') };
      const response = await fetch(`${url}/users/${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'The code could not be verified.');
      saveUser(result.user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The code could not be verified.');
    } finally { setLoading(false); }
  };

  const changeMode = (next: Mode) => {
    setMode(next); setStep('details'); setError(''); setMessage(''); setEmail(''); setUserId('');
  };

  return (
    <div className="draa-corp access-page">
      <SEO title="Student Account" siteName="DRAA" description="Sign in or create a DRAA student account for Study in India planning and education guidance." keywords="DRAA student login, Study in India account" ogImage="/brand/draa-mark.png" />
      <DraaCorporateHeader />
      <main className="access-main">
        <div className="draa-corp-shell access-layout">
          <section className="access-story">
            <Link to="/study-in-india" className="access-back"><ArrowLeft size={16} /> Back to Study in India</Link>
            <span className="access-eyebrow">DRAA student workspace</span>
            <h1>One account for a more organised education journey.</h1>
            <p>Build your planning profile, keep track of preparation and connect with DRAA when you need informed guidance.</p>
            <div className="access-benefits">
              <article><CheckCircle2 /><div><strong>Organise your preferences</strong><span>Keep your intended level, field and budget in one place.</span></div></article>
              <article><CheckCircle2 /><div><strong>Track readiness</strong><span>Work through documents and important application stages.</span></div></article>
              <article><CheckCircle2 /><div><strong>Request focused guidance</strong><span>Give counsellors useful context before a conversation.</span></div></article>
            </div>
            <div className="access-disclaimer"><ShieldCheck size={19} /><p>A DRAA account is not an official SII account and does not create a Government of India SII ID.</p></div>
          </section>

          <section className="access-card">
            <div className="access-brand"><img src="/brand/draa-mark.png" alt="" /><span><strong>DRAA</strong><small>Student account</small></span></div>
            {step === 'details' ? (
              <>
                <div className="access-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => changeMode('login')}>Sign in</button><button className={mode === 'register' ? 'active' : ''} onClick={() => changeMode('register')}>Create account</button></div>
                <div className="access-heading"><h2>{mode === 'login' ? 'Welcome back.' : 'Start your DRAA workspace.'}</h2><p>{mode === 'login' ? 'Use the email and password registered with your student account.' : 'Create an account using an email address you can verify.'}</p></div>
                <form className="access-form" onSubmit={submitDetails}>
                  {mode === 'register' && <label>Full name<div><UserRound size={18} /><input name="name" required maxLength={100} placeholder="Your full name" /></div></label>}
                  <label>Email address<div><Mail size={18} /><input name="email" type="email" required autoComplete="email" placeholder="name@example.com" /></div></label>
                  {mode === 'register' && <label>Phone number<div><UserRound size={18} /><input name="phone" type="tel" required pattern="\+?[0-9]{8,15}" placeholder="Country code and number" /></div></label>}
                  <label>Password<div><LockKeyhole size={18} /><input name="password" type={showPassword ? 'text' : 'password'} minLength={6} required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="Minimum 6 characters" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
                  {mode === 'login' && <Link className="access-forgot" to="/forgot-password">Forgot password?</Link>}
                  {error && <p className="access-error" role="alert">{error}</p>}
                  <button className="access-submit" disabled={loading}>{loading ? 'Please wait…' : <>{mode === 'login' ? 'Continue securely' : 'Create account'} <ArrowRight size={17} /></>}</button>
                </form>
              </>
            ) : (
              <div className="access-otp">
                <button className="access-otp-back" onClick={() => setStep('details')}><ArrowLeft size={16} /> Change details</button>
                <span className="access-otp-icon"><Mail size={25} /></span>
                <h2>Verify your email</h2>
                <p>{message}</p><strong>{email}</strong>
                <form onSubmit={verifyOtp}><label>Six-digit code<input name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus placeholder="000000" /></label>{error && <p className="access-error" role="alert">{error}</p>}<button className="access-submit" disabled={loading}>{loading ? 'Verifying…' : <>Verify and continue <ArrowRight size={17} /></>}</button></form>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
