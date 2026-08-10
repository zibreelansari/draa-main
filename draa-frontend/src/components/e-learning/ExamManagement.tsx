import React from'react';
import ELearningPage from'./ELearningPage';
import usePageTitle from '../../hooks/usePageTitle';

const ExamManagement = () => {
  return (
    <ELearningPage
      title="Exam Management Systems"
      subtitle="Digital solutions for end-to-end testing and proctoring."
      description={
        <>
          <p>We offer complete digital solutions for end-to-end examination management  from secure online proctoring and automated grading to result analytics and question bank management.</p>
          <p>Our systems are designed to ensure the integrity, efficiency, and scalability of the examination process, whether you are running 100 or 100,000 tests simultaneously.</p>
        </>
      }
      features={[
"Secure Online Proctoring",
"Automated Grading",
"Detailed Result Analytics",
"Question Bank Management",
"User Progress Tracking",
"Scalable Testing Infrastructure"
      ]}
      overviewImage="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      contentSections={[
        {
          title:"AI-Powered Proctoring & Security",
          description:"Our exam management system uses AI-based proctoring to detect suspicious behaviour, prevent tab-switching, and flag irregularities in real time. Every exam session is recorded and monitored to ensure complete integrity of the assessment process.",
          image:"https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"right"
        },
        {
          title:"Smart Analytics & Reporting",
          description:"After every exam, our platform auto-generates detailed performance reports for individual students and cohorts. Teachers and admins get instant insights into topic-wise accuracy, time management patterns, and improvement trends to guide future instruction.",
          image:"https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
          imagePosition:"left"
        }
      ]}
      galleryImages={[
"https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
"https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
      ]}
    />
  );
};

export default ExamManagement;
