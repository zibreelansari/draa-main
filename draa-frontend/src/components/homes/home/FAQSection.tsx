import React, { useState, useEffect } from'react';
import { motion, AnimatePresence } from'framer-motion';
import { ChevronDown, HelpCircle } from'lucide-react';
import axios from'axios';
import url from'../../../url';
import'./FAQSection.css';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQSection: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [loading, setLoading] = useState(true);

  const defaultFaqs: FAQ[] = [
    {
      _id:'1',
      question:'How do I access the free study materials?',
      answer:'You can access all free study materials by navigating to the"Free Resources" section in the menu. We offer Syllabus, Previous Year Questions (PYQs), Current Affairs, and Blogs for various competitive exams.',
      category:'General'
    },
    {
      _id:'2',
      question:'Are the courses taught by expert teachers?',
      answer:'Yes, all our courses are designed and taught by highly qualified teachers with years of experience in their respective fields. You can view teacher profiles and their specializations on the course details page.',
      category:'Courses'
    },
    {
      _id:'3',
      question:'Can I download the study materials for offline use?',
      answer:'Yes, most of our PDF resources like Syllabus and PYQs are downloadable. You can save them to your device and study anytime, anywhere without an active internet connection.',
      category:'Technical'
    },
    {
      _id:'4',
      question:'How do I contact support for technical issues?',
      answer:'If you encounter any issues, you can raise a support ticket through your dashboard or use the"Contact" page to send us an inquiry. Our technical team usually responds within 24 hours.',
      category:'Support'
    }
  ];

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get(`${url}/admin/faqs/public?limit=6`);
        if (response.data.success) {
          // The API returns grouped by category, let's flatten it for the home page
          const grouped = response.data.data;
          const flattened = Object.values(grouped).flat() as FAQ[];
          setFaqs(flattened.length > 0 ? flattened : defaultFaqs);
        } else {
          setFaqs(defaultFaqs);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
        setFaqs(defaultFaqs);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-header">
          <span className="faq-subtitle">Common Questions</span>
          <h2 className="faq-title">Frequently Asked <span>Questions</span></h2>
          <p>Everything you need to know about Draa and our learning platform.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={faq._id} 
              className={`faq-item ${activeIndex === index ?'active' :''}`}
            >
              <button 
                className="faq-question-btn" 
                onClick={() => toggleAccordion(index)}
                aria-expanded={activeIndex === index}
              >
                <span className="faq-question">{faq.question}</span>
                <div className="faq-icon-wrapper">
                  <ChevronDown size={20} />
                </div>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height:'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease:'easeInOut' }}
                    className="faq-answer-container"
                  >
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
        
        {faqs.length === 0 && !loading && (
          <div className="text-center py-5">
            <HelpCircle size={48} color="#ccc" className="mb-3" />
            <p>No FAQs available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FAQSection;
