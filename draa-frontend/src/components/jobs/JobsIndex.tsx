
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
// import InquiryPopUp from"../common/studentInqury";
import JobNotifications from"./JobNotifications";
import SEO from"../common/SEO";
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function JobsNotification() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  return (
    <>
      <SEO 
        title="Government Job Notifications & Recruitment Alerts" 
        description="Explore the latest government job notifications, recruitment notifications, exam notifications, and Sarkari job alerts on Draa." 
        keywords="government job notifications, recruitment notifications, exam notifications, Sarkari job alerts, Draa"
      />
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="Notifications" 
        subtitle="Stay updated with the latest exam results, notifications & updates." 
        category="Notifications"
      />
      <JobNotifications />
      
      {/* FAQs Section */}
      <section className="fr-faq-section" style={{ padding: '80px 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span style={{
              color: '#bd7b20',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontSize: '12px',
              background: 'rgba(91, 108, 255, 0.1)',
              padding: '6px 16px',
              borderRadius: '50px',
              display: 'inline-block',
              marginBottom: '16px'
            }}>FAQ</span>
            <h2 style={{ fontSize: '32px', fontWeight: 900, color: '#0f172a' }}>Frequently Asked Questions</h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Get answers to common queries regarding government job notifications and recruitment alerts.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                question: 'Where can I find daily government job notifications in India?',
                answer: 'You can find the latest government job notifications, recruitment alerts, and exam deadlines dynamically updated on our Jobs & Notifications page.'
              },
              {
                question: 'What details are included in each job notification?',
                answer: 'Each job post contains detailed information, including vacancy counts, eligibility criteria, educational qualification, age limits, pay scale, official PDF download link, and direct online application links.'
              },
              {
                question: 'Can I filter job notifications by qualification or category?',
                answer: 'Yes, you can easily search and filter job listings by exam type, category (Bank, Railway, SSC, UPSC, etc.), and active/expired status.'
              },
              {
                question: 'How do I receive alerts for upcoming Sarkari exams?',
                answer: 'You can visit our Jobs page daily or subscribe to our newsletter and notifications to receive real-time updates on active recruitments.'
              },
              {
                question: 'Is it free to check and download job notification details on Draa?',
                answer: 'Yes, checking notifications, viewing eligibility parameters, and downloading official notifications or syllabus PDFs is completely free for all candidates.'
              }
            ].map((faq, index) => {
              const isActive = activeFaqIndex === index;
              return (
                <div 
                  key={index} 
                  style={{ 
                    background: '#fff', 
                    borderRadius: '16px', 
                    border: isActive ? '1px solid #bd7b20' : '1px solid #e2e8f0', 
                    overflow: 'hidden',
                    boxShadow: isActive ? '0 10px 25px -5px rgba(91, 108, 255, 0.08)' : '0 4px 6px -1px rgba(0,0,0,0.02)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <button
                    onClick={() => setActiveFaqIndex(isActive ? null : index)}
                    style={{
                      width: '100%',
                      padding: '22px 28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>{faq.question}</span>
                    {isActive ? <ChevronUp size={18} color="#bd7b20" /> : <ChevronDown size={18} color="#94a3b8" />}
                  </button>
                  {isActive && (
                    <div style={{ padding: '0 28px 22px', fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <MainFooter />
      {/* <InquiryPopUp /> */}
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
