import React, { useState, useEffect, useCallback, useRef } from'react';
import toast from '../../utils/toast';
import url from'../../url';

//  Enhanced Interfaces
interface InquiryPopupProps {
  visible: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  otp: string;
}

interface APIResponse {
  success: boolean;
  message: string;
  data?: any;
  code?: string;
  errors?: Array<{ field: string; message: string; value?: string }>;
  waitTime?: number;
  remainingAttempts?: number;
  retryAfter?: number;
}

interface SubmissionData {
  email: string;
  submittedAt: string;
  verified: boolean;
  inquiryId?: string;
  inquiredEmails?: string[]; //  NEW: Track all inquired emails
}

const isUserLoggedIn = (): boolean => {
  try {
    const userData = localStorage.getItem('edudocs');
    if (!userData) return false;

    const parsed = JSON.parse(userData);
    return Boolean(parsed?.token);
  } catch {
    return false;
  }
};


//  FIXED: InquiryPopup Component
const InquiryPopup: React.FC<InquiryPopupProps> = ({ visible, onClose, onSubmitSuccess }) => {
  //  ALL HOOKS AT TOP LEVEL
  const [step, setStep] = useState<'form' |'otp' |'success'>('form');
  const [formData, setFormData] = useState<FormData>({
    name:'',
    email:'',
    phone:'',
    otp:''
  });
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [apiError, setApiError] = useState<string>('');
  const [remainingAttempts, setRemainingAttempts] = useState<number>(5);
  const [resendCount, setResendCount] = useState<number>(0);

  // Refs
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);



  //  Countdown timer
  useEffect(() => {
    let timer: number;
    if (countdown > 0 && visible) {
      timer = window.setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, [countdown, visible]);

  //  Reset form when modal opens
  useEffect(() => {
    if (visible) {
      setStep('form');
      setFormData({ name:'', email:'', phone:'', otp:'' });
      setErrors({});
      setApiError('');
      setCountdown(0);
      setRemainingAttempts(5);
      setResendCount(0);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  //  Close on Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key ==='Escape' && visible) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow ='hidden';
    } else {
      document.body.style.overflow ='unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow ='unset';
    };
  }, [visible, onClose]);

  //  Handle input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    if (apiError) {
      setApiError('');
    }
  }, [errors, apiError]);

  //  API Call function
  const makeAPICall = useCallback(async (endpoint: string, body: any, method: string ='POST'): Promise<APIResponse> => {
    try {
      const response = await fetch(`${url}/admin/inquiry/${endpoint}`, {
        method,
        headers: {
'Content-Type':'application/json',
        },
        body: method ==='GET' ? undefined : JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 429) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message ||'Too many requests. Please try again later.');
        }

        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Server error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API call error (${endpoint}):`, error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network connection failed. Please check your internet connection.');
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Server temporarily unavailable. Please try again.');
    }
  }, []);

  //  Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g,''));
  };

  const validateName = (name: string): boolean => {
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name ='Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name ='Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name ='Name cannot exceed 50 characters';
    } else if (!validateName(formData.name)) {
      newErrors.name ='Name can only contain letters and spaces';
    }

    if (!formData.email.trim()) {
      newErrors.email ='Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email ='Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone ='Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone ='Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    setApiError('');
    return Object.keys(newErrors).length === 0;
  };

  //  Send OTP
  const sendOTP = useCallback(async () => {
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0] as keyof FormData;
      if (firstError ==='name') nameInputRef.current?.focus();
      else if (firstError ==='email') emailInputRef.current?.focus();
      else if (firstError ==='phone') phoneInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const response = await makeAPICall('send-otp', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        source:'popup'
      });

      if (response.success) {
        toast.success(response.message ||'OTP sent successfully to your email!');
        setStep('otp');
        setCountdown(response.data?.canResendAfter || 60);
        setResendCount(0);
        setRemainingAttempts(5);

        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 100);
      } else {
        if (response.code ==='EMAIL_ALREADY_EXISTS') {
          setErrors({ email:'An inquiry with this email already exists' });
          emailInputRef.current?.focus();
        } else if (response.code ==='VALIDATION_ERROR' && response.errors) {
          const validationErrors: Partial<FormData> = {};
          response.errors.forEach(error => {
            validationErrors[error.field as keyof FormData] = error.message;
          });
          setErrors(validationErrors);
        } else if (response.code ==='OTP_COOLDOWN_ACTIVE' || response.code ==='RATE_LIMIT_EXCEEDED') {
          const waitTime = response.waitTime || response.retryAfter || 60;
          setApiError(`Please wait ${waitTime} seconds before requesting a new OTP`);
          setCountdown(waitTime);
        } else {
          setApiError(response.message ||'Failed to send OTP. Please try again.');
        }
      }
    } catch (error: any) {
      console.error('Send OTP error:', error);
      setApiError(error.message ||'Network error. Please check your connection and try again.');
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, errors, makeAPICall]);

  //  Verify OTP and Submit
  const verifyOTPAndSubmit = useCallback(async () => {
    if (!formData.otp.trim()) {
      setErrors({ otp:'Please enter the OTP' });
      otpInputRef.current?.focus();
      return;
    }

    if (formData.otp.trim().length !== 6) {
      setErrors({ otp:'OTP must be exactly 6 digits' });
      otpInputRef.current?.focus();
      return;
    }

    if (!/^\d{6}$/.test(formData.otp.trim())) {
      setErrors({ otp:'OTP must contain only digits' });
      otpInputRef.current?.focus();
      return;
    }

    setOtpLoading(true);
    setApiError('');

    try {
      const response = await makeAPICall('verify-otp', {
        email: formData.email.trim().toLowerCase(),
        otp: formData.otp.trim()
      });

      if (response.success) {
        toast.success(response.message ||'Inquiry submitted successfully!');
        setStep('success');

        //  FIXED: Save to localStorage with email tracking
        const cleanEmail = formData.email.trim().toLowerCase();
        let submissionData: SubmissionData = {
          email: cleanEmail,
          submittedAt: new Date().toISOString(),
          verified: true,
          inquiryId: response.data?.inquiryId,
          inquiredEmails: [cleanEmail] //  NEW: Track inquired emails
        };

        //  Check if there's existing data
        const existingData = localStorage.getItem('inquirySubmitted');
        if (existingData) {
          try {
            const parsed = JSON.parse(existingData);
            if (parsed.inquiredEmails && Array.isArray(parsed.inquiredEmails)) {
              //  Merge emails and keep only unique ones
              submissionData.inquiredEmails = [...new Set([...parsed.inquiredEmails, cleanEmail])];
            }
          } catch (e) {
            console.error('Error parsing existing data:', e);
          }
        }

        localStorage.setItem('inquirySubmitted', JSON.stringify(submissionData));

        //  Analytics tracking
        if (typeof window !=='undefined' && (window as any).gtag) {
          (window as any).gtag('event','inquiry_submitted', {
            event_category:'engagement',
            event_label:'popup_inquiry',
            custom_parameters: {
              inquiry_id: response.data?.inquiryId,
              email_domain: formData.email.split('@')[1]
            }
          });
        }

        setTimeout(() => {
          onSubmitSuccess();
          onClose();
        }, 2500);
      } else {
        if (response.code ==='OTP_MISMATCH') {
          setRemainingAttempts(response.remainingAttempts || remainingAttempts - 1);
          setErrors({
            otp: `Invalid OTP. ${response.remainingAttempts || remainingAttempts - 1} attempts remaining.`
          });
        } else if (response.code ==='OTP_EXPIRED') {
          setApiError('OTP has expired. Please request a new OTP.');
          setStep('form');
        } else if (response.code ==='MAX_ATTEMPTS_EXCEEDED') {
          setApiError('Too many failed attempts. Please request a new OTP.');
          setStep('form');
        } else if (response.code ==='INQUIRY_NOT_FOUND') {
          setApiError('Session expired. Please restart the process.');
          setStep('form');
        } else {
          setApiError(response.message ||'Verification failed. Please try again.');
          setErrors({ otp:'Invalid OTP' });
        }

        otpInputRef.current?.focus();
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);
      setApiError(error.message ||'Network error. Please try again.');
      toast.error('Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  }, [formData, remainingAttempts, makeAPICall, onSubmitSuccess, onClose]);

  //  Resend OTP
  const resendOTP = useCallback(async () => {
    setOtpLoading(true);
    setApiError('');

    try {
      const response = await makeAPICall('resend-otp', {
        email: formData.email.trim().toLowerCase()
      });

      if (response.success) {
        toast.success(response.message ||'New OTP sent successfully!');
        setCountdown(response.data?.canResendAfter || 60);
        setResendCount(prev => prev + 1);
        setFormData(prev => ({ ...prev, otp:'' }));
        setErrors(prev => ({ ...prev, otp: undefined }));
        setRemainingAttempts(5);

        setTimeout(() => {
          otpInputRef.current?.focus();
        }, 100);
      } else {
        if (response.code ==='RESEND_COOLDOWN_ACTIVE' || response.code ==='RATE_LIMIT_EXCEEDED') {
          const waitTime = response.waitTime || response.retryAfter || 60;
          setApiError(`Please wait ${waitTime} seconds before requesting a new OTP`);
          setCountdown(waitTime);
        } else {
          setApiError(response.message ||'Failed to resend OTP');
        }
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
      setApiError(error.message ||'Failed to resend OTP');
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  }, [formData.email, makeAPICall]);

  //  Handle key press
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key ==='Enter') {
      event.preventDefault();
      if (step ==='form') {
        sendOTP();
      } else if (step ==='otp') {
        verifyOTPAndSubmit();
      }
    }
  }, [step, sendOTP, verifyOTPAndSubmit]);

  //  CONDITIONAL RETURN AFTER ALL HOOKS
  if (!visible) {
    return null;
  }

  return (
    <div style={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        style={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
        onKeyPress={handleKeyPress}
      >
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerText}>
            {step ==='form' &&' Student Inquiry'}
            {step ==='otp' &&' Email Verification'}
            {step ==='success' &&' Success!'}
          </h2>
          <button
            onClick={onClose}
            style={styles.closeButton}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        {/* Step Indicator */}
        <div style={styles.stepIndicator}>
          <div style={styles.stepContainer}>
            <div style={{
              ...styles.step,
              ...(step ==='form' ? styles.activeStep : step ==='otp' || step ==='success' ? styles.completedStep : {})
            }}>
              {step ==='otp' || step ==='success' ?'' :'1'}
            </div>
            <span style={styles.stepLabel}>Details</span>
          </div>
          <div style={styles.stepLine}></div>
          <div style={styles.stepContainer}>
            <div style={{
              ...styles.step,
              ...(step ==='otp' ? styles.activeStep : step ==='success' ? styles.completedStep : {})
            }}>
              {step ==='success' ?'' :'2'}
            </div>
            <span style={styles.stepLabel}>Verify</span>
          </div>
          <div style={styles.stepLine}></div>
          <div style={styles.stepContainer}>
            <div style={{
              ...styles.step,
              ...(step ==='success' ? styles.activeStep : {})
            }}>
              3
            </div>
            <span style={styles.stepLabel}>Success</span>
          </div>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div style={styles.apiError}>
            <span style={styles.errorIcon}></span>
            {apiError}
          </div>
        )}

        {/* Body Content */}
        <div style={styles.body}>
          {step ==='form' && (
            <>
              <p style={styles.bodyText}>
                Interested in our courses? Let us help you! 
              </p>

              <div style={styles.formGroup}>
                <input
                  ref={nameInputRef}
                  type="text"
                  placeholder="Your Full Name *"
                  style={{
                    ...styles.input,
                    ...(errors.name ? styles.inputError : {})
                  }}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  maxLength={50}
                  disabled={loading}
                  autoComplete="name"
                />
                {errors.name && <span style={styles.errorText}>{errors.name}</span>}
              </div>

              <div style={styles.formGroup}>
                <input
                  ref={emailInputRef}
                  type="email"
                  placeholder="Your Email Address *"
                  style={{
                    ...styles.input,
                    ...(errors.email ? styles.inputError : {})
                  }}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.formGroup}>
                <input
                  ref={phoneInputRef}
                  type="tel"
                  placeholder="Your Phone Number *"
                  style={{
                    ...styles.input,
                    ...(errors.phone ? styles.inputError : {})
                  }}
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value.replace(/\D/g,'').slice(0, 10))}
                  maxLength={10}
                  disabled={loading}
                  autoComplete="tel"
                />
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>

              <div style={styles.infoText}>
                 We'll contact you within 24 hours with personalized course recommendations.
              </div>
            </>
          )}

          {step ==='otp' && (
            <>
              <p style={styles.bodyText}>
                We've sent a 6-digit verification code to<br />
                <strong style={styles.emailHighlight}>{formData.email}</strong>
              </p>

              <div style={styles.formGroup}>
                <input
                  ref={otpInputRef}
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  style={{
                    ...styles.input,
                    ...styles.otpInput,
                    ...(errors.otp ? styles.inputError : {})
                  }}
                  value={formData.otp}
                  onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g,'').slice(0, 6))}
                  maxLength={6}
                  disabled={otpLoading}
                  autoComplete="one-time-code"
                />
                {errors.otp && <span style={styles.errorText}>{errors.otp}</span>}
              </div>

              <div style={styles.otpInfo}>
                <div style={styles.resendSection}>
                  {countdown > 0 ? (
                    <span style={styles.countdownText}>
                       Resend OTP in {countdown}s
                    </span>
                  ) : (
                    <button
                      onClick={resendOTP}
                      disabled={otpLoading || resendCount >= 5}
                      style={{
                        ...styles.resendButton,
                        ...(resendCount >= 5 ? styles.disabledButton : {})
                      }}
                    >
                      {otpLoading ?' Resending...' : resendCount >= 5 ?'Max resends reached' :' Resend OTP'}
                    </button>
                  )}
                </div>

                <div style={styles.attemptsInfo}>
                  {remainingAttempts < 5 && (
                    <span style={styles.attemptsText}>
                      {remainingAttempts} attempts remaining
                    </span>
                  )}
                  {resendCount > 0 && (
                    <span style={styles.resendInfo}>
                      Resent {resendCount} time{resendCount > 1 ?'s' :''}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}

          {step ==='success' && (
            <div style={styles.successContent}>
              <div style={styles.successAnimation}>
                <div style={styles.successIcon}></div>
                <div style={styles.checkmark}></div>
              </div>
              <h3 style={styles.successTitle}>Thank You!</h3>
              <p style={styles.successText}>
                Your inquiry has been submitted successfully!<br />
                <strong>Our education counselor will contact you within 24 hours.</strong>
              </p>

              <div style={styles.nextSteps}>
                <h4 style={styles.nextStepsTitle}>What's Next?</h4>
                <ul style={styles.nextStepsList}>
                  <li> Personal consultation call</li>
                  <li> Discuss your learning goals</li>
                  <li> Get course recommendations</li>
                  <li> Start your learning journey</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          {step ==='form' && (
            <button
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {})
              }}
              onClick={sendOTP}
              disabled={loading}
            >
              {loading ?' Sending OTP...' :' Send Verification Code'}
            </button>
          )}

          {step ==='otp' && (
            <div style={styles.buttonGroup}>
              <button
                style={styles.backButton}
                onClick={() => setStep('form')}
                disabled={otpLoading}
              >
                 Back
              </button>
              <button
                style={{
                  ...styles.button,
                  ...(otpLoading ? styles.buttonDisabled : {})
                }}
                onClick={verifyOTPAndSubmit}
                disabled={otpLoading}
              >
                {otpLoading ?' Verifying...' :' Verify & Submit'}
              </button>
            </div>
          )}

          {step ==='success' && (
            <div style={styles.successFooter}>
              <p style={styles.footerText}>
                Check your email for confirmation details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

//  FIXED: Main Component - Popup shows ONLY ONCE per email
const InquiryPopUp: React.FC = () => {
  //  ALL HOOKS AT TOP LEVEL
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [showFloatingButton, setShowFloatingButton] = useState<boolean>(true);
  const [inquiredEmails, setInquiredEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkSubmissionStatus = () => {
      try {
        //  1. HARD BLOCK  Logged in users NEVER see popup
        if (isUserLoggedIn()) {
          setHasSubmitted(true);
          setShowFloatingButton(false);
          return;
        }

        //  2. Check inquiry submission
        const submissionData = localStorage.getItem('inquirySubmitted');

        if (submissionData) {
          const data = JSON.parse(submissionData);

          if (data.inquiredEmails && Array.isArray(data.inquiredEmails)) {
            setInquiredEmails(new Set(data.inquiredEmails));
          }

          if (data.verified && data.submittedAt && data.email) {
            const submissionDate = new Date(data.submittedAt);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (submissionDate > thirtyDaysAgo) {
              setHasSubmitted(true);
              setShowFloatingButton(false);
              return;
            }
          }
        }

        //  3. Otherwise allow popup
        setShowFloatingButton(true);
      } catch (error) {
        console.error('Inquiry popup check failed:', error);
        setShowFloatingButton(false);
      }
    };

    checkSubmissionStatus();
  }, []);


  //  Auto-open logic - don't open if already submitted
  useEffect(() => {
    if (hasSubmitted || !showFloatingButton) return;

    let initialTimeout: number;
    let intervalTimeout: number;

    initialTimeout = window.setTimeout(() => {
      if (!hasSubmitted && !modalVisible) {
        setModalVisible(true);
      }
    }, 15000);

    intervalTimeout = window.setInterval(() => {
      if (!modalVisible && !hasSubmitted) {
        setModalVisible(true);
      }
    }, 120000);

    return () => {
      window.clearTimeout(initialTimeout);
      window.clearInterval(intervalTimeout);
    };
  }, [modalVisible, hasSubmitted, showFloatingButton]);

  //  Callbacks
  const handleClose = useCallback(() => {
    setModalVisible(false);
  }, []);

  //  FIXED: Handle successful submission
  const handleSubmitSuccess = useCallback(() => {
    //  Mark as submitted so popup won't appear again
    setHasSubmitted(true);
    setShowFloatingButton(false);
    setModalVisible(false);
  }, []);

  //  CONDITIONAL RETURN - Don't render if already submitted
  if (hasSubmitted || !showFloatingButton) {
    return null;
  }

  return (
    <>
      <div style={styles.floatingContainer}>
        <button
          style={styles.floatingButton}
          onClick={() => setModalVisible(true)}
          title="Need Help? Get Free Consultation!"
          aria-label="Open inquiry form for free consultation"
        >
          <span style={styles.floatingIcon}></span>
          <span style={styles.floatingPulse}></span>
        </button>
        <div style={styles.floatingTooltip}>
          Need Help? Click for Free Consultation!
        </div>
      </div>

      <InquiryPopup
        visible={modalVisible}
        onClose={handleClose}
        onSubmitSuccess={handleSubmitSuccess}
      />
    </>
  );
};

//  Styles (remaining same as before)
const styles = {
  overlay: {
    position:'fixed' as const,
    top: 0,
    left: 0,
    width:'100%',
    height:'100%',
    backgroundColor:'rgba(0, 0, 0, 0.7)',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    zIndex: 10000,
    backdropFilter:'blur(8px)',
  },
  modalContainer: {
    backgroundColor:'white',
    borderRadius:'20px',
    width:'90%',
    maxWidth:'500px',
    maxHeight:'90vh',
    display:'flex',
    flexDirection:'column',
    overflow:'hidden',
  },
  header: {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    padding:'24px 28px',
    background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color:'white',
    flexShrink: 0,              //  lock height
  },

  headerText: {
    fontSize:'20px',
    fontWeight:'700',
    margin: 0,
    letterSpacing:'-0.02em',
  },
  closeButton: {
    background:'rgba(255, 255, 255, 0.15)',
    backdropFilter:'blur(10px)',
    border:'none',
    fontSize:'28px',
    color:'white',
    cursor:'pointer',
    width:'40px',
    height:'40px',
    display:'flex',
    justifyContent:'center',
    alignItems:'center',
    borderRadius:'50%',
    transition:'all 0.2s ease',
  },
  stepIndicator: {
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    padding:'24px',
    background:'linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)',
    gap:'8px',
  },
  stepContainer: {
    display:'flex',
    flexDirection:'column' as const,
    alignItems:'center',
    gap:'8px',
  },
  step: {
    width:'36px',
    height:'36px',
    borderRadius:'50%',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontSize:'14px',
    fontWeight:'700',
    backgroundColor:'#e2e8f0',
    color:'#64748b',
    transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border:'2px solid transparent',
  },
  stepLabel: {
    fontSize:'12px',
    fontWeight:'600',
    color:'#64748b',
    textAlign:'center' as const,
  },
  activeStep: {
    backgroundColor:'#667eea',
    color:'white',
    transform:'scale(1.1)',
    boxShadow:'0 4px 12px rgba(102, 126, 234, 0.4)',
  },
  completedStep: {
    backgroundColor:'#10b981',
    color:'white',
    transform:'scale(1.05)',
  },
  stepLine: {
    width:'60px',
    height:'2px',
    backgroundColor:'#e2e8f0',
    margin:'0 12px',
    borderRadius:'1px',
  },
  apiError: {
    margin:'0 24px',
    padding:'16px',
    backgroundColor:'#fef2f2',
    border:'1px solid #fecaca',
    borderRadius:'12px',
    color:'#dc2626',
    fontSize:'14px',
    display:'flex',
    alignItems:'center',
    gap:'8px',
    fontWeight:'500',
  },
  errorIcon: {
    fontSize:'16px',
  },
  body: {
    padding:'28px',
    overflowY:'auto',
    flex: 1,                    //  takes remaining height
  },
  bodyText: {
    fontSize:'16px',
    color:'#4b5563',
    textAlign:'center' as const,
    lineHeight:'26px',
    margin:'0 0 28px 0',
    fontWeight:'400',
  },
  formGroup: {
    marginBottom:'24px',
    position:'relative' as const,
  },
  input: {
    width:'100%',
    padding:'16px 20px',
    border:'2px solid #e5e7eb',
    borderRadius:'12px',
    fontSize:'16px',
    boxSizing:'border-box' as const,
    transition:'all 0.3s ease',
    fontFamily:'inherit',
    backgroundColor:'#ffffff',
    outline:'none',
  },
  inputError: {
    borderColor:'#ef4444',
    backgroundColor:'#fef2f2',
    boxShadow:'0 0 0 3px rgba(239, 68, 68, 0.1)',
  },
  otpInput: {
    textAlign:'center' as const,
    fontSize:'28px',
    letterSpacing:'12px',
    fontWeight:'700',
    fontFamily:'monospace',
  },
  errorText: {
    color:'#ef4444',
    fontSize:'13px',
    marginTop:'6px',
    display:'block',
    fontWeight:'500',
  },
  emailHighlight: {
    color:'#667eea',
    fontSize:'16px',
  },
  otpInfo: {
    marginTop:'20px',
  },
  resendSection: {
    textAlign:'center' as const,
    marginBottom:'12px',
  },
  countdownText: {
    color:'#6b7280',
    fontSize:'14px',
    fontWeight:'500',
  },
  resendButton: {
    background:'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border:'none',
    color:'white',
    fontSize:'14px',
    fontWeight:'600',
    cursor:'pointer',
    padding:'10px 20px',
    borderRadius:'8px',
    transition:'all 0.2s ease',
  },
  disabledButton: {
    background:'#9ca3af',
    cursor:'not-allowed',
    opacity: 0.6,
  },
  attemptsInfo: {
    display:'flex',
    justifyContent:'space-between',
    alignItems:'center',
    fontSize:'12px',
    color:'#6b7280',
  },
  attemptsText: {
    color:'#f59e0b',
    fontWeight:'600',
  },
  resendInfo: {
    color:'#6b7280',
  },
  infoText: {
    fontSize:'13px',
    color:'#6b7280',
    textAlign:'center' as const,
    marginTop:'20px',
    padding:'12px',
    backgroundColor:'#f8fafc',
    borderRadius:'8px',
    border:'1px solid #e2e8f0',
  },
  successContent: {
    textAlign:'center' as const,
    padding:'20px 0',
  },
  successAnimation: {
    position:'relative' as const,
    display:'inline-block',
    marginBottom:'20px',
  },
  successIcon: {
    fontSize:'64px',
  },
  checkmark: {
    position:'absolute' as const,
    top:'-10px',
    right:'-10px',
    fontSize:'32px',
  },
  successTitle: {
    fontSize:'28px',
    fontWeight:'700',
    color:'#059669',
    margin:'0 0 16px 0',
    letterSpacing:'-0.02em',
  },
  successText: {
    fontSize:'16px',
    color:'#4b5563',
    lineHeight:'26px',
    margin:'0 0 24px 0',
  },
  nextSteps: {
    backgroundColor:'#f0fdf4',
    border:'1px solid #bbf7d0',
    borderRadius:'12px',
    padding:'20px',
    marginTop:'20px',
    textAlign:'left' as const,
  },
  nextStepsTitle: {
    fontSize:'16px',
    fontWeight:'700',
    color:'#059669',
    margin:'0 0 12px 0',
  },
  nextStepsList: {
    margin: 0,
    paddingLeft:'20px',
    color:'#065f46',
  },
  footer: {
    padding:'24px 28px',
    borderTop:'1px solid #f3f4f6',
    backgroundColor:'#fafbfc',
    flexShrink: 0,              //  VERY IMPORTANT
  },
  button: {
    backgroundColor:'#667eea',
    color:'white',
    padding:'16px 28px',
    border:'none',
    borderRadius:'12px',
    fontSize:'16px',
    fontWeight:'700',
    cursor:'pointer',
    width:'100%',
    transition:'all 0.2s ease',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    gap:'8px',
    boxShadow:'0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  buttonDisabled: {
    backgroundColor:'#9ca3af',
    cursor:'not-allowed',
    opacity: 0.7,
  },
  buttonGroup: {
    display:'flex',
    gap:'16px',
  },
  backButton: {
    backgroundColor:'transparent',
    color:'#6b7280',
    border:'2px solid #e5e7eb',
    padding:'16px 24px',
    borderRadius:'12px',
    fontSize:'16px',
    fontWeight:'600',
    cursor:'pointer',
    transition:'all 0.2s ease',
    flex:'0 0 auto',
  },
  successFooter: {
    textAlign:'center' as const,
    padding:'12px 0',
  },
  footerText: {
    fontSize:'14px',
    color:'#6b7280',
    margin: 0,
    fontStyle:'italic',
  },
  floatingContainer: {
    position:'fixed' as const,
    bottom:'28px',
    right:'28px',
    zIndex: 9999,
  },
  floatingButton: {
    backgroundColor:'#667eea',
    color:'white',
    border:'none',
    borderRadius:'50%',
    width:'68px',
    height:'68px',
    fontSize:'28px',
    cursor:'pointer',
    boxShadow:'0 8px 32px rgba(102, 126, 234, 0.4)',
    transition:'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    position:'relative' as const,
  },
  floatingIcon: {
    position:'relative' as const,
    zIndex: 2,
  },
  floatingPulse: {
    position:'absolute' as const,
    top: 0,
    left: 0,
    width:'100%',
    height:'100%',
    borderRadius:'50%',
    backgroundColor:'#667eea',
    opacity: 0.6,
  },
  floatingTooltip: {
    position:'absolute' as const,
    bottom:'80px',
    right:'0',
    backgroundColor:'#1f2937',
    color:'white',
    padding:'8px 12px',
    borderRadius:'8px',
    fontSize:'12px',
    fontWeight:'600',
    whiteSpace:'nowrap' as const,
    opacity: 0,
    transform:'translateY(10px)',
    transition:'all 0.3s ease',
    pointerEvents:'none' as const,
    boxShadow:'0 4px 12px rgba(0, 0, 0, 0.3)',
  },
};

export default InquiryPopUp;
