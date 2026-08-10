import React from'react';
import { Link } from'react-router-dom';
import'./ElevatePreparation.css';

const ElevatePreparation = () => {
  return (
    <section className="elevate-section">
      <div className="container">
        <div className="elevate-content">
          <h2 className="elevate-title">Ready to elevate your preparation?</h2>
          <p className="elevate-description">
            Join thousands of aspirants who have transformed their learning journey with Draa.
          </p>
          <div className="elevate-actions">
            <Link to="/contact" className="btn-contact">Contact Us</Link>
            <Link to="/courses" className="btn-view-all-elevate">View All Courses</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ElevatePreparation;