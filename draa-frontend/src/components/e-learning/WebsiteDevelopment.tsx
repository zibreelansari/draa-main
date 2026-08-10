import React from'react';
import ELearningPage from'./ELearningPage';
import usePageTitle from '../../hooks/usePageTitle';

const WebsiteDevelopment = () => {
  return (
    <ELearningPage
      title="Website Development"
      subtitle="Building custom Learning Management Systems (LMS) and educational portals."
      description={
        <>
          <p>We specialize in building custom Learning Management Systems (LMS), educational portals, and responsive web platforms tailored for coaching institutes, teachers, and book ventures.</p>
          <p>Our solutions are designed to provide a seamless learning experience while managing content effectively. We leverage modern frameworks to deliver lightning-fast, accessible, and scalable platforms.</p>
        </>
      }
      features={[
"Custom LMS Development",
"Educational Portals",
"Responsive Web Platforms",
"Tailored for Coaching Institutes",
"LMS Integration",
"Secure User Authentication"
      ]}
      overviewImage="https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      contentSections={[
        {
          title:"Modern Web Technologies",
          description:"We use the latest technology stacks including React, Node.js, and scalable cloud databases to ensure your platform runs smoothly under heavy traffic. Our architecture ensures your courses are delivered without buffering or downtime.",
          image:"https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"right"
        },
        {
          title:"User-Centric Design",
          description:"Every LMS and educational portal we build prioritizes the user experience. With intuitive navigation, engaging UI elements, and responsive designs, students and educators can access materials easily from any device.",
          image:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"left"
        }
      ]}
      galleryImages={[
"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ]}
    />
  );
};

export default WebsiteDevelopment;
