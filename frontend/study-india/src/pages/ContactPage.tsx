import React, { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-white">
      <section className="bg-[#023B45] text-white py-5 text-center">
        <div className="cs-container">
          <h1 className="h3 fw-bold text-white mb-1">Contact Study in India Helpdesk</h1>
          <p className="small text-white-50 mb-0">Get in touch with international admission officers and counsellor support</p>
        </div>
      </section>

      <div className="cs-container py-5">
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card border p-4 rounded-3 h-100 bg-light">
              <h4 className="fw-bold mb-3">Get in Touch</h4>
              <p className="small text-secondary mb-4">
                Have questions about eligible courses, university offer letters, or student visa documentation? Our international advisory desk is here to assist.
              </p>

              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-white p-2 rounded border text-warning">
                  <i className="bi bi-envelope fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Official Email</small>
                  <a href="mailto:help.studyinindia@gov.in" className="fw-bold text-dark small">help.studyinindia@gov.in</a>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="bg-white p-2 rounded border text-warning">
                  <i className="bi bi-telephone fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Helpline (Toll-Free)</small>
                  <a href="tel:+911206565065" className="fw-bold text-dark small">+91 120-6565065</a>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <div className="bg-white p-2 rounded border text-warning">
                  <i className="bi bi-geo-alt fs-5"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Office Location</small>
                  <span className="fw-bold text-dark small">DRAA International Student Gateway, New Delhi, India</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card border p-4 rounded-3 shadow-sm">
              <h4 className="fw-bold mb-3">Send an Enquiry</h4>
              {submitted ? (
                <div className="alert alert-success p-3 rounded-3 text-center">
                  <i className="bi bi-check-circle-fill fs-3 text-success d-block mb-2"></i>
                  <strong className="d-block">Message Received!</strong>
                  <span className="small">Our student counsellor will get back to you within 24 business hours.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="row g-3 small">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Full Name *</label>
                    <input type="text" required className="form-control" placeholder="Your Name" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email Address *</label>
                    <input type="email" required className="form-control" placeholder="name@example.com" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Country / Nationality *</label>
                    <input type="text" required className="form-control" placeholder="e.g. Nepal, UAE, Nigeria" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Interested Course / Level</label>
                    <input type="text" className="form-control" placeholder="e.g. B.Tech Computer Science" />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">Your Query *</label>
                    <textarea rows={4} required className="form-control" placeholder="How can we assist you?"></textarea>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-warning text-white fw-bold px-4 py-2">
                      Submit Enquiry
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
