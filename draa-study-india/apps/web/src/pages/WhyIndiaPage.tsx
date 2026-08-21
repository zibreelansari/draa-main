import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Globe,
  DollarSign,
  Award,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function WhyIndiaPage() {
  return (
    <div className="space-y-0 text-slate-800">
      {/* Banner */}
      <section className="bg-gradient-to-r from-[#0d3b66] via-[#1565C0] to-[#0D47A1] text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-2">
          <h1 className="font-bold text-3xl sm:text-4xl text-white">
            Why India?
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            A Global Hub of Higher Education, Innovation & Cultural Richness
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10 text-xs text-slate-700 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              The Indian Higher Education Landscape
            </h2>
            <p>
              India houses the world's 3rd largest higher education ecosystem with over 1,200+ universities and 45,000+ colleges delivering undergraduate, postgraduate, and doctoral degrees in Science, Engineering, Business, Humanities, Law, and Traditional Medical Sciences (AYUSH).
            </p>
            <p>
              Renowned for its analytical curriculum, distinguished faculty, and vast alumni networks leading global Fortune 500 tech and management enterprises, studying in India provides international students with strong career fundamentals at competitive and affordable costs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <strong className="block text-sm font-bold text-slate-900">Academic Rigor</strong>
              <p className="text-slate-600">Curricula reviewed and benchmarked with global standards under UGC and AIU frameworks.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <strong className="block text-sm font-bold text-slate-900">English Medium</strong>
              <p className="text-slate-600">100% of university degree teaching and examinations are delivered in English.</p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <strong className="block text-sm font-bold text-slate-900">Global Community</strong>
              <p className="text-slate-600">Students from over 160+ countries study together across safe, residential campus townships.</p>
            </div>
          </div>

          <div className="pt-6 text-center">
            <Link
              to="/courses"
              className="px-6 py-3 bg-[#1565C0] hover:bg-[#0D47A1] text-white font-bold rounded-xl text-xs inline-flex items-center gap-1.5 shadow"
            >
              Explore Courses & Institutes <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
