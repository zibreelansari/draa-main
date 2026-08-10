import React, { useEffect, useState } from'react';
import { Link, useNavigate } from'react-router-dom';
import {
  FileText, BookOpen, Brain, Newspaper,
  GraduationCap, Download, Star, Users,
  TrendingUp, Clock, Eye, ArrowRight,
  Zap, Shield, Award, Target, Briefcase,
  CheckCircle, TrendingUp as Trending, Filter, ChevronDown, Video
} from'lucide-react';
import HeaderOne from'../../../layouts/headers/HeaderOne';
import MainFooter from'../../../layouts/footers/MainFooter';
import Breadcrumb from'../../common/Breadcrumb';
import url, { getImageUrl } from'../../../url';
import axios from'axios';
import SEO from '../../common/SEO';
import'./FreeResources.css';
import'../../common/SkeletonLoader.css';
import { ChevronUp } from 'lucide-react';

/* ================= TYPES ================= */
interface ResourceCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  link: string;
  count: number;
  color: string;
  badge?: string;
  badgeColor?: string;
}


/* ================= STATIC RESOURCE CATEGORIES ================= */
const RESOURCE_CATEGORIES: ResourceCard[] = [
  {
    id:'jobs',
    title:'Notifications',
    subtitle:'Updates',
    description:'Jobs Notifications accross PAN India',
    icon: <Briefcase size={22} />,
    gradient:'rgba(250, 112, 154, 0.1)',
    link:'/jobs-notifications',
    count: 300,
    color:'#fa709a',
  },
  {
    id:'courses',
    title:'Courses',
    subtitle:'Learn',
    description:'Premium courses for competitive exams.',
    icon: <Zap size={22} />,
    gradient:'rgba(94, 107, 255, 0.1)',
    link:'/courses',
    count: 50,
    color:'#bd7b20',
  },
  {
    id:'syllabus',
    title:'Syllabus',
    subtitle:'Syllabus',
    description:'Syllabus for competitive exams.',
    icon: <BookOpen size={22} />,
    gradient:'rgba(71, 73, 74, 0.1)',
    link:'/syllabus',
    count: 150,
    color:'#4facfe',
  },
  {
    id:'current-affairs',
    title:'Current Affairs',
    subtitle:'News',
    description:'Daily, weekly, monthly & yearly updates.',
    icon: <Newspaper size={22} />,
    gradient:'rgba(240, 147, 251, 0.1)',
    link:'/current-affairs',
    count: 1200,
    color:'#f093fb',
  },
  {
    id:'pyqs',
    title:'PYQs',
    subtitle:'PYQs',
    description:'Previous year question papers',
    icon: <FileText size={22} />,
    gradient:'rgba(102, 126, 234, 0.1)',
    link:'/previous-year-questions',
    count: 5000,
    color:'#667eea',
  },
  {
    id:'blogs',
    title:'Blogs',
    subtitle:'Blogs',
    description:'Study tips, strategies and expert guidance.',
    icon: <Brain size={22} />,
    gradient:'rgba(46, 204, 113, 0.1)',
    link:'/grid-blog',
    count: 200,
    color:'#2ecc71',
  },
  {
    id:'recorded-videos',
    title:'Recorded Videos',
    subtitle:'Videos',
    description:'High-quality recorded video classes.',
    icon: <Video size={22} />,
    gradient:'rgba(0, 188, 209, 0.1)',
    link:'/recorded-videos',
    count: 100,
    color:'#00bcd1',
  },
];


