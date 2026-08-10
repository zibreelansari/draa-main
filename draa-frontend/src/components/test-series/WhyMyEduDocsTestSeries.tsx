import React from 'react';

export const WhyDraaTestSeries: React.FC = () => {
  return (
    <section className="why-test-series-section" style={{ padding: '70px 0 80px', background: '#fafbfc' }}>
      <style>{`
        .why-ts-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        <h2 
          style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: '#111827', 
            marginBottom: '40px',
            textAlign: 'left',
            fontFamily: 'inherit'
          }}
        >
          Why take Draa Test Series?
        </h2>

        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '24px' 
          }}
        >
          {/* CARD 1: Latest Exam Patterns */}
          <div 
            style={{ 
              background: '#f2f9f5', 
              borderRadius: '20px', 
              padding: '40px 30px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              border: '1px solid rgba(16, 185, 129, 0.12)',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.04)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            className="why-ts-card"
          >
            {/* SVG Illustration Container */}
            <div 
              style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '24px', 
                background: '#dcfce7', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '28px',
                position: 'relative'
              }}
            >
              <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Paper sheet */}
                <rect x="20" y="16" width="40" height="50" rx="8" fill="#FFFFFF" stroke="#86EFAC" strokeWidth="2" />
                {/* Ribbon Tag NEW */}
                <rect x="26" y="22" width="28" height="12" rx="4" fill="#EF4444" />
                <text x="40" y="30" fill="#FFFFFF" fontSize="8" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">NEW</text>
                {/* Lines */}
                <rect x="28" y="40" width="24" height="4" rx="2" fill="#10B981" />
                <rect x="28" y="48" width="16" height="4" rx="2" fill="#CBD5E1" />
                <rect x="28" y="56" width="20" height="4" rx="2" fill="#CBD5E1" />
                {/* Confetti details */}
                <circle cx="16" cy="24" r="3" fill="#F59E0B" />
                <circle cx="64" cy="44" r="2.5" fill="#3B82F6" />
                <path d="M14 48 C16 44, 20 52, 22 48" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Latest Exam Patterns
            </h3>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.55, margin: 0, maxWidth: '280px' }}>
              Prepare for the level expected in the upcoming exams.
            </p>
          </div>

          {/* CARD 2: Save Tests & Questions */}
          <div 
            style={{ 
              background: '#f3f4fd', 
              borderRadius: '20px', 
              padding: '40px 30px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              border: '1px solid rgba(99, 102, 241, 0.12)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.04)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            className="why-ts-card"
          >
            {/* SVG Illustration Container */}
            <div 
              style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '24px', 
                background: '#eee3d0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '28px',
                position: 'relative'
              }}
            >
              <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Card document */}
                <rect x="22" y="16" width="36" height="48" rx="8" fill="#FFFFFF" stroke="#e3d0ad" strokeWidth="2" />
                <rect x="28" y="24" width="8" height="8" rx="4" fill="#818CF8" />
                <rect x="28" y="38" width="24" height="4" rx="2" fill="#bd7b20" />
                <rect x="28" y="46" width="18" height="4" rx="2" fill="#CBD5E1" />
                <rect x="28" y="54" width="22" height="4" rx="2" fill="#CBD5E1" />
                {/* Bookmark ribbon */}
                <path d="M46 42 V58 L52 53 L58 58 V42 Z" fill="#EF4444" />
                {/* Top dot */}
                <circle cx="50" cy="24" r="3" fill="#818CF8" />
              </svg>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Save Tests & Questions
            </h3>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.55, margin: 0, maxWidth: '280px' }}>
              Save important Tests & Questions to revise or reattempt them later.
            </p>
          </div>

          {/* CARD 3: In-depth Performance Analysis */}
          <div 
            style={{ 
              background: '#fdf6ea', 
              borderRadius: '20px', 
              padding: '40px 30px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              border: '1px solid rgba(245, 158, 11, 0.12)',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.04)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            }}
            className="why-ts-card"
          >
            {/* SVG Illustration Container */}
            <div 
              style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '24px', 
                background: '#fef3c7', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '28px',
                position: 'relative'
              }}
            >
              <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Analytics Sheet */}
                <rect x="22" y="16" width="36" height="48" rx="8" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="2" />
                {/* Pie Chart / Dot */}
                <circle cx="32" cy="26" r="4" fill="#F59E0B" />
                {/* Bar Graph Columns */}
                <rect x="28" y="44" width="5" height="12" rx="1.5" fill="#FBBF24" />
                <rect x="37" y="38" width="5" height="18" rx="1.5" fill="#F59E0B" />
                <rect x="46" y="34" width="5" height="22" rx="1.5" fill="#D97706" />
                {/* Green badge with upward chart */}
                <rect x="42" y="18" width="16" height="14" rx="4" fill="#10B981" />
                <path d="M46 27 L49 23 L51 25 L54 21" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              In-depth Performance Analysis
            </h3>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.55, margin: 0, maxWidth: '290px' }}>
              Get insights on your Strengths & Weaknesses, All India Rank & Performance Comparison with the Topper
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyDraaTestSeries;
