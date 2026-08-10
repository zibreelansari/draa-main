import React, { useState, useEffect } from"react";
import toast from '../../utils/toast';
import { useNavigate, Link } from"react-router-dom";
import axios from"axios";
import { 
  ChevronRight, 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  CheckCircle2,
  Clock
} from"lucide-react";
import url from"../../url";
import"./ForgotPassword.css";
import OtpInput from"../common/OtpInput";
import usePageTitle from '../../hooks/usePageTitle';

export default function ForgotPassword() {
  usePageTitle('Forgot Password | Draa');
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' |'verify' |'reset'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<any>({});

  // Logic: Countdown timer (Maintained)
  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => { if (timer) window.clearTimeout(timer); };
  }, [countdown]);

  // Logic: Prevent logged-in users (Maintained)
  useEffect(() => {
    if (localStorage.getItem('edudocs')) {
      toast.warning("You are already logged in!");
      navigate('/');
    }
  }, [navigate]);

  // Logic: Step 1 Send Code (Maintained)
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setErrors({ email:'Email is required' });
    
    setLoading(true);
    try {
      const res = await axios.post(`${url}/users/send-forgot-password-otp`, { email: email.trim().toLowerCase() });
      if (res.data.success) {
        toast.success('Reset code sent to your email!');
        setStep('verify');
        setCountdown(900);
        setResetCode('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message ||'Error sending code');
    } finally { setLoading(false); }
  };

  // Logic: Step 2 Reset (Maintained)
  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newPassword !== confirmPassword) return setErrors({ confirmPassword:'Passwords do not match' });

    setLoading(true);
    try {
      const res = await axios.post(`${url}/users/verify-forgot-password-otp`, {
        email: email.trim().toLowerCase(),
        resetCode: resetCode.trim(),
        newPassword
      });

      if (res.data.success) {
        toast.success('Password reset successfully!');
        setStep('reset');
        setTimeout(() => navigate('/student-login'), 3000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message ||'Verification failed');
    } finally { setLoading(false); }
  };

  // Logic: Auto-submit on 6-digit OTP and valid passwords (NEW)
  useEffect(() => {
    if (resetCode.length === 6 && newPassword && confirmPassword && step ==='verify') {
      if (newPassword === confirmPassword) {
        handleResetPassword();
      }
    }
  }, [resetCode, newPassword, confirmPassword, step]);

  return (
    <main className="auth-marketplace-page">
      <div className="container">
        
        {/* BREADCRUMB */}
        <nav className="figma-breadcrumb">
          <Link to="/">Home</Link> <ChevronRight size={14} /> 
          <span className="active">Reset Password</span>
        </nav>

        <div className="auth-card-container">
          <div className="auth-card-figma">
            
            {/* CARD HEADER */}
            <header className="auth-header">
              <div className="auth-icon-box">
                {step ==='email' && <Mail size={28} />}
                {step ==='verify' && <KeyRound size={28} />}
                {step ==='reset' && <CheckCircle2 size={28} />}
              </div>
              <h1>
                {step ==='email' &&'Reset Password'}
                {step ==='verify' &&'Verify Code'}
                {step ==='reset' &&'Success!'}
              </h1>
              <p>
                {step ==='email' &&"Enter your email to receive a password reset code."}
                {step ==='verify' && `We've sent a 6-digit code to ${email}`}
                {step ==='reset' &&"Your password has been successfully updated."}
              </p>
            </header>

            {/* STEP 1: EMAIL */}
            {step ==='email' && (
              <form onSubmit={handleSendResetCode} className="figma-auth-form">
                <div className="auth-input-group">
                  <label>Email Address</label>
                  <div className="input-with-icon">
                    <Mail size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com" 
                      required 
                    />
                  </div>
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={20} /> :"Send Reset Code"}
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            )}

            {/* STEP 2: VERIFY & RESET */}
            {step ==='verify' && (
              <form onSubmit={handleResetPassword} className="figma-auth-form">
                <div className="auth-input-group">
                  <label>6-Digit Reset Code</label>
                  <OtpInput
                    value={resetCode}
                    onChange={setResetCode}
                    disabled={loading}
                    length={6}
                  />
                </div>

                <div className="auth-input-group">
                  <label>New Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder=""
                      required 
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label>Confirm Password</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder=""
                      required 
                    />
                  </div>
                  {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                </div>

                <div className="timer-resend-box">
                  {countdown > 0 ? (
                    <div className="countdown-pill">
                      <Clock size={14} /> <span>Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2,'0')}</span>
                    </div>
                  ) : (
                    <button type="button" className="resend-link" onClick={() => {}}>Resend Code</button>
                  )}
                </div>

                <button className="btn-auth-primary" type="submit" disabled={loading}>
                  {loading ? <Loader2 className="spinner" size={20} /> :"Update Password"}
                  {!loading && <ShieldCheck size={18} />}
                </button>

                <button type="button" className="btn-back-link" onClick={() => { setStep('email'); setResetCode(''); }}>
                  <ArrowLeft size={16} /> Back to email
                </button>
              </form>
            )}

            {/* STEP 3: SUCCESS */}
            {step ==='reset' && (
              <div className="auth-success-screen">
                <div className="success-banner">
                  <CheckCircle2 size={48} />
                  <p>Redirecting to login in 3 seconds...</p>
                </div>
                <Link to="/student-login" className="btn-auth-primary">
                  Sign In Now <ArrowRight size={18} />
                </Link>
              </div>
            )}

            <footer className="auth-footer">
              <p>Remember your password? <Link to="/student-login">Sign In</Link></p>
            </footer>
          </div>
        </div>

      </div>
    </main>
  );
}