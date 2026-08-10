import React, { useState } from 'react';
import url from '../../url';
import './UpperFotter.css';

const UpperFooter: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);
  const [newsletterError, setNewsletterError] = useState<string | null>(null);

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) {
      setNewsletterError('Please enter an email address.');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterError('Please enter a valid email address.');
      return;
    }

    setNewsletterLoading(true);
    setNewsletterSuccess(null);
    setNewsletterError(null);

    try {
      const response = await fetch(`${url}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });
      const data = await response.json();
      if (data.success) {
        setNewsletterSuccess(data.message || 'Verification link sent!');
        setNewsletterEmail('');
        setTimeout(() => setNewsletterSuccess(null), 8000);
      } else {
        setNewsletterError(data.message || 'Subscription failed. Please try again.');
        setTimeout(() => setNewsletterError(null), 8000);
      }
    } catch (err) {
      console.error('Newsletter Signup Error:', err);
      setNewsletterError('Failed to connect to the server. Please try again later.');
      setTimeout(() => setNewsletterError(null), 8000);
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <section className="upper-footer-tier">
      <div className="container">
        <div className="newsletter-wrapper d-flex flex-column">
          <div className="d-flex w-100 justify-content-between align-items-center flex-wrap gap-3">
            {/* Left Content Area */}
            <div className="newsletter-text" style={{ flex: '1 1 300px' }}>
              <h3 className="newsletter-title" style={{ margin: 0 }}>
                Subscribe to Our Newsletter for Latest Update
              </h3>
              <p className="newsletter-subtitle" style={{ margin: '8px 0 0 0' }}>
                Get the latest exam news and study materials delivered directly to your inbox.
              </p>
            </div>

            {/* Right Form Area */}
            <form className="newsletter-form" onSubmit={handleNewsletterSubscribe} style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <input
                type="email"
                placeholder="Email Address"
                className="newsletter-input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterLoading}
                required
                style={{ width: '100%', maxWidth: '280px' }}
              />
              <button type="submit" className="newsletter-btn d-flex align-items-center justify-content-center gap-2" disabled={newsletterLoading} style={{ minWidth: '120px' }}>
                {newsletterLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Sending...</span>
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
          <div className="w-100 text-end" style={{ paddingRight: '20px' }}>
            {newsletterSuccess && (
              <p className="small mt-2 mb-0" style={{ color: '#10b981', fontWeight: 600 }}>
                {newsletterSuccess}
              </p>
            )}
            {newsletterError && (
              <p className="small mt-2 mb-0" style={{ color: '#ef4444', fontWeight: 600 }}>
                ⚠️ {newsletterError}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpperFooter;