import React from "react";
import { Link } from "react-router-dom";

export default function EligibilityPage() {
  return (
    <div className="bg-white">
      <section className="bg-[#023B45] text-white py-5 text-center">
        <div className="cs-container">
          <h1 className="h3 fw-bold text-white mb-1">Eligibility Criteria for International Students</h1>
          <p className="small text-white-50 mb-0">General requirements for undergraduate, postgraduate, and doctoral admissions</p>
        </div>
      </section>

      <div className="cs-container py-5">
        <div className="row g-4 justify-content-center">
          <div className="col-lg-10">
            <div className="card border p-4 rounded-3 shadow-sm mb-4">
              <h4 className="fw-bold mb-3">1. Undergraduate Programmes (Bachelor's Degrees)</h4>
              <ul className="text-secondary small mb-0 lh-lg">
                <li>Completion of 12 years of formal schooling (10+2 / Senior Secondary / GCE A-Levels / High School Diploma) from a recognized board.</li>
                <li>Minimum aggregate marks of 50% to 60% in qualifying subjects (Physics, Chemistry, Maths for B.Tech/Engineering; Commerce/Maths for BBA/B.Com).</li>
                <li>Proof of English proficiency or English as the Medium of Instruction (MOI) in secondary school.</li>
              </ul>
            </div>

            <div className="card border p-4 rounded-3 shadow-sm mb-4">
              <h4 className="fw-bold mb-3">2. Postgraduate Programmes (Master's Degrees / MBA)</h4>
              <ul className="text-secondary small mb-0 lh-lg">
                <li>A recognized Bachelor's Degree (3 or 4 years duration) with minimum 50% - 55% marks from an accredited university.</li>
                <li>For technical M.Tech programmes: Bachelor's in relevant engineering discipline (B.E. / B.Tech).</li>
                <li>For MBA programmes: Bachelor's degree in any discipline with good academic record.</li>
              </ul>
            </div>

            <div className="card border p-4 rounded-3 shadow-sm mb-4">
              <h4 className="fw-bold mb-3">3. Doctoral Programmes (Ph.D.)</h4>
              <ul className="text-secondary small mb-0 lh-lg">
                <li>A Master's degree in a relevant subject area with at least 55% aggregate marks or equivalent grade point average.</li>
                <li>Submission of a Preliminary Research Proposal statement of purpose (SOP).</li>
              </ul>
            </div>

            <div className="text-center pt-3">
              <Link to="/courses" className="btn btn-warning text-white fw-bold px-4 py-2">
                Explore Eligible Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
