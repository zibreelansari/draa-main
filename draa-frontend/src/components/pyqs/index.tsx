

import HeaderOne from'../../layouts/headers/HeaderOne'
import Breadcrumb from'../common/Breadcrumb'
import ScrollToTop from'../common/ScrollToTop'
import ScrollTop from'../common/ScrollTop'
// import Preloader from'../common/Preloader'
// import InquiryPopUp from'../common/studentInqury'
import PYQs from'./PYQs'
import MainFooter from'../../layouts/footers/MainFooter'
import SEO from'../common/SEO';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function PYQSIndex() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  return (
    <>
      <SEO 
        title="Previous Year Questions & PYQs for Competitive Exams" 
        description="Practice previous year questions and PYQs to understand exam patterns and improve preparation with Draa." 
        keywords="previous year questions, PYQs with solutions, download PYQs, past year papers, Draa"
      />
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="PYQs" 
        subtitle="Practice with original question papers from previous years." 
        category="PYQs"
        isFree={true}
      />
      <PYQs/>
      
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
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Get answers to common queries regarding previous year question papers (PYQs).</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                question: 'Why are previous year questions (PYQs) important for competitive exams?',
                answer: 'PYQs help candidates understand the actual exam pattern, weightage of different topics, and the difficulty level of questions asked in previous years.'
              },
              {
                question: 'Do you provide solutions for previous year questions on Draa?',
                answer: 'Yes, all PYQs on Draa are accompanied by step-by-step detailed solutions and answers curated by subject-matter experts.'
              },
              {
                question: 'Can I download PYQ papers as PDFs?',
                answer: 'Yes, you can download previous year question papers as PDFs for free, enabling offline practice and revision at your convenience.'
              },
              {
                question: 'Which exams are covered in the PYQs section?',
                answer: 'We cover all major government and competitive exams, including UPSC, Banking (IBPS, SBI), Railways (RRB), CUET, and other state-level exams.'
              },
              {
                question: 'How many years of past papers are available for download?',
                answer: 'We offer up to 5-10 years of original past papers with solutions for most competitive exams, sorted by year and subject.'
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

      {/* <InquiryPopUp/> */}
      <MainFooter />
      <ScrollToTop />
      <ScrollTop />
    </>
  )
}
