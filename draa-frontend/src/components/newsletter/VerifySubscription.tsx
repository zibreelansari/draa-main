import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import url from '../../url';
import './VerifySubscription.css';
import usePageTitle from '../../hooks/usePageTitle';

const VerifySubscription: React.FC = () => {
  usePageTitle('Verify Subscription | Draa');
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email newsletter subscription...');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Missing verification token. Please sign up again from the footer.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`${url}/newsletter/verify?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Subscription successfully verified!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired verification link.');
        }
      } catch (err) {
        console.error('Newsletter Verification Error:', err);
        setStatus('error');
        setMessage('Unable to connect to the server. Please check your internet connection and try again.');
      }
    };

    // Small intentional timeout to let the beautiful loader show and create premium anticipation
    const timer = setTimeout(() => {
      verifyToken();
    }, 1500);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="verify-sub-container">
      <div className="verify-card">
        {/* Animated Icon Wrapper */}
        <div className="status-icon-wrapper">
          {status === 'loading' && (
            <div className="verify-spinner"></div>
          )}

          {status === 'success' && (
            <svg className="checkmark-svg" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          )}

          {status === 'error' && (
            <svg className="error-svg" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>

        {/* Dynamic Card Text */}
        <h2 className="verify-title">
          {status === 'loading' && 'Verifying...'}
          {status === 'success' && 'Subscription Confirmed!'}
          {status === 'error' && 'Verification Failed'}
        </h2>
        <p className="verify-desc">{message}</p>

        {/* Dynamic Action Buttons */}
        {status !== 'loading' && (
          <div>
            <Link to="/" className="verify-btn">
              <span>Go to Homepage</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifySubscription;
