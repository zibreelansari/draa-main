import React from'react';
import ELearningPage from'./ELearningPage';
import usePageTitle from '../../hooks/usePageTitle';

const WhiteLabelContent = () => {
  return (
    <ELearningPage
      title="White Label Content"
      subtitle="Ready-made educational courses for your brand."
      description={
        <>
          <p>We provide ready-made educational courses for competitive examinations including SSC, Banking, Railway, CUET, UGC, IIT JEE, NEET, UPSC, and Teaching  all rebrandable as your own.</p>
          <p>Launch your educational business in days, not months. Our white-label platforms give you a fully operational, content-rich e-learning business under your own brand identity.</p>
        </>
      }
      features={[
"Rebrandable Courses",
"Ready-to-Use Platforms",
"SSC, Banking, UPSC Coverage",
"IIT JEE & NEET Content",
"Brand Customization",
"Quality Content Library"
      ]}
      overviewImage="https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      contentSections={[
        {
          title:"Comprehensive Course Library",
          description:"Our library covers over 50+ competitive exam categories with thousands of hours of video lectures, practice questions, mock tests, and study notes. Every course is crafted by subject matter experts and aligned with the latest exam syllabi.",
          image:"https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"right"
        },
        {
          title:"Launch Under Your Brand",
          description:"We hand over a fully branded, white-labeled platform with your logo, color scheme, and custom domain. Students will only see your brand  we remain invisible in the background. You can start selling courses from day one with zero development overhead.",
          image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"left"
        }
      ]}
      galleryImages={[
"https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ]}
    />
  );
};

export default WhiteLabelContent;
