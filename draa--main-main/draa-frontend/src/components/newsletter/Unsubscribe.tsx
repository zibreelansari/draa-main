import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import url from '../../url';
import './Unsubscribe.css';
import usePageTitle from '../../hooks/usePageTitle';

const Unsubscribe: React.FC = () => {
  usePageTitle('Unsubscribe | Draa');
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [status, setStatus] = useState<'prompt' | 'loading' | 'success' | 'error'>('prompt');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(`${url}/newsletter/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, reason }),
      });
      const data = await response.json();

      if (data.success) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.message || 'We encountered an error unsubscribing this email address.');
      }
    } catch (err) {
      console.error('Newsletter Unsubscribe Error:', err);
      setStatus('error');
      setErrorMessage('Unable to connect to the server. Please check your network and try again.');
    }
  };

  return (
    <div className="unsub-container">
      <div className="unsub-card">
        {status === 'success' ? (
          <div className="unsub-success-wrapper">
            <svg className="unsub-success-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <h2 className="unsub-title">Unsubscribed Successfully</h2>
            <p className="unsub-subtitle" style={{ marginBottom: '32px' }}>
              Your email address (<strong>{email}</strong>) has been removed from our newsletter subscribers. We are sad to see you go, but we respect your privacy!
            </p>
            <Link to="/" className="back-home-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Homepage</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe}>
            <h2 className="unsub-title">Newsletter Opt-Out</h2>
            <p className="unsub-subtitle">
              We are sorry to see you go! Let us know if we can do anything to improve.
            </p>

            {/* Email field - manually enterable if missing from URL */}
            <div>
              <label style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '8px' }}>
                Your Email Address
              </label>
              <input
                type="email"
                className="manual-email-input"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Amazon style feedback reasons */}
            <div className="feedback-group">
              <h3 className="feedback-title">Please share your reason for leaving (Optional)</h3>
              
              <label className="feedback-option">
                <input
                  type="radio"
                  name="reason"
                  value="frequency"
                  checked={reason === 'frequency'}
                  onChange={() => setReason('frequency')}
                />
                <span>I receive emails too frequently</span>
              </label>

              <label className="feedback-option">
                <input
                  type="radio"
                  name="reason"
                  value="relevance"
                  checked={reason === 'relevance'}
                  onChange={() => setReason('relevance')}
                />
                <span>The content is not relevant to my needs</span>
              </label>

              <label className="feedback-option">
                <input
                  type="radio"
                  name="reason"
                  value="mistake"
                  checked={reason === 'mistake'}
                  onChange={() => setReason('mistake')}
                />
                <span>I subscribed by accident / mistake</span>
              </label>

              <label className="feedback-option">
                <input
                  type="radio"
                  name="reason"
                  value="other"
                  checked={reason === 'other'}
                  onChange={() => setReason('other')}
                />
                <span>Other reason</span>
              </label>
            </div>

            {status === 'error' && (
              <p style={{ color: '#ef4444', fontSize: '13.5px', textAlign: 'center', marginBottom: '20px' }}>
                ⚠️ {errorMessage}
              </p>
            )}

            <div className="unsub-actions">
              <button
                type="submit"
                className="unsub-confirm-btn"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? 'Processing...' : 'Confirm Unsubscribe'}
              </button>
              
              <Link to="/" className="unsub-cancel-link">
                Cancel & return home
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Unsubscribe;
