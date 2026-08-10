import React from'react';
import ELearningPage from'./ELearningPage';
import usePageTitle from '../../hooks/usePageTitle';

const AcademicContent = () => {
  return (
    <ELearningPage
      title="Academic Content Development"
      subtitle="Specialized creation of content for competitive examinations."
      description={
        <>
          <p>We provide specialized creation of curriculum and study material for competitive examinations including SSC, Banking, Railway, CUET, UGC, IIT JEE, NEET, UPSC, and Teaching.</p>
          <p>Our content includes meticulously designed lesson plans, textbooks, question banks, and pedagogical frameworks  all crafted by domain experts with years of teaching experience.</p>
        </>
      }
      features={[
"Competitive Exam Content",
"Lesson Plan Creation",
"Textbook Development",
"Pedagogical Frameworks",
"Subject Matter Expertise",
"Curriculum Design"
      ]}
      overviewImage="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      contentSections={[
        {
          title:"Expert-Crafted Study Material",
          description:"Every piece of content is developed by verified subject matter experts who have deep knowledge of exam patterns, marking schemes, and frequently tested topics. We ensure accuracy, relevance, and completeness across all subjects and difficulty levels.",
          image:"https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"right"
        },
        {
          title:"Structured Curriculum Design",
          description:"We build end-to-end curriculum frameworks aligned with the latest syllabus notifications from exam bodies like UPSC, SSC CGL, IBPS, NTA, and state PSCs. Our modular approach allows for easy updates whenever exam patterns change.",
          image:"https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"left"
        }
      ]}
      galleryImages={[
"https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ]}
    />
  );
};

export default AcademicContent;
