

import HeaderOne from'../../layouts/headers/HeaderOne'
import Breadcrumb from'../common/Breadcrumb'
import ScrollToTop from'../common/ScrollToTop'
import ScrollTop from'../common/ScrollTop'
// import Preloader from'../common/Preloader'
// import InquiryPopUp from'../common/studentInqury'
import MainFooter from'../../layouts/footers/MainFooter'
import Syllabus from'./Syllabus'
import SEO from'../common/SEO';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function SyllabusIndex() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  return (
    <>
      <SEO 
        title="Competitive Exam Syllabus & Exam Pattern" 
        description="Check latest competitive exam syllabus, topic breakdown, and exam pattern before starting preparation." 
        keywords="competitive exam syllabus, government exam syllabus, syllabus and exam pattern, Draa"
      />
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        title="Syllabus" 
        subtitle="Detailed subject-wise syllabus for various examinations." 
        category="Syllabus"
        isFree={true}
      />
      <Syllabus/>
      
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
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Get answers to common queries regarding exam syllabus and pattern.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                question: 'Where can I find the latest official syllabus for government exams?',
                answer: 'You can find the fully updated subject-wise and topic-wise official syllabus for all major competitive exams in our Syllabus section.'
              },
              {
                question: 'Does Draa provide exam pattern and marking scheme details?',
                answer: 'Yes, along with the detailed syllabus, we provide comprehensive exam pattern guidelines, number of questions, duration, and marking/negative marking details.'
              },
              {
                question: 'Is the syllabus based on the latest notifications?',
                answer: 'Absolutely. We update our syllabus and exam pattern guides immediately following any official notifications issued by exam conducting bodies.'
              },
              {
                question: 'Can I download the exam syllabus as a PDF?',
                answer: 'Yes, the complete exam syllabus and topic breakdown guides can be downloaded as PDFs for free.'
              },
              {
                question: 'Why is analyzing the syllabus important before starting preparation?',
                answer: 'Analyzing the syllabus helps you create a structured study plan, prioritize high-weightage topics, and avoid wasting time on irrelevant topics.'
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
