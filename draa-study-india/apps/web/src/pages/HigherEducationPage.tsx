import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Award, GraduationCap, ArrowRight } from "lucide-react";

export default function HigherEducationPage() {
  return (
    <div className="space-y-0 text-slate-800">
      <section className="bg-gradient-to-r from-[#0d3b66] via-[#1565C0] to-[#0D47A1] text-white py-14 text-center">
        <h1 className="font-bold text-3xl sm:text-4xl text-white">
          Indian Higher Education System
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 mt-2">
          Regulatory Authorities, Accreditation Standards & Academic Structure
        </p>
      </section>

      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-8 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900">
              Institutional Framework & Regulatory Bodies
            </h2>
            <p>
              Higher education in India is overseen by the Ministry of Education along with apex regulatory councils:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
              <li><strong>University Grants Commission (UGC):</strong> Coordinates, determines, and maintains standards of university education.</li>
              <li><strong>All India Council for Technical Education (AICTE):</strong> Regulates engineering, management, and technical programmes.</li>
              <li><strong>Association of Indian Universities (AIU):</strong> Evaluates and grants equivalence to foreign degrees.</li>
              <li><strong>National Assessment and Accreditation Council (NAAC):</strong> Evaluates quality standards (A++, A+, A).</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <strong className="block text-sm font-bold text-slate-900">Bachelor's Degrees (UG)</strong>
              <p className="text-slate-600">3 to 4-year undergraduate qualifications with credit transfer mechanisms and industry internships.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <strong className="block text-sm font-bold text-slate-900">Master's Degrees (PG)</strong>
              <p className="text-slate-600">2-year postgraduate degrees including M.Tech, MBA, M.Sc, MA with specialized thesis research.</p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <strong className="block text-sm font-bold text-slate-900">Doctoral Degrees (Ph.D.)</strong>
              <p className="text-slate-600">3 to 5-year rigorous research programmes with international peer-reviewed publication benchmarks.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