/* ================= COMPONENT ================= */
const FreeResources: React.FC = () => {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [counts, setCounts] = useState<any>({ jobs: 300, syllabus: 150, currentAffairs: 1200, pyqs: 5000, blogs: 200 });

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);

    // Fetch live database counts
    axios.get(`${url}/count/getResources`).then(res => {
      if (res.data?.success && res.data.counts) {
        setCounts(res.data.counts);
      }
    }).catch(err => console.log('Count fetch error', err));

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <>
        <SEO
          title="Free Resources for Competitive Exams"
          description="Get free resources for competitive exams including syllabus, PYQs, current affairs, and study material on Draa."
          keywords="free resources for competitive exams, free PYQs, free syllabus, free current affairs, free study material, Draa"
        />
        <HeaderOne />
        <Breadcrumb
          theme="resources"
          title="Resources"
          subtitle="Access high-quality study materials designed to help you excel."
          isFree={true}
          paths={[
            { pathName: 'Resources', url: '/free-resources' }
          ]}
        />
        <section className="fr-categories-section">
          <div className="container">
            <div className="fr-categories-grid">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="fr-cat-card" style={{ pointerEvents: 'none' }}>
                  <div className="fr-cat-top">
                    <div className="sk-shimmer" style={{ width: 44, height: 44, borderRadius: 12 }} />
                  </div>
                  <div className="fr-cat-content">
                    <div className="sk-shimmer" style={{ height: 20, width: '60%', borderRadius: 8, marginBottom: 10 }} />
                    <div className="sk-shimmer" style={{ height: 14, width: '90%', borderRadius: 6 }} />
                  </div>
                  <div className="fr-cat-footer">
                    <div className="sk-shimmer" style={{ height: 14, width: 80, borderRadius: 6 }} />
                    <div className="sk-shimmer" style={{ height: 14, width: 20, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <MainFooter />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Free Resources for Competitive Exams"
        description="Get free resources for competitive exams including syllabus, PYQs, current affairs, and study material on Draa."
        keywords="free resources for competitive exams, free PYQs, free syllabus, free current affairs, free study material, Draa"
      />
      <HeaderOne />

      <Breadcrumb
        theme="resources"
        title="Resources"
        subtitle="Access high-quality study materials designed to help you excel."
        isFree={true}
        paths={[
          { pathName:'Resources', url:'/free-resources' }
        ]}
      />

      {/*  FILTER DROPDOWN  */}
      <section className="fr-filter-section">
        <div className="container">
          <div className="fr-filter-wrap">
            <div className="fr-filter-label">
              <Filter size={18} />
              <span>Filter by Category:</span>
            </div>
            <div className="fr-custom-select">
              <select 
                value={activeFilter} 
                onChange={(e) => setActiveFilter(e.target.value)}
                className="fr-select-input"
              >
                <option value="All">All Resources</option>
                <option value="jobs">Latest Notifications</option>
                <option value="courses">Premium Courses</option>
                <option value="syllabus">Official Syllabus</option>
                <option value="current-affairs">Current Affairs</option>
                <option value="pyqs">Previous Year Questions</option>
                <option value="blogs">Study Blogs</option>
                <option value="recorded-videos">Recorded Videos</option>
              </select>
              <ChevronDown className="select-arrow" size={16} />
            </div>
          </div>
        </div>
      </section>

      {/*  RESOURCE CATEGORIES  */}
      <section className="fr-categories-section">
        <div className="container">
          <div className="fr-categories-grid">
            {RESOURCE_CATEGORIES.filter(cat => activeFilter ==='All' || cat.id === activeFilter).map((cat, i) => {
              const liveCount = counts[cat.id] ?? cat.count;
              return (
                <Link
                  key={cat.id}
                  to={cat.link}
                  className="fr-cat-card"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className="fr-cat-top">
                    <div className="fr-cat-icon-wrap" style={{ background: cat.gradient, color: cat.color }}>
                      {cat.icon}
                    </div>
                    {/* <div className="fr-cat-badge">DRAA</div> */}
                  </div>

                  <div className="fr-cat-content">
                    <h3 className="fr-cat-title">{cat.title}</h3>
                    <p className="fr-cat-desc">{cat.description}</p>
                  </div>

                  <div className="fr-cat-footer">
                    <div className="fr-cat-count">
                      {liveCount.toLocaleString()}+ Items
                    </div>
                    <ArrowRight size={14} className="fr-cat-arrow" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
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
            <p style={{ color: '#64748b', fontSize: '16px', marginTop: '8px' }}>Get answers to common queries regarding our free study materials and resources.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                question: 'What kind of free study materials are available on Draa?',
                answer: 'We provide free previous year questions (PYQs) with solutions, official syllabus and exam pattern guides, daily current affairs, and comprehensive study notes for competitive exams.'
              },
              {
                question: 'How can I download PYQs for government exams on Draa?',
                answer: 'You can download past year papers in PDF format directly from our dedicated PYQs section. These PDFs are highly structured, featuring exam names, years, and step-by-step solutions.'
              },
              {
                question: 'Does Draa provide free syllabus breakdowns for competitive exams?',
                answer: 'Yes, we offer detailed subject-wise and topic-wise official syllabus breakdowns for UPSC, Bank, Railway, CUET, and other major exams to help you prepare effectively.'
              },
              {
                question: 'Where can I get daily current affairs for exam preparation?',
                answer: 'Our Current Affairs page is updated daily with date-wise GK updates, current affairs quizzes, and monthly roundups designed specifically for competitive exam preparation.'
              },
              {
                question: 'Are all the resources on the Free Resources page completely free?',
                answer: 'Absolutely! All syllabus PDFs, PYQs, and daily current affairs posted in the Free Resources section are 100% free to access and download.'
              },
              {
                question: 'How do online mock test series help in exam preparation?',
                answer: 'Online mock test series simulate the real exam pattern and timing. Attempting mock tests helps identify weak spots, improve speed, and boost your confidence.'
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

      <style>{`
        .fr-page-loader {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0f172a;
        }
        .fr-loader-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(91, 108, 255, 0.2);
          border-top-color: #bd7b20;
          border-radius: 50%;
          animation: frSpin 0.8s linear infinite;
        }
        @keyframes frSpin {
          to { transform: rotate(360deg); }
        }

        /* Essential Layout Fallbacks */
        .fr-categories-section {
          padding: 20px 0 80px;
        }
        .fr-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 24px;
          padding: 20px 0;
        }
        .fr-cat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          text-decoration: none;
          transition: transform 0.2s;
        }
        .fr-cat-card:hover { transform: translateY(-4px); }
        .fr-cat-top { display: flex; justify-content: space-between; align-items: center; }
        .fr-cat-icon-wrap { 
          width: 44px !important; 
          height: 44px !important; 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          flex-shrink: 0;
        }
        .fr-cat-title { font-size: 18px; font-weight: 700; color: #1e293b; margin: 0; }
        .fr-cat-desc { font-size: 14px; color: #64748b; margin: 0; }
        .fr-cat-footer { display: flex; justify-content: space-between; align-items: center; margin-top: auto; }
        .fr-cat-count { font-size: 12px; font-weight: 600; color: #94a3b8; }
        
        @media (max-width: 768px) {
          .fr-categories-grid { grid-template-columns: 1fr; }
        }

        /* Filter Section Styles */
        .fr-filter-section {
          padding: 40px 0 20px;
          background: #fff;
        }
        .fr-filter-wrap {
          display: flex;
          align-items: center;
          gap: 20px;
          background: #f8fafc;
          padding: 15px 25px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          max-width: 600px;
          margin: 0 auto;
        }
        .fr-filter-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
        }
        .fr-custom-select {
          position: relative;
          flex: 1;
        }
        .fr-select-input {
          width: 100%;
          padding: 10px 15px;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          appearance: none;
          transition: all 0.3s;
        }
        .fr-select-input:hover, .fr-select-input:focus {
          border-color: #bd7b20;
          box-shadow: 0 4px 12px rgba(91, 108, 255, 0.1);
          outline: none;
        }
        .select-arrow {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #94a3b8;
        }
        @media (max-width: 640px) {
          .fr-filter-wrap {
            flex-direction: column;
            align-items: flex-start;
          }
          .fr-custom-select {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default FreeResources;
