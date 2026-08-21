import React from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Award,
  Globe,
  BookOpen,
  CheckCircle2,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Building2
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-0 text-slate-800">
      {/* Hero Header */}
      <section className="bg-[#0B1B2B] text-white py-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-widest">
            ABOUT THE PLATFORM
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            About Study in India
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Discover the scale, global reputation, and diverse multidisciplinary learning opportunities across India's higher education landscape.
          </p>
        </div>
      </section>

      {/* Main Content & Overview */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              HIGHER EDUCATION OVERVIEW
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900 leading-tight">
              One of the World's Largest & Most Dynamic Higher Education Systems
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              India boasts more than 1,100 accredited universities and 45,000 affiliated colleges, catering to over 40 million students. With centuries of intellectual tradition merged with modern technology clusters, Indian universities offer world-class degrees in Engineering, Management, Sciences, Humanities, Law, and Traditional Knowledge Systems.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              The DRAA Study in India gateway is committed to simplifying international student discovery, verifying academic eligibility, and facilitating direct communication with admissions officers at top NAAC A++ and NIRF-ranked institutions.
            </p>
            <div className="pt-2">
              <Link
                to="/institutes"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Browse Partner Campuses <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
              <img
                src="/media/university-building.jpg"
                alt="University Architecture in India"
                className="w-full h-80 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Key Education System Statistics */}
      <section id="education-system" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
              FACTS & RECOGNITION
            </span>
            <h2 className="font-serif text-3xl font-bold text-slate-900">
              Regulatory Standards & Accreditation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 w-fit">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-900">
                UGC & AIU Recognition
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Degrees awarded by universities recognised by the University Grants Commission (UGC) and Association of Indian Universities (AIU) are accepted globally for postgraduate progression and professional licensing.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 w-fit">
                <Award size={22} />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-900">
                NIRF Ranking Framework
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The National Institutional Ranking Framework (NIRF) assesses campuses on Teaching, Learning & Resources, Research & Professional Practice, and Graduate Outcomes.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 w-fit">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-900">
                NAAC A++ Quality Benchmarks
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The National Assessment and Accreditation Council (NAAC) provides independent quality grades, ensuring state-of-the-art laboratory infrastructure, faculty excellence, and student support.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
