import React, { useState, useEffect } from"react";
import toast from '../../utils/toast';
import { useNavigate, Link } from"react-router-dom";
import axios from"axios";
import url from"../../url";
import OtpInput from"../common/OtpInput";
import usePageTitle from '../../hooks/usePageTitle';

export default function TeacherForgotPassword() {
  usePageTitle('Forgot Password | Teacher');
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' |'verify' |'success'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [countdown]);

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue.trim());
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email:'Email is required' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email:'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/teachers/send-forgot-password-otp`,
        { temail: email.trim().toLowerCase() }
      );

      if (response.data.success) {
        toast.success('Reset code sent to your email!');
        setStep('verify');
        setCountdown(900);
        setResetCode('');
      } else {
        toast.error(response.data.message ||'Failed to send reset code');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message ||'Error sending reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrors({});

    const newErrors: any = {};

    if (!resetCode.trim()) {
      newErrors.resetCode ='Reset code is required';
    } else if (resetCode.length !== 6 || !/^\d{6}$/.test(resetCode)) {
      newErrors.resetCode ='Reset code must be 6 digits';
    }

    if (!newPassword) {
      newErrors.newPassword ='New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword ='Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword ='Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword ='Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/teachers/verify-forgot-password-otp`,
        {
          temail: email.trim().toLowerCase(),
          resetCode: resetCode.trim(),
          newPassword: newPassword
        }
      );

      if (response.data.success) {
        toast.success('Password reset successfully!');
        setStep('success');

        setTimeout(() => {
          navigate('/teacher-login');
        }, 2000);
      } else {
        toast.error(response.data.message ||'Failed to reset password');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message ||'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  // Logic: Auto-submit on 6-digit OTP and valid passwords (NEW)
  useEffect(() => {
    if (resetCode.length === 6 && newPassword.length >= 8 && newPassword === confirmPassword && step ==='verify') {
      handleResetPassword();
    }
  }, [resetCode, newPassword, confirmPassword, step]);

  const handleResendResetCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${url}/teachers/resend-forgot-password-otp`,
        { temail: email.trim().toLowerCase() }
      );

      if (response.data.success) {
        toast.success('New reset code sent!');
        setCountdown(900);
        setResetCode('');
      } else {
        toast.error(response.data.message ||'Failed to resend');
      }
    } catch (error: any) {
      toast.error('Error resending reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    setStep('email');
    setResetCode('');
    setNewPassword('');
    setConfirmPassword('');
    setCountdown(0);
    setErrors({});
  };

  return (
    <div style={{
      minHeight:'100vh',
      background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding:'40px 20px',
      display:'flex',
      alignItems:'center',
      justifyContent:'center'
    }}>
      <div style={{ width:'100%', maxWidth: 500 }} className="card">
        <div style={{ padding:'30px' }}>
          <h2 style={{ textAlign:'center', marginBottom:'10px' }}>
            {step ==='email' &&' Reset Your Password'}
            {step ==='verify' &&' Verify Reset Code'}
            {step ==='success' &&' Password Reset Successfully'}
          </h2>

          {/* STEP 1: Email */}
          {step ==='email' && (
            <form onSubmit={handleSendResetCode}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight:'600', display:'block', marginBottom:'8px' }}>Email Address *</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email:'' });
                  }}
                  style={{
                    width:'100%',
                    padding:'12px',
                    border: errors.email ?'1px solid #ff4d4f' :'1px solid #d9d9d9',
                    borderRadius:'6px',
                    fontSize:'14px'
                  }}
                  disabled={loading}
                />
                {errors.email && <span style={{ color:'#dc2626', fontSize:'12px' }}>{errors.email}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width:'100%',
                  padding:'12px',
                  background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color:'white',
                  border:'none',
                  borderRadius:'6px',
                  fontSize:'16px',
                  fontWeight:'bold',
                  cursor: loading ?'not-allowed' :'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ?'Sending...' :'Send Reset Code'}
              </button>
            </form>
          )}

          {/* STEP 2: Verify */}
          {step ==='verify' && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight:'600', display:'block', marginBottom:'8px' }}>Reset Code *</label>
                <OtpInput
                  value={resetCode}
                  onChange={(val) => {
                    setResetCode(val);
                    if (errors.resetCode) setErrors({ ...errors, resetCode:'' });
                  }}
                  disabled={loading}
                  length={6}
                />
                {errors.resetCode && <span style={{ color:'#dc2626', display:'block', marginTop:'8px', fontSize:'12px' }}>{errors.resetCode}</span>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight:'600', display:'block', marginBottom:'8px' }}>New Password *</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors({ ...errors, newPassword:'' });
                  }}
                  style={{
                    width:'100%',
                    padding:'12px',
                    border: errors.newPassword ?'1px solid #ff4d4f' :'1px solid #d9d9d9',
                    borderRadius:'6px',
                    fontSize:'14px'
                  }}
                  disabled={loading}
                />
                {errors.newPassword && <span style={{ color:'#dc2626', fontSize:'12px' }}>{errors.newPassword}</span>}
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ fontWeight:'600', display:'block', marginBottom:'8px' }}>Confirm Password *</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword:'' });
                  }}
                  style={{
                    width:'100%',
                    padding:'12px',
                    border: errors.confirmPassword ?'1px solid #ff4d4f' :'1px solid #d9d9d9',
                    borderRadius:'6px',
                    fontSize:'14px'
                  }}
                  disabled={loading}
                />
                {errors.confirmPassword && <span style={{ color:'#dc2626', fontSize:'12px' }}>{errors.confirmPassword}</span>}
              </div>

              <div style={{ textAlign:'center', marginBottom: 16 }}>
                {countdown > 0 ? (
                  <p style={{ color:'#ff7a00', fontWeight:'bold' }}>
                    Code expires in {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2,'0')}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendResetCode}
                    disabled={loading}
                    style={{
                      background:'#f5f5f5',
                      color:'#1890ff',
                      border:'1px solid #1890ff',
                      padding:'8px 16px',
                      borderRadius:'6px',
                      cursor: loading ?'not-allowed' :'pointer'
                    }}
                  >
                    Resend Code
                  </button>
                )}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <button
                  type="button"
                  onClick={handleGoBack}
                  disabled={loading}
                  style={{
                    padding:'12px',
                    background:'#f5f5f5',
                    border:'1px solid #d9d9d9',
                    borderRadius:'6px',
                    cursor:'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding:'12px',
                    background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color:'white',
                    border:'none',
                    borderRadius:'6px',
                    cursor: loading ?'not-allowed' :'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ?'Resetting...' :'Reset Password'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success */}
          {step ==='success' && (
            <div style={{ textAlign:'center', padding:'30px 0' }}>
              <div style={{ fontSize:'64px', marginBottom:'20px' }}></div>
              <h3 style={{ color:'#059669', fontSize:'24px', marginBottom:'10px' }}>
                Password Reset Successfully!
              </h3>
              <p style={{ color:'#4b5563', marginBottom:'30px' }}>
                You can now login with your new password.
              </p>
              <Link
                to="/teacher-login"
                style={{
                  display:'inline-block',
                  background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color:'white',
                  padding:'12px 30px',
                  borderRadius:'6px',
                  textDecoration:'none',
                  fontWeight:'bold'
                }}
              >
                Go to Login
              </Link>
            </div>
          )}

          <div style={{ textAlign:'center', marginTop:'20px' }}>
            {step !=='success' && (
              <>
                <p>Remember your password? <Link to="/teacher-login" style={{ color:'#1890ff', fontWeight:'bold' }}>Login here</Link></p>
                <p>Don't have an account? <Link to="/teacher-register" style={{ color:'#1890ff', fontWeight:'bold' }}>Register here</Link></p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
