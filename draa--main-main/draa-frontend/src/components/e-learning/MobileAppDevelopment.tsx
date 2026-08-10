import React from'react';
import ELearningPage from'./ELearningPage';
import usePageTitle from '../../hooks/usePageTitle';

const MobileAppDevelopment = () => {
  return (
    <ELearningPage
      title="Mobile Application Development"
      subtitle="Creating iOS and Android apps for on-the-go learning."
      description={
        <>
          <p>Our mobile application development services focus on creating high-quality iOS and Android apps for'on-the-go' learning with modern, intuitive interfaces.</p>
          <p>Features include offline/online class access, mock tests, job and admission notifications, e-commerce integration, and interactive UIs built for student engagement.</p>
        </>
      }
      features={[
"iOS & Android Apps",
"Offline Class Access",
"Mock Test Integration",
"Job & Admission Notifications",
"Interactive Learning UI",
"Secure Payment Gateways"
      ]}
      overviewImage="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      contentSections={[
        {
          title:"Cross-Platform Excellence",
          description:"We build native-quality apps using React Native and Flutter, ensuring your students get the same premium experience on both iOS and Android. Our apps are optimized for performance, ensuring smooth video playback and fast load times even on slower networks.",
          image:"https://images.unsplash.com/photo-1555421689-d68471e189f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"right"
        },
        {
          title:"Engaging Learning Features",
          description:"From live class streaming and downloadable video lectures to AI-powered mock test engines and progress dashboards, we pack every feature your students need into a clean, distraction-free interface that keeps them coming back every day.",
          image:"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"left"
        }
      ]}
      galleryImages={[
"https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1526406915894-7bcd65f60845?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ]}
    />
  );
};

export default MobileAppDevelopment;
