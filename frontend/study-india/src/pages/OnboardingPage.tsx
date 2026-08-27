import React from "react";
import { Link } from "react-router-dom";

export default function OnboardingPage() {
  return (
    <div className="bg-white">
      <section className="bg-[#023B45] text-white py-5 text-center">
        <div className="cs-container">
          <h1 className="h3 fw-bold text-white mb-1">Onboarding &amp; e-FRRO Registration</h1>
          <p className="small text-white-50 mb-0">Arrival guidelines, Foreign Regional Registration (FRRO), and host institute support</p>
        </div>
      </section>

      <div className="cs-container py-5">
        <div className="row g-4 justify-content-center">
          <div className="col-lg-10">
            <div className="alert alert-warning border-warning d-flex align-items-center gap-3 p-3 mb-4 rounded-3">
              <i className="bi bi-exclamation-triangle-fill fs-3 text-warning"></i>
              <div className="small">
                <strong>Mandatory 14-Day Arrival Rule:</strong> All foreign students with an Indian Student Visa valid for more than 180 days must complete e-FRRO online registration within 14 days of arrival in India.
              </div>
            </div>

            <div className="card border p-4 rounded-3 shadow-sm mb-4">
              <h4 className="fw-bold mb-3">Online e-FRRO Registration Steps</h4>
              <ol className="text-secondary small mb-0 lh-lg ps-3">
                <li><strong>Report to University International Student Cell (ISC):</strong> Obtain your official Bonafide Certificate and Form S from your university dean's office.</li>
                <li><strong>Create e-FRRO Account:</strong> Visit the official e-FRRO portal and create a user profile using your Student Visa and Passport details.</li>
                <li><strong>Upload Documents:</strong> Upload passport photo, visa stamp copy, provisional admission letter, and accommodation address proof.</li>
                <li><strong>Receive Residential Permit (RP):</strong> The registration certificate / Residential Permit will be digitally issued and emailed to you without needing physical office visits.</li>
              </ol>
            </div>

            <div className="card border p-4 rounded-3 shadow-sm mb-4">
              <h4 className="fw-bold mb-3">Campus Onboarding &amp; Local Assistance</h4>
              <ul className="text-secondary small mb-0 lh-lg">
                <li><strong>Airport Pickup:</strong> Most partner institutes provide airport greeting and transit services during official intake weeks.</li>
                <li><strong>Local SIM Card &amp; Bank Account:</strong> The university helps you obtain a local 5G mobile SIM card and open an Indian student bank account.</li>
                <li><strong>Medical &amp; Hostel Facilities:</strong> On-campus healthcare clinics, meal mess facilities, and high-speed Wi-Fi hostels.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
