import React from'react';
import ELearningPage from'./ELearningPage';
import usePageTitle from '../../hooks/usePageTitle';

const ManagedServices = () => {
  return (
    <ELearningPage
      title="Managed E-Learning Services"
      subtitle="Holistic Business-in-a-Box service for your brand."
      description={
        <>
          <p>A holistic'Business-in-a-Box' service where we handle everything from the tech stack and content updates to marketing and student support  all under your brand.</p>
          <p>This allows you to focus entirely on teaching and growing your audience while we manage the operational, technical, and marketing aspects of your e-learning platform.</p>
        </>
      }
      features={[
"Tech Stack Management",
"Regular Content Updates",
"Operational Support",
"Marketing & Growth",
"Scalable Infrastructure",
"Full Business Support"
      ]}
      overviewImage="https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      contentSections={[
        {
          title:"End-to-End Platform Management",
          description:"We take full ownership of your e-learning platform's operations  server maintenance, security updates, feature rollouts, bug fixes, and content uploads. Our dedicated team ensures your platform is online 24/7 with zero downtime affecting your students.",
          image:"https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"right"
        },
        {
          title:"Growth Marketing & Student Acquisition",
          description:"Beyond technology, we run full-funnel marketing campaigns to bring new students to your platform every month. From SEO and social media to paid ads and email funnels, our growth team ensures your revenue keeps scaling while you focus on delivery.",
          image:"https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"left"
        }
      ]}
      galleryImages={[
"https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ]}
    />
  );
};

export default ManagedServices;
