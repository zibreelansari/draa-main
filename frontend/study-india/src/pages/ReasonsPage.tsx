import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function ReasonsPage() {
  const reasons = [
    { title: "World's 3rd Largest Higher Education Network", desc: "Access to over 1,200+ universities and 45,000+ colleges with diverse degree options." },
    { title: "Quality Education at Competitive Costs", desc: "Low tuition fees and affordable living compared to Western and European destinations." },
    { title: "Globally Recognized Degrees", desc: "Accredited by UGC, AIU, and global evaluation bodies for seamless international career progression." },
    { title: "100% English Medium Instruction", desc: "Lectures, books, research, and exams are conducted completely in the English language." },
    { title: "Epicenter of Technology & Startups", desc: "Direct proximity to India's thriving software, fintech, and biomedical innovation hubs." },
    { title: "Rich Cultural Diversity", desc: "Experience festivals, heritage monuments, scenic landscapes, and warm hospitality." },
    { title: "Holistic Knowledge Traditions (AYUSH)", desc: "Home to classical Yoga, Ayurveda, and integrative wellness sciences." },
    { title: "Safe & Supportive Residential Campuses", desc: "Dedicated International Student Cells (ISC) and on-campus hostel security." },
    { title: "Global Leadership & Alumni Network", desc: "Alumni of Indian institutions lead global multinational giants across technology, finance, and science." },
    { title: "Fast-Track Student Visa (S-Visa)", desc: "Streamlined visa applications with official Offer Letters and simple e-FRRO onboarding." }
  ];

  return (
    <div className="space-y-0 text-slate-800">
      <section className="bg-gradient-to-r from-[#0d3b66] via-[#1565C0] to-[#0D47A1] text-white py-14 text-center">
        <h1 className="font-bold text-3xl sm:text-4xl text-white">
          10 Reasons to Study in India
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 mt-2">
          Discover why international students choose India for higher education
        </p>
      </section>

      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reasons.map((r, i) => (
              <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3.5">
                <span className="w-8 h-8 rounded-full bg-[#1565C0] text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div>
                  <strong className="block text-sm font-bold text-slate-900">{r.title}</strong>
                  <p className="text-xs text-slate-600 mt-1 leading-snug">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 text-center">
            <Link
              to="/courses"
              className="px-6 py-3 bg-[#FF6F00] hover:bg-[#E65100] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow"
            >
              Explore Available Courses <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
