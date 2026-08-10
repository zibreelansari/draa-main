
import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";
// import InquiryPopUp from"../common/studentInqury";
import TestSeriesArea from"./TestSeriesArea";
import WhyDraaTestSeries from "./WhyDraaTestSeries";
import SEO from"../common/SEO";
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

import usePageTitle from"../../hooks/usePageTitle";

export default function OnlineTestSeries() {
  usePageTitle('Online Test Series');
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  return (
    <>
      <SEO 
        title="Online Mock Test Series for Competitive Exams" 
        description="Attempt online mock test series with detailed solutions and build confidence for competitive exams." 
        keywords="online test series, mock test series, daily mock tests, mock tests with detailed solutions, Draa"
      />
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        theme="test-series"
        title="Online Test Series" 
        subtitle="Prepare for your success with our comprehensive online mock tests and performance analysis." 
        category="Test Series"
      />
      <TestSeriesArea />
      
      <WhyDraaTestSeries />
      
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
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Get answers to common queries regarding our online mock test series.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                question: 'How can I attempt the online mock test series on Draa?',
                answer: 'You can register as a student, choose your desired test series (by exam or subject), and start attempting mock tests on our test interface.'
              },
              {
                question: 'Do the mock tests provide detailed solutions?',
                answer: 'Yes, after submitting a test, you receive detailed, step-by-step explanations for every question to help you learn from mistakes.'
              },
              {
                question: 'Will I get a performance analysis after completing a mock test?',
                answer: 'Yes, our platform provides comprehensive analytics, including score breakdown, accuracy, time spent per question, and comparison with toppers.'
              },
              {
                question: 'Are there any free mock tests available in the series?',
                answer: 'Yes, we offer free demo tests in each test series so you can experience the quality of questions and interface before purchasing.'
              },
              {
                question: 'Are mock tests compatible with mobile devices?',
                answer: 'Yes, our responsive test platform is fully optimized for mobile phones, laptops, and desktops, allowing you to practice on the go.'
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
