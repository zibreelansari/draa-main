import MainFooter from"../../layouts/footers/MainFooter";
import HeaderOne from"../../layouts/headers/HeaderOne";
import Breadcrumb from"../common/Breadcrumb";
// import Preloader from"../common/Preloader";
import ScrollTop from"../common/ScrollTop";
import ScrollToTop from"../common/ScrollToTop";

// import'./courses.css'
// import InquiryPopUp from"../common/studentInqury";
import BooksArea from"./booksArea";
import SEO from"../common/SEO";
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Books() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  return (
    <>
      <SEO 
        title="Competitive Exam Books & PYQ Books" 
        description="Explore competitive exam books, PYQ books, practice sets, and syllabus-based study material from Draa." 
        keywords="competitive exam books, government exam books, PYQ books, syllabus based books, Draa"
      />
      {/* <Preloader /> */}
      <HeaderOne />
      <Breadcrumb 
        theme="books"
        title="Books & Study Materials" 
        subtitle="Explore our collection of handpicked books to boost your competitive exam preparation." 
        category="Books"
      />
      <BooksArea />
      
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
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Get answers to common queries regarding books, e-books, and study materials.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                question: 'What types of competitive exam books are available on Draa?',
                answer: 'We offer a wide range of subject-wise textbooks, previous year questions (PYQ) books, solved practice sets, and custom syllabus-based study material.'
              },
              {
                question: 'Are these books available in e-book (PDF) format or hardcover?',
                answer: 'Most books are available in both premium e-book (PDF) format for instant digital download and physical hardcover format.'
              },
              {
                question: 'Can I read sample chapters of the books before purchasing?',
                answer: 'Yes, you can view details, tables of content, and sample pages to ensure a book fits your preparation needs before buying.'
              },
              {
                question: 'Do these books cover solved previous year questions?',
                answer: 'Yes, we have dedicated PYQ books containing original exam questions with detailed explanations.'
              },
              {
                question: 'Is there any discount or coupon code on book purchases?',
                answer: 'We run promotional discounts and offers frequently. You can also redeem wallet coins for extra savings during checkout.'
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
