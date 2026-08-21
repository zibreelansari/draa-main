import React, { useState } from "react";
import { FAQS } from "../data/portalData";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="bg-white">
      <section className="bg-[#023B45] text-white py-5 text-center">
        <div className="cs-container">
          <h1 className="h3 fw-bold text-white mb-1">Frequently Asked Questions (FAQs)</h1>
          <p className="small text-white-50 mb-0">Answers to common queries regarding admissions, visas, scholarships, and student life</p>
        </div>
      </section>

      <div className="cs-container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="accordion" id="faqAccordion">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div key={index} className="accordion-item mb-2 border rounded-3 overflow-hidden">
                    <h2 className="accordion-header">
                      <button
                        className={`accordion-button ${isOpen ? "" : "collapsed"} fw-bold text-dark`}
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? null : index)}
                        style={{ fontSize: "14.5px" }}
                      >
                        {faq.q}
                      </button>
                    </h2>
                    {isOpen && (
                      <div className="accordion-collapse show">
                        <div className="accordion-body small text-secondary lh-lg">
                          {faq.a}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
