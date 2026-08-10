import React from'react';
import ELearningPage from'./ELearningPage';
import usePageTitle from '../../hooks/usePageTitle';

const DigitalContentCreation = () => {
  return (
    <ELearningPage
      title="Digital Content Creation"
      subtitle="Multimedia assets and interactive learning modules."
      description={
        <>
          <p>We produce premium multimedia assets including video lectures, interactive 2D/3D animations, infographics, and gamified learning modules that keep students deeply engaged.</p>
          <p>We also provide support in book typesetting, printing, DTP formatting, and layout design to transform your raw educational material into polished, market-ready products.</p>
        </>
      }
      features={[
"Video Lecture Production",
"2D/3D Animations",
"Interactive Infographics",
"Gamified Learning Modules",
"DTP & Formatting Services",
"Multimedia Asset Management"
      ]}
      overviewImage="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      contentSections={[
        {
          title:"Professional Video & Animation Studio",
          description:"Our in-house team of animators, videographers, and instructional designers work together to produce studio-quality educational videos. Whether it's a whiteboard explainer, a motion graphics video, or a full 3D animated lecture, we bring concepts to life.",
          image:"https://images.unsplash.com/photo-1536240478700-b869ad10e2c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"right"
        },
        {
          title:"Book Design & DTP Services",
          description:"We convert raw manuscripts and study materials into beautifully typeset books and PDFs. Our DTP specialists ensure precise formatting, consistent styling, and print-ready layouts for textbooks, question banks, and competitive exam guides.",
          image:"https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"left"
        }
      ]}
      galleryImages={[
"https://images.unsplash.com/photo-1611532736597-de2d4265fba3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ]}
    />
  );
};

export default DigitalContentCreation;
