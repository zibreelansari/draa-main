import HeaderOne from'../../layouts/headers/HeaderOne'
import ScrollToTop from'../common/ScrollToTop'
// import InquiryPopUp from'../common/studentInqury'
import MainFooter from'../../layouts/footers/MainFooter'
import Breadcrumb from'../common/Breadcrumb'
import CurrentAffairs from'./CurrentAffairs'
import SEO from'../common/SEO';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CurrentAffairsIndex() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  return (
    <>
      <SEO 
        title="Daily Current Affairs for Competitive Exams" 
        description="Read daily current affairs, GK updates, and exam-oriented current affairs for competitive exam preparation." 
        keywords="daily current affairs, current affairs quiz, GK current affairs, exam current affairs, Draa"
      />
      <HeaderOne />
      <Breadcrumb 
        title="Current Affairs" 
        subtitle="Stay updated with national and international news for competitive exam preparation." 
        category="Current Affairs"
        isFree={true}
      />
      <CurrentAffairs />
      
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
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Get answers to common queries regarding daily current affairs and general knowledge.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                question: 'How often is the current affairs section updated on Draa?',
                answer: 'Our current affairs section is updated daily with date-wise national and international updates relevant to competitive exams.'
              },
              {
                question: 'Do you provide current affairs quizzes for practice?',
                answer: 'Yes, we offer interactive daily and weekly current affairs quizzes to test your general knowledge and retention.'
              },
              {
                question: 'Are monthly and yearly current affairs roundups available?',
                answer: 'Yes, we compile weekly, monthly, and yearly current affairs PDFs to make comprehensive revision easy before exams.'
              },
              {
                question: 'What topics are covered in daily current affairs?',
                answer: 'We cover national and international news, government schemes, science & tech, economy, polity, awards, sports, and key appointments.'
              },
              {
                question: 'Is the GK and current affairs content free to access?',
                answer: 'Yes, all daily news updates, quizzes, and monthly current affairs PDFs are completely free for aspirants.'
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

      {/* <InquiryPopUp /> */}
      <MainFooter />
      <ScrollToTop />
    </>
  )
}
