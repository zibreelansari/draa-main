import React from'react';
import ELearningPage from'./ELearningPage';
import usePageTitle from '../../hooks/usePageTitle';

const DigitalMarketing = () => {
  return (
    <ELearningPage
      title="Digital Marketing"
      subtitle="Strategic promotion to increase sales and visibility."
      description={
        <>
          <p>Our digital marketing services provide strategic promotion through SEO, social media management, and targeted ad campaigns to grow your educational business.</p>
          <p>We help coaching institutes, ed-tech startups, and book publishers reach a wider audience through data-driven marketing strategies that convert visitors into students.</p>
        </>
      }
      features={[
"Search Engine Optimization",
"Social Media Management",
"Targeted Ad Campaigns",
"Conversion Rate Optimization",
"Brand Awareness",
"Performance Analytics"
      ]}
      overviewImage="https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      contentSections={[
        {
          title:"Data-Driven SEO & Content",
          description:"We analyse keywords that your target students are searching for and craft content strategies that rank your platform on Google. From on-page SEO to high-quality blog creation, we ensure organic traffic continues to grow month over month.",
          image:"https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"right"
        },
        {
          title:"Social Media & Paid Campaigns",
          description:"We run highly targeted Meta, Google, and YouTube ad campaigns specifically designed to reach students preparing for competitive exams. Our team creates compelling creatives, manages budgets, and continuously optimises campaigns for maximum ROI.",
          image:"https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"left"
        }
      ]}
      galleryImages={[
"https://images.unsplash.com/photo-1562577309-4932fdd64cd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ]}
    />
  );
};

export default DigitalMarketing;
