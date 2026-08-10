import React, { useState } from'react';
import { X, Download, Loader2, ArrowLeft } from'lucide-react';
import toast from'../../utils/toast';
import axios from'axios';
import url from'../../url';
import { getStoredUser, isAuthenticated } from'../../utils/global_auth';
import'./DownloadPopupModal.css';

interface DownloadPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  resourceTitle: string;
  resourceType?: string;
}

const DownloadPopupModal: React.FC<DownloadPopupModalProps> = ({ isOpen, onClose, targetUrl, resourceTitle, resourceType ='Job Notification' }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  React.useEffect(() => {
    if (isOpen && isAuthenticated()) {
      const user = getStoredUser();
      if (user) {
        setName(user.name ||'');
        setPhone(user.phone || user.phn ||'');
      }
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) {
      setOtp('');
      setOtpSent(false);
      setResendCooldown(0);
      setSendingOtp(false);
    }
  }, [isOpen]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      return toast.error('Please fill in Name and Phone Number.');
    }
    if (phone.length < 10) {
      return toast.error('Please enter a valid 10-digit phone number.');
    }

    setSendingOtp(true);
    try {
      const response = await axios.post(`${url}/free-resources/send-otp`, {
        name,
        phone
      });
      if (response.data.success) {
        toast.success('OTP sent successfully. Check your terminal/logs.');
        setOtpSent(true);
        setResendCooldown(60); // 60 seconds resend cooldown
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message ||'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      return toast.error('Please fill in all fields.');
    }
    if (!otp) {
      return toast.error('Please enter the OTP sent to your phone.');
    }

    setLoading(true);
    // Open window synchronously to avoid popup blockers
    const tempWindow = window.open('about:blank','_blank');
    const finalUrl = targetUrl.startsWith('http') ? targetUrl : `${url}/${targetUrl}`;

    try {
      const response = await axios.post(`${url}/free-resources/verify-otp`, {
        name,
        phone,
        otp,
        resource_type: resourceType,
        resource_title: resourceTitle
      });
      if (response.data.success) {
        toast.success('Phone verified! Download starting...');
        if (tempWindow) tempWindow.location.href = finalUrl;
        else window.location.href = finalUrl; // Fallback
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message ||'Verification failed. Please try again.');
      if (tempWindow) tempWindow.close(); // Close temp window since verification failed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="miui-modal-overlay" onClick={onClose}>
      <div className="miui-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="miui-modal-close" onClick={onClose}><X size={20} /></button>
        
        {otpSent && (
          <button className="miui-modal-back" onClick={() => setOtpSent(false)} title="Change Details">
            <ArrowLeft size={18} />
          </button>
        )}

        <div className="miui-modal-header">
          <div className="icon-circle">
            <Download size={24} color="#bd7b20" />
          </div>
          <h2>Free Resource Access</h2>
          {otpSent ? (
            <p>Please enter the 6-digit OTP code sent to phone <strong>+91 {phone}</strong> to verify and start downloading.</p>
          ) : (
            <p>Please enter your details to continue downloading <strong>{resourceTitle}</strong></p>
          )}
        </div>

        {!otpSent ? (
          <form className="miui-modal-form">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="Enter your name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="input-group">
              <label>Phone Number</label>
              <input 
                type="tel" 
                placeholder="e.g. 9876543210" 
                maxLength={10}
                value={phone} 
                onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))} 
                required 
              />
            </div>

            <button 
              type="button" 
              onClick={handleSendOtp} 
              className="miui-btn-primary" 
              disabled={sendingOtp || !name || phone.length < 10}
            >
              {sendingOtp ? <Loader2 className="spinner" size={18} /> :'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="miui-modal-form">
            <div className="verified-details-summary">
              <div><strong>Name:</strong> {name}</div>
              <div><strong>Phone:</strong> +91 {phone}</div>
            </div>

            <div className="input-group">
              <label>6-Digit Verification Code</label>
              <input 
                type="text" 
                placeholder="Enter 6-digit OTP" 
                maxLength={6}
                value={otp} 
                onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))} 
                className="otp-code-input"
                required 
              />
            </div>

            <div className="resend-container">
              {resendCooldown > 0 ? (
                <span className="resend-timer-text">Resend OTP in <strong>{resendCooldown}s</strong></span>
              ) : (
                <button type="button" onClick={handleSendOtp} className="resend-btn-link">
                  Resend OTP Code
                </button>
              )}
            </div>

            <button type="submit" className="miui-btn-primary" disabled={loading || otp.length < 6}>
              {loading ? <Loader2 className="spinner" size={18} /> :'Verify & Start Download'}
            </button>
          </form>
        )}
        <p className="secure-text">Your information is secure and will never be shared.</p>
      </div>
    </div>
  );
};

export default DownloadPopupModal;
